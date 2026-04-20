import SectionHeader from "./SectionHeader";

export default function OverviewSection({ stats, activity, onGoToGuides }) {
  const statCards = [
    { label: "Total Guides", value: stats.totalGuides, icon: "🧭", color: "#e0b874", sub: `${stats.pendingVerification} pending` },
    { label: "Registered Trekkers", value: stats.totalTrekkers, icon: "🎒", color: "#8ac8d8", sub: "All time" },
    { label: "Total Bookings", value: stats.totalBookings, icon: "📋", color: "#88cc99", sub: "Across all routes" },
    { label: "Platform Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: "💰", color: "#c888d8", sub: "Gross earnings" },
  ];

  return (
    <div>
      <SectionHeader title="Dashboard Overview" sub="Platform activity and key metrics" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-[11px] text-[#4a6858] bg-white/[0.04] rounded-full px-2 py-0.5">{s.sub}</span>
            </div>
            <div className="font-serif text-[1.8rem] font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[12px] text-[#5a7868]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending verification alert */}
      {stats.pendingVerification > 0 && (
        <button
          onClick={onGoToGuides}
          className="w-full flex items-center gap-3 bg-[#e0b874]/08 border border-[#e0b874]/25 hover:border-[#e0b874]/40 rounded-2xl p-4 mb-6 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#e0b874]/15 border border-[#e0b874]/25 flex items-center justify-center shrink-0 text-[#e0b874] text-[1rem]">⏳</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-medium text-[#e0b874]">
              {stats.pendingVerification} guide{stats.pendingVerification !== 1 ? "s" : ""} awaiting verification
            </p>
            <p className="text-[12px] text-[#9a8050] truncate">Review NTB credentials and approve or reject their listings.</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-[#9a8050] group-hover:text-[#e0b874] transition-colors">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Recent activity */}
      <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl p-5">
        <h3 className="font-serif text-[1rem] font-semibold text-[#f0e4c8] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activity.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sm shrink-0">{a.icon}</span>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[13px] text-[#b0c0b0] leading-snug">{a.text}</p>
                <p className="text-[11px] text-[#4a6050] mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
