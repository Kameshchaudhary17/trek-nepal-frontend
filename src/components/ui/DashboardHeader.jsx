import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function DashboardHeader({ title }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  const userData = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
  const userName = userData?.fullName || "";
  const userRole = userData?.role;
  const roleLabel = userRole === "guide" ? "Guide" : userRole === "admin" ? "Admin" : "Trekker";
  const initials  = userName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[68px] bg-white border-b border-stone-200 flex items-center justify-between px-5 sm:px-8">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0">
        <span className="text-forest-500">
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.55" />
          </svg>
        </span>
        <span className="font-serif text-[1rem] font-semibold tracking-wide text-stone-900">
          TrekDirect<span className="text-forest-500">Nepal</span>
        </span>
      </Link>

      {title && (
        <span className="hidden sm:block text-[13px] font-semibold text-stone-400 absolute left-1/2 -translate-x-1/2">
          {title}
        </span>
      )}

      {/* User dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-all"
        >
          {userData?.profilePhoto ? (
            <img src={userData.profilePhoto} alt={userName} className="w-7 h-7 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-forest-500 flex items-center justify-center text-white font-serif font-bold text-[11px] shrink-0">
              {initials}
            </div>
          )}
          <div className="text-left hidden sm:block">
            <div className="text-[13px] font-semibold text-stone-800 leading-tight">{userName.split(" ")[0]}</div>
            <div className="text-[10px] text-stone-400 leading-none">{roleLabel}</div>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`text-stone-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}>
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden py-1 z-50">
            <div className="px-4 py-3 border-b border-stone-100">
              <div className="text-[13px] font-semibold text-stone-800 truncate">{userName}</div>
              <div className="text-[11.5px] text-stone-400 truncate">{userData?.email}</div>
            </div>

            <Link
              to="/"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-[13.5px] text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors font-medium"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7L7 1l6 6M3 5.5V13h3V9h2v4h3V5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Home
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
    </header>
  );
}
