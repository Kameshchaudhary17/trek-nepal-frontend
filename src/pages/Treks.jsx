import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import { treksService } from "../services/api";
import { DIFFICULTY_LEVELS, REGIONS, DURATIONS } from "../data/treks.js";
import { formatNPR } from "../utils/money";

/* ── Helpers ──────────────────────────────────────────────────── */
const SORT_OPTIONS = [
  { value: "popular",  label: "Most Popular" },
  { value: "price",    label: "Price: low → high" },
  { value: "duration", label: "Shortest first" },
  { value: "altitude", label: "Highest first" },
];

function totalPermitCost(permits) {
  return permits.reduce((s, p) => s + p.cost, 0);
}

const TREK_PHOTOS = {
  "Everest Base Camp": "/image/everest-base-camp.png",
};

/* ── Sub-components ───────────────────────────────────────────── */
function StatBox({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">{label}</div>
      <div className="text-[13px] font-medium text-stone-900 leading-tight tabular-nums">{value}</div>
    </div>
  );
}

function TrekCard({ trek }) {
  const [permitOpen, setPermitOpen] = useState(false);
  const permitTotal = totalPermitCost(trek.permits);
  const photo = trek.photo || TREK_PHOTOS[trek.name];

  return (
    <div
      className="group relative bg-white border border-stone-100 rounded-xl overflow-hidden hover:border-stone-300 transition-colors flex flex-col"
      style={photo ? { backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      {photo && (
        <>
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
        </>
      )}

      <div className={`relative p-6 flex flex-col flex-1 transition-colors duration-300 ${photo ? "group-hover:[&_*:not(svg)]:!text-white group-hover:[&_.border-stone-100]:!border-white/25" : ""}`}>
        {/* Meta line */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-stone-400 mb-2">
          <span>{trek.difficulty}</span>
          {trek.restricted && (<><span className="text-stone-300">·</span><span>Restricted</span></>)}
          <span className="text-stone-300">·</span>
          <span className="normal-case tracking-normal">{trek.region}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <h3 className="text-[1.15rem] font-medium text-stone-900 leading-snug">{trek.name}</h3>
          <div className="shrink-0 text-right">
            <div className="text-[1rem] font-medium text-stone-900 tabular-nums leading-none">{formatNPR(trek.guideFrom)}</div>
            <div className="text-[10.5px] text-stone-400 mt-1">from / person</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-stone-100 mb-5">
          <StatBox label="Duration" value={`${trek.minDays}–${trek.maxDays}d`} />
          <StatBox label="Max alt." value={trek.altitude} />
          <StatBox label="Best" value={trek.bestMonths} />
        </div>

        {/* Description */}
        <p className="text-[13px] text-stone-500 leading-relaxed mb-5 flex-1">{trek.desc}</p>

        {/* Highlights */}
        <ul className="mb-5 space-y-1.5">
          {trek.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2.5 text-[12.5px] text-stone-600">
              <span className="mt-[7px] w-1 h-1 rounded-full bg-stone-400 shrink-0" />
              {h}
            </li>
          ))}
        </ul>

        {/* Tags */}
        {trek.tags?.length > 0 && (
          <div className="text-[11.5px] text-stone-400 mb-5">
            {trek.tags.join(" · ")}
          </div>
        )}

        {/* Permit disclosure */}
        <div className="mb-5">
          <button
            onClick={() => setPermitOpen(!permitOpen)}
            className="w-full flex items-center justify-between py-2 text-left text-[12.5px] text-stone-600 hover:text-stone-900 transition-colors"
          >
            <span>
              {trek.permits.length} permit{trek.permits.length > 1 ? "s" : ""} required
              <span className="text-stone-400"> · {formatNPR(permitTotal)} total</span>
            </span>
            <svg
              width="11" height="11" viewBox="0 0 12 12" fill="none"
              className={`text-stone-400 transition-transform ${permitOpen ? "rotate-180" : ""}`}
            >
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {permitOpen && (
            <div className="pt-1 pb-1 space-y-1">
              {trek.permits.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-[12px]">
                  <span className="text-stone-500">{p.name}</span>
                  <span className="text-stone-700 tabular-nums">{formatNPR(p.cost)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Season */}
        <div className="text-[12px] text-stone-500 mb-6">
          <span className="text-stone-400">Season </span>{trek.season}
        </div>

        {/* CTA */}
        <Link
          to={`/guides?trek=${encodeURIComponent(trek.name)}&region=${encodeURIComponent(trek.region)}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-forest-600 hover:text-forest-700 transition-colors group/cta"
        >
          Find guides
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover/cta:translate-x-0.5">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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

