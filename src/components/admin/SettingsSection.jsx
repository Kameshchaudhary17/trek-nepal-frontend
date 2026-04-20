import SectionHeader from "./SectionHeader";

export default function SettingsSection() {
  const cards = [
    { title: "Email Notifications", desc: "Configure SMTP settings and notification templates.", icon: "✉️" },
    { title: "Google OAuth", desc: "Manage Google OAuth credentials and authorized origins.", icon: "🔐" },
    { title: "NTB Integration", desc: "Connect to Nepal Tourism Board API for credential verification.", icon: "🏛️" },
    { title: "Platform Fees", desc: "Set guide booking fee percentages and payout rules.", icon: "%" },
  ];

  return (
    <div>
      <SectionHeader title="Platform Settings" sub="Configuration and system preferences" />
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((s) => (
          <div
            key={s.title}
            className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.14] transition-all"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{s.icon}</span>
              <div>
                <h4 className="text-[14px] font-medium text-[#d0c8b0] mb-1">{s.title}</h4>
                <p className="text-[12.5px] text-[#5a7868] leading-relaxed">{s.desc}</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.05]">
              <span className="text-[11px] text-[#3a5848] bg-white/[0.03] border border-white/[0.06] px-2.5 py-1 rounded-full">
                Coming soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
