import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";

const ROUTES = [
  { id: 1, name: "Everest Base Camp", region: "Khumbu", days: "12–16", difficulty: "Hard", altitude: "5,364m", priceFrom: 800, season: "Oct–Nov, Mar–May", color: "#2D6A4F", tags: ["Classic", "Most Popular"] },
  { id: 2, name: "Annapurna Circuit", region: "Gandaki", days: "14–21", difficulty: "Moderate–Hard", altitude: "5,416m", priceFrom: 700, season: "Oct–Nov, Mar–Apr", color: "#5E6BAD", tags: ["Scenic", "High Pass"] },
  { id: 3, name: "Langtang Valley", region: "Bagmati", days: "7–10", difficulty: "Moderate", altitude: "3,870m", priceFrom: 400, season: "Oct–Nov, Mar–May", color: "#3D8A68", tags: ["Family Friendly"] },
  { id: 4, name: "Manaslu Circuit", region: "Gandaki", days: "14–18", difficulty: "Hard", altitude: "5,106m", priceFrom: 900, season: "Sep–Nov, Mar–May", color: "#C05621", tags: ["Remote", "Off-beaten"] },
  { id: 5, name: "Gokyo Lakes", region: "Khumbu", days: "12–15", difficulty: "Moderate–Hard", altitude: "5,357m", priceFrom: 750, season: "Oct–Nov, Mar–May", color: "#2E7A8A", tags: ["Lakes", "Panoramic"] },
  { id: 6, name: "Upper Mustang", region: "Gandaki", days: "10–14", difficulty: "Moderate", altitude: "3,840m", priceFrom: 1500, season: "May–Oct", color: "#8B6914", tags: ["Restricted Area", "Cultural"] },
];

const GUIDES = [
  { id: 1, name: "Pemba Sherpa", specialty: "Everest Base Camp", experience: 14, rating: 4.9, reviews: 128, treks: 240, languages: ["English", "Nepali", "Hindi"], verified: true, initials: "PS", color: "#2D6A4F" },
  { id: 2, name: "Dawa Tamang", specialty: "Annapurna Circuit", experience: 9, rating: 4.8, reviews: 94, treks: 160, languages: ["English", "Nepali"], verified: true, initials: "DT", color: "#5E6BAD" },
  { id: 3, name: "Nima Gurung", specialty: "Multi-Route", experience: 16, rating: 4.9, reviews: 210, treks: 380, languages: ["English", "Nepali", "German", "French"], verified: true, initials: "NG", color: "#3D8A68" },
];

const TESTIMONIALS = [
  { id: 1, text: "Pemba was outstanding — his knowledge of the Khumbu region made every day feel safe and deeply personal. The summit sunrise was something I will carry forever.", author: "Sarah M.", country: "United Kingdom", trek: "Everest Base Camp", initials: "SM" },
  { id: 2, text: "I was nervous booking a guide online, but TrekDirect's verification gave me complete confidence. Dawa's pace, patience, and stories about the Annapurna trails were incredible.", author: "Marco L.", country: "Italy", trek: "Annapurna Circuit", initials: "ML" },
  { id: 3, text: "Nima speaks four languages and has done the Langtang route over 60 times — you could feel it in every step. Perfectly organised from permit to tea house.", author: "Yuki T.", country: "Japan", trek: "Langtang Valley", initials: "YT" },
];

const FEATURES = [
  { icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 2L13.5 8H20L14.5 12.5L16.5 19L11 15L5.5 19L7.5 12.5L2 8H8.5L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>, title: "Verified Guides Only", desc: "Every guide holds a valid Nepal Tourism Board license, manually checked before listing." },
  { icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" /><path d="M11 7v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, title: "Real-Time Trail Conditions", desc: "Live weather, trail status and seasonal alerts so you plan with accurate data." },
  { icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M3 9h16M8 3v4M14 3v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, title: "Permit & Visa Planner", desc: "AI-powered checklist for TIMS cards, national park fees and restricted area permits." },
  { icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3c-4.418 0-8 3.134-8 7 0 2.387 1.317 4.484 3.333 5.782L6 19l3.5-1.5A9.08 9.08 0 0011 17.5c4.418 0 8-3.134 8-7s-3.582-7-8-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 10h1M11 10h1M14 10h1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>, title: "Direct Guide Messaging", desc: "Chat with guides before booking — no agency overhead, no hidden fees." },
  { icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M4 6h14M4 10h10M4 14h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="17" cy="15" r="3.5" stroke="currentColor" strokeWidth="1.5" /><path d="M15.8 15l.8.8 1.6-1.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>, title: "Transparent Pricing", desc: "Compare guide rates, route costs and seasonal prices side-by-side with no surprises." },
  { icon: <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 3L6 7v5c0 4.418 2.24 7.196 5 8 2.76-.804 5-3.582 5-8V7L11 3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8 11l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>, title: "Safety First", desc: "All listed guides carry first-aid certification. Itineraries include acclimatisation days." },
];

/* ─── Hero backdrop ─────────────────────────────────────────────── */
function HeroBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Dawn sky */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#B8D4E8_0%,#C8DDD0_18%,#D8E8D4_32%,#E4DCC8_52%,#EEE4D4_70%,#F4EDE8_85%,#F6F4EF_100%)]" />
      {/* Sun glow */}
      <div className="absolute left-[45%] top-[58%] w-[600px] h-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(255,218,120,0.5)_0%,rgba(255,180,60,0.2)_40%,transparent_70%)] blur-2xl" />
      {/* Far mountains — misty */}
      <svg className="absolute bottom-0 left-0 w-full h-[65%]" viewBox="0 0 1440 700" preserveAspectRatio="none">
        <path fill="#7AAAA0" fillOpacity="0.28" d="M0,500 L0,340 L90,270 L180,330 L300,200 L420,310 L540,230 L660,320 L780,190 L900,300 L1020,240 L1140,310 L1260,210 L1380,300 L1440,260 L1440,700 L0,700 Z" />
      </svg>
      {/* Mid mountains */}
      <svg className="absolute bottom-0 left-0 w-full h-[52%]" viewBox="0 0 1440 700" preserveAspectRatio="none">
        <path fill="#3D7058" fillOpacity="0.55" d="M0,700 L0,400 L140,270 L260,370 L400,220 L540,350 L660,250 L800,380 L940,210 L1080,360 L1200,255 L1320,360 L1440,260 L1440,700 Z" />
        <path fill="white" fillOpacity="0.55" d="M396,224 L406,242 L420,228 L432,248 L444,234 L418,248 Z M936,214 L946,232 L958,218 L970,238 L982,228 L952,240 Z M136,274 L146,290 L160,278 L170,298 L182,284 L152,296 Z" />
      </svg>
      {/* Foreground ridge */}
      <svg className="absolute bottom-0 left-0 w-full h-[30%]" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path fill="#1E3D2C" d="M0,400 L0,290 L90,210 L200,280 L320,170 L440,260 L560,180 L680,270 L800,195 L920,280 L1040,210 L1160,270 L1280,185 L1400,260 L1440,240 L1440,400 Z" />
      </svg>
    </div>
  );
}

/* ─── Sub-components ────────────────────────────────────────────── */
function Stars({ n = 5 }) {
  return (
    <span className="inline-flex gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i < Math.round(n) ? "#D97706" : "none"}>
          <path d="M6 1l1.39 2.81L10.5 4.27l-2.25 2.19.53 3.1L6 8l-2.78 1.46.53-3.1L1.5 4.27l3.11-.46L6 1z" stroke="#D97706" strokeWidth="0.8" />
        </svg>
      ))}
    </span>
  );
}

function RouteCard({ route }) {
  return (
    <div className="group flex-shrink-0 w-[280px] sm:w-auto bg-white border border-stone-100 rounded-xl overflow-hidden hover:border-stone-300 transition-colors cursor-pointer">
      <div className="p-6">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-stone-400 mb-2">
          <span>{route.difficulty}</span>
          <span className="text-stone-300">·</span>
          <span className="normal-case tracking-normal">{route.region}</span>
        </div>
        <div className="flex items-start justify-between gap-4 mb-5">
          <h3 className="text-[1.1rem] font-medium text-stone-900 leading-snug">{route.name}</h3>
          <div className="shrink-0 text-right">
            <div className="text-[1rem] font-medium text-stone-900 tabular-nums leading-none">${route.priceFrom}</div>
            <div className="text-[10.5px] text-stone-400 mt-1">from / person</div>
          </div>
        </div>
        <div className="grid grid-cols-3 py-4 border-y border-stone-100 mb-5">
          <RouteStat label="Duration" value={`${route.days}d`} />
          <RouteStat label="Max alt." value={route.altitude} />
          <RouteStat label="Season" value={route.season.split(",")[0]} />
        </div>
        <Link to="/guides" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-forest-600 hover:text-forest-700 transition-colors group/cta">
          Find guides
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover/cta:translate-x-0.5">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

function RouteStat({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">{label}</div>
      <div className="text-[13px] font-medium text-stone-900 tabular-nums leading-tight">{value}</div>
    </div>
  );
}

function GuideCard({ guide }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-[1rem] text-white shrink-0"
          style={{ background: guide.color }}
        >
          {guide.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-serif text-[0.95rem] font-semibold text-stone-900">{guide.name}</h3>
            {guide.verified && (
              <span title="NTB Verified">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L3 4v5c0 3.314 2.24 5.397 5 6 2.76-.603 5-2.686 5-6V4L8 1.5z" fill="#2D6A4F" stroke="#2D6A4F" strokeWidth="0.5" />
                  <path d="M5.5 8l1.75 1.75 3.25-3.25" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
          <div className="text-[12px] text-stone-400 mb-1">{guide.specialty} · {guide.experience} yrs exp</div>
          <div className="flex items-center gap-1.5">
            <Stars n={guide.rating} />
            <span className="text-[12px] text-amber-600 font-medium">{guide.rating}</span>
            <span className="text-[11px] text-stone-400">({guide.reviews})</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-stone-50 border border-stone-100">
        <div>
          <div className="text-[11px] text-stone-400 mb-0.5">Treks completed</div>
          <div className="text-stone-800 font-semibold text-[14px]">{guide.treks}+</div>
        </div>
        <div>
          <div className="text-[11px] text-stone-400 mb-0.5">Languages</div>
          <div className="text-[11px] text-stone-700 leading-relaxed">{guide.languages.join(", ")}</div>
        </div>
      </div>
      <Link to={`/guides/${guide.id}`} className="block w-full text-center py-[9px] rounded-xl bg-stone-50 border border-stone-200 text-[13px] text-stone-700 hover:bg-forest-50 hover:text-forest-600 hover:border-forest-200 transition-all font-medium">
        View profile
      </Link>
    </div>
  );
}

function TestimonialCard({ t }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
      <svg width="24" height="18" viewBox="0 0 24 18" className="text-forest-200 mb-3" fill="currentColor">
        <path d="M0 18V10.8C0 4.8 3.6 1.2 10.8 0l1.2 1.8C8.4 2.7 6.6 4.8 6 8h4.8V18H0zm13.2 0V10.8C13.2 4.8 16.8 1.2 24 0l1.2 1.8c-3.6.9-5.4 3-6 6.2H24V18H13.2z" />
      </svg>
      <p className="text-[14.5px] text-stone-600 leading-relaxed mb-5 italic">"{t.text}"</p>
      <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
        <div className="w-9 h-9 rounded-full bg-forest-100 flex items-center justify-center text-[12px] font-semibold text-forest-700">{t.initials}</div>
        <div>
          <div className="text-[13px] font-medium text-stone-800">{t.author}</div>
          <div className="text-[11px] text-stone-400">{t.country} · {t.trek}</div>
        </div>
      </div>
    </div>
  );
}

function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); navigate("/guides"); }}
      className="flex max-sm:flex-col items-center gap-2 bg-white rounded-2xl p-2 shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-stone-200"
    >
      <div className="flex-1 flex items-center gap-2 px-3 w-full">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-stone-400 shrink-0">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search route or destination..."
          className="flex-1 bg-transparent text-[15px] text-stone-800 placeholder:text-stone-400 outline-none py-2.5"
        />
      </div>
      <div className="hidden sm:block w-px h-8 bg-stone-200" />
      <div className="flex items-center gap-2 px-3 max-sm:w-full max-sm:border-t max-sm:border-stone-100 max-sm:pt-2">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-stone-400 shrink-0">
          <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 15c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <select className="bg-transparent text-[14px] text-stone-500 outline-none cursor-pointer py-2.5 max-sm:flex-1">
          <option value="">Any guide type</option>
          <option value="trekker">For trekkers</option>
          <option value="climbing">Climbing guide</option>
          <option value="cultural">Cultural trek</option>
        </select>
      </div>
      <button
        type="submit"
        className="max-sm:w-full px-6 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all hover:bg-forest-600 hover:shadow-md active:translate-y-0"
      >
        Find Guides
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}

const STEP_ICON = { width: 28, height: 28, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" };

function StepSearch() {
  return (
    <svg {...STEP_ICON}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L20 20" />
    </svg>
  );
}

function StepClipboard() {
  return (
    <svg {...STEP_ICON}>
      <rect x="6" y="5" width="12" height="16" rx="1.5" />
      <path d="M9 3h6v4H9z" />
      <path d="M9 12h6M9 16h4" opacity=".6" />
    </svg>
  );
}

function StepMountain() {
  return (
    <svg {...STEP_ICON}>
      <path d="M3 19l6-11 4 7 3-5 5 9H3z" />
      <path d="M8 14l1-2" opacity=".5" />
    </svg>
  );
}

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="mb-10 sm:mb-12 text-center">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest-500 font-semibold mb-4">
        <span className="w-6 h-px bg-forest-300" />
        {eyebrow}
        <span className="w-6 h-px bg-forest-300" />
      </span>
      <h2 className="font-serif text-[2rem] sm:text-[2.4rem] font-bold text-stone-900 leading-tight mb-3">{title}</h2>
      {sub && <p className="text-[15px] text-stone-500 max-w-[560px] mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

/* ─── Home page ─────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center pt-[66px]">
        <HeroBackdrop />

        {/* Prayer flags */}
        <svg className="absolute top-0 right-0 w-[340px] max-lg:w-[200px] opacity-75 pointer-events-none z-10" viewBox="0 0 360 120" aria-hidden="true">
          <path d="M0,12 Q180,88 360,22" stroke="#2D5A40" strokeWidth="1" fill="none" />
          {["#3a7bd5","#f0d062","#f08070","#7aab50","#e0e0e0","#3a7bd5"].map((c,i)=>{
            const t = (i+1)/8;
            const x = t*360;
            const y = 12+Math.sin(t*Math.PI)*58;
            return <g key={i} transform={`translate(${x-12},${y})`}><rect width="22" height="28" fill={c} opacity="0.8"/></g>;
          })}
        </svg>

        <div className="relative z-10 w-full max-w-[800px] mx-auto px-5 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-600 font-semibold mb-6">
            <span className="w-8 h-px bg-forest-400" />
            Nepal · Himalaya
            <span className="w-8 h-px bg-forest-400" />
          </span>

          <h1 className="font-serif text-[3rem] sm:text-[4rem] lg:text-[4.8rem] font-bold text-stone-900 leading-[1.05] tracking-tight mb-6">
            Find Your Guide.<br />
            <span className="italic text-forest-500">Conquer the Himalayas.</span>
          </h1>

          <p className="text-[16px] sm:text-[17px] text-stone-600 max-w-[580px] mx-auto leading-relaxed mb-10">
            Connect directly with Nepal Tourism Board–verified trekking guides. No agencies, no hidden fees — just you, your guide, and the mountains.
          </p>

          <div className="max-w-[600px] mx-auto mb-8">
            <HeroSearch />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-stone-500">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-forest-400" /> 1,200+ verified guides</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-forest-400" /> 80+ trek routes</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-forest-400" /> 4.9★ average rating</span>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-stone-400">
          <span className="text-[11px] uppercase tracking-[0.15em]">Scroll</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-stone-400 to-transparent" />
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="relative z-10 border-y border-stone-100 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 sm:divide-x sm:divide-stone-100">
          {[
            { value: "1,200+", label: "Verified guides" },
            { value: "80+", label: "Trek routes" },
            { value: "15,000+", label: "Trekkers served" },
            { value: "4.9★", label: "Average guide rating" },
          ].map((s) => (
            <div key={s.label} className="text-center sm:px-6">
              <div className="text-[1.75rem] font-medium text-stone-900 leading-none mb-2 tabular-nums">{s.value}</div>
              <div className="text-[12.5px] text-stone-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trek Routes ── */}
      <div className="py-20 sm:py-24 bg-stone-50">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <SectionHead
            eyebrow="Popular Treks"
            title="Nepal's Greatest Trails"
            sub="From the iconic Everest Base Camp to the remote Upper Mustang — find the perfect trek for your level and timeline."
          />
        </div>
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 snap-x snap-mandatory sm:snap-none -mx-5 sm:mx-0 px-5 sm:px-0">
            {ROUTES.map((r) => (
              <div key={r.id} className="snap-start">
                <RouteCard route={r} />
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/guides" className="inline-flex items-center gap-2 text-[14px] text-forest-600 hover:text-forest-700 border border-forest-200 hover:border-forest-300 px-5 py-2.5 rounded-xl hover:bg-forest-50 transition-all font-medium">
              View all routes
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="py-20 sm:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <SectionHead eyebrow="Process" title="Your Trek in 3 Steps" />
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="hidden sm:block absolute top-[52px] left-[calc(16.67%+12px)] right-[calc(16.67%+12px)] h-px bg-stone-200" />
            {[
              { step: "01", title: "Search & Compare", desc: "Filter guides by route, language, rating, and price. Read real reviews from past trekkers.", Icon: StepSearch },
              { step: "02", title: "Book & Confirm", desc: "Message guides directly, agree on itinerary, and secure your booking — no agency middleman.", Icon: StepClipboard },
              { step: "03", title: "Trek with Confidence", desc: "Your NTB-verified guide meets you at the trailhead. Permits, acclimatisation and safety handled.", Icon: StepMountain },
            ].map((s) => (
              <div key={s.step} className="relative text-center px-6 pt-10 pb-8">
                <div className="w-10 h-10 mx-auto mb-6 flex items-center justify-center text-forest-600">
                  <s.Icon />
                </div>
                <div className="text-[11px] tracking-[0.18em] text-stone-400 mb-3">{s.step}</div>
                <h3 className="text-[16px] font-medium text-stone-900 mb-2">{s.title}</h3>
                <p className="text-[13.5px] text-stone-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Featured Guides ── */}
      <div className="py-20 sm:py-24 bg-stone-50">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <SectionHead
            eyebrow="Top Guides"
            title="Meet Some of Our Best"
            sub="Hand-picked guides with outstanding track records, multilingual abilities, and verified NTB credentials."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUIDES.map((g) => <GuideCard key={g.id} guide={g} />)}
          </div>
          <div className="mt-8 text-center">
            <Link to="/guides" className="inline-flex items-center gap-2 px-6 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold transition-all hover:bg-forest-600 hover:shadow-md">
              Browse all guides
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Why TrekDirect ── */}
      <div className="py-20 sm:py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <SectionHead
            eyebrow="Why Us"
            title="Built for Safe Trekking"
            sub="Every feature is designed around one goal — getting you to the summit and back, safely."
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4 p-5 bg-stone-50 border border-stone-200 rounded-2xl hover:border-forest-200 hover:bg-forest-50 transition-all">
                <div className="w-10 h-10 rounded-xl bg-forest-100 border border-forest-200 flex items-center justify-center text-forest-600 shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-serif text-[0.95rem] font-semibold text-stone-900 mb-1">{f.title}</h3>
                  <p className="text-[13px] text-stone-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Testimonials ── */}
      <div className="py-20 sm:py-24 bg-stone-50">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
          <SectionHead
            eyebrow="Stories"
            title="From the Trail"
            sub="Real words from trekkers who booked through TrekDirect Nepal."
          />
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => <TestimonialCard key={t.id} t={t} />)}
          </div>
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="py-20 sm:py-24 bg-forest-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
        <svg className="absolute bottom-0 left-0 w-full h-[45%] pointer-events-none opacity-20" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
          <path fill="white" d="M0,300 L0,200 L100,140 L220,195 L360,110 L500,185 L640,120 L780,185 L920,115 L1060,190 L1200,130 L1320,190 L1440,150 L1440,300 Z" />
        </svg>
        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-200 font-semibold mb-5">
            <span className="w-8 h-px bg-forest-300" />
            Start planning
            <span className="w-8 h-px bg-forest-300" />
          </span>
          <h2 className="font-serif text-[2.2rem] sm:text-[3rem] font-bold text-white leading-tight mb-5">
            Your Himalayan adventure<br />
            <span className="italic text-forest-100">starts here.</span>
          </h2>
          <p className="text-[15px] text-forest-200 max-w-[500px] mx-auto mb-10 leading-relaxed">
            Join thousands of trekkers who found their perfect guide through TrekDirect Nepal. Free to browse — pay only when you book.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/guides"
              className="px-8 py-3.5 bg-white text-forest-700 rounded-xl text-[15px] font-semibold transition-all hover:bg-stone-50 hover:shadow-md"
            >
              Browse guides
            </Link>
            <Link
              to="/register"
              className="px-8 py-3.5 bg-forest-500 border border-forest-400 text-white rounded-xl text-[15px] font-semibold transition-all hover:bg-forest-400"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-400">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-forest-300">
                <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.6" />
                </svg>
              </span>
              <span className="font-serif text-[1rem] font-bold text-white">TrekDirect<span className="text-forest-300">Nepal</span></span>
            </Link>
            <p className="text-[13px] text-stone-500 leading-relaxed mb-4">Connecting trekkers with verified Himalayan guides since 2020.</p>
            <div className="flex gap-3">
              {["F", "I", "X"].map((s) => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-500 hover:text-forest-300 hover:bg-stone-700 transition-all">
                  <span className="text-[11px] font-semibold">{s}</span>
                </a>
              ))}
            </div>
          </div>
          {[
            { heading: "Explore", links: ["Guides", "Trek Routes", "Trail Conditions", "Pricing"] },
            { heading: "Company", links: ["About", "Careers", "Blog", "Press"] },
            { heading: "Support", links: ["Help Centre", "Safety", "Terms", "Privacy"] },
          ].map((col) => (
            <div key={col.heading}>
              <h4 className="text-[12px] uppercase tracking-[0.15em] text-stone-500 font-medium mb-4">{col.heading}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-[13.5px] text-stone-500 hover:text-stone-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-stone-800 px-5 sm:px-8 py-5 max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-stone-600">
          <span>© 2025 TrekDirect Nepal. All rights reserved.</span>
          <span>Made with care for the mountains</span>
        </div>
      </footer>
    </div>
  );
}
