const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: OverviewIcon },
  { id: "guides", label: "Guide Verification", icon: ShieldIcon },
  { id: "users", label: "Users", icon: UsersIcon },
  { id: "pricing", label: "Pricing", icon: PricingIcon },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

export { NAV_ITEMS };

export default function AdminSidebar({ activeTab, setActiveTab, pendingCount, sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-[68px] left-0 h-[calc(100vh-68px)] w-[220px] bg-[#07091a] border-r border-white/[0.07] flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="px-4 pt-5 pb-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#3a5048] font-medium mb-3 px-2">
            Admin Panel
          </p>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all text-left ${
                  activeTab === id
                    ? "bg-[#e0b874]/12 text-[#e0b874] border border-[#e0b874]/20"
                    : "text-[#7a9080] hover:text-[#c0d0c0] hover:bg-white/[0.04]"
                }`}
              >
                <Icon active={activeTab === id} />
                {label}
                {id === "guides" && pendingCount > 0 && (
                  <span className="ml-auto bg-[#e0b874] text-[#0e1a14] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-6">
          <div className="bg-[#4a9a6a]/10 border border-[#4a9a6a]/20 rounded-xl p-3">
            <p className="text-[11px] text-[#4a9a6a] font-medium mb-0.5">Platform Status</p>
            <p className="text-[11px] text-[#3a7858]">All systems operational</p>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ── Nav icons ────────────────────────────────────────────────── */
function OverviewIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" />
    </svg>
  );
}

function ShieldIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L3 4v5c0 3.314 2.24 5.397 5 6 2.76-.603 5-2.686 5-6V4L8 1.5z" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M5.5 8l1.75 1.75 3.25-3.25" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="2.5" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" />
      <path d="M1.5 13c0-2.485 2.015-4.5 4.5-4.5S10.5 10.515 10.5 13" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="12" cy="5.5" r="1.75" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.2" />
      <path d="M14.5 13c0-1.933-1.12-3.5-2.5-3.5" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function PricingIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v14M5 4h4.5a2.5 2.5 0 010 5H5M5 9h5a2.5 2.5 0 010 5H5" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" stroke={active ? "#e0b874" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
