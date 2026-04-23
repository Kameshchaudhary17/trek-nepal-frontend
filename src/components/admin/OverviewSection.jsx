import SectionHeader from "./SectionHeader";
import { formatNPR } from "../../utils/money";

export default function OverviewSection({ stats, activity, onGoToGuides }) {
  const statCards = [
    { label: "Total Guides",        value: stats.totalGuides,                 icon: "🧭", color: "#2D6A4F", bg: "bg-forest-50 border-forest-200", sub: `${stats.pendingVerification} pending` },
    { label: "Registered Trekkers", value: stats.totalTrekkers,               icon: "🎒", color: "#2563EB", bg: "bg-blue-50 border-blue-200",    sub: "All time" },
    { label: "Total Bookings",      value: stats.totalBookings,               icon: "📋", color: "#16a34a", bg: "bg-green-50 border-green-200",  sub: "Across all routes" },
    { label: "Platform Revenue",    value: formatNPR(stats.revenue),          icon: "💰", color: "#7c3aed", bg: "bg-violet-50 border-violet-200", sub: "Gross earnings" },
  ];

  return (
    <div>
      <SectionHeader title="Dashboard Overview" sub="Platform activity and key metrics" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className={`bg-white border ${s.bg.split(" ")[1]} rounded-2xl p-4`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className={`text-[11px] ${s.bg} rounded-full px-2 py-0.5 border`} style={{ color: s.color }}>{s.sub}</span>
            </div>
            <div className="font-serif text-[1.8rem] font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[12px] text-stone-500">{s.label}</div>
          </div>
        ))}
      </div>

      {stats.pendingVerification > 0 && (
        <button
          onClick={onGoToGuides}
          className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 hover:border-amber-300 hover:bg-amber-100 rounded-2xl p-4 mb-6 transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0 text-[1rem]">⏳</div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-amber-800">
              {stats.pendingVerification} guide{stats.pendingVerification !== 1 ? "s" : ""} awaiting verification
            </p>
            <p className="text-[12px] text-amber-600 truncate">Review NTB credentials and approve or reject their listings.</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 text-amber-400 group-hover:text-amber-600 transition-colors">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className="bg-white border border-stone-200 rounded-2xl p-5">
        <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {activity.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-sm shrink-0">{a.icon}</span>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-[13px] text-stone-700 leading-snug">{a.text}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
