import { useState, useEffect, useRef } from "react";
import Navbar from "../components/ui/Navbar";
import GuideCard from "../components/guides/GuideCard";
import { guideService } from "../services/api";

const REGIONS = ["All Regions", "Khumbu", "Gandaki", "Bagmati", "Mustang", "Karnali", "Mechi"];
const LANGUAGES = ["Any Language", "English", "German", "French", "Japanese", "Chinese", "Tibetan"];
const SORT_OPTIONS = [
  { value: "rating", label: "Highest rated" },
  { value: "price_asc", label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
  { value: "experience", label: "Most experienced" },
  { value: "treks", label: "Most treks" },
];

function normalizeGuide(g) {
  return {
    ...g,
    id: g._id,
    name: g.user?.fullName || "",
    rating: g.averageRating,
    reviews: g.reviewCount,
    treks: g.treksCompleted,
  };
}

function SkeletonCard() {
  return (
    <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7)_0%,rgba(10,14,28,0.85)_100%)] border border-white/[0.08] rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-white/[0.07]" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-white/[0.07] rounded w-3/4" />
          <div className="h-3 bg-white/[0.05] rounded w-1/2" />
          <div className="h-3 bg-white/[0.05] rounded w-2/3" />
        </div>
      </div>
      <div className="h-16 bg-white/[0.04] rounded-xl mb-4" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-white/[0.05] rounded-full w-20" />
        <div className="h-5 bg-white/[0.05] rounded-full w-24" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-9 bg-white/[0.05] rounded-xl" />
        <div className="flex-1 h-9 bg-white/[0.07] rounded-xl" />
      </div>
    </div>
  );
}

export default function GuideListing() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [region, setRegion] = useState("All Regions");
  const [language, setLanguage] = useState("Any Language");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState("rating");
  const [guides, setGuides] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchTimer = useRef(null);

  function handleSearch(val) {
    setSearch(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(val), 400);
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchGuides() {
      setLoading(true);
      setError(null);
      try {
        const params = {
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(region !== "All Regions" && { region }),
          ...(language !== "Any Language" && { language }),
          ...(minRating > 0 && { minRating }),
          sort,
          limit: 50,
        };
        const data = await guideService.getGuides(params);
        if (!cancelled) {
          setGuides((data.guides || []).map(normalizeGuide));
          setTotal(data.total ?? 0);
        }
      } catch {
        if (!cancelled) setError("Failed to load guides. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchGuides();
    return () => { cancelled = true; };
  }, [debouncedSearch, region, language, minRating, sort]);

  const activeFilterCount = [
    region !== "All Regions",
    language !== "Any Language",
    minRating > 0,
  ].filter(Boolean).length;

  function clearFilters() {
    setRegion("All Regions");
    setLanguage("Any Language");
    setMinRating(0);
    setSearch("");
    setDebouncedSearch("");
  }

  return (
    <div className="min-h-screen bg-[#05080f] text-[#f0e4c8] font-sans overflow-x-hidden">
      <Navbar />

      {/* ── Page header ── */}
      <div className="relative pt-[68px] overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#07091a_0%,#05080f_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(224,184,116,0.07)_0%,transparent_70%)]" />
        <svg className="absolute bottom-0 left-0 w-full h-[60%] pointer-events-none opacity-30" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
          <path fill="#0a1228" d="M0,200 L0,130 L120,80 L260,120 L400,60 L560,110 L700,55 L860,105 L1000,50 L1140,100 L1280,65 L1440,95 L1440,200 Z" />
        </svg>

        <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 py-14 sm:py-16">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#e0b874] font-medium mb-4">
            <span className="w-6 h-px bg-[#e0b874]" />
            Verified Guides
            <span className="w-6 h-px bg-[#e0b874]" />
          </span>
          <h1 className="font-serif text-[2.4rem] sm:text-[3rem] font-bold text-[#f5ead0] leading-tight mb-3">
            Find Your Perfect<br />
            <span className="italic text-[#e0b874]">Himalayan Guide</span>
          </h1>
          <p className="text-[15px] text-[#9ab0a0] max-w-[520px] leading-relaxed mb-8">
            {total > 0 ? `Browse ${total} ` : "Browse "}
            Nepal Tourism Board–verified guides. Filter by route, language, and budget — book directly with no agency fees.
          </p>

          <div className="flex flex-wrap gap-3 text-[13px] text-[#7a9880]">
            {[
              { icon: "✓", text: "NTB verified" },
              { icon: "★", text: "Avg. 4.8 rating" },
              { icon: "⛰", text: "80+ routes covered" },
            ].map((s) => (
              <span key={s.text} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] border border-white/[0.07] rounded-full">
                <span className="text-[#e0b874] text-[11px]">{s.icon}</span>
                {s.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sticky top-[68px] z-40 bg-[#07091a]/90 backdrop-blur-xl border-b border-white/[0.07] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-[7px] flex-1 min-w-[180px] max-w-[260px]">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-[#5a7868] shrink-0">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Name or route..."
              className="bg-transparent text-[13px] text-[#f0e4c8] placeholder:text-[#3a5848] outline-none w-full"
            />
          </div>

          {/* Region */}
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-[7px] text-[13px] text-[#b0c0b8] outline-none cursor-pointer hover:bg-white/[0.07] transition-colors"
          >
            {REGIONS.map((r) => <option key={r} value={r} className="bg-[#0d1020]">{r}</option>)}
          </select>

          {/* Language */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-[7px] text-[13px] text-[#b0c0b8] outline-none cursor-pointer hover:bg-white/[0.07] transition-colors"
          >
            {LANGUAGES.map((l) => <option key={l} value={l} className="bg-[#0d1020]">{l}</option>)}
          </select>

          {/* Min rating */}
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-[7px] text-[13px] text-[#b0c0b8] outline-none cursor-pointer hover:bg-white/[0.07] transition-colors"
          >
            <option value={0} className="bg-[#0d1020]">Any rating</option>
            <option value={4.5} className="bg-[#0d1020]">4.5★ & up</option>
            <option value={4.8} className="bg-[#0d1020]">4.8★ & up</option>
          </select>

          {/* Sort + clear */}
          <div className="flex items-center gap-2 ml-auto">
            {(activeFilterCount > 0 || search) && (
              <button
                onClick={clearFilters}
                className="text-[12px] text-[#7a9080] hover:text-[#e0b874] transition-colors px-2 py-1"
              >
                Clear {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}` : "search"}
              </button>
            )}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-[7px] text-[13px] text-[#b0c0b8] outline-none cursor-pointer hover:bg-white/[0.07] transition-colors"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-[#0d1020]">{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10">
        {!loading && !error && (
          <p className="text-[13px] text-[#6a8878] mb-6">
            Showing <span className="text-[#c0b090] font-medium">{guides.length}</span> guide{guides.length !== 1 ? "s" : ""}
            {activeFilterCount > 0 || debouncedSearch ? " matching your filters" : ""}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-2xl">⚠️</div>
            <h3 className="font-serif text-[1.1rem] font-semibold text-[#f0e4c8] mb-2">Something went wrong</h3>
            <p className="text-[14px] text-[#6a8878] max-w-[300px]">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Guide grid */}
        {!loading && !error && guides.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((g) => <GuideCard key={g.id} guide={g} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && guides.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4 text-2xl">🏔️</div>
            <h3 className="font-serif text-[1.1rem] font-semibold text-[#f0e4c8] mb-2">No guides found</h3>
            <p className="text-[14px] text-[#6a8878] mb-5 max-w-[300px]">Try adjusting your filters or search term.</p>
            <button
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] text-[14px] font-semibold transition-all hover:shadow-[0_6px_20px_rgba(224,184,116,0.4)]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* ── Footer note ── */}
      <div className="border-t border-white/[0.05] bg-[#04060f] py-8 text-center text-[13px] text-[#3a5048]">
        All listed guides hold a valid Nepal Tourism Board license · Prices in USD per day
      </div>
    </div>
  );
}
