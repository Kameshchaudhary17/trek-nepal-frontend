import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";

export default function GuideDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role !== "guide") { navigate("/dashboard"); return; }
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
              <span className="w-5 h-px bg-[#e0b874]" /> Guide Dashboard
            </span>
            <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-bold text-[#f5ead0] leading-tight">
              Welcome, <span className="text-[#e0b874]">{user.fullName?.split(" ")[0]}</span>
            </h1>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-[1rem] text-white bg-[linear-gradient(135deg,#4a9a6a70,#4a9a6a40)] border border-[#4a9a6a50] shrink-0">
            {initials}
          </div>
        </div>

        {/* Verification banner */}
        <div className="flex items-start gap-3 bg-[#4a7a8a]/10 border border-[#4a7a8a]/25 rounded-2xl p-4 mb-8">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5">
            <path d="M10 2L4 5v6c0 4.142 2.8 7.374 6 8 3.2-.626 6-3.858 6-8V5L10 2z" stroke="#8ac8d8" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M7 10l2 2 4-4" stroke="#8ac8d8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-[13.5px] font-medium text-[#c8e8f0] mb-0.5">Application under review</p>
            <p className="text-[12.5px] text-[#6a9aa8] leading-relaxed">
              Your NTB credentials are being verified. You'll receive an email within 2–3 business days once your account is activated.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Booking requests", value: "0", icon: "📋" },
            { label: "Treks completed", value: "0", icon: "⛰️" },
            { label: "Average rating", value: "—", icon: "★" },
            { label: "Total earnings", value: "$0", icon: "💰" },
          ].map((s) => (
            <div key={s.label} className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl p-4 text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-serif text-[1.6rem] font-bold text-[#e0b874]">{s.value}</div>
              <div className="text-[12px] text-[#5a7868] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <ActionCard
            icon="👤"
            title="Complete Your Profile"
            desc="Add your specialties, routes, languages, and daily rate to attract trekkers."
            href="/guide/profile"
            cta="Set up profile"
            highlight
          />
          <ActionCard
            icon="📅"
            title="Manage Availability"
            desc="Set your available dates so trekkers can book you at the right time."
            href="/guide/availability"
            cta="Set availability"
          />
          <ActionCard
            icon="💬"
            title="Trekker Messages"
            desc="Respond to enquiries from trekkers interested in booking your services."
            href="/guide/messages"
            cta="View messages"
          />
        </div>

        {/* Booking requests placeholder */}
        <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl p-6">
          <h2 className="font-serif text-[1.1rem] font-semibold text-[#f0e4c8] mb-1">Booking Requests</h2>
          <p className="text-[13px] text-[#5a7868] mb-6">Incoming booking requests from trekkers will appear here.</p>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-xl mb-3">📭</div>
            <p className="text-[14px] text-[#6a8878] mb-4">No requests yet</p>
            <p className="text-[13px] text-[#4a6858] max-w-[260px]">Complete your profile and get verified to start receiving bookings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, href, cta, highlight }) {
  return (
    <div className={`flex flex-col rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] ${
      highlight
        ? "bg-[linear-gradient(160deg,rgba(224,184,116,0.08),rgba(168,133,58,0.05))] border border-[#e0b874]/20 hover:border-[#e0b874]/35"
        : "bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] hover:border-white/20"
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${highlight ? "bg-[#e0b874]/15 border border-[#e0b874]/25" : "bg-[#e0b874]/10 border border-[#e0b874]/15"}`}>
        {icon}
      </div>
      <h3 className="font-serif text-[1rem] font-semibold text-[#f0e4c8] mb-1.5">{title}</h3>
      <p className="text-[13px] text-[#7a9888] leading-relaxed mb-4 flex-1">{desc}</p>
      <Link to={href} className="text-[13px] text-[#e0b874] hover:text-[#f0cc88] transition-colors flex items-center gap-1">
        {cta}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </div>
  );
}
