import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import GuideList from "../components/guides/GuideList";
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

export default function GuideListing() {
  const { search: locationSearch } = useLocation();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [trekFilter, setTrekFilter] = useState(() => new URLSearchParams(locationSearch).get("trek") || "");
  const [region, setRegion] = useState(() => {
    const p = new URLSearchParams(locationSearch);
    return p.get("region") || "All Regions";
  });
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
          ...(trekFilter && { trek: trekFilter }),
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
  }, [trekFilter, debouncedSearch, region, language, minRating, sort]);

  const activeFilterCount = [
    !!trekFilter,
    region !== "All Regions",
    language !== "Any Language",
    minRating > 0,
  ].filter(Boolean).length;

  function clearFilters() {
    setTrekFilter("");
    setRegion("All Regions");
    setLanguage("Any Language");
    setMinRating(0);
    setSearch("");
    setDebouncedSearch("");
  }

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      <Navbar />

      {/* ── Page header ── */}
      <div className="pt-[66px] border-b border-stone-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <h1 className="text-[2.5rem] sm:text-[3rem] font-medium text-stone-900 leading-tight tracking-tight mb-3">
            {trekFilter ? `${trekFilter} guides` : "Verified Himalayan guides"}
          </h1>
          <p className="text-[15px] text-stone-500 max-w-[560px] leading-relaxed mb-6">
            {trekFilter
              ? `Nepal Tourism Board–verified guides who specialise in ${trekFilter}. Book directly, no agency fees.`
              : `${total > 0 ? `Browse ${total} ` : "Browse "}NTB-verified guides. Filter by route, language, and budget — book directly, no agency fees.`
            }
          </p>
          <div className="flex flex-wrap gap-6 text-[13px] text-stone-600">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-forest-500" /> NTB verified</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-forest-500" /> Avg. 4.8 rating</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-forest-500" /> 80+ routes covered</span>
          </div>
        </div>
      </div>

      {/* ── Trek filter banner ── */}
      {trekFilter && (
        <div className="border-b border-stone-100">
          <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 flex items-center gap-3">
            <span className="text-[13px] text-stone-600">
              Filtering for <span className="text-stone-900 font-medium">{trekFilter}</span>
            </span>
            <button
              onClick={() => { setTrekFilter(""); setRegion("All Regions"); }}
              className="ml-auto text-[12.5px] text-forest-600 hover:text-forest-700 font-medium transition-colors"
            >
              Show all guides
            </button>
          </div>
        </div>
      )}

      {/* ── Filter bar ── */}
      <div className="sticky top-[66px] z-40 bg-white border-b border-stone-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 border-b border-stone-200 px-1 py-1.5 flex-1 min-w-[180px] max-w-[260px] focus-within:border-forest-600 transition-colors">
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none" className="text-stone-400 shrink-0">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Name or route..."
              className="bg-transparent text-[13px] text-stone-800 placeholder:text-stone-400 outline-none w-full"
            />
          </div>

          <select value={region} onChange={(e) => setRegion(e.target.value)}
            className="bg-white border-b border-stone-200 px-1 py-1.5 text-[13px] text-stone-700 outline-none cursor-pointer hover:border-stone-400 transition-colors">
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border-b border-stone-200 px-1 py-1.5 text-[13px] text-stone-700 outline-none cursor-pointer hover:border-stone-400 transition-colors">
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-white border-b border-stone-200 px-1 py-1.5 text-[13px] text-stone-700 outline-none cursor-pointer hover:border-stone-400 transition-colors">
            <option value={0}>Any rating</option>
            <option value={4.5}>4.5★ & up</option>
            <option value={4.8}>4.8★ & up</option>
          </select>

          <div className="flex items-center gap-3 ml-auto">
            {(activeFilterCount > 0 || search) && (
              <button onClick={clearFilters} className="text-[12.5px] text-stone-500 hover:text-stone-900 transition-colors">
                Clear {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? "s" : ""}` : "search"}
              </button>
            )}
            <select value={sort} onChange={(e) => setSort(e.target.value)}
              className="bg-white border-b border-stone-200 px-1 py-1.5 text-[13px] text-stone-700 outline-none cursor-pointer hover:border-stone-400 transition-colors">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10">
        {!loading && !error && (
          <p className="text-[13px] text-stone-400 mb-6">
            Showing <span className="text-stone-700 font-medium">{guides.length}</span> guide{guides.length !== 1 ? "s" : ""}
            {activeFilterCount > 0 || debouncedSearch ? " matching your filters" : ""}
          </p>
        )}

        <GuideList
          guides={guides}
          loading={loading}
          error={error}
          hasFilters={activeFilterCount > 0 || !!debouncedSearch}
          onClearFilters={clearFilters}
        />
      </div>

      {/* ── Footer note ── */}
      <div className="border-t border-stone-100 py-6 text-center text-[12.5px] text-stone-400">
        All listed guides hold a valid Nepal Tourism Board license · Prices in USD per day
      </div>
    </div>
  );
}
