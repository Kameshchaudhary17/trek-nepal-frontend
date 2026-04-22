import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import { guideService, pricingService } from "../services/api";

/* ── Sidebar nav items ───────────────────────────────────────────── */
const NAV = [
  { id: "overview",  label: "Overview",   icon: OverviewIcon  },
  { id: "profile",   label: "My Profile", icon: ProfileIcon   },
  { id: "rate",      label: "My Rate",    icon: RateIcon      },
  { id: "bookings",  label: "Bookings",   icon: BookingsIcon  },
];

const LANGUAGES_OPTIONS = ["English", "Nepali", "Hindi", "Tibetan", "French", "German", "Spanish", "Japanese", "Chinese", "Korean"];
const REGION_OPTIONS = ["Khumbu", "Gandaki", "Bagmati", "Mustang", "Karnali", "Mechi", "Other"];

/* ── Main component ─────────────────────────────────────────────── */
export default function GuideDashboard() {
  const navigate = useNavigate();

  const [user,         setUser]         = useState(null);
  const [guide,        setGuide]        = useState(null);
  const [pricing,      setPricing]      = useState(null);
  const [activeTab,    setActiveTab]    = useState("overview");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [toast,        setToast]        = useState(null);

  // Profile form state
  const [profileForm,  setProfileForm]  = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Rate form state
  const [selectedTier, setSelectedTier] = useState(null);
  const [rateInput,    setRateInput]    = useState("");
  const [rateSaving,   setRateSaving]   = useState(false);

  /* ── Auth guard ── */
  useEffect(() => {
    const token  = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "guide") { navigate("/dashboard"); return; }
    setUser(parsed);
  }, [navigate]);

  /* ── Close sidebar on outside click ── */
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = () => setSidebarOpen(false);
    document.addEventListener("click", close, { once: true });
    return () => document.removeEventListener("click", close);
  }, [sidebarOpen]);

  /* ── Fetch guide profile + pricing config ── */
  const loadData = useCallback(async () => {
    try {
      const [guideRes, pricingRes] = await Promise.all([
        guideService.getMyProfile(),
        pricingService.getConfig(),
      ]);
      const g = guideRes.guide;
      setGuide(g);
      setPricing(pricingRes);

      setProfileForm({
        specialty:  g?.specialty  || "",
        region:     g?.region     || "Other",
        experience: g?.experience || 0,
        bio:        g?.bio        || "",
        languages:  g?.languages  || ["English", "Nepali"],
        routes:     g?.routes     || [],
      });

      if (g?.ratePerDay && pricingRes?.guideTiers) {
        setRateInput(String(g.ratePerDay));
        const matchedTier = pricingRes.guideTiers.find(
          (t) => g.ratePerDay >= t.ratePerDay.min && g.ratePerDay <= t.ratePerDay.max
        );
        setSelectedTier(matchedTier?.id ?? pricingRes.guideTiers[0]?.id);
      } else if (pricingRes?.guideTiers?.length) {
        setSelectedTier(pricingRes.guideTiers[0].id);
      }
    } catch {
      showToast("Failed to load profile data.", "error");
    }
  }, []);

  useEffect(() => { if (user) loadData(); }, [user, loadData]);

  /* ── Helpers ── */
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function updateForm(field, val) {
    setProfileForm((p) => ({ ...p, [field]: val }));
  }

  function toggleLanguage(lang) {
    setProfileForm((p) => ({
      ...p,
      languages: p.languages.includes(lang)
        ? p.languages.filter((l) => l !== lang)
        : [...p.languages, lang],
    }));
  }

  async function saveProfile() {
    setProfileSaving(true);
    try {
      const res = await guideService.upsertMyProfile(profileForm);
      setGuide(res.guide);
      showToast("Profile saved successfully.");
    } catch {
      showToast("Failed to save profile.", "error");
    } finally {
      setProfileSaving(false);
    }
  }

  async function saveRate() {
    const rate = parseFloat(rateInput);
    const tier = pricing?.guideTiers?.find((t) => t.id === selectedTier);
    if (!tier) return;
    if (isNaN(rate) || rate < tier.ratePerDay.min || rate > tier.ratePerDay.max) {
      showToast(`Rate must be $${tier.ratePerDay.min}–$${tier.ratePerDay.max} for this tier.`, "error");
      return;
    }
    setRateSaving(true);
    try {
      const res = await guideService.upsertMyProfile({ ratePerDay: rate });
      setGuide(res.guide);
      showToast("Daily rate saved.");
    } catch {
      showToast("Failed to save rate.", "error");
    } finally {
      setRateSaving(false);
    }
  }

  if (!user) return null;

  const initials = user.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const isVerified = guide?.status === "verified";
  const isPending  = !guide || guide.status === "pending";
  const isRejected = guide?.status === "rejected";

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13.5px] font-semibold shadow-lg border ${
          toast.type === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-forest-50 border-forest-200 text-forest-700"
        }`}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}

      <div className="flex pt-[68px] min-h-screen">
        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`fixed top-[68px] left-0 h-[calc(100vh-68px)] w-[240px] bg-white border-r border-stone-200 flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          {/* Guide info */}
          <div className="px-5 pt-6 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-[0.9rem] text-white bg-forest-500 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-stone-900 truncate">{user.fullName}</div>
                <div className="text-[11px] text-stone-400 truncate">{user.email}</div>
              </div>
            </div>
            {/* Verification badge */}
            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-700 font-semibold">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                NTB Verified
              </span>
            ) : isRejected ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 font-semibold">
                Rejected
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-semibold">
                Pending review
              </span>
            )}
          </div>

          {/* Nav */}
          <nav className="px-4 pt-4 space-y-1 flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-3 px-2">Guide Panel</p>
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all text-left font-medium ${
                  activeTab === id
                    ? "bg-forest-50 text-forest-700 border border-forest-200"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                <Icon active={activeTab === id} />
                {label}
              </button>
            ))}
          </nav>

          <div className="px-5 pb-6 mt-auto">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <p className="text-[11px] text-stone-600 font-medium mb-0.5">Daily rate</p>
              <p className="text-[1.1rem] font-serif font-bold text-terra-500">
                {guide?.ratePerDay ? `$${guide.ratePerDay}/day` : "Not set"}
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 md:ml-[240px] min-w-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center gap-3 px-5 py-3 border-b border-stone-200 bg-white">
            <button
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
              className="p-2 rounded-lg bg-stone-100 border border-stone-200 text-stone-600"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-[13px] text-stone-600 font-medium">
              {NAV.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="px-6 sm:px-10 py-8">
            {activeTab === "overview"  && <OverviewTab user={user} guide={guide} setActiveTab={setActiveTab} />}
            {activeTab === "profile"   && profileForm && <ProfileTab form={profileForm} updateForm={updateForm} toggleLanguage={toggleLanguage} onSave={saveProfile} saving={profileSaving} />}
            {activeTab === "rate"      && pricing && <RateTab guide={guide} pricing={pricing} selectedTier={selectedTier} setSelectedTier={setSelectedTier} rateInput={rateInput} setRateInput={setRateInput} onSave={saveRate} saving={rateSaving} />}
            {activeTab === "bookings"  && <BookingsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Overview Tab ───────────────────────────────────────────────── */
function OverviewTab({ user, guide, setActiveTab }) {
  const isVerified = guide?.status === "verified";
  const isPending  = !guide || guide.status === "pending";

  const stats = [
    { label: "Booking requests", value: "0",  sub: "Active requests" },
    { label: "Treks completed",  value: guide?.treksCompleted ?? "0", sub: "All time" },
    { label: "Average rating",   value: guide?.averageRating ? `${guide.averageRating.toFixed(1)} ★` : "—", sub: `${guide?.reviewCount ?? 0} reviews` },
    { label: "Daily rate",       value: guide?.ratePerDay ? `$${guide.ratePerDay}` : "—", sub: "Per day" },
  ];

  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> Overview
        </span>
        <h1 className="font-serif text-[2rem] sm:text-[2.3rem] font-bold text-stone-900 leading-tight">
          Welcome back, <span className="text-forest-500">{user.fullName?.split(" ")[0]}</span>
        </h1>
      </div>

      {/* Status banner */}
      {isPending && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5 text-amber-500">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9 5v4M9 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-[13.5px] font-semibold text-amber-800 mb-0.5">Application under review</p>
            <p className="text-[12.5px] text-amber-700 leading-relaxed">
              Your NTB credentials are being verified. You'll be notified within 2–3 business days. Complete your profile while you wait.
            </p>
          </div>
        </div>
      )}
      {isVerified && (
        <div className="flex items-center gap-3 bg-forest-50 border border-forest-200 rounded-2xl p-4 mb-6">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-forest-500">
            <path d="M9 1.5L3 4.5v5c0 4 2.67 6.333 6 7 3.333-.667 6-3 6-7v-5L9 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M6 9l2.333 2.333L12 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-[13.5px] font-semibold text-forest-700">Your account is NTB verified and visible to trekkers.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all">
            <div className="font-serif text-[1.8rem] font-bold text-forest-500 mb-1">{s.value}</div>
            <div className="text-[13px] font-medium text-stone-700">{s.label}</div>
            <div className="text-[11.5px] text-stone-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Action cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          {
            icon: "👤", title: "Complete Profile",
            desc: "Add your specialties, routes, languages and experience to attract trekkers.",
            cta: "Edit profile", tab: "profile", highlight: !guide?.bio,
          },
          {
            icon: "💰", title: "Set Your Rate",
            desc: "Set your daily rate within platform tier bands. Guides with rates get more bookings.",
            cta: "Set rate", tab: "rate", highlight: !guide?.ratePerDay,
          },
          {
            icon: "📋", title: "Booking Requests",
            desc: "View and manage incoming booking requests from trekkers.",
            cta: "View bookings", tab: "bookings", highlight: false,
          },
        ].map(({ icon, title, desc, cta, tab, highlight }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex flex-col text-left rounded-2xl p-5 border transition-all hover:-translate-y-0.5 hover:shadow-md ${
              highlight ? "bg-forest-50 border-forest-200 hover:border-forest-300" : "bg-white border-stone-200 hover:border-stone-300"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${highlight ? "bg-forest-100 border border-forest-200" : "bg-stone-100 border border-stone-200"}`}>
              {icon}
            </div>
            <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-1.5">{title}</h3>
            <p className="text-[13px] text-stone-500 leading-relaxed mb-4 flex-1">{desc}</p>
            <span className="text-[13px] text-forest-600 font-medium flex items-center gap-1">
              {cta}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Profile Tab ────────────────────────────────────────────────── */
function ProfileTab({ form, updateForm, toggleLanguage, onSave, saving }) {
  const [routeInput, setRouteInput] = useState("");

  function addRoute(e) {
    if (e.key === "Enter" && routeInput.trim()) {
      updateForm("routes", [...(form.routes || []), routeInput.trim()]);
      setRouteInput("");
    }
  }

  function removeRoute(r) {
    updateForm("routes", form.routes.filter((x) => x !== r));
  }

  return (
    <div className="max-w-[680px]">
      <div className="mb-7">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> My Profile
        </span>
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">Guide Profile</h2>
        <p className="text-[13.5px] text-stone-400 mt-1">Shown to trekkers in listings. Complete profile = more bookings.</p>
      </div>

      <div className="space-y-5">
        {/* Specialty */}
        <Field label="Specialty / Trek Type">
          <input
            type="text"
            value={form.specialty}
            onChange={(e) => updateForm("specialty", e.target.value)}
            placeholder="e.g. High-altitude trekking, EBC, Annapurna Circuit"
            className={inputCls}
          />
        </Field>

        {/* Region */}
        <Field label="Primary Region">
          <select value={form.region} onChange={(e) => updateForm("region", e.target.value)} className={inputCls}>
            {REGION_OPTIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>

        {/* Experience */}
        <Field label="Years of Experience">
          <input
            type="number" min="0" max="50"
            value={form.experience}
            onChange={(e) => updateForm("experience", Number(e.target.value))}
            className={inputCls}
          />
        </Field>

        {/* Bio */}
        <Field label="Bio" hint="Tell trekkers about yourself, your experience and why they should choose you.">
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => updateForm("bio", e.target.value)}
            placeholder="Share your story, certifications, favorite treks..."
            className={`${inputCls} resize-none`}
          />
        </Field>

        {/* Languages */}
        <Field label="Languages Spoken">
          <div className="flex flex-wrap gap-2">
            {LANGUAGES_OPTIONS.map((lang) => {
              const active = form.languages.includes(lang);
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg text-[12.5px] border font-medium transition-all ${
                    active ? "bg-forest-50 border-forest-300 text-forest-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {lang}
                </button>
              );
            })}
          </div>
        </Field>

        {/* Routes */}
        <Field label="Trek Routes" hint="Press Enter to add a route.">
          <input
            type="text"
            value={routeInput}
            onChange={(e) => setRouteInput(e.target.value)}
            onKeyDown={addRoute}
            placeholder="e.g. Everest Base Camp"
            className={inputCls}
          />
          {form.routes?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2.5">
              {form.routes.map((r) => (
                <span key={r} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[12px] text-stone-700">
                  {r}
                  <button type="button" onClick={() => removeRoute(r)} className="text-stone-400 hover:text-stone-700 leading-none">×</button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <div className="pt-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Rate Tab ───────────────────────────────────────────────────── */
function RateTab({ guide, pricing, selectedTier, setSelectedTier, rateInput, setRateInput, onSave, saving }) {
  const { guideTiers = [], platformFeePct = 5 } = pricing;
  const tier = guideTiers.find((t) => t.id === selectedTier) ?? guideTiers[0];
  const rate = parseFloat(rateInput) || 0;
  const inBand = tier && rate >= tier.ratePerDay.min && rate <= tier.ratePerDay.max;

  return (
    <div className="max-w-[620px]">
      <div className="mb-7">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> My Rate
        </span>
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">Daily Rate</h2>
        <p className="text-[13.5px] text-stone-400 mt-1">Set your rate within the admin-approved tier band. All rates are shown transparently to trekkers.</p>
      </div>

      {/* Current rate display */}
      {guide?.ratePerDay ? (
        <div className="flex items-center justify-between bg-forest-50 border border-forest-200 rounded-2xl p-5 mb-6">
          <div>
            <div className="text-[11.5px] uppercase tracking-[0.12em] text-forest-600 font-semibold mb-0.5">Current rate</div>
            <div className="font-serif text-[2rem] font-bold text-forest-700">${guide.ratePerDay}<span className="text-[14px] font-normal text-forest-500 ml-1">/day</span></div>
          </div>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-forest-300">
            <path d="M14 3v22M9 7h7.5a3.5 3.5 0 010 7H9M9 14h8a3.5 3.5 0 010 7H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
      ) : (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 mt-0.5 text-amber-500">
            <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9 5v4M9 11.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-[13px] text-amber-700 font-medium">No rate set yet. Set your daily rate to appear in trekker search results.</p>
        </div>
      )}

      {/* Tier selection */}
      <div className="mb-5">
        <label className="block text-[11.5px] uppercase tracking-[0.12em] text-stone-500 font-semibold mb-3">Select Your Guide Tier</label>
        <div className="space-y-3">
          {guideTiers.map((t) => (
            <label
              key={t.id}
              className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border transition-all ${
                selectedTier === t.id ? "bg-forest-50 border-forest-300" : "bg-white border-stone-200 hover:border-stone-300"
              }`}
            >
              <input type="radio" name="tier" value={t.id} checked={selectedTier === t.id} onChange={() => { setSelectedTier(t.id); setRateInput(String(t.ratePerDay.min)); }} className="hidden" />
              <span className="w-3.5 h-3.5 rounded-full mt-[3px] shrink-0 border-2" style={{ background: selectedTier === t.id ? t.color : "transparent", borderColor: selectedTier === t.id ? t.color : "#D1D5DB" }} />
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className={`text-[13.5px] font-semibold ${selectedTier === t.id ? "text-forest-800" : "text-stone-700"}`}>{t.label}</span>
                  <span className="text-[13px] font-semibold text-terra-500">${t.ratePerDay.min}–${t.ratePerDay.max}<span className="text-stone-400 font-normal text-[11px]">/day</span></span>
                </div>
                <span className="text-[12px] text-stone-400">{t.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Rate input */}
      {tier && (
        <div className="mb-6">
          <label className="block text-[11.5px] uppercase tracking-[0.12em] text-stone-500 font-semibold mb-2">
            Your Daily Rate — must be ${tier.ratePerDay.min}–${tier.ratePerDay.max}
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-[15px] font-semibold pointer-events-none">$</span>
              <input
                type="number"
                min={tier.ratePerDay.min}
                max={tier.ratePerDay.max}
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className={`pl-7 pr-16 py-3 text-[1rem] font-semibold rounded-xl border outline-none w-36 transition-colors ${
                  !rateInput ? "border-stone-200 bg-stone-50" : inBand ? "border-forest-300 bg-forest-50 text-forest-700" : "border-red-300 bg-red-50 text-red-700"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] pointer-events-none">/day</span>
            </div>
            {rateInput && (
              <span className={`text-[12.5px] font-medium ${inBand ? "text-forest-600" : "text-red-500"}`}>
                {inBand ? "Within band ✓" : `Must be $${tier.ratePerDay.min}–$${tier.ratePerDay.max}`}
              </span>
            )}
          </div>

          {/* Visual band slider */}
          <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div className="flex justify-between text-[11px] text-stone-400 mb-2">
              <span>${tier.ratePerDay.min}</span>
              <span className="text-forest-600 font-semibold">
                {inBand ? `$${rate}/day set` : "set a rate"}
              </span>
              <span>${tier.ratePerDay.max}</span>
            </div>
            <div className="relative h-2 bg-stone-200 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 rounded-full" style={{ background: tier.color, width: "100%" }} />
              {inBand && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow"
                  style={{
                    borderColor: tier.color,
                    left: `calc(${((rate - tier.ratePerDay.min) / (tier.ratePerDay.max - tier.ratePerDay.min)) * 100}% - 8px)`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Platform fee note */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50 border border-blue-200 mb-6">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-blue-500 shrink-0 mt-0.5">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 7v3M8 5.5v.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <p className="text-[12px] text-blue-700 leading-relaxed">
          A <strong>{platformFeePct}%</strong> platform fee is added on top of your rate. Trekkers see the full breakdown before booking — no hidden charges.
        </p>
      </div>

      <button
        onClick={onSave}
        disabled={saving || !inBand}
        className="px-6 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving…" : "Save My Rate"}
      </button>
    </div>
  );
}

/* ── Bookings Tab ───────────────────────────────────────────────── */
function BookingsTab() {
  return (
    <div>
      <div className="mb-7">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> Bookings
        </span>
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">Booking Requests</h2>
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl mb-4">📭</div>
        <h3 className="font-serif text-[1.1rem] font-semibold text-stone-800 mb-2">No bookings yet</h3>
        <p className="text-[13.5px] text-stone-400 max-w-[280px] leading-relaxed">
          Complete your profile and get verified to start receiving booking requests from trekkers.
        </p>
      </div>
    </div>
  );
}

/* ── Shared components ──────────────────────────────────────────── */
const inputCls = "w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] text-stone-800 outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-colors";

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-[11.5px] uppercase tracking-[0.12em] text-stone-500 font-semibold mb-2">{label}</label>
      {hint && <p className="text-[11.5px] text-stone-400 mb-2">{hint}</p>}
      {children}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────── */
function OverviewIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function RateIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v14M5 4h4.5a2.5 2.5 0 010 5H5M5 9h5a2.5 2.5 0 010 5H5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BookingsIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M5 1v4M11 1v4M2 7h12" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
