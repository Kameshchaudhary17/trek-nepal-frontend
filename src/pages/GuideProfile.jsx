import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import BookingModal from "../components/guides/BookingModal";
import { guideService } from "../services/api";
import { formatNPR } from "../utils/money";

/* ── Star rating ─────────────────────────────────────────────── */
function Stars({ n = 0, size = 14 }) {
  return (
    <span className="inline-flex gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 12 12"
          fill={i < Math.round(n) ? "#D97706" : "none"}>
          <path d="M6 1l1.39 2.81L10.5 4.27l-2.25 2.19.53 3.1L6 8l-2.78 1.46.53-3.1L1.5 4.27l3.11-.46L6 1z"
            stroke="#D97706" strokeWidth="0.8" />
        </svg>
      ))}
    </span>
  );
}

/* ── Skeleton ────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border-b border-stone-200 pt-[66px]">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-10 flex gap-8">
          <div className="w-32 h-32 rounded-2xl bg-stone-200 shrink-0" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-4 w-20 bg-stone-200 rounded" />
            <div className="h-8 w-64 bg-stone-200 rounded" />
            <div className="h-4 w-40 bg-stone-200 rounded" />
            <div className="h-4 w-32 bg-stone-200 rounded" />
          </div>
        </div>
      </div>
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8 grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3">
              <div className="h-4 w-32 bg-stone-200 rounded" />
              <div className="h-16 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl h-64" />
      </div>
    </div>
  );
}

/* ── Stat box ────────────────────────────────────────────────── */
function StatBox({ label, value, sub }) {
  return (
    <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 text-center">
      <div className="font-serif text-[1.6rem] font-bold text-forest-600 leading-none mb-0.5">{value}</div>
      <div className="text-[12px] font-medium text-stone-700">{label}</div>
      {sub && <div className="text-[11px] text-stone-400 mt-0.5">{sub}</div>}
    </div>
  );
}

/* ── Section card ────────────────────────────────────────────── */
function Card({ title, icon, children }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <h2 className="flex items-center gap-2 font-serif text-[1.05rem] font-semibold text-stone-900 mb-4">
        {icon && <span className="text-base">{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────── */
export default function GuideProfile() {
  const { id } = useParams();

  const [guide,        setGuide]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [bookingOpen,  setBookingOpen]  = useState(false);
  const [copied,       setCopied]       = useState(false);

  useEffect(() => {
    setLoading(true);
    guideService.getGuideById(id)
      .then((data) => setGuide(data.guide))
      .catch((err) => {
        const status = err?.response?.data?.statusCode;
        setError(status === 404 ? "Guide not found." : "Failed to load profile. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <><Navbar /><Skeleton /></>;

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 font-sans">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-5">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl mb-5">
            🧗
          </div>
          <h1 className="font-serif text-[1.5rem] font-bold text-stone-900 mb-2">
            {error === "Guide not found." ? "Guide not found" : "Something went wrong"}
          </h1>
          <p className="text-stone-500 text-[14px] mb-6">{error}</p>
          <Link to="/guides" className="px-6 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all">
            ← Back to all guides
          </Link>
        </div>
      </div>
    );
  }

  const name       = guide.user?.fullName || "Guide";
  const photo      = guide.user?.profilePhoto || "";
  const initials   = guide.initials || name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const isVerified = guide.status === "verified";
  const rating     = guide.averageRating ?? 0;
  const reviews    = guide.reviewCount ?? 0;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <Navbar />

      {/* ── Hero banner ── */}
      <div className="pt-[66px] bg-white border-b border-stone-200">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8 sm:py-10">

          {/* Back link */}
          <Link
            to="/guides"
            className="inline-flex items-center gap-1.5 text-[12.5px] text-stone-400 hover:text-forest-600 transition-colors mb-6 font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All guides
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            {/* Avatar */}
            <div className="shrink-0">
              {photo ? (
                <img src={photo} alt={name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-stone-100 shadow-sm" />
              ) : (
                <div
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl flex items-center justify-center font-serif font-bold text-[2rem] text-white shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${guide.color}CC, ${guide.color}99)` }}
                >
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {isVerified && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-700 font-semibold">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    NTB Verified
                  </span>
                )}
                {guide.region && (
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-medium">
                    {guide.region} Region
                  </span>
                )}
              </div>

              <h1 className="font-serif text-[2rem] sm:text-[2.3rem] font-bold text-stone-900 leading-tight mb-1">
                {name}
              </h1>

              {guide.specialty && (
                <p className="text-[15px] text-stone-500 mb-3">{guide.specialty}</p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <Stars n={rating} size={15} />
                <span className="text-[14px] font-semibold text-amber-600">{rating > 0 ? rating.toFixed(1) : "—"}</span>
                <span className="text-[13px] text-stone-400">({reviews} review{reviews !== 1 ? "s" : ""})</span>
              </div>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-4 text-[13px] text-stone-500">
                {guide.experience > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-forest-400">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span className="font-medium text-stone-700">{guide.experience} yrs</span> experience
                  </span>
                )}
                {guide.treksCompleted > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-forest-400">
                      <path d="M2 12L5 5l3 4 2-3 2 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium text-stone-700">{guide.treksCompleted}</span> treks completed
                  </span>
                )}
                {guide.languages?.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-forest-400">
                      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M2 7h10M7 1.5c-1.5 2-1.5 7 0 11M7 1.5c1.5 2 1.5 7 0 11" stroke="currentColor" strokeWidth="1.1" />
                    </svg>
                    {guide.languages.join(", ")}
                  </span>
                )}
              </div>
            </div>

            {/* CTA (desktop) */}
            <div className="shrink-0 hidden sm:flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-[11px] text-stone-400 mb-0.5">Daily rate from</div>
                <div className="font-serif text-[2rem] font-bold text-terra-500 leading-none">
                  {guide.ratePerDay ? formatNPR(guide.ratePerDay) : "—"}
                </div>
                <div className="text-[11px] text-stone-400">per day</div>
              </div>
              <button
                onClick={() => setBookingOpen(true)}
                className="px-7 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 hover:shadow-md transition-all"
              >
                Book this guide
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 text-[12.5px] text-stone-400 hover:text-stone-600 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M8.5 1.5h4v4M13 1.5l-5 5M5.5 4.5H3a1.5 1.5 0 00-1.5 1.5v5A1.5 1.5 0 003 12.5h5A1.5 1.5 0 009.5 11V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {copied ? "Link copied!" : "Share profile"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox label="Treks completed" value={guide.treksCompleted || "0"} />
            <StatBox label="Years experience" value={guide.experience > 0 ? `${guide.experience}+` : "—"} />
            <StatBox label="Average rating" value={rating > 0 ? rating.toFixed(1) : "—"} sub={reviews > 0 ? `${reviews} reviews` : ""} />
            <StatBox label="Daily rate" value={guide.ratePerDay ? formatNPR(guide.ratePerDay) : "—"} sub="per person" />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <div className="grid lg:grid-cols-[1fr_296px] gap-6 lg:gap-8 items-start">

          {/* ── Left: main content ── */}
          <div className="space-y-5">

            {/* About */}
            {guide.bio && (
              <Card title="About" icon="👤">
                <p className="text-[14px] text-stone-600 leading-relaxed whitespace-pre-line">{guide.bio}</p>
              </Card>
            )}

            {/* Trek routes */}
            {guide.routes?.length > 0 && (
              <Card title="Trek Routes" icon="⛰️">
                <div className="flex flex-wrap gap-2">
                  {guide.routes.map((r) => (
                    <Link
                      key={r}
                      to={`/guides?trek=${encodeURIComponent(r)}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-forest-50 border border-forest-200 text-[12.5px] text-forest-700 hover:bg-forest-100 transition-colors font-medium"
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-forest-400">
                        <path d="M2 10L5 4l3 3 2-3 2 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {r}
                    </Link>
                  ))}
                </div>
                <p className="text-[11.5px] text-stone-400 mt-3">
                  Click a route to see all guides who cover it.
                </p>
              </Card>
            )}

            {/* Languages */}
            {guide.languages?.length > 0 && (
              <Card title="Languages Spoken" icon="🌐">
                <div className="flex flex-wrap gap-2">
                  {guide.languages.map((lang) => (
                    <span key={lang}
                      className="px-3 py-1.5 rounded-full bg-stone-50 border border-stone-200 text-[13px] text-stone-700 font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Reviews placeholder */}
            <Card title="Trekker Reviews" icon="★">
              {reviews === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl mb-3">
                    📝
                  </div>
                  <p className="text-[13.5px] text-stone-500 font-medium mb-1">No reviews yet</p>
                  <p className="text-[12.5px] text-stone-400">
                    Be the first to review {name.split(" ")[0]} after your trek.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                  <div className="text-center shrink-0">
                    <div className="font-serif text-[2.5rem] font-bold text-amber-600 leading-none">{rating.toFixed(1)}</div>
                    <Stars n={rating} size={13} />
                    <div className="text-[11px] text-stone-400 mt-1">{reviews} reviews</div>
                  </div>
                  <p className="text-[13px] text-stone-500 leading-relaxed">
                    Full review display coming soon. This guide has received <strong>{reviews}</strong> verified reviews from trekkers.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* ── Right: booking card (sticky) ── */}
          <div className="lg:sticky lg:top-[86px]">
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Rate header */}
              <div className="px-6 py-5 border-b border-stone-100 bg-stone-50">
                <div className="text-[11px] text-stone-400 mb-1">Starting from</div>
                <div className="flex items-end gap-1.5">
                  <span className="font-serif text-[2.2rem] font-bold text-terra-500 leading-none">
                    {guide.ratePerDay ? formatNPR(guide.ratePerDay) : "—"}
                  </span>
                  {guide.ratePerDay && <span className="text-[13px] text-stone-400 mb-1">/ day</span>}
                </div>
                {isVerified && (
                  <div className="flex items-center gap-1.5 mt-2 text-[12px] text-forest-600">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1L2.5 3v3.75c0 2.485 1.68 4.048 3.5 4.5 1.82-.452 3.5-2.015 3.5-4.5V3L6 1z" fill="#2D6A4F" />
                      <path d="M4 6l1.5 1.5 2.5-2.5" stroke="white" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    NTB verified · no hidden fees
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-4">
                {/* Quick info */}
                {[
                  { label: "Region",     value: guide.region || "—" },
                  { label: "Experience", value: guide.experience ? `${guide.experience} years` : "—" },
                  { label: "Languages",  value: guide.languages?.slice(0, 2).join(", ") + (guide.languages?.length > 2 ? ` +${guide.languages.length - 2}` : "") || "—" },
                  { label: "Routes",     value: guide.routes?.length ? `${guide.routes.length} covered` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center text-[13px]">
                    <span className="text-stone-400 font-medium">{label}</span>
                    <span className="text-stone-700 font-semibold">{value}</span>
                  </div>
                ))}

                <button
                  onClick={() => setBookingOpen(true)}
                  className="w-full mt-2 py-3.5 bg-forest-500 text-white rounded-xl text-[14.5px] font-semibold hover:bg-forest-600 hover:shadow-md transition-all"
                >
                  Book this guide
                </button>

                <button
                  onClick={copyLink}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-stone-200 rounded-xl text-[13px] text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                    <path d="M8.5 1.5h4v4M13 1.5l-5 5M5.5 4.5H3a1.5 1.5 0 00-1.5 1.5v5A1.5 1.5 0 003 12.5h5A1.5 1.5 0 009.5 11V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {copied ? "Copied!" : "Share profile"}
                </button>
              </div>

              {/* Footer note */}
              <div className="px-6 py-3.5 border-t border-stone-100 bg-stone-50">
                <p className="text-[11.5px] text-stone-400 text-center leading-relaxed">
                  You won't be charged yet · Guide confirms availability within 24h
                </p>
              </div>
            </div>

            {/* Mobile book button */}
            <div className="mt-4 sm:hidden">
              <button
                onClick={() => setBookingOpen(true)}
                className="w-full py-3.5 bg-forest-500 text-white rounded-xl text-[15px] font-semibold hover:bg-forest-600 transition-all"
              >
                Book this guide →
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Booking modal */}
      {bookingOpen && (
        <BookingModal
          guide={{ ...guide, name }}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </div>
  );
}
