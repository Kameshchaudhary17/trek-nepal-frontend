import { Link, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { id: "overview", label: "Overview",           icon: OverviewIcon },
  { id: "guides",   label: "Guide Verification", icon: ShieldIcon   },
  { id: "users",    label: "Users",              icon: UsersIcon    },
  { id: "treks",    label: "Trek Routes",        icon: TreksIcon    },
  { id: "pricing",  label: "Pricing",            icon: PricingIcon  },
  { id: "settings", label: "Settings",           icon: SettingsIcon },
];

export { NAV_ITEMS };

export default function AdminSidebar({ activeTab, setActiveTab, pendingCount, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-[260px] bg-white border-r border-stone-200 flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
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

        <div className="px-5 pt-5 pb-3 flex-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-4 px-2">
            Admin Panel
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] transition-all text-left font-medium ${
                  activeTab === id
                    ? "bg-forest-50 text-forest-700 border border-forest-200"
                    : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                }`}
              >
                <Icon active={activeTab === id} />
                {label}
                {id === "guides" && pendingCount > 0 && (
                  <span className="ml-auto bg-forest-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-5 pb-5 space-y-3">
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-3">
            <p className="text-[11px] text-forest-700 font-medium mb-0.5">Platform Status</p>
            <p className="text-[11px] text-forest-600">All systems operational</p>
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
    </>
  );
}

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

function ShieldIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L3 4v5c0 3.314 2.24 5.397 5 6 2.76-.603 5-2.686 5-6V4L8 1.5z" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.5 8l1.75 1.75 3.25-3.25" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M1.5 13c0-2.485 2.015-4.5 4.5-4.5S10.5 10.515 10.5 13" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="12" cy="5.5" r="1.75" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.2" />
      <path d="M14.5 13c0-1.933-1.12-3.5-2.5-3.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PricingIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v14M5 4h4.5a2.5 2.5 0 010 5H5M5 9h5a2.5 2.5 0 010 5H5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function TreksIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L15 14H1L8 1Z" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5 14L8 8L11 14" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.1" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

function SettingsIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
