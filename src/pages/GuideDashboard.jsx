import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarAvatarMenu from "../components/ui/SidebarAvatarMenu";
import ImageUpload from "../components/ui/ImageUpload";
import authService, { guideService, pricingService, bookingService } from "../services/api";
import { formatNPR } from "../utils/money";
import ChatModal from "../components/messages/ChatModal";

/* ── Sidebar nav items ───────────────────────────────────────────── */
const NAV = [
  { id: "overview",  label: "Overview",   icon: OverviewIcon  },
  { id: "profile",   label: "My Profile", icon: ProfileIcon   },
  { id: "rate",      label: "My Rate",    icon: RateIcon      },
  { id: "bookings",  label: "Bookings",   icon: BookingsIcon  },
  { id: "reviews",   label: "Reviews",    icon: ReviewsIcon   },
  { id: "earnings",  label: "Earnings",   icon: EarningsIcon  },
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

      // Read profilePhoto from localStorage to avoid stale closure on user state
      const storedUser = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

      setProfileForm({
        fullName:     g?.user?.fullName     || storedUser?.fullName     || "",
        phone:        g?.user?.phone        || storedUser?.phone        || "",
        profilePhoto: g?.user?.profilePhoto || storedUser?.profilePhoto || "",
        specialty:    g?.specialty    || "",
        region:       g?.region       || "Other",
        experience:   g?.experience   || 0,
        bio:          g?.bio          || "",
        languages:    g?.languages    || ["English", "Nepali"],
        routes:       g?.routes       || [],
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
    if (!profileForm.fullName?.trim()) {
      showToast("Full name is required.", "error");
      return;
    }
    setProfileSaving(true);
    try {
      const [userRes, guideRes] = await Promise.all([
        authService.updateMe({
          fullName:     profileForm.fullName.trim(),
          phone:        profileForm.phone,
          profilePhoto: profileForm.profilePhoto,
        }),
        guideService.upsertMyProfile(profileForm),
      ]);
      setGuide(guideRes.guide);
      // sync user fields to localStorage so sidebar/header update immediately
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged = { ...parsed, ...userRes.user };
        localStorage.setItem("user", JSON.stringify(merged));
        setUser(merged);
      }
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
      showToast(`Rate must be ${formatNPR(tier.ratePerDay.min)}–${formatNPR(tier.ratePerDay.max)} for this tier.`, "error");
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
  const isRejected = guide?.status === "rejected";

  async function handleLogout() {
    await authService.logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex">
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

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-stone-200 flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-stone-100">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-forest-500">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.55" />
              </svg>
            </span>
            <span className="font-serif text-[0.95rem] font-semibold tracking-wide text-stone-900 group-hover:text-forest-600 transition-colors">
              TrekDirect<span className="text-forest-500">Nepal</span>
            </span>
          </Link>
        </div>
          {/* Guide info */}
          <div className="px-5 pt-5 pb-4 border-b border-stone-100">
            <SidebarAvatarMenu
              photo={user.profilePhoto}
              initials={initials}
              name={user.fullName}
              email={user.email}
              viewProfileTo={guide?._id ? `/guides/${guide._id}` : undefined}
              onPhotoChange={async (url) => {
                try {
                  const res = await authService.updateMe({ profilePhoto: url });
                  const stored = localStorage.getItem("user");
                  if (stored) {
                    const merged = { ...JSON.parse(stored), ...res.user };
                    localStorage.setItem("user", JSON.stringify(merged));
                    setUser(merged);
                  }
                  if (profileForm) updateForm("profilePhoto", url);
                } catch { /* silently ignore — photo upload is non-critical */ }
              }}
            />
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

          <div className="px-5 pb-5 mt-auto space-y-3">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3">
              <p className="text-[11px] text-stone-600 font-medium mb-0.5">Daily rate</p>
              <p className="text-[1.1rem] font-serif font-bold text-terra-500">
                {guide?.ratePerDay ? `${formatNPR(guide.ratePerDay)}/day` : "Not set"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Log out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 md:ml-[240px] min-w-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-stone-200 bg-white sticky top-0 z-30">
            <button
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
              className="p-2 rounded-lg bg-stone-100 border border-stone-200 text-stone-600"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-2">
              <span className="text-forest-500"><svg width="20" height="20" viewBox="0 0 28 28" fill="none"><path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></span>
              <span className="font-serif text-[0.9rem] font-semibold text-stone-900">TrekDirect<span className="text-forest-500">Nepal</span></span>
            </Link>
            <span className="text-[12px] text-stone-400">{NAV.find((n) => n.id === activeTab)?.label}</span>
          </div>

          <div className="px-6 sm:px-10 py-8">
            {isRejected && (
              <RejectionBanner
                reason={guide.rejectionReason}
                onReapplied={async () => {
                  const data = await guideService.getMyProfile();
                  setGuide(data.guide || null);
                }}
                showToast={showToast}
              />
            )}
            {activeTab === "overview"  && <OverviewTab user={user} guide={guide} setActiveTab={setActiveTab} />}
            {activeTab === "profile"   && profileForm && <ProfileTab form={profileForm} updateForm={updateForm} toggleLanguage={toggleLanguage} onSave={saveProfile} saving={profileSaving} hasNationalId={!!guide?.nationalIdPublicId} userEmail={user.email} />}
            {activeTab === "rate"      && pricing && <RateTab guide={guide} pricing={pricing} selectedTier={selectedTier} setSelectedTier={setSelectedTier} rateInput={rateInput} setRateInput={setRateInput} onSave={saveRate} saving={rateSaving} />}
            {activeTab === "bookings"  && <BookingsTab />}
            {activeTab === "reviews"   && <ReviewsTab />}
            {activeTab === "earnings"  && <EarningsTab />}
          </div>
        </main>
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
    { label: "Daily rate",       value: guide?.ratePerDay ? formatNPR(guide.ratePerDay) : "—", sub: "Per day" },
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
function ProfileTab({ form, updateForm, toggleLanguage, onSave, saving, hasNationalId, userEmail }) {
  const [routeInput, setRouteInput] = useState("");

  function addRoute(e) {
    if (e.key === "Enter" && routeInput.trim()) {
      e.preventDefault();
      updateForm("routes", [...(form.routes || []), routeInput.trim()]);
      setRouteInput("");
    }
  }

  function removeRoute(r) {
    updateForm("routes", form.routes.filter((x) => x !== r));
  }

  const initials = (form.fullName || "G").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="max-w-[800px]">
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> My Profile
        </span>
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">Guide Profile</h2>
        <p className="text-[13.5px] text-stone-400 mt-1">Shown to trekkers in listings. A complete profile gets more bookings.</p>
      </div>

      {/* ── Profile hero ── */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-5">
        <div className="h-[72px] bg-gradient-to-br from-stone-800 via-forest-800 to-forest-600" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-9 mb-3">
            {form.profilePhoto ? (
              <img
                src={form.profilePhoto} alt={form.fullName}
                className="w-[68px] h-[68px] rounded-2xl object-cover border-[3px] border-white shadow ring-1 ring-stone-100"
              />
            ) : (
              <div className="w-[68px] h-[68px] rounded-2xl bg-forest-700 flex items-center justify-center font-serif font-bold text-[1.25rem] text-white border-[3px] border-white shadow">
                {initials}
              </div>
            )}
            <div className="mb-1 flex items-center gap-2 flex-wrap justify-end">
              {form.specialty && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-medium">
                  {form.specialty.split(",")[0].trim()}
                </span>
              )}
              {form.experience > 0 && (
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-medium">
                  {form.experience} yrs exp
                </span>
              )}
            </div>
          </div>
          <h3 className="font-serif text-[1.15rem] font-bold text-stone-900 leading-snug">{form.fullName || "—"}</h3>
          <p className="text-[13px] text-stone-400 mt-0.5">{userEmail}</p>
          {form.region && form.region !== "Other" && (
            <p className="text-[12px] text-stone-500 mt-1 flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 14 18" fill="none" className="text-forest-400 shrink-0">
                <path d="M7 1C4.239 1 2 3.239 2 6c0 4 5 11 5 11s5-7 5-11c0-2.761-2.239-5-5-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              </svg>
              {form.region} Region
            </p>
          )}
        </div>
      </div>

      {/* ── Two-column: personal + guide details ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Personal details */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-4">Personal Details</p>
          <div className="space-y-4">
            {/* Photo upload */}
            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-2">Profile Photo</label>
              <div className="flex items-center gap-3">
                {form.profilePhoto ? (
                  <img src={form.profilePhoto} alt={form.fullName}
                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-forest-700 flex items-center justify-center font-bold text-[0.9rem] text-white shrink-0">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <ImageUpload
                    uploadType="profile"
                    accept="image/jpeg,image/png,image/webp"
                    maxSizeMB={5}
                    value={form.profilePhoto}
                    onChange={({ url }) => updateForm("profilePhoto", url)}
                    hint="Square · shown in guide listings"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Full Name</label>
              <input type="text" value={form.fullName}
                onChange={(e) => updateForm("fullName", e.target.value)}
                placeholder="Your full name" className={inputCls} />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Email</label>
              <input type="email" value={userEmail} disabled
                className="w-full bg-stone-100 border border-stone-200 rounded-xl px-3.5 py-2.5 text-[14px] text-stone-400 outline-none cursor-not-allowed" />
              <p className="text-[11px] text-stone-400 mt-1">Cannot be changed</p>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Phone</label>
              <input type="tel" value={form.phone}
                onChange={(e) => updateForm("phone", e.target.value)}
                placeholder="+977 98XXXXXXXX" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Guide details */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-4">Guide Details</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Specialty / Trek Type</label>
              <input type="text" value={form.specialty}
                onChange={(e) => updateForm("specialty", e.target.value)}
                placeholder="e.g. High-altitude, EBC, Annapurna" className={inputCls} />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Primary Region</label>
              <select value={form.region} onChange={(e) => updateForm("region", e.target.value)} className={inputCls}>
                {REGION_OPTIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Years of Experience</label>
              <input type="number" min="0" max="50" value={form.experience}
                onChange={(e) => updateForm("experience", Number(e.target.value))}
                className={inputCls} />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1">Bio</label>
              <p className="text-[11px] text-stone-400 mb-1.5">Tell trekkers about yourself.</p>
              <textarea rows={5} value={form.bio}
                onChange={(e) => updateForm("bio", e.target.value)}
                placeholder="Share your story, certifications, favorite treks..."
                className={`${inputCls} resize-none`} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Languages ── */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-3">Languages Spoken</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES_OPTIONS.map((lang) => {
            const active = form.languages.includes(lang);
            return (
              <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] border font-medium transition-all ${
                  active ? "bg-forest-50 border-forest-300 text-forest-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
        {form.languages.length > 0 && (
          <p className="text-[11px] text-stone-400 mt-2.5">{form.languages.length} language{form.languages.length !== 1 ? "s" : ""} selected</p>
        )}
      </div>

      {/* ── Trek Routes ── */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-1">Trek Routes</p>
        <p className="text-[11.5px] text-stone-400 mb-3">Press Enter to add a route you specialize in.</p>
        <input type="text" value={routeInput}
          onChange={(e) => setRouteInput(e.target.value)}
          onKeyDown={addRoute}
          placeholder="e.g. Everest Base Camp"
          className={inputCls} />
        {form.routes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {form.routes.map((r) => (
              <span key={r} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[12px] text-stone-700">
                {r}
                <button type="button" onClick={() => removeRoute(r)} className="text-stone-400 hover:text-stone-700 leading-none ml-0.5">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Identity Document ── */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-5">
        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-3">Identity Document</p>
        {hasNationalId ? (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-forest-50 border border-forest-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-forest-500 shrink-0">
              <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-forest-700">Document on file</p>
              <p className="text-[11.5px] text-forest-600">Visible to admin only · contact support to update</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-forest-100 border border-forest-200 text-forest-700 font-semibold shrink-0">Locked</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-amber-500 shrink-0">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 5v3M8 10v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div>
              <p className="text-[13px] font-semibold text-amber-800">No document on file</p>
              <p className="text-[11.5px] text-amber-700">Contact support or re-register to submit your identity document.</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pb-4">
        <button onClick={onSave} disabled={saving}
          className="px-7 py-2.5 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all disabled:opacity-60 flex items-center gap-2"
        >
          {saving
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
            : "Save Profile"
          }
        </button>
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
            <div className="font-serif text-[2rem] font-bold text-forest-700">{formatNPR(guide.ratePerDay)}<span className="text-[14px] font-normal text-forest-500 ml-1">/day</span></div>
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
                  <span className="text-[13px] font-semibold text-terra-500">{formatNPR(t.ratePerDay.min)}–{formatNPR(t.ratePerDay.max)}<span className="text-stone-400 font-normal text-[11px]">/day</span></span>
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
            Your Daily Rate — must be {formatNPR(tier.ratePerDay.min)}–{formatNPR(tier.ratePerDay.max)}
          </label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[12.5px] font-semibold pointer-events-none">Rs.</span>
              <input
                type="number"
                min={tier.ratePerDay.min}
                max={tier.ratePerDay.max}
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className={`pl-12 pr-16 py-3 text-[1rem] font-semibold rounded-xl border outline-none w-44 transition-colors ${
                  !rateInput ? "border-stone-200 bg-stone-50" : inBand ? "border-forest-300 bg-forest-50 text-forest-700" : "border-red-300 bg-red-50 text-red-700"
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-[12px] pointer-events-none">/day</span>
            </div>
            {rateInput && (
              <span className={`text-[12.5px] font-medium ${inBand ? "text-forest-600" : "text-red-500"}`}>
                {inBand ? "Within band ✓" : `Must be ${formatNPR(tier.ratePerDay.min)}–${formatNPR(tier.ratePerDay.max)}`}
              </span>
            )}
          </div>

          {/* Visual band slider */}
          <div className="mt-4 bg-stone-50 border border-stone-200 rounded-xl p-4">
            <div className="flex justify-between text-[11px] text-stone-400 mb-2">
              <span>{formatNPR(tier.ratePerDay.min)}</span>
              <span className="text-forest-600 font-semibold">
                {inBand ? `${formatNPR(rate)}/day set` : "set a rate"}
              </span>
              <span>{formatNPR(tier.ratePerDay.max)}</span>
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
const GUIDE_BOOKING_TABS = ["All", "Pending", "Confirmed", "Rejected"];

const STATUS_BADGE_CLS = {
  pending:   "bg-amber-50 border border-amber-200 text-amber-700",
  confirmed: "bg-forest-50 border border-forest-200 text-forest-700",
  rejected:  "bg-red-50 border border-red-200 text-red-600",
  cancelled: "bg-stone-100 border border-stone-200 text-stone-500",
  completed: "bg-blue-50 border border-blue-200 text-blue-700",
};

function formatBookingDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TrekkerAvatar({ trekker }) {
  const photo = trekker?.profilePhoto;
  if (photo) {
    return (
      <img
        src={photo}
        alt={trekker?.fullName || "Trekker"}
        className="w-10 h-10 rounded-xl object-cover shrink-0"
      />
    );
  }
  const initials = (trekker?.fullName || "T")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[0.8rem] text-white bg-gradient-to-br from-forest-400 to-forest-600 shrink-0">
      {initials}
    </div>
  );
}

function BookingsTab() {
  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState("All");
  const [actionState,   setActionState]   = useState({}); // { [id]: { open: 'confirm'|'reject', note: '', saving: false } }
  const [chattingWith,  setChattingWith]  = useState(null);

  useEffect(() => {
    bookingService.getGuideBookings()
      .then((res) => setBookings(res.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  function openAction(id, type) {
    setActionState((prev) => ({
      ...prev,
      [id]: { open: type, note: "", saving: false },
    }));
  }

  function closeAction(id) {
    setActionState((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function setNote(id, val) {
    setActionState((prev) => ({
      ...prev,
      [id]: { ...prev[id], note: val },
    }));
  }

  async function handleAction(id, status) {
    const note = actionState[id]?.note || "";
    setActionState((prev) => ({
      ...prev,
      [id]: { ...prev[id], saving: true },
    }));
    try {
      const res = await bookingService.updateStatus(id, status, note || undefined);
      setBookings((prev) => prev.map((b) => (b._id === id ? res.booking : b)));
      closeAction(id);
    } catch (err) {
      setActionState((prev) => ({
        ...prev,
        [id]: { ...prev[id], saving: false },
      }));
      alert(err?.response?.data?.message || "Failed to update booking.");
    }
  }

  const filtered =
    activeTab === "All"
      ? bookings
      : bookings.filter((b) => b.status === activeTab.toLowerCase());

  return (
    <div>
      <div className="mb-7">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> Bookings
        </span>
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">Booking Requests</h2>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-5">
        {GUIDE_BOOKING_TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count =
            tab === "All"
              ? bookings.length
              : bookings.filter((b) => b.status === tab.toLowerCase()).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                isActive
                  ? "bg-forest-500 text-white border-forest-500 shadow-sm"
                  : "bg-white text-stone-600 border-stone-200 hover:border-forest-300 hover:text-forest-600"
              }`}
            >
              {tab}
              {count > 0 && (
                <span className={`text-[11px] px-1.5 py-px rounded-full font-semibold ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                  <div className="h-3 bg-stone-100 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="17" rx="2" stroke="#a8a29e" strokeWidth="1.5" />
              <path d="M8 2v4M16 2v4M3 10h18" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="font-serif text-[1.1rem] font-semibold text-stone-800 mb-2">
            {activeTab === "All" ? "No bookings yet" : `No ${activeTab.toLowerCase()} bookings`}
          </h3>
          <p className="text-[13.5px] text-stone-400 max-w-[280px] leading-relaxed">
            {activeTab === "All"
              ? "Complete your profile and get verified to start receiving booking requests from trekkers."
              : `You have no bookings with ${activeTab.toLowerCase()} status.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const trekker = booking.trekker;
            const action  = actionState[booking._id];

            return (
              <div
                key={booking._id}
                className="bg-white border border-stone-200 rounded-2xl p-5"
              >
                <div className="flex items-start gap-3">
                  <TrekkerAvatar trekker={trekker} />

                  <div className="flex-1 min-w-0">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <div>
                        <div className="text-[14px] font-semibold text-stone-900">
                          {trekker?.fullName || "Trekker"}
                        </div>
                        <div className="text-[12px] text-stone-400">{trekker?.email || ""}</div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium capitalize shrink-0 ${STATUS_BADGE_CLS[booking.status] || STATUS_BADGE_CLS.pending}`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2.5">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold">Route</span>
                        <p className="text-[13px] text-stone-700 font-medium truncate">{booking.route || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold">Start date</span>
                        <p className="text-[13px] text-stone-700 font-medium">{formatBookingDate(booking.startDate)}</p>
                      </div>
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold">Duration</span>
                        <p className="text-[13px] text-stone-700 font-medium">{booking.days} day{booking.days !== 1 ? "s" : ""}</p>
                      </div>
                      {booking.totalCost > 0 && (
                        <div>
                          <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold">Est. cost</span>
                          <p className="text-[13px] font-bold text-terra-500">{formatNPR(booking.totalCost)}</p>
                        </div>
                      )}
                    </div>

                    {/* Trekker message */}
                    {booking.message && (
                      <div className="mt-3 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 border-l-2 border-l-forest-300">
                        <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold block mb-0.5">Message from trekker</span>
                        <p className="text-[12.5px] text-stone-600 leading-relaxed italic">"{booking.message}"</p>
                      </div>
                    )}

                    {/* Guide note if already set */}
                    {booking.guideNote && (
                      <div className="mt-2 px-3 py-2 rounded-xl bg-forest-50 border border-forest-200">
                        <span className="text-[11px] uppercase tracking-[0.08em] text-forest-600 font-semibold block mb-0.5">Your note</span>
                        <p className="text-[12.5px] text-forest-700 leading-relaxed">{booking.guideNote}</p>
                      </div>
                    )}

                    {/* Actions. Message button is always available on active
                        bookings so the guide can reply to the trekker. */}
                    {["pending", "confirmed", "completed"].includes(booking.status) && !action && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() => openAction(booking._id, "confirm")}
                              className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold bg-forest-500 text-white hover:bg-forest-600 transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => openAction(booking._id, "reject")}
                              className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setChattingWith(booking)}
                          className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                        >
                          Message trekker
                        </button>
                      </div>
                    )}

                    {/* Inline confirm/reject note input */}
                    {action && (
                      <div className="mt-3 p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                        <label className="block text-[11.5px] font-semibold text-stone-500 uppercase tracking-[0.1em]">
                          {action.open === "confirm" ? "Add a confirmation note (optional)" : "Reason for rejection (optional)"}
                        </label>
                        <textarea
                          rows={2}
                          value={action.note}
                          onChange={(e) => setNote(booking._id, e.target.value)}
                          placeholder={action.open === "confirm" ? "e.g. Looking forward to guiding you!" : "e.g. Unavailable on those dates."}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-[13px] text-stone-800 outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-colors resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            disabled={action.saving}
                            onClick={() => handleAction(booking._id, action.open === "confirm" ? "confirmed" : "rejected")}
                            className={`px-4 py-1.5 rounded-xl text-[12.5px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              action.open === "confirm"
                                ? "bg-forest-500 text-white hover:bg-forest-600"
                                : "bg-red-500 text-white hover:bg-red-600"
                            }`}
                          >
                            {action.saving
                              ? "Saving…"
                              : action.open === "confirm"
                              ? "Confirm booking"
                              : "Reject booking"}
                          </button>
                          <button
                            disabled={action.saving}
                            onClick={() => closeAction(booking._id)}
                            className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold border border-stone-200 text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {chattingWith && (
        <ChatModal booking={chattingWith} onClose={() => setChattingWith(null)} />
      )}
    </div>
  );
}

/* ── Rejection banner ────────────────────────────────────────────── */
function RejectionBanner({ reason, onReapplied, showToast }) {
  const [submitting, setSubmitting] = useState(false);

  async function handleReapply() {
    setSubmitting(true);
    try {
      await guideService.reapply();
      showToast?.("Re-application submitted — your profile is back to pending review.");
      await onReapplied?.();
    } catch (err) {
      showToast?.(err?.response?.data?.message || "Couldn't re-apply. Try again.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-red-600">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 4v5M8 11.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-[1rem] font-semibold text-red-700 mb-0.5">Your application was not approved</h3>
          <p className="text-[12.5px] text-red-600/80">
            The admin team has left a note below. Address it, then submit a re-application so they can review again.
          </p>
        </div>
      </div>

      {reason ? (
        <div className="bg-white border border-red-200 rounded-xl p-3 mb-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-red-500 font-semibold mb-1">Admin note</p>
          <p className="text-[13px] text-stone-800 whitespace-pre-wrap leading-relaxed">{reason}</p>
        </div>
      ) : (
        <div className="bg-white border border-red-200 rounded-xl p-3 mb-4 text-[12.5px] text-stone-500 italic">
          No reason was recorded. Please contact support if you need clarification.
        </div>
      )}

      <button
        onClick={handleReapply}
        disabled={submitting}
        className="px-4 py-2 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Re-apply for verification"}
      </button>
    </div>
  );
}

/* ── Shared components ──────────────────────────────────────────── */
const inputCls = "w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] text-stone-800 outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 transition-colors";

// eslint-disable-next-line no-unused-vars -- kept for future form sections
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

function ReviewsIcon({ active }) {
  const c = active ? "#2D6A4F" : "currentColor";
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.8l1.75 3.55 3.92.57-2.84 2.77.67 3.9L8 10.77l-3.5 1.82.67-3.9L2.33 5.92l3.92-.57L8 1.8z" stroke={c} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function EarningsIcon({ active }) {
  const c = active ? "#2D6A4F" : "currentColor";
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.3" />
      <path d="M8 4.5v7M10 6.25c-.33-.67-1-1-2-1s-1.67.33-2 1 .67 1 2 1 2 .33 2 1-1 1-2 1-1.67-.33-2-1" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/* ── Reviews tab ─────────────────────────────────────────────────── */
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    guideService.getMyReviews()
      .then((data) => {
        const list = data.reviews || [];
        setReviews(list);
        if (list.length) {
          const sum = list.reduce((a, r) => a + (r.rating || 0), 0);
          setAvg(Math.round((sum / list.length) * 10) / 10);
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[1.6rem] font-bold text-stone-900">Reviews</h2>
        <p className="text-[13px] text-stone-400 mt-1">
          {reviews.length > 0 ? `${avg.toFixed(1)} ★ average · ${reviews.length} ${reviews.length === 1 ? "review" : "reviews"}` : "No reviews yet."}
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center">
          <p className="text-[14px] text-stone-500">Once a trekker completes a trek with you and leaves feedback, it'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white border border-stone-200 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  {r.trekker?.profilePhoto ? (
                    <img src={r.trekker.profilePhoto} alt={r.trekker.fullName} className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[11px] font-semibold text-stone-500">
                      {(r.trekker?.fullName || "T").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-[13.5px] font-semibold text-stone-800">{r.trekker?.fullName || "Trekker"}</div>
                    <div className="text-[11.5px] text-stone-400">{new Date(r.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
                  </div>
                </div>
                <span className="shrink-0 text-[13px] font-semibold text-terra-500" style={{ color: "#e0b874" }}>
                  {"★".repeat(r.rating)}
                  <span className="text-stone-200">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              {r.comment && (
                <p className="text-[13.5px] text-stone-700 leading-relaxed mt-2 whitespace-pre-wrap">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Earnings tab ────────────────────────────────────────────────── */
function EarningsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guideService.getMyEarnings()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="bg-white border border-stone-200 rounded-2xl p-10 animate-pulse h-48" />;
  if (!data) return <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-[14px] text-stone-500">Couldn't load earnings.</div>;

  const { totals, monthly, recent } = data;
  const cards = [
    { label: "Total revenue",   value: formatNPR(totals.totalRevenue), sub: `${totals.bookings} paid ${totals.bookings === 1 ? "booking" : "bookings"}`, color: "#2D6A4F" },
    { label: "Platform fees",   value: formatNPR(totals.platformFees), sub: "Already deducted",               color: "#7c3aed" },
    { label: "Net earnings",    value: formatNPR(totals.netEarnings),  sub: "Your take-home",                 color: "#16a34a" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-[1.6rem] font-bold text-stone-900">Earnings</h2>
        <p className="text-[13px] text-stone-400 mt-1">All values in NPR. Only paid bookings are counted.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-stone-200 rounded-2xl p-5">
            <div className="text-[11px] uppercase tracking-[0.14em] text-stone-400 font-semibold mb-2">{c.label}</div>
            <div className="font-serif text-[1.5rem] font-bold" style={{ color: c.color }}>{c.value}</div>
            <div className="text-[12px] text-stone-500 mt-1">{c.sub}</div>
          </div>
        ))}
      </div>

      {monthly.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5 mb-8">
          <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-3">Monthly breakdown</h3>
          <div className="space-y-2">
            {monthly.map((m) => (
              <div key={`${m.year}-${m.month}`} className="flex items-center justify-between text-[13px]">
                <span className="text-stone-500">
                  {new Date(m.year, m.month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
                <span className="font-medium text-stone-800 tabular-nums">
                  {formatNPR(m.revenue)} <span className="text-stone-400 text-[11px] font-normal">· {m.bookings}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recent.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-3">Recent payments</h3>
          <div className="space-y-3">
            {recent.map((b) => (
              <div key={b._id} className="flex items-center justify-between gap-3 text-[13px]">
                <div className="flex-1 min-w-0">
                  <div className="text-stone-800 font-medium truncate">{b.route}</div>
                  <div className="text-[11.5px] text-stone-400 truncate">
                    {b.trekker?.fullName || "Trekker"} · {b.days} day{b.days === 1 ? "" : "s"} · paid {new Date(b.paidAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
                <span className="font-semibold text-stone-900 tabular-nums shrink-0">{formatNPR(b.totalCost)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
