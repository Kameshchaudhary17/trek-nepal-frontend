import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Guides", to: "/guides" },
  { label: "Routes", to: "/routes" },
  { label: "Conditions", to: "/conditions" },
  { label: "Pricing", to: "/pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userRole = (() => { try { return JSON.parse(localStorage.getItem("user"))?.role; } catch { return null; } })();
  const dashboardPath = userRole === "guide" ? "/guide/dashboard" : "/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#07091a]/90 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <span className="text-[#e0b874]">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </span>
          <span className="font-serif text-[1.1rem] font-bold tracking-wide text-[#f5ead0]">
            TrekDirect<span className="text-[#e0b874]">Nepal</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 text-[14px] text-[#b0c0b8] hover:text-[#f0e4c8] transition-colors rounded-lg hover:bg-white/[0.05]"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <Link
              to={dashboardPath}
              className="px-4 py-2 text-[14px] bg-gradient-to-br from-[#e8c07c] to-[#a8853a] text-[#0e1a14] rounded-lg font-semibold transition-all hover:shadow-[0_4px_16px_rgba(224,184,116,0.4)] hover:-translate-y-[1px]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-[14px] text-[#b0c0b8] hover:text-[#f0e4c8] transition-colors">
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-[9px] text-[14px] bg-gradient-to-br from-[#e8c07c] to-[#a8853a] text-[#0e1a14] rounded-lg font-semibold transition-all hover:shadow-[0_4px_16px_rgba(224,184,116,0.4)] hover:-translate-y-[1px]"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-[1.5px] bg-[#c0b090] transition-all ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-[#c0b090] transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-[#c0b090] transition-all ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#07091a]/95 backdrop-blur-xl border-t border-white/[0.07] px-5 py-4 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="block py-3 px-3 text-[15px] text-[#b0c0b8] hover:text-[#f0e4c8] rounded-lg hover:bg-white/[0.05]">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-white/[0.06] mt-3">
            <Link to="/login" className="block py-3 px-3 text-[15px] text-[#b0c0b8] hover:text-[#f0e4c8]">Sign in</Link>
            <Link to="/register" className="block py-3 px-4 text-center text-[15px] bg-gradient-to-br from-[#e8c07c] to-[#a8853a] text-[#0e1a14] rounded-xl font-semibold">
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
