import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userRole = (() => { try { return JSON.parse(localStorage.getItem("user"))?.role; } catch { return null; } })();
  const dashboardPath = userRole === "guide" ? "/guide/dashboard" : userRole === "admin" ? "/admin" : "/dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    setOpen(false);
  };

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
          ? "bg-white border-b border-stone-200 shadow-sm"
          : "bg-white/95 backdrop-blur-sm border-b border-stone-200"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[66px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <span className="text-forest-500">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.55" />
            </svg>
          </span>
          <span className="font-serif text-[1.05rem] font-semibold tracking-wide text-stone-900">
            TrekDirect<span className="text-forest-500">Nepal</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-4 py-2 text-[14px] text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors rounded-lg font-medium"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          {token ? (
            <>
              <Link
                to={dashboardPath}
                className="px-4 py-2 text-[14px] text-stone-700 border border-stone-300 rounded-lg font-medium transition-all hover:border-stone-400 hover:bg-stone-50"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-[14px] bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium transition-all hover:bg-red-100 hover:border-red-300 flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-[14px] text-stone-700 hover:text-stone-900 border border-stone-300 rounded-lg font-medium transition-all hover:border-stone-400 hover:bg-stone-50">
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-[9px] text-[14px] bg-forest-500 text-white rounded-lg font-medium transition-all hover:bg-forest-600 hover:shadow-sm"
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
          <span className={`block w-5 h-[1.5px] bg-stone-600 transition-all ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-stone-600 transition-all ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-stone-600 transition-all ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-5 py-4 space-y-1 shadow-lg">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="block py-3 px-3 text-[15px] text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg font-medium">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-stone-100 mt-3">
            {token ? (
              <>
                <Link to={dashboardPath} className="block py-3 px-4 text-center text-[15px] bg-forest-500 text-white rounded-xl font-medium hover:bg-forest-600">
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 px-4 text-center text-[15px] bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-3 px-3 text-[15px] text-stone-600 hover:text-stone-900 font-medium">Sign in</Link>
                <Link to="/register" className="block py-3 px-4 text-center text-[15px] bg-forest-500 text-white rounded-xl font-medium hover:bg-forest-600">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
