import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import { treksService } from "../services/api";
import { DIFFICULTY_LEVELS, REGIONS, DURATIONS } from "../data/treks.js";

/* ── Helpers ──────────────────────────────────────────────────── */
const DIFF_BADGE = {
  "Easy":           "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Moderate":       "bg-sky-50 text-sky-700 border-sky-200",
  "Moderate–Hard":  "bg-amber-50 text-amber-700 border-amber-200",
  "Hard":           "bg-red-50 text-red-700 border-red-200",
};

const SORT_OPTIONS = [
  { value: "popular",  label: "Most Popular" },
  { value: "price",    label: "Price: low → high" },
  { value: "duration", label: "Shortest first" },
  { value: "altitude", label: "Highest first" },
];

function totalPermitCost(permits) {
  return permits.reduce((s, p) => s + p.cost, 0);
}

/* ── Sub-components ───────────────────────────────────────────── */
function StatBox({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">{label}</div>
      <div className="text-[12.5px] font-semibold text-stone-700 leading-tight">{value}</div>
    </div>
  );
}

function TrekCard({ trek }) {
  const [permitOpen, setPermitOpen] = useState(false);
  const permitTotal = totalPermitCost(trek.permits);
  const diffClass = DIFF_BADGE[trek.difficulty] ?? DIFF_BADGE["Moderate"];

  return (
    <div className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:border-stone-300 hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
      {/* Trek photo or colour accent */}
      {trek.photo ? (
        <div className="h-36 w-full shrink-0 overflow-hidden">
          <img src={trek.photo} alt={trek.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      ) : (
        <div className="h-1.5 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${trek.color}, ${trek.color}70)` }} />
      )}

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className={`text-[10.5px] px-2 py-[2px] rounded-full border font-semibold ${diffClass}`}>
                {trek.difficulty}
              </span>
              {trek.restricted && (
                <span className="text-[10.5px] px-2 py-[2px] rounded-full border font-semibold bg-rose-50 text-rose-700 border-rose-200">
                  Restricted
                </span>
              )}
            </div>
            <h3 className="font-serif text-[1.05rem] font-bold text-stone-900 leading-snug mb-0.5">
              {trek.name}
            </h3>
            <p className="text-[11.5px] text-stone-400">{trek.region} Province</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] text-stone-400 mb-0.5">Guide from</div>
            <div className="text-[1.1rem] font-bold text-forest-600">${trek.guideFrom}</div>
            <div className="text-[10px] text-stone-400">/ person</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {trek.tags.map((t) => (
            <span key={t} className="text-[10.5px] px-2 py-[2px] rounded-full bg-stone-100 text-stone-500 border border-stone-200">
              {t}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl bg-stone-50 border border-stone-100">
          <StatBox label="Duration" value={`${trek.minDays}–${trek.maxDays}d`} />
          <StatBox label="Max Alt." value={trek.altitude} />
          <StatBox label="Best" value={trek.bestMonths} />
        </div>

        {/* Description */}
        <p className="text-[13px] text-stone-500 leading-relaxed mb-4 flex-1">
          {trek.desc}
        </p>

        {/* Highlights */}
        <ul className="mb-4 space-y-1.5">
          {trek.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-[12.5px] text-stone-600">
              <span className="mt-[3px] w-3.5 h-3.5 rounded-full bg-forest-100 border border-forest-200 flex items-center justify-center shrink-0">
                <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 4l2 2 3-3" stroke="#2D6A4F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {h}
            </li>
          ))}
        </ul>

        {/* Permit accordion */}
        <div className="mb-4 rounded-xl border border-stone-200 overflow-hidden">
          <button
            onClick={() => setPermitOpen(!permitOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-stone-50 hover:bg-stone-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-stone-400">
                <rect x="2" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M5 4V3a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="7" cy="8" r="1" fill="currentColor" />
              </svg>
              <span className="text-[12px] font-semibold text-stone-700">
                {trek.permits.length} permit{trek.permits.length > 1 ? "s" : ""} required
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-terra-500">${permitTotal} total</span>
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`text-stone-400 transition-transform ${permitOpen ? "rotate-180" : ""}`}
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </button>
          {permitOpen && (
            <div className="px-3.5 py-2.5 space-y-2 bg-white">
              {trek.permits.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-[12px]">
                  <span className="text-stone-600">{p.name}</span>
                  <span className="font-semibold text-stone-800">${p.cost}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Season */}
        <div className="flex items-center gap-2 text-[12px] text-stone-500 mb-5">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-forest-400 shrink-0">
            <rect x="2" y="3" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 6h10M5 1v2M9 1v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span><span className="font-medium text-stone-700">Best season:</span> {trek.season}</span>
        </div>

        {/* CTA */}
        <Link
          to={`/guides?trek=${encodeURIComponent(trek.name)}&region=${encodeURIComponent(trek.region)}`}
          className="block w-full text-center py-[10px] rounded-xl bg-forest-500 text-white text-[13.5px] font-semibold hover:bg-forest-600 hover:shadow-md transition-all"
        >
          Find guides for this trek →
        </Link>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`bg-stone-50 border border-stone-200 rounded-xl px-3 py-[7px] text-[13px] text-stone-700 outline-none cursor-pointer hover:border-stone-300 transition-colors ${className}`}
    >
      {options.map((o) => (
        <option key={typeof o === "string" ? o : o.value} value={typeof o === "string" ? o : o.value}>
          {typeof o === "string" ? o : o.label}
        </option>
      ))}
    </select>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function Treks() {
  const [allTreks, setAllTreks]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [region, setRegion]         = useState("All Regions");
  const [duration, setDuration]     = useState("Any Duration");
  const [sort, setSort]             = useState("popular");

  useEffect(() => {
    setLoading(true);
    treksService.getTreks()
      .then((data) => setAllTreks(data.treks ?? []))
      .catch(() => setError("Failed to load treks. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const easyCount       = allTreks.filter((t) => t.difficulty === "Easy").length;
  const moderateCount   = allTreks.filter((t) => t.difficulty.includes("Moderate")).length;
  const hardCount       = allTreks.filter((t) => t.difficulty === "Hard").length;
  const restrictedCount = allTreks.filter((t) => t.restricted).length;

  const activeFilters = [
    difficulty !== "All",
    region !== "All Regions",
    duration !== "Any Duration",
    !!search,
  ].filter(Boolean).length;

  const filtered = useMemo(() => {
    const dur = DURATIONS.find((d) => d.label === duration) ?? DURATIONS[0];

    let list = allTreks.filter((t) => {
      if (difficulty !== "All" && t.difficulty !== difficulty) return false;
      if (region !== "All Regions" && t.region !== region)     return false;
      if (t.minDays > dur.max || t.maxDays < dur.min)          return false;
      if (search) {
        const q = search.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !t.region.toLowerCase().includes(q) &&
            !t.tags.some((tag) => tag.toLowerCase().includes(q))) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "price")    return a.guideFrom - b.guideFrom;
      if (sort === "duration") return a.minDays - b.minDays;
      if (sort === "altitude") return b.altitudeM - a.altitudeM;
      return 0; // popular = original order
    });

    return list;
  }, [allTreks, search, difficulty, region, duration, sort]);

  function clearFilters() {
    setSearch(""); setDifficulty("All"); setRegion("All Regions"); setDuration("Any Duration");
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <Navbar />

      {/* ── Page header ── */}
      <div className="pt-[66px] bg-white border-b border-stone-200">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 sm:py-12">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest-500 font-semibold mb-3">
            <span className="w-5 h-px bg-forest-300" />
            {allTreks.length > 0 ? `${allTreks.length} Routes` : "Trek Routes"} · Nepal Himalaya
          </span>
          <h1 className="font-serif text-[2.2rem] sm:text-[2.8rem] font-bold text-stone-900 leading-tight mb-3">
            Nepal <span className="italic text-forest-500">Trek Routes</span>
          </h1>
          <p className="text-[15px] text-stone-500 max-w-[520px] leading-relaxed mb-7">
            From gentle valley walks to high-altitude circuit treks — explore every major Nepal trekking route with full permit details, seasonal guidance and difficulty ratings.
          </p>

          {/* Stats pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: `${easyCount} Easy`, cls: "bg-emerald-50 border-emerald-200 text-emerald-700" },
              { label: `${moderateCount} Moderate`, cls: "bg-sky-50 border-sky-200 text-sky-700" },
              { label: `${hardCount} Hard`, cls: "bg-red-50 border-red-200 text-red-700" },
              { label: `${restrictedCount} Restricted Area`, cls: "bg-rose-50 border-rose-200 text-rose-700" },
              { label: "No API key needed", cls: "bg-stone-100 border-stone-200 text-stone-600" },
            ].map((s) => (
              <span key={s.label} className={`px-3 py-1.5 rounded-full border text-[12px] font-medium ${s.cls}`}>
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sticky top-[66px] z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-[7px] min-w-[180px] max-w-[220px] focus-within:border-forest-300 focus-within:ring-2 focus-within:ring-forest-100 transition-all">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-stone-400 shrink-0">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search treks..."
              className="bg-transparent text-[13px] text-stone-800 placeholder:text-stone-400 outline-none w-full"
            />
          </div>

          {/* Difficulty */}
          <FilterSelect
            value={difficulty}
            onChange={setDifficulty}
            options={DIFFICULTY_LEVELS}
          />

          {/* Region */}
          <FilterSelect
            value={region}
            onChange={setRegion}
            options={REGIONS}
          />

          {/* Duration */}
          <FilterSelect
            value={duration}
            onChange={setDuration}
            options={DURATIONS.map((d) => d.label)}
          />

          {/* Clear filters */}
          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="text-[12px] text-stone-500 hover:text-terra-500 transition-colors px-2 py-1 font-medium"
            >
              Clear {activeFilters} filter{activeFilters > 1 ? "s" : ""}
            </button>
          )}

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <FilterSelect
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
            />
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-10">

        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl text-[13.5px] text-red-700 font-medium">
            {error}
          </div>
        )}

        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-1.5 bg-stone-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-32 bg-stone-200 rounded" />
                  <div className="h-5 w-48 bg-stone-200 rounded" />
                  <div className="grid grid-cols-3 gap-2 p-3 bg-stone-50 rounded-xl">
                    {[...Array(3)].map((_, j) => <div key={j} className="h-8 bg-stone-200 rounded" />)}
                  </div>
                  <div className="h-12 bg-stone-100 rounded" />
                  <div className="h-10 bg-stone-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
        <>
        <div className="flex items-center justify-between mb-6">
          <p className="text-[13px] text-stone-400">
            Showing <span className="text-stone-700 font-medium">{filtered.length}</span> of{" "}
            <span className="text-stone-700 font-medium">{allTreks.length}</span> routes
            {activeFilters > 0 && " · filtered"}
          </p>
          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-[12px] text-stone-500 hover:text-forest-600 font-medium transition-colors">
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-stone-400">
                <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M14 10v6M14 19v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              </svg>
            </div>
            <p className="text-stone-500 text-[15px] mb-3">No treks match your filters.</p>
            <button onClick={clearFilters} className="text-[13px] text-forest-600 hover:text-forest-700 font-medium">
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {filtered.map((trek) => <TrekCard key={trek._id} trek={trek} />)}
          </div>
        )}
        </>
        )}
      </div>

      {/* ── CTA banner ── */}
      {!loading && filtered.length > 0 && (
        <div className="border-t border-stone-200 bg-forest-600 py-14 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1440 200" preserveAspectRatio="none">
              <path fill="white" d="M0,200 L0,120 L120,80 L240,120 L360,60 L480,110 L600,55 L720,105 L840,50 L960,100 L1080,55 L1200,95 L1320,55 L1440,90 L1440,200Z" />
            </svg>
          </div>
          <div className="relative z-10 max-w-[1200px] mx-auto px-5 sm:px-8 text-center">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-200 font-semibold mb-4">
              <span className="w-6 h-px bg-forest-300" /> Ready to trek? <span className="w-6 h-px bg-forest-300" />
            </span>
            <h2 className="font-serif text-[1.9rem] sm:text-[2.4rem] font-bold text-white leading-tight mb-4">
              Found your route?<br />
              <span className="italic text-forest-100">Now find your guide.</span>
            </h2>
            <p className="text-[14.5px] text-forest-200 max-w-[440px] mx-auto mb-8 leading-relaxed">
              Browse 1,200+ NTB-verified guides — filter by route, language and budget. Book directly, no agency fees.
            </p>
            <Link
              to="/guides"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-forest-700 rounded-xl text-[15px] font-semibold hover:bg-stone-50 hover:shadow-md transition-all"
            >
              Browse all guides
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* ── Footer note ── */}
      <div className="border-t border-stone-200 bg-white py-6 text-center text-[12.5px] text-stone-400">
        Permit costs are indicative and subject to change · Always verify current fees before departure
      </div>
    </div>
  );
}

