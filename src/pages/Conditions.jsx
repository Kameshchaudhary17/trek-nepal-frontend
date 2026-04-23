import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/ui/Navbar";
import { conditionsService } from "../services/api";

const STATUSES = ["All", "Open", "Caution", "Closed"];

const STATUS_CFG = {
  open:    { label: "Open",    dot: "bg-emerald-500", text: "text-emerald-700" },
  caution: { label: "Caution", dot: "bg-amber-500",   text: "text-amber-700" },
  closed:  { label: "Closed",  dot: "bg-red-500",     text: "text-red-700" },
};

const TRAIL_CFG = {
  good: { label: "Good", color: "text-emerald-600", bar: "bg-emerald-500", w: "w-full" },
  fair: { label: "Fair", color: "text-amber-600",   bar: "bg-amber-500",   w: "w-2/3"  },
  poor: { label: "Poor", color: "text-red-600",     bar: "bg-red-500",     w: "w-1/3"  },
};

/* ── Skeleton ──────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-100 rounded-xl p-6 animate-pulse">
      <div className="h-3 w-32 bg-stone-100 rounded mb-3" />
      <div className="h-5 w-48 bg-stone-100 rounded mb-5" />
      <div className="grid grid-cols-2 gap-y-4 py-4 border-y border-stone-100 mb-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-2 w-12 bg-stone-100 rounded" />
            <div className="h-4 w-20 bg-stone-100 rounded" />
          </div>
        ))}
      </div>
      <div className="h-3 w-40 bg-stone-100 rounded mb-5" />
      <div className="h-[3px] w-full bg-stone-100 rounded-full mb-5" />
      <div className="h-2.5 w-24 bg-stone-100 rounded" />
    </div>
  );
}

/* ── Condition card ────────────────────────────────────────────── */
function ConditionCard({ item }) {
  const s = STATUS_CFG[item.status] ?? STATUS_CFG.open;
  const t = TRAIL_CFG[item.trail]   ?? TRAIL_CFG.good;

  if (item.error) {
    return (
      <div className="bg-white border border-stone-100 rounded-xl p-6">
        <p className="text-[14px] font-medium text-stone-700">{item.name}</p>
        <p className="text-[12px] text-stone-400 mt-0.5">{item.region} · Data unavailable</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-100 rounded-xl overflow-hidden hover:border-stone-300 transition-colors">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-stone-400 mb-2">
          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
          <span className={s.text}>{s.label}</span>
          <span className="text-stone-300">·</span>
          <span className="normal-case tracking-normal">{item.region}</span>
        </div>
        <h3 className="text-[1.05rem] font-medium text-stone-900 leading-snug mb-5">{item.name}</h3>

        {/* Stats */}
        <div className="grid grid-cols-2 py-4 border-y border-stone-100 mb-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">Now</div>
            <div className="text-[18px] font-medium text-stone-900 tabular-nums">{item.temp}°C</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">Today</div>
            <div className="text-[14px] font-medium text-stone-900 tabular-nums">
              {item.tempMin}° <span className="text-stone-300">/</span> {item.tempMax}°
            </div>
          </div>
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">Wind</div>
            <div className="text-[13.5px] text-stone-700 tabular-nums">{item.windspeed} km/h</div>
          </div>
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">
              {item.snowfall > 0 ? "Snowfall" : "Precipitation"}
            </div>
            <div className="text-[13.5px] text-stone-700 tabular-nums">
              {item.snowfall > 0 ? `${item.snowfall} cm` : `${item.precipitation} mm`}
            </div>
          </div>
        </div>

        {/* Weather */}
        <p className="text-[13px] text-stone-500 mb-5">
          {item.desc}
          {item.snowfall > 0 && ` · ${item.snowfall}cm snow`}
        </p>

        {/* Trail quality */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] text-stone-400 uppercase tracking-[0.12em]">Trail quality</span>
            <span className={`text-[12px] font-medium ${t.color}`}>{t.label}</span>
          </div>
          <div className="h-[3px] rounded-full bg-stone-100">
            <div className={`h-full rounded-full transition-all ${t.bar} ${t.w}`} />
          </div>
        </div>

        <div className="text-[11px] text-stone-400">
          Updated {new Date(item.fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

/* ── Status pill ───────────────────────────────────────────────── */
function StatusPill({ status, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] transition-colors ${
        active ? "text-stone-900 font-medium border-b border-stone-900" : "text-stone-500 hover:text-stone-900 border-b border-transparent"
      }`}
    >
      {status}
      <span className={`text-[11px] tabular-nums ${active ? "text-stone-500" : "text-stone-400"}`}>
        {count ?? 0}
      </span>
    </button>
  );
}

/* ── Page ──────────────────────────────────────────────────────── */
export default function Conditions() {
  const [conditions, setConditions]     = useState([]);
  const [regions, setRegions]           = useState([]);
  const [counts, setCounts]             = useState({ open: 0, caution: 0, closed: 0 });
  const [fetchedAt, setFetchedAt]       = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All Regions");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [condRes, regRes] = await Promise.all([
        conditionsService.getConditions(),
        conditionsService.getRegions(),
      ]);
      setConditions(condRes.conditions ?? []);
      setCounts(condRes.counts ?? { open: 0, caution: 0, closed: 0 });
      setFetchedAt(condRes.fetchedAt ?? "");
      setRegions(["All Regions", ...(regRes.regions ?? [])]);
    } catch (e) {
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to load conditions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    conditions.filter((item) => {
      if (statusFilter !== "All" && item.status !== statusFilter.toLowerCase()) return false;
      if (regionFilter !== "All Regions" && item.region !== regionFilter)       return false;
      if (search) {
        const q = search.toLowerCase();
        if (!item.name.toLowerCase().includes(q) && !item.region.toLowerCase().includes(q)) return false;
      }
      return true;
    }),
  [conditions, statusFilter, regionFilter, search]);

  const pillCounts = {
    All:     conditions.length,
    Open:    counts.open    ?? 0,
    Caution: counts.caution ?? 0,
    Closed:  counts.closed  ?? 0,
  };

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      <Navbar />

      {/* ── Page header ── */}
      <div className="pt-[66px] border-b border-stone-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <h1 className="text-[2.5rem] sm:text-[3rem] font-medium text-stone-900 leading-tight tracking-tight mb-3">
            Trail conditions
          </h1>
          <p className="text-[15px] text-stone-500 max-w-[560px] leading-relaxed mb-8">
            Real-time weather across {conditions.length || 46} Nepal trekking destinations — temperature, precipitation, wind and trail accessibility updated live.
          </p>

          {!loading && !error && (
            <div className="flex flex-wrap gap-6 text-[13px]">
              <span className="flex items-center gap-2 text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {counts.open} open
              </span>
              <span className="flex items-center gap-2 text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {counts.caution} caution
              </span>
              <span className="flex items-center gap-2 text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {counts.closed} closed
              </span>
              {fetchedAt && (
                <span className="text-stone-400">
                  Fetched {new Date(fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sticky top-[66px] z-40 bg-white border-b border-stone-100">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 flex flex-wrap gap-3 items-center">
          {/* Status tabs */}
          <div className="flex items-center">
            {STATUSES.map((s) => (
              <StatusPill
                key={s} status={s}
                count={pillCounts[s]}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>

          <div className="hidden sm:block w-px h-5 bg-stone-100 mx-1" />

          {/* Region */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-white border-b border-stone-200 px-1 py-1.5 text-[13px] text-stone-700 outline-none cursor-pointer hover:border-stone-400 transition-colors"
          >
            {regions.length > 0
              ? regions.map((r) => <option key={r} value={r}>{r}</option>)
              : <option value="All Regions">All Regions</option>}
          </select>

          {/* Search */}
          <div className="ml-auto flex items-center gap-2 border-b border-stone-200 px-1 py-1.5 min-w-[180px] max-w-[240px] focus-within:border-forest-600 transition-colors">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-stone-400 shrink-0">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search location..."
              className="bg-transparent text-[13px] text-stone-800 placeholder:text-stone-400 outline-none w-full"
            />
          </div>

          {/* Refresh */}
          <button
            onClick={load} disabled={loading}
            className="flex items-center gap-1.5 px-2 py-1.5 text-[13px] text-stone-600 hover:text-forest-600 transition-colors disabled:opacity-40"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={loading ? "animate-spin" : ""}>
              <path d="M13 7A6 6 0 1 1 7 1a6 6 0 0 1 4.243 1.757L13 1v4H9l1.5-1.5A4 4 0 1 0 11 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10">

        {/* Error */}
        {error && (
          <div className="mb-8 p-5 border border-red-100 rounded-lg flex items-center gap-4">
            <div className="flex-1">
              <p className="text-[14px] font-medium text-red-700 mb-0.5">Weather data unavailable</p>
              <p className="text-[12.5px] text-red-500">{error}</p>
            </div>
            <button onClick={load} className="text-[13px] text-red-600 hover:text-red-700 font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[13px] text-stone-400">
                Showing <span className="text-stone-700 font-medium">{filtered.length}</span> of{" "}
                <span className="text-stone-700 font-medium">{conditions.length}</span> locations
                {(statusFilter !== "All" || regionFilter !== "All Regions" || search) && " · filtered"}
              </p>
              {(statusFilter !== "All" || regionFilter !== "All Regions" || search) && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter("All"); setRegionFilter("All Regions"); }}
                  className="text-[12px] text-stone-500 hover:text-forest-600 font-medium transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-24 border-y border-stone-100">
                <p className="text-stone-600 text-[14px] mb-2">No locations match your filters.</p>
                <button
                  onClick={() => { setSearch(""); setStatusFilter("All"); setRegionFilter("All Regions"); }}
                  className="text-[13px] text-forest-600 hover:text-forest-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filtered.map((item) => (
                  <ConditionCard key={item.name} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-stone-100 py-6 text-center text-[12.5px] text-stone-400">
        Weather via{" "}
        <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-forest-600 hover:underline">
          Open-Meteo
        </a>
        {" "}· Cached 5 min · Advisory only · Verify with your guide before departure
      </div>
    </div>
  );
}
