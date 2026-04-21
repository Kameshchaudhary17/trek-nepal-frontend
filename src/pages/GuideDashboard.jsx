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
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-[86px] pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-1.5">
              <span className="w-5 h-px bg-forest-300" /> Guide Dashboard
            </span>
            <h1 className="font-serif text-[2rem] sm:text-[2.4rem] font-bold text-stone-900 leading-tight">
              Welcome, <span className="text-forest-500">{user.fullName?.split(" ")[0]}</span>
            </h1>
          </div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-[1rem] text-white bg-forest-500 shrink-0">
            {initials}
          </div>
        </div>

        {/* Verification banner */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0 mt-0.5 text-blue-500">
            <path d="M10 2L4 5v6c0 4.142 2.8 7.374 6 8 3.2-.626 6-3.858 6-8V5L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <p className="text-[13.5px] font-medium text-blue-800 mb-0.5">Application under review</p>
            <p className="text-[12.5px] text-blue-600 leading-relaxed">
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
            <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-4 text-center hover:border-stone-300 hover:shadow-sm transition-all">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-serif text-[1.6rem] font-bold text-forest-500">{s.value}</div>
              <div className="text-[12px] text-stone-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          <ActionCard icon="👤" title="Complete Your Profile" desc="Add your specialties, routes, languages, and daily rate to attract trekkers." href="/guide/profile" cta="Set up profile" highlight />
          <ActionCard icon="📅" title="Manage Availability" desc="Set your available dates so trekkers can book you at the right time." href="/guide/availability" cta="Set availability" />
          <ActionCard icon="💬" title="Trekker Messages" desc="Respond to enquiries from trekkers interested in booking your services." href="/guide/messages" cta="View messages" />
        </div>

        {/* Booking requests */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="font-serif text-[1.1rem] font-semibold text-stone-900 mb-1">Booking Requests</h2>
          <p className="text-[13px] text-stone-400 mb-6">Incoming booking requests from trekkers will appear here.</p>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-xl mb-3">📭</div>
            <p className="text-[14px] text-stone-500 mb-2">No requests yet</p>
            <p className="text-[13px] text-stone-400 max-w-[260px]">Complete your profile and get verified to start receiving bookings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon, title, desc, href, cta, highlight }) {
  return (
    <div className={`flex flex-col rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md border ${
      highlight
        ? "bg-forest-50 border-forest-200 hover:border-forest-300"
        : "bg-white border-stone-200 hover:border-stone-300"
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4 ${highlight ? "bg-forest-100 border border-forest-200" : "bg-stone-100 border border-stone-200"}`}>
        {icon}
      </div>
      <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-1.5">{title}</h3>
      <p className="text-[13px] text-stone-500 leading-relaxed mb-4 flex-1">{desc}</p>
      <Link to={href} className="text-[13px] text-forest-600 hover:text-forest-700 font-medium transition-colors flex items-center gap-1">
        {cta}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </Link>
    </div>
  );
}
