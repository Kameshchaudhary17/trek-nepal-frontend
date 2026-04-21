import SectionHeader from "./SectionHeader";

export default function SettingsSection() {
  const cards = [
    { title: "Email Notifications", desc: "Configure SMTP settings and notification templates.", icon: "✉️" },
    { title: "Google OAuth",        desc: "Manage Google OAuth credentials and authorized origins.", icon: "🔐" },
    { title: "NTB Integration",     desc: "Connect to Nepal Tourism Board API for credential verification.", icon: "🏛️" },
    { title: "Platform Fees",       desc: "Set guide booking fee percentages and payout rules.", icon: "%" },
  ];

  return (
    <div>
      <SectionHeader title="Platform Settings" sub="Configuration and system preferences" />
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((s) => (
          <div key={s.title} className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{s.icon}</span>
              <div>
                <h4 className="text-[14px] font-semibold text-stone-800 mb-1">{s.title}</h4>
                <p className="text-[12.5px] text-stone-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100">
              <span className="text-[11px] text-stone-500 bg-stone-100 border border-stone-200 px-2.5 py-1 rounded-full font-medium">
                Coming soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
