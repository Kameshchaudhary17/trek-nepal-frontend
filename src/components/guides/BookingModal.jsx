import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { bookingService, treksService, pricingService, aiService } from "../../services/api";
import { formatNPR } from "../../utils/money";

const TODAY = new Date().toISOString().split("T")[0];

/* Route is derived from the guide's own profile — trekker never types it.
     Priority: URL trek filter → guide.specialty → first listed route → region label. */
function resolveRoute(guide) {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("trek");
    if (fromUrl && fromUrl.trim()) return fromUrl.trim();
  } catch { /* no-window fallback */ }
  if (guide?.specialty && guide.specialty !== "Multi-Route") return guide.specialty;
  if (guide?.routes?.length > 0) return guide.routes[0];
  if (guide?.region) return `${guide.region} region`;
  return "";
}

export default function BookingModal({ guide, onClose }) {
  const navigate = useNavigate();
  const resolvedRoute = resolveRoute(guide);
  const [step,     setStep]     = useState(1); // 1 = form, 2 = success
  const [form,     setForm]     = useState({
    start:   "",
    days:    "7",
    message: "",
  });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const overlayRef = useRef(null);

  // Fair-rate check (AI endpoint) + static lookup caches.
  const [treks, setTreks] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [fair, setFair]   = useState(null);      // { range, season, tier }
  const [fairLoading, setFairLoading] = useState(false);

  useEffect(() => {
    // One-shot reference data. Needed to resolve trek name → _id and guide rate → tier.
    Promise.all([treksService.getTreks(), pricingService.getConfig()])
      .then(([t, cfg]) => {
        setTreks(t.treks || []);
        setTiers(cfg.guideTiers || []);
      })
      .catch(() => { /* fair-rate widget is non-critical; fail silent */ });
  }, []);

  useEffect(() => {
    // Ask the AI helper for a fair range whenever the route + date + days are known.
    if (!resolvedRoute || !form.start || !Number(form.days)) { setFair(null); return; }
    const trek = treks.find((t) => t.name === resolvedRoute);
    if (!trek) { setFair(null); return; }
    const tier = tiers.find(
      (ti) => guide.ratePerDay >= (ti.ratePerDay?.min ?? 0) && guide.ratePerDay <= (ti.ratePerDay?.max ?? Infinity)
    ) || tiers[0];
    if (!tier) { setFair(null); return; }

    let cancelled = false;
    setFairLoading(true);
    aiService
      .priceCheck({ trekId: trek._id, startDate: form.start, days: Number(form.days), tierId: tier.id })
      .then((res) => { if (!cancelled) setFair(res); })
      .catch(() => { if (!cancelled) setFair(null); })
      .finally(() => { if (!cancelled) setFairLoading(false); });
    return () => { cancelled = true; };
  }, [resolvedRoute, form.start, form.days, treks, tiers, guide.ratePerDay]);

  /* close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.start) e.start = "Please select a start date";
    if (!form.days || Number(form.days) < 1) e.days = "Enter number of days";
    if (!form.message.trim()) e.message = "Add a message to the guide";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    // Defensive: if the guide has no trek info on their profile, we can't derive
    // a route to send. Surface the problem instead of blaming the backend.
    if (!resolvedRoute) {
      setApiError("This guide hasn't set any trek routes yet. Please try another guide.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      await bookingService.create({
        guideId: guide._id,
        route: resolvedRoute,
        startDate: form.start,
        days: Number(form.days),
        message: form.message,
      });
      setStep(2);
    } catch (err) {
      const status = err?.response?.data?.status;
      if (status === 401) {
        navigate("/login");
      } else {
        setApiError(err?.response?.data?.message || "Failed to send booking request. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const cost = guide.ratePerDay
    ? guide.ratePerDay * Number(form.days || 0)
    : 0;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-[2px] p-0 sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="w-full sm:max-w-[480px] bg-white rounded-t-[24px] sm:rounded-2xl overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-[1.15rem] font-bold text-stone-900">
              {step === 1 ? "Book guide" : "Request sent!"}
            </h2>
            <p className="text-[12px] text-stone-400">{guide.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Step 1 — form */}
        {step === 1 && (
          <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-4">

              {/* Guide quick info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                {guide.user?.profilePhoto ? (
                  <img src={guide.user.profilePhoto} alt={guide.name}
                    className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[0.85rem] text-white shrink-0"
                    style={{ background: `linear-gradient(135deg, ${guide.color}CC, ${guide.color}99)` }}
                  >
                    {guide.initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-stone-800">{guide.name}</div>
                  <div className="text-[11.5px] text-stone-400">{guide.specialty || guide.region}</div>
                </div>
                {guide.ratePerDay && (
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-stone-400">from</div>
                    <div className="text-[14px] font-bold text-terra-500">{formatNPR(guide.ratePerDay)}<span className="text-[10px] font-normal text-stone-400">/day</span></div>
                  </div>
                )}
              </div>

              {/* Guide's trek coverage — read-only context so the trekker knows
                  where this guide operates. The booked route is the primary one
                  (URL trek filter → specialty → first route) resolved above. */}
              {(guide.routes?.length > 0 || resolvedRoute) && (
                <div className="p-3 rounded-xl bg-forest-50/40 border border-forest-100">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-forest-700 font-semibold mb-1.5">
                    Trek route
                  </p>
                  <p className="text-[13.5px] font-semibold text-stone-800">{resolvedRoute || "—"}</p>
                  {guide.routes?.length > 1 && (
                    <p className="text-[11.5px] text-stone-500 mt-1.5 leading-snug">
                      {guide.name?.split(" ")[0] || "This guide"} also covers: {guide.routes.filter((r) => r !== resolvedRoute).join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Start date + days */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-stone-500 uppercase tracking-[0.1em] mb-1.5">
                    Start date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    min={TODAY}
                    value={form.start}
                    onChange={(e) => set("start", e.target.value)}
                    className={`w-full bg-stone-50 border rounded-xl px-3 py-2.5 text-[13.5px] text-stone-800 outline-none focus:ring-2 focus:ring-forest-100 transition-colors ${errors.start ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-forest-400"}`}
                  />
                  {errors.start && <p className="text-[11.5px] text-red-500 mt-1">{errors.start}</p>}
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-stone-500 uppercase tracking-[0.1em] mb-1.5">
                    Days <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    placeholder="7"
                    value={form.days}
                    onChange={(e) => set("days", e.target.value)}
                    className={`w-full bg-stone-50 border rounded-xl px-3 py-2.5 text-[13.5px] text-stone-800 outline-none focus:ring-2 focus:ring-forest-100 transition-colors ${errors.days ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-forest-400"}`}
                  />
                  {errors.days && <p className="text-[11.5px] text-red-500 mt-1">{errors.days}</p>}
                </div>
              </div>

              {/* Cost estimate */}
              {cost && form.days && Number(form.days) > 0 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50 border border-forest-100 text-[13px]">
                  <span className="text-forest-700">Estimated guide cost</span>
                  <span className="font-bold text-forest-800">{formatNPR(cost)}</span>
                </div>
              )}

              {/* AI fair-rate check — compares guide's total against the
                  tier-band × seasonal multiplier suggested by /api/ai/price-check. */}
              {fairLoading && (
                <div className="text-[12px] text-stone-400 italic px-1">Checking fair-rate range…</div>
              )}
              {fair && !fairLoading && (() => {
                const min = fair.estimate.guideRange.min;
                const max = fair.estimate.guideRange.max;
                const status = cost < min ? "below" : cost > max ? "above" : "fair";
                const styles = {
                  fair:  { bg: "bg-forest-50",  border: "border-forest-200",  text: "text-forest-700", label: "Within fair range for this season ✓" },
                  below: { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",    label: "Below the typical fair range — great deal" },
                  above: { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",  label: "Above the typical fair range" },
                }[status];
                return (
                  <div className={`p-3 rounded-xl border ${styles.bg} ${styles.border} text-[12.5px] ${styles.text} space-y-1`}>
                    <div className="font-semibold">{styles.label}</div>
                    <div className="text-stone-500">
                      Fair range ({fair.tier?.label}, {fair.season?.id}): {formatNPR(min)} – {formatNPR(max)}
                    </div>
                  </div>
                );
              })()}

              {/* Message */}
              <div>
                <label className="block text-[11.5px] font-semibold text-stone-500 uppercase tracking-[0.1em] mb-1.5">
                  Message to guide <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  placeholder={`Hi ${guide.name?.split(" ")[0]}, I'm planning a trek and would love your guidance…`}
                  className={`w-full bg-stone-50 border rounded-xl px-3 py-2.5 text-[13.5px] text-stone-800 outline-none focus:ring-2 focus:ring-forest-100 transition-colors resize-none ${errors.message ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-forest-400"}`}
                />
                {errors.message && <p className="text-[11.5px] text-red-500 mt-1">{errors.message}</p>}
              </div>

              <p className="text-[11.5px] text-stone-400 leading-relaxed">
                You won't be charged yet. The guide reviews your request and confirms within 24 hours.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-100 bg-stone-50 space-y-3">
              {apiError && (
                <p className="text-[12.5px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
                  {apiError}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-forest-500 text-white rounded-xl text-[15px] font-semibold hover:bg-forest-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending request…</>
                  : "Send booking request →"
                }
              </button>
            </div>
          </form>
        )}

        {/* Step 2 — success */}
        {step === 2 && (
          <div className="px-6 py-8 flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center mb-5">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 17l6 6 14-14" stroke="#2D6A4F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-serif text-[1.4rem] font-bold text-stone-900 mb-2">Request sent!</h3>
            <p className="text-[14px] text-stone-500 leading-relaxed mb-6 max-w-[300px]">
              Your booking request has been sent to <strong>{guide.name?.split(" ")[0]}</strong>. They'll respond within 24 hours.
            </p>
            <div className="w-full p-4 rounded-xl bg-stone-50 border border-stone-200 text-left mb-6 space-y-2.5">
              {[
                { label: "Route",  value: resolvedRoute || "Not specified" },
                { label: "Start",  value: form.start ? new Date(form.start + "T00:00").toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) : "—" },
                { label: "Duration", value: `${form.days} day${Number(form.days) !== 1 ? "s" : ""}` },
                ...(cost ? [{ label: "Est. guide cost", value: formatNPR(cost) }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-[12.5px]">
                  <span className="text-stone-400">{label}</span>
                  <span className="text-stone-700 font-medium">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
