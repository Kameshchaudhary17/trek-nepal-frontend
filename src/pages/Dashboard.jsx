import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";

const NAV = [
  { id: "overview",  label: "Overview",  icon: OverviewIcon  },
  { id: "explore",   label: "Explore",   icon: ExploreIcon   },
  { id: "bookings",  label: "Bookings",  icon: BookingsIcon  },
  { id: "account",   label: "Account",   icon: AccountIcon   },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user,        setUser]        = useState(null);
  const [activeTab,   setActiveTab]   = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token  = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "guide")  { navigate("/guide/dashboard"); return; }
    if (parsed.role === "admin")  { navigate("/admin");           return; }
    setUser(parsed);
  }, [navigate]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const close = () => setSidebarOpen(false);
    document.addEventListener("click", close, { once: true });
    return () => document.removeEventListener("click", close);
  }, [sidebarOpen]);

  if (!user) return null;

  const initials = user.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <Navbar />

      <div className="flex pt-[68px] min-h-screen">
        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`fixed top-[68px] left-0 h-[calc(100vh-68px)] w-[240px] bg-white border-r border-stone-200 flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
          {/* User info */}
          <div className="px-5 pt-6 pb-5 border-b border-stone-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-[0.9rem] text-white bg-forest-500 shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-stone-900 truncate">{user.fullName}</div>
                <div className="text-[11px] text-stone-400 truncate">{user.email}</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-semibold">
              Trekker
            </span>
          </div>

          {/* Nav */}
          <nav className="px-4 pt-4 space-y-1 flex-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-3 px-2">Trekker Panel</p>
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
            <div className="bg-forest-50 border border-forest-200 rounded-xl p-3">
              <p className="text-[11px] text-forest-700 font-medium mb-0.5">Ready to trek?</p>
              <Link to="/treks" className="text-[11px] text-forest-600 hover:text-forest-700 font-semibold transition-colors">
                Browse routes →
              </Link>
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
            {activeTab === "overview" && <OverviewTab user={user} setActiveTab={setActiveTab} />}
            {activeTab === "explore"  && <ExploreTab />}
            {activeTab === "bookings" && <BookingsTab />}
            {activeTab === "account"  && <AccountTab user={user} />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ── Overview Tab ───────────────────────────────────────────────── */
function OverviewTab({ user, setActiveTab }) {
  const stats = [
    { label: "Upcoming treks",  value: "0", sub: "Confirmed bookings" },
    { label: "Saved guides",    value: "0", sub: "In your list" },
    { label: "Treks completed", value: "0", sub: "All time" },
    { label: "Reviews given",   value: "0", sub: "Guide reviews" },
  ];

  return (
    <div>
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> Overview
        </span>
        <h1 className="font-serif text-[2rem] sm:text-[2.3rem] font-bold text-stone-900 leading-tight">
          Welcome, <span className="text-forest-500">{user.fullName?.split(" ")[0]}</span>
        </h1>
        <p className="text-[14px] text-stone-500 mt-1.5">Plan your next Nepal adventure.</p>
      </div>

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

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {[
          { icon: "⛰️", title: "Browse Treks",      desc: "Explore 12+ curated Nepal routes with difficulty ratings, permits and season guides.", to: "/treks",      cta: "Explore routes" },
          { icon: "🧗", title: "Find a Guide",       desc: "Browse NTB-verified guides filtered by route, language, experience and daily rate.",  to: "/guides",     cta: "Browse guides" },
          { icon: "💰", title: "Calculate Cost",     desc: "Use the price calculator to estimate your full trek budget — guide, permits, season.", to: "/pricing",    cta: "Calculate now" },
          { icon: "🌤️", title: "Trail Conditions",  desc: "Check live weather and trail status across 40+ Nepal locations before you book.",     to: "/conditions", cta: "Check now" },
          { icon: "📋", title: "My Bookings",        desc: "View and manage your upcoming and past trek bookings.",                                tab: "bookings",   cta: "View bookings" },
          { icon: "👤", title: "Account Settings",   desc: "Update your profile details, email and preferences.",                                 tab: "account",    cta: "Edit account" },
        ].map(({ icon, title, desc, to, tab, cta }) => (
          to ? (
            <Link key={title} to={to} className="flex flex-col bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="w-10 h-10 rounded-xl bg-forest-100 border border-forest-200 flex items-center justify-center text-xl mb-4">{icon}</div>
              <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-1.5">{title}</h3>
              <p className="text-[13px] text-stone-500 leading-relaxed mb-4 flex-1">{desc}</p>
              <span className="text-[13px] text-forest-600 group-hover:text-forest-700 font-medium flex items-center gap-1 transition-colors">
                {cta}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </Link>
          ) : (
            <button key={title} onClick={() => setActiveTab(tab)} className="flex flex-col bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-md transition-all hover:-translate-y-0.5 group text-left">
              <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl mb-4">{icon}</div>
              <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-1.5">{title}</h3>
              <p className="text-[13px] text-stone-500 leading-relaxed mb-4 flex-1">{desc}</p>
              <span className="text-[13px] text-forest-600 group-hover:text-forest-700 font-medium flex items-center gap-1 transition-colors">
                {cta}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </button>
          )
        ))}
      </div>
    </div>
  );
}

/* ── Explore Tab ────────────────────────────────────────────────── */
function ExploreTab() {
  const links = [
    { icon: "⛰️", label: "Trek Routes",    sub: "12 curated routes",            to: "/treks",      color: "bg-blue-50 border-blue-200 text-blue-700" },
    { icon: "🧗", label: "Verified Guides", sub: "NTB-certified professionals",  to: "/guides",     color: "bg-forest-50 border-forest-200 text-forest-700" },
    { icon: "💰", label: "Pricing",         sub: "Transparent cost breakdown",   to: "/pricing",    color: "bg-amber-50 border-amber-200 text-amber-700" },
    { icon: "🌤️", label: "Trail Conditions", sub: "Live weather & status",       to: "/conditions", color: "bg-sky-50 border-sky-200 text-sky-700" },
  ];

  return (
    <div>
      <div className="mb-7">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> Explore
        </span>
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">Plan Your Trek</h2>
        <p className="text-[13.5px] text-stone-400 mt-1">Everything you need to plan the perfect Nepal trekking experience.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {links.map(({ icon, label, sub, to, color }) => (
          <Link key={to} to={to} className="flex items-center gap-5 bg-white border border-stone-200 rounded-2xl p-6 hover:border-stone-300 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border ${color} shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-[1.05rem] font-semibold text-stone-900 mb-0.5">{label}</div>
              <div className="text-[12.5px] text-stone-400">{sub}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-stone-300 group-hover:text-stone-500 transition-colors shrink-0">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </div>

      <div className="mt-6 p-5 bg-forest-50 border border-forest-200 rounded-2xl">
        <h3 className="font-serif text-[1rem] font-semibold text-forest-900 mb-1.5">Best time to trek</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {[
            { season: "Spring", months: "Mar–May", badge: "High season", color: "bg-green-100 text-green-700" },
            { season: "Monsoon", months: "Jun–Aug", badge: "Avoid if possible", color: "bg-blue-100 text-blue-700" },
            { season: "Autumn", months: "Sep–Nov", badge: "Peak season", color: "bg-amber-100 text-amber-700" },
            { season: "Winter", months: "Dec–Feb", badge: "Low season", color: "bg-sky-100 text-sky-700" },
          ].map((s) => (
            <div key={s.season} className="bg-white border border-forest-100 rounded-xl p-3">
              <div className="font-semibold text-[13px] text-stone-800 mb-0.5">{s.season}</div>
              <div className="text-[11.5px] text-stone-500 mb-1.5">{s.months}</div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.badge}</span>
            </div>
          ))}
        </div>
      </div>
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
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">My Bookings</h2>
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl mb-4">📋</div>
        <h3 className="font-serif text-[1.1rem] font-semibold text-stone-800 mb-2">No bookings yet</h3>
        <p className="text-[13.5px] text-stone-400 max-w-[280px] leading-relaxed mb-6">
          Your upcoming and past trek bookings will appear here once you book a guide.
        </p>
        <Link to="/guides" className="px-6 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all">
          Find a guide
        </Link>
      </div>
    </div>
  );
}

/* ── Account Tab ────────────────────────────────────────────────── */
function AccountTab({ user }) {
  return (
    <div className="max-w-[560px]">
      <div className="mb-7">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> Account
        </span>
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">Account Details</h2>
      </div>

      <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100">
        {[
          { label: "Full name",  value: user.fullName },
          { label: "Email",      value: user.email },
          { label: "Role",       value: user.role === "trekker" ? "Trekker" : user.role },
          { label: "Phone",      value: user.phone || "Not set" },
          { label: "Member since", value: "2026" },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-5 py-4">
            <span className="text-[12.5px] text-stone-400 font-medium uppercase tracking-[0.08em]">{label}</span>
            <span className="text-[14px] text-stone-800 font-medium">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <p className="text-[12.5px] text-blue-700 leading-relaxed">
          To update your email or password, please contact support. Profile editing coming in a future release.
        </p>
      </div>
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

function ExploreIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M10.5 5.5l-2 5-2-2-1.5 1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

function AccountIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
