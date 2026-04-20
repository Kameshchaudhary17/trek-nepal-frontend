import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "guide") { navigate("/guide/dashboard"); return; }
    setUser(parsed);
  }, [navigate]);

  if (!user) return null;

  const initials = user.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-[#05080f] text-[#f0e4c8] font-sans">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-[88px] pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#e0b874] font-medium mb-2">
              <span className="w-5 h-px bg-[#e0b874]" /> Trekker Dashboard
            </span>
            <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-bold text-[#f5ead0] leading-tight">
              Welcome back, <span className="text-[#e0b874]">{user.fullName?.split(" ")[0]}</span>
            </h1>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-[1rem] text-white bg-[linear-gradient(135deg,#4a7aaa70,#4a7aaa40)] border border-[#4a7aaa50] shrink-0">
            {initials}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Upcoming treks", value: "0", icon: "⛰️" },
            { label: "Saved guides", value: "0", icon: "🧗" },
            { label: "Treks completed", value: "0", icon: "✓" },
            { label: "Reviews given", value: "0", icon: "★" },
          ].map((s) => (
            <div key={s.label} className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-serif text-[1.6rem] font-bold text-[#e0b874]">{s.value}</div>
              <div className="text-[12px] text-[#5a7868] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <ActionCard
            icon="🧗"
            title="Find a Guide"
            desc="Browse 1,200+ NTB-verified guides filtered by route, language, and budget."
            href="/guides"
            cta="Browse guides"
          />
          <ActionCard
            icon="💰"
            title="Plan Your Budget"
            desc="Compare route costs, permit fees, and guide rates side-by-side."
            href="/pricing"
            cta="View pricing"
          />
          <ActionCard
            icon="🌤️"
            title="Trail Conditions"
            desc="Check live weather and trail status before you commit to a route."
            href="/conditions"
            cta="Check conditions"
          />
        </div>

        {/* Recent bookings placeholder */}
        <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="font-serif text-[1.1rem] font-semibold text-[#f0e4c8] mb-1">Recent Bookings</h2>
          <p className="text-[13px] text-[#5a7868] mb-6">Your upcoming and past trek bookings will appear here.</p>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-xl mb-3">📋</div>
            <p className="text-[14px] text-[#6a8878] mb-4">No bookings yet</p>
            <Link to="/guides" className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] text-[13px] font-semibold transition-all hover:shadow-[0_6px_20px_rgba(224,184,116,0.4)]">
              Find your first guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, href, cta }) {
  return (
    <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl p-5 hover:border-white/20 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col">
      <div className="w-10 h-10 rounded-xl bg-[#e0b874]/10 border border-[#e0b874]/15 flex items-center justify-center text-xl mb-4">{icon}</div>
      <h3 className="font-serif text-[1rem] font-semibold text-[#f0e4c8] mb-1.5">{title}</h3>
      <p className="text-[13px] text-[#7a9888] leading-relaxed mb-4 flex-1">{desc}</p>
      <Link to={href} className="text-[13px] text-[#e0b874] hover:text-[#f0cc88] transition-colors flex items-center gap-1">
        {cta}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </div>
  );
}
