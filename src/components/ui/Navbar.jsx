import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NAV_LINKS = [
  { label: "Treks",      to: "/treks"      },
  { label: "Guides",     to: "/guides"     },
  { label: "Conditions", to: "/conditions" },
  { label: "Pricing",    to: "/pricing"    },
];

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location    = useLocation();
  const navigate    = useNavigate();

  const token    = localStorage.getItem("token");
  const userData = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  const userRole = userData?.role;
  const userName = userData?.fullName || "";
  const initials = userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const dashboardPath = userRole === "guide" ? "/guide/dashboard" : userRole === "admin" ? "/admin" : "/dashboard";
  const roleLabel     = userRole === "guide" ? "Guide" : userRole === "admin" ? "Admin" : "Trekker";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white border-b border-stone-200 shadow-sm" : "bg-white/95 backdrop-blur-sm border-b border-stone-200"}`}>
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-[66px] flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
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

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 text-[14px] font-medium rounded-lg transition-colors ${
                location.pathname === l.to
                  ? "text-forest-600 bg-forest-50"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-2">
          {token ? (
            /* ── Avatar dropdown ── */
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all group"
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-lg bg-forest-500 flex items-center justify-center text-white font-serif font-bold text-[11px] shrink-0">
                  {initials}
                </div>
                <div className="text-left">
                  <div className="text-[13px] font-semibold text-stone-800 leading-tight">{userName.split(" ")[0]}</div>
                  <div className="text-[10px] text-stone-400 leading-none">{roleLabel}</div>
                </div>
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`text-stone-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden py-1 z-50">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-stone-100">
                    <div className="text-[13px] font-semibold text-stone-800 truncate">{userName}</div>
                    <div className="text-[11.5px] text-stone-400 truncate">{userData?.email}</div>
                  </div>

                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors font-medium"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                    Dashboard
                  </Link>

                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-red-500 hover:bg-red-50 transition-colors font-medium"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="px-4 py-2 text-[14px] text-stone-700 hover:text-stone-900 border border-stone-300 rounded-lg font-medium transition-all hover:border-stone-400 hover:bg-stone-50">
                Sign in
              </Link>
              <Link to="/register" className="px-4 py-[9px] text-[14px] bg-forest-500 text-white rounded-lg font-medium transition-all hover:bg-forest-600 hover:shadow-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className={`block w-5 h-[1.5px] bg-stone-600 transition-all ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-stone-600 transition-all ${mobileOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-stone-600 transition-all ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-stone-100 px-5 py-4 space-y-1 shadow-lg">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="block py-2.5 px-3 text-[15px] text-stone-700 hover:text-stone-900 hover:bg-stone-50 rounded-lg font-medium">
              {l.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-stone-100 mt-1 space-y-1">
            {token ? (
              <>
                {/* User info row */}
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-forest-500 flex items-center justify-center text-white font-serif font-bold text-[12px] shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="text-[13.5px] font-semibold text-stone-800">{userName}</div>
                    <div className="text-[11px] text-stone-400">{roleLabel}</div>
                  </div>
                </div>
                <Link to={dashboardPath} className="flex items-center gap-2.5 py-2.5 px-3 text-[14.5px] text-stone-700 hover:bg-stone-50 rounded-lg font-medium">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                    <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 py-2.5 px-3 text-[14.5px] text-red-500 hover:bg-red-50 rounded-lg font-medium"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2.5 px-3 text-[15px] text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-lg font-medium">
                  Sign in
                </Link>
                <Link to="/register" className="block py-3 px-4 text-center text-[15px] bg-forest-500 text-white rounded-xl font-semibold hover:bg-forest-600">
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
