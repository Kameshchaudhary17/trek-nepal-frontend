import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";

/* ─── Mock data ─────────────────────────────────────────────────── */

const ROUTES = [
  {
    id: 1,
    name: "Everest Base Camp",
    region: "Khumbu",
    days: "12–16",
    difficulty: "Hard",
    altitude: "5,364m",
    priceFrom: 800,
    season: "Oct–Nov, Mar–May",
    color: "#4a7aaa",
    tags: ["Classic", "Most Popular"],
  },
  {
    id: 2,
    name: "Annapurna Circuit",
    region: "Gandaki",
    days: "14–21",
    difficulty: "Moderate–Hard",
    altitude: "5,416m",
    priceFrom: 700,
    season: "Oct–Nov, Mar–Apr",
    color: "#7a5aaa",
    tags: ["Scenic", "High Pass"],
  },
  {
    id: 3,
    name: "Langtang Valley",
    region: "Bagmati",
    days: "7–10",
    difficulty: "Moderate",
    altitude: "3,870m",
    priceFrom: 400,
    season: "Oct–Nov, Mar–May",
    color: "#4a9a6a",
    tags: ["Family Friendly"],
  },
  {
    id: 4,
    name: "Manaslu Circuit",
    region: "Gandaki",
    days: "14–18",
    difficulty: "Hard",
    altitude: "5,106m",
    priceFrom: 900,
    season: "Sep–Nov, Mar–May",
    color: "#9a5a40",
    tags: ["Remote", "Off-beaten"],
  },
  {
    id: 5,
    name: "Gokyo Lakes",
    region: "Khumbu",
    days: "12–15",
    difficulty: "Moderate–Hard",
    altitude: "5,357m",
    priceFrom: 750,
    season: "Oct–Nov, Mar–May",
    color: "#3a8a9a",
    tags: ["Lakes", "Panoramic"],
  },
  {
    id: 6,
    name: "Upper Mustang",
    region: "Gandaki",
    days: "10–14",
    difficulty: "Moderate",
    altitude: "3,840m",
    priceFrom: 1500,
    season: "May–Oct",
    color: "#aa7a30",
    tags: ["Restricted Area", "Cultural"],
  },
];

const GUIDES = [
  {
    id: 1,
    name: "Pemba Sherpa",
    specialty: "Everest Base Camp",
    experience: 14,
    rating: 4.9,
    reviews: 128,
    treks: 240,
    languages: ["English", "Nepali", "Hindi"],
    verified: true,
    initials: "PS",
    color: "#4a7aaa",
  },
  {
    id: 2,
    name: "Dawa Tamang",
    specialty: "Annapurna Circuit",
    experience: 9,
    rating: 4.8,
    reviews: 94,
    treks: 160,
    languages: ["English", "Nepali"],
    verified: true,
    initials: "DT",
    color: "#7a5aaa",
  },
  {
    id: 3,
    name: "Nima Gurung",
    specialty: "Multi-Route",
    experience: 16,
    rating: 4.9,
    reviews: 210,
    treks: 380,
    languages: ["English", "Nepali", "German", "French"],
    verified: true,
    initials: "NG",
    color: "#4a9a6a",
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    text: "Pemba was outstanding — his knowledge of the Khumbu region made every day feel safe and deeply personal. The summit sunrise was something I will carry forever.",
    author: "Sarah M.",
    country: "United Kingdom",
    trek: "Everest Base Camp",
    initials: "SM",
  },
  {
    id: 2,
    text: "I was nervous booking a guide online, but TrekDirect's verification gave me complete confidence. Dawa's pace, patience, and stories about the Annapurna trails were incredible.",
    author: "Marco L.",
    country: "Italy",
    trek: "Annapurna Circuit",
    initials: "ML",
  },
  {
    id: 3,
    text: "Nima speaks four languages and has done the Langtang route over 60 times — you could feel it in every step. Perfectly organised from permit to tea house.",
    author: "Yuki T.",
    country: "Japan",
    trek: "Langtang Valley",
    initials: "YT",
  },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L13.5 8H20L14.5 12.5L16.5 19L11 15L5.5 19L7.5 12.5L2 8H8.5L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: "Verified Guides Only",
    desc: "Every guide holds a valid Nepal Tourism Board license, manually checked before listing.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Real-Time Trail Conditions",
    desc: "Live weather, trail status and seasonal alerts so you plan with accurate data.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 9h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 3v4M14 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Permit & Visa Planner",
    desc: "AI-powered checklist for TIMS cards, national park fees and restricted area permits.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3c-4.418 0-8 3.134-8 7 0 2.387 1.317 4.484 3.333 5.782L6 19l3.5-1.5A9.08 9.08 0 0011 17.5c4.418 0 8-3.134 8-7s-3.582-7-8-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 10h1M11 10h1M14 10h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
    title: "Direct Guide Messaging",
    desc: "Chat with guides before booking — no agency overhead, no hidden fees.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 6h14M4 10h10M4 14h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="17" cy="15" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M15.8 15l.8.8 1.6-1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Transparent Pricing",
    desc: "Compare guide rates, route costs and seasonal prices side-by-side with no surprises.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L6 7v5c0 4.418 2.24 7.196 5 8 2.76-.804 5-3.582 5-8V7L11 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Safety First",
    desc: "All listed guides carry first-aid certification. Itineraries include acclimatisation days.",
  },
];

/* ─── Sub-components ────────────────────────────────────────────── */

function Stars({ n = 5 }) {
  return (
    <span className="inline-flex gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i < Math.round(n) ? "#e0b874" : "none"}>
          <path d="M6 1l1.39 2.81L10.5 4.27l-2.25 2.19.53 3.1L6 8l-2.78 1.46.53-3.1L1.5 4.27l3.11-.46L6 1z" stroke="#e0b874" strokeWidth="0.8" />
        </svg>
      ))}
    </span>
  );
}

function DifficultyBadge({ level }) {
  const map = {
    Hard: "bg-[#c8503c]/15 text-[#f08070] border-[#c8503c]/25",
    "Moderate–Hard": "bg-[#d4913a]/15 text-[#e0a860] border-[#d4913a]/25",
    Moderate: "bg-[#7aab50]/15 text-[#9acc70] border-[#7aab50]/25",
  };
  return (
    <span className={`text-[11px] px-2 py-[2px] rounded-full border font-medium ${map[level] || map["Moderate"]}`}>
      {level}
    </span>
  );
}

function RouteCard({ route }) {
  return (
    <div className="group relative flex-shrink-0 w-[280px] sm:w-auto bg-[linear-gradient(160deg,rgba(20,24,40,0.7)_0%,rgba(10,14,28,0.85)_100%)] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.5)] cursor-pointer">
      {/* Colour accent top */}
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${route.color}80, ${route.color}40)` }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-serif text-[1rem] font-semibold text-[#f0e4c8] leading-snug mb-0.5">{route.name}</h3>
            <span className="text-[12px] text-[#6a8878]">{route.region} Province</span>
          </div>
          <DifficultyBadge level={route.difficulty} />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {route.tags.map((t) => (
            <span key={t} className="text-[11px] px-2 py-[2px] rounded-full bg-white/[0.06] text-[#8aa898] border border-white/[0.06]">{t}</span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat icon="📅" label="Duration" value={`${route.days} d`} />
          <Stat icon="⛰️" label="Max alt." value={route.altitude} />
          <Stat icon="🌿" label="Season" value={route.season.split(",")[0]} />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
          <div>
            <span className="text-[11px] text-[#6a8878]">Guide from</span>
            <div className="text-[#e0b874] font-semibold text-[15px]">${route.priceFrom} <span className="text-[12px] font-normal text-[#6a8878]">/ person</span></div>
          </div>
          <Link to="/guides" className="text-[13px] px-3 py-[7px] rounded-lg bg-white/[0.06] border border-white/[0.08] text-[#b0c0b8] hover:bg-white/[0.1] hover:text-[#f0e4c8] transition-all">
            Find guides →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="text-center">
      <div className="text-[14px] mb-0.5">{icon}</div>
      <div className="text-[11px] text-[#5a7868] mb-0.5">{label}</div>
      <div className="text-[12px] text-[#c0b090] font-medium leading-tight">{value}</div>
    </div>
  );
}

function GuideCard({ guide }) {
  return (
    <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7)_0%,rgba(10,14,28,0.85)_100%)] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.5)]">
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center font-serif font-bold text-[1.1rem] text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${guide.color}70, ${guide.color}40)`, border: `1px solid ${guide.color}50` }}
        >
          {guide.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-serif text-[1rem] font-semibold text-[#f0e4c8]">{guide.name}</h3>
            {guide.verified && (
              <span title="NTB Verified">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L3 4v5c0 3.314 2.24 5.397 5 6 2.76-.603 5-2.686 5-6V4L8 1.5z" fill="#4a7a8a" stroke="#4a7a8a" strokeWidth="0.5" />
                  <path d="M5.5 8l1.75 1.75 3.25-3.25" stroke="#c8e8f0" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
          <div className="text-[12px] text-[#6a8878] mb-1.5">{guide.specialty} · {guide.experience} yrs exp</div>
          <div className="flex items-center gap-1.5">
            <Stars n={guide.rating} />
            <span className="text-[12px] text-[#e0b874] font-medium">{guide.rating}</span>
            <span className="text-[11px] text-[#5a7868]">({guide.reviews} reviews)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        <div>
          <div className="text-[11px] text-[#5a7868] mb-0.5">Treks completed</div>
          <div className="text-[#c0b090] font-semibold text-[15px]">{guide.treks}+</div>
        </div>
        <div>
          <div className="text-[11px] text-[#5a7868] mb-0.5">Languages</div>
          <div className="text-[12px] text-[#c0b090] leading-relaxed">{guide.languages.join(", ")}</div>
        </div>
      </div>

      <Link
        to={`/guides/${guide.id}`}
        className="block w-full text-center py-[10px] rounded-xl bg-white/[0.05] border border-white/[0.08] text-[14px] text-[#b0c0b8] hover:bg-white/[0.1] hover:text-[#f0e4c8] transition-all"
      >
        View profile
      </Link>
    </div>
  );
}

function TestimonialCard({ t }) {
  return (
    <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.6)_0%,rgba(10,14,28,0.8)_100%)] backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6">
      <svg width="24" height="18" viewBox="0 0 24 18" className="text-[#e0b874]/40 mb-3" fill="currentColor">
        <path d="M0 18V10.8C0 4.8 3.6 1.2 10.8 0l1.2 1.8C8.4 2.7 6.6 4.8 6 8h4.8V18H0zm13.2 0V10.8C13.2 4.8 16.8 1.2 24 0l1.2 1.8c-3.6.9-5.4 3-6 6.2H24V18H13.2z" />
      </svg>
      <p className="text-[14.5px] text-[#c8d8c8]/90 leading-relaxed mb-5 italic">"{t.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
        <div className="w-9 h-9 rounded-full bg-[#3a5848] flex items-center justify-center text-[12px] font-semibold text-[#c0d8c0]">{t.initials}</div>
        <div>
          <div className="text-[13px] font-medium text-[#e8dcc8]">{t.author}</div>
          <div className="text-[11px] text-[#5a7868]">{t.country} · {t.trek}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Mountain backdrop (hero-specific) ────────────────────────── */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Sky */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#050813_0%,#0a1228_20%,#16192e_38%,#2e2040_55%,#6a3c38_70%,#b87844_82%,#d8a058_90%,#c88040_100%)]" />
      {/* Sun glow */}
      <div className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(255,210,140,0.45)_0%,rgba(220,140,60,0.2)_35%,transparent_65%)] blur-3xl" />
      {/* Aurora */}
      <div className="absolute top-[15%] left-0 w-full h-[160px] bg-[linear-gradient(90deg,transparent,rgba(100,160,220,0.14),rgba(160,100,220,0.18),rgba(100,180,180,0.14),transparent)] blur-3xl animate-auth-aurora" />
      {/* Far mountains */}
      <svg className="absolute bottom-0 left-0 w-full h-[65%]" viewBox="0 0 1440 700" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hm-far" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3c3060" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#14102a" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path fill="url(#hm-far)" d="M0,500 L0,340 L90,270 L180,330 L300,200 L420,310 L540,230 L660,320 L780,190 L900,300 L1020,240 L1140,310 L1260,210 L1380,300 L1440,260 L1440,700 L0,700 Z" />
      </svg>
      {/* Mid mountains with snow */}
      <svg className="absolute bottom-0 left-0 w-full h-[52%]" viewBox="0 0 1440 700" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hm-mid" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#282050" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#0c0c1e" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path fill="url(#hm-mid)" d="M0,700 L0,400 L140,270 L260,370 L400,220 L540,350 L660,250 L800,380 L940,210 L1080,360 L1200,255 L1320,360 L1440,260 L1440,700 Z" />
        <path fill="#f0e8e0" fillOpacity="0.28" d="M396,224 L406,242 L420,228 L432,248 L444,234 L418,248 Z M936,214 L946,232 L958,218 L970,238 L982,228 L952,240 Z M136,274 L146,290 L160,278 L170,298 L182,284 L152,296 Z" />
      </svg>
      {/* Foreground ridge */}
      <svg className="absolute bottom-0 left-0 w-full h-[30%]" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path fill="#04060f" d="M0,400 L0,290 L90,210 L200,280 L320,170 L440,260 L560,180 L680,270 L800,195 L920,280 L1040,210 L1160,270 L1280,185 L1400,260 L1440,240 L1440,400 Z" />
      </svg>
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.5)_100%)]" />
      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
      />
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────────── */
function Section({ children, className = "" }) {
  return (
    <section className={`relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 ${className}`}>
      {children}
    </section>
  );
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="mb-10 sm:mb-12 text-center">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#e0b874] font-medium mb-4">
        <span className="w-6 h-px bg-[#e0b874]" />
        {eyebrow}
        <span className="w-6 h-px bg-[#e0b874]" />
      </span>
      <h2 className="font-serif text-[2rem] sm:text-[2.4rem] font-bold text-[#f5ead0] leading-tight mb-3">{title}</h2>
      {sub && <p className="text-[15px] text-[#9ab0a0] max-w-[560px] mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ─── Search bar ────────────────────────────────────────────────── */
function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); navigate("/guides"); }}
      className="flex max-sm:flex-col items-center gap-2 bg-black/30 backdrop-blur-xl border border-white/[0.12] rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
    >
      <div className="flex-1 flex items-center gap-2 px-3 w-full">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#6a8878] shrink-0">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search route or destination..."
          className="flex-1 bg-transparent text-[15px] text-[#f0e4c8] placeholder:text-[#4a6858] outline-none py-2.5 font-light"
        />
      </div>
      <div className="hidden sm:block w-px h-8 bg-white/[0.08]" />
      <div className="flex items-center gap-2 px-3 max-sm:w-full max-sm:border-t max-sm:border-white/[0.08] max-sm:pt-2">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#6a8878] shrink-0">
          <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 15c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <select className="bg-transparent text-[14px] text-[#9ab0a0] outline-none cursor-pointer py-2.5 font-light max-sm:flex-1">
          <option value="">Any guide type</option>
          <option value="trekker">For trekkers</option>
          <option value="climbing">Climbing guide</option>
          <option value="cultural">Cultural trek</option>
        </select>
      </div>
      <button
        type="submit"
        className="max-sm:w-full px-6 py-3 bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-[0_8px_24px_rgba(224,184,116,0.45)] hover:-translate-y-[1px] active:translate-y-0"
      >
        Find Guides
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}

/* ─── Home page ─────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#05080f] font-sans text-[#f0e4c8] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center pt-[68px]">
        <HeroBackdrop />

        {/* Prayer flags */}
        <svg className="absolute top-0 right-0 w-[360px] max-lg:w-[220px] opacity-70 pointer-events-none z-10" viewBox="0 0 360 120" aria-hidden="true">
          <path d="M0,12 Q180,88 360,22" stroke="#2a2a44" strokeWidth="1" fill="none" />
          {["#3a7bd5","#f0d062","#f08070","#7aab50","#e0e0e0","#3a7bd5"].map((c,i)=>{
            const t = (i+1)/8;
            const x = t*360;
            const y = 12+Math.sin(t*Math.PI)*58;
            return <g key={i} transform={`translate(${x-12},${y})`}><rect width="22" height="28" fill={c} opacity="0.8"/></g>;
          })}
        </svg>

        <div className="relative z-10 w-full max-w-[800px] mx-auto px-5 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#e0b874] font-medium mb-6">
            <span className="w-8 h-px bg-[#e0b874]" />
            Nepal · Himalaya
            <span className="w-8 h-px bg-[#e0b874]" />
          </span>

          <h1 className="font-serif text-[3rem] sm:text-[4rem] lg:text-[4.8rem] font-bold text-[#f5ead0] leading-[1.05] tracking-tight mb-6">
            Find Your Guide.<br />
            <span className="italic text-[#e0b874]">Conquer the Himalayas.</span>
          </h1>

          <p className="text-[16px] sm:text-[17px] text-[#b8c8b8]/90 max-w-[580px] mx-auto font-light leading-relaxed mb-10">
            Connect directly with Nepal Tourism Board–verified trekking guides. No agencies, no hidden fees — just you, your guide, and the mountains.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl text-[15px] font-semibold transition-all shadow-[0_10px_30px_-8px_rgba(224,184,116,0.5)] hover:shadow-[0_14px_36px_-8px_rgba(224,184,116,0.6)] hover:-translate-y-[1px]"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white/[0.05] border border-white/[0.12] text-[#c0d0c0] rounded-xl text-[15px] font-medium transition-all hover:bg-white/[0.09] hover:text-[#f0e4c8]"
            >
              Sign in
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-[#7a9880]">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#e0b874]" /> 1,200+ verified guides</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#e0b874]" /> 80+ trek routes</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#e0b874]" /> 4.9★ average rating</span>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-[#4a6858]">
          <span className="text-[11px] uppercase tracking-[0.15em]">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#4a6858] to-transparent" />
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="relative z-10 border-y border-white/[0.06] bg-[#07091a]/80 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-white/[0.06]">
          {[
            { value: "1,200+", label: "Verified guides" },
            { value: "80+", label: "Trek routes" },
            { value: "15,000+", label: "Trekkers served" },
            { value: "4.9 ★", label: "Average guide rating" },
          ].map((s) => (
            <div key={s.label} className="text-center sm:px-6">
              <div className="font-serif text-[1.7rem] font-semibold text-[#e0b874] leading-none mb-1">{s.value}</div>
              <div className="text-[12.5px] text-[#7a9080]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trek Routes ── */}
      <div className="py-20 sm:py-24 bg-[#05080f]">
        <Section>
          <SectionHead
            eyebrow="Popular Treks"
            title="Nepal's Greatest Trails"
            sub="From the iconic Everest Base Camp to the remote Upper Mustang — find the perfect trek for your level and timeline."
          />
        </Section>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory sm:snap-none -mx-5 sm:mx-0 px-5 sm:px-0">
            {ROUTES.map((r) => (
              <div key={r.id} className="snap-start">
                <RouteCard route={r} />
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 mt-8 text-center">
          <Link to="/guides" className="inline-flex items-center gap-2 text-[14px] text-[#9ab0a0] hover:text-[#e0b874] transition-colors border border-white/[0.1] hover:border-[#e0b874]/30 px-5 py-2.5 rounded-xl hover:bg-[#e0b874]/[0.05]">
            View all routes
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="py-20 sm:py-24 bg-[linear-gradient(180deg,#05080f_0%,#07091a_50%,#05080f_100%)]">
        <Section>
          <SectionHead eyebrow="Process" title="Your Trek in 3 Steps" />
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-[52px] left-[calc(16.67%+12px)] right-[calc(16.67%+12px)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {[
              { step: "01", title: "Search & Compare", desc: "Filter guides by route, language, rating, and price. Read real reviews from past trekkers.", icon: "🔍" },
              { step: "02", title: "Book & Confirm", desc: "Message guides directly, agree on itinerary, and secure your booking — no agency middleman.", icon: "📋" },
              { step: "03", title: "Trek with Confidence", desc: "Your NTB-verified guide meets you at the trailhead. Permits, acclimatisation and safety handled.", icon: "🏔️" },
            ].map((s) => (
              <div key={s.step} className="relative text-center p-6 sm:p-8 bg-[linear-gradient(160deg,rgba(20,24,40,0.5)_0%,rgba(10,14,28,0.7)_100%)] border border-white/[0.07] rounded-2xl">
                <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#e0b874]/10 border border-[#e0b874]/20 flex items-center justify-center text-2xl">
                  {s.icon}
                </div>
                <div className="font-serif text-[0.7rem] tracking-[0.2em] text-[#e0b874]/60 mb-2">{s.step}</div>
                <h3 className="font-serif text-[1.05rem] font-semibold text-[#f0e4c8] mb-2">{s.title}</h3>
                <p className="text-[13.5px] text-[#8aa898] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Featured Guides ── */}
      <div className="py-20 sm:py-24 bg-[#05080f]">
        <Section>
          <SectionHead
            eyebrow="Top Guides"
            title="Meet Some of Our Best"
            sub="Hand-picked guides with outstanding track records, multilingual abilities, and verified NTB credentials."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUIDES.map((g) => <GuideCard key={g.id} guide={g} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/guides" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl text-[14px] font-semibold transition-all hover:shadow-[0_8px_24px_rgba(224,184,116,0.4)] hover:-translate-y-[1px]">
              Browse all guides
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </Section>
      </div>

      {/* ── Why TrekDirect ── */}
      <div className="py-20 sm:py-24 bg-[linear-gradient(180deg,#05080f_0%,#07091a_50%,#05080f_100%)]">
        <Section>
          <SectionHead
            eyebrow="Why Us"
            title="Built for Safe Trekking"
            sub="Every feature is designed around one goal — getting you to the summit and back, safely."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 bg-[linear-gradient(160deg,rgba(20,24,40,0.5)_0%,rgba(10,14,28,0.7)_100%)] border border-white/[0.07] rounded-2xl hover:border-white/[0.14] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#e0b874]/10 border border-[#e0b874]/15 flex items-center justify-center text-[#e0b874] shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-serif text-[0.95rem] font-semibold text-[#f0e4c8] mb-1">{f.title}</h3>
                  <p className="text-[13px] text-[#7a9888] leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* ── Testimonials ── */}
      <div className="py-20 sm:py-24 bg-[#05080f]">
        <Section>
          <SectionHead
            eyebrow="Stories"
            title="From the Trail"
            sub="Real words from trekkers who booked through TrekDirect Nepal."
          />
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </Section>
      </div>

      {/* ── CTA Banner ── */}
      <div className="py-20 sm:py-24 relative overflow-hidden">
        {/* BG mountain silhouette */}
        <div className="absolute inset-0 bg-[linear-gradient(160deg,#0a1228_0%,#16192e_50%,#0a1228_100%)]" />
        <svg className="absolute bottom-0 left-0 w-full h-[55%] pointer-events-none" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
          <path fill="#04060f" d="M0,300 L0,200 L100,140 L220,195 L360,110 L500,185 L640,120 L780,185 L920,115 L1060,190 L1200,130 L1320,190 L1440,150 L1440,300 Z" />
        </svg>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,rgba(224,184,116,0.08)_0%,transparent_70%)]" />

        <Section className="relative z-10 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#e0b874] font-medium mb-5">
            <span className="w-8 h-px bg-[#e0b874]" />
            Start planning
            <span className="w-8 h-px bg-[#e0b874]" />
          </span>
          <h2 className="font-serif text-[2.2rem] sm:text-[3rem] font-bold text-[#f5ead0] leading-tight mb-5">
            Your Himalayan adventure<br />
            <span className="italic text-[#e0b874]">starts here.</span>
          </h2>
          <p className="text-[15px] text-[#9ab0a0] max-w-[500px] mx-auto mb-10 leading-relaxed">
            Join thousands of trekkers who found their perfect guide through TrekDirect Nepal. Free to browse — pay only when you book.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/guides"
              className="px-8 py-3.5 bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl text-[15px] font-semibold transition-all shadow-[0_10px_30px_-8px_rgba(224,184,116,0.5)] hover:shadow-[0_14px_36px_-8px_rgba(224,184,116,0.6)] hover:-translate-y-[1px]"
            >
              Browse guides
            </Link>
          </div>
        </Section>
      </div>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#04060f]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-[#e0b874]">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.6" />
                </svg>
              </span>
              <span className="font-serif text-[1rem] font-bold text-[#f5ead0]">TrekDirect<span className="text-[#e0b874]">Nepal</span></span>
            </Link>
            <p className="text-[13px] text-[#5a7868] leading-relaxed mb-4">Connecting trekkers with verified Himalayan guides since 2020.</p>
            <div className="flex gap-3">
              {["facebook", "instagram", "twitter"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#5a7868] hover:text-[#e0b874] hover:bg-white/[0.1] transition-all">
                  <span className="text-[11px] font-medium capitalize">{s[0].toUpperCase()}</span>
                </a>
              ))}
            </div>
          </div>
          {/* Links */}
          {[
            { heading: "Explore", links: ["Guides", "Trek Routes", "Trail Conditions", "Pricing"] },
            { heading: "Company", links: ["About", "Careers", "Blog", "Press"] },
            { heading: "Support", links: ["Help Centre", "Safety", "Terms", "Privacy"] },
          ].map((col) => (
            <div key={col.heading}>
              <h4 className="text-[12px] uppercase tracking-[0.15em] text-[#4a6858] font-medium mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13.5px] text-[#7a9080] hover:text-[#c0d0c0] transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/[0.05] px-5 sm:px-8 py-5 max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#3a5048]">
          <span>© 2025 TrekDirect Nepal. All rights reserved.</span>
          <span>Made with care for the mountains</span>
        </div>
      </footer>
    </div>
  );
}
