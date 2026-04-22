import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/ui/Navbar";
import { conditionsService } from "../services/api";

const STATUSES = ["All", "Open", "Caution", "Closed"];

const STATUS_CFG = {
  open:    { label: "Open",    badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: "✓" },
  caution: { label: "Caution", badge: "bg-amber-50 text-amber-700 border-amber-200",       dot: "bg-amber-500",   icon: "!" },
  closed:  { label: "Closed",  badge: "bg-red-50 text-red-700 border-red-200",             dot: "bg-red-500",     icon: "✕" },
};

const TRAIL_CFG = {
  good: { label: "Good", color: "text-emerald-600", bar: "bg-emerald-500", w: "w-full" },
  fair: { label: "Fair", color: "text-amber-600",   bar: "bg-amber-500",   w: "w-2/3"  },
  poor: { label: "Poor", color: "text-red-600",     bar: "bg-red-500",     w: "w-1/3"  },
};

/* ── Skeleton ──────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-1 w-full bg-stone-200" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-40 bg-stone-200 rounded" />
            <div className="h-3 w-24 bg-stone-100 rounded" />
          </div>
          <div className="h-5 w-16 bg-stone-200 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-2.5 w-14 bg-stone-200 rounded" />
              <div className="h-4 w-20 bg-stone-200 rounded" />
            </div>
          ))}
        </div>
        <div className="h-9 w-full bg-stone-100 rounded-xl" />
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <div className="h-2.5 w-20 bg-stone-100 rounded" />
            <div className="h-2.5 w-10 bg-stone-100 rounded" />
          </div>
          <div className="h-1.5 w-full bg-stone-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/* ── Condition card ────────────────────────────────────────────── */
function ConditionCard({ item }) {
  const s = STATUS_CFG[item.status] ?? STATUS_CFG.open;
  const t = TRAIL_CFG[item.trail]   ?? TRAIL_CFG.good;

  const borderCls =
    item.status === "closed"  ? "border-red-200 hover:border-red-300"   :
    item.status === "caution" ? "border-amber-200 hover:border-amber-300" :
    "border-stone-200 hover:border-stone-300";

  if (item.error) {
    return (
      <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-stone-400">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 4v3M7 9v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-medium text-stone-700">{item.name}</p>
          <p className="text-[11.5px] text-stone-400">{item.region} · Data unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${borderCls}`}>
      <div className="h-1 w-full bg-gradient-to-r from-forest-500 to-forest-300" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <h3 className="font-serif text-[0.95rem] font-semibold text-stone-900 leading-snug">
                {item.name}
              </h3>
              <span className={`text-[10px] px-2 py-[2px] rounded-full border font-semibold flex items-center gap-1 ${s.badge}`}>
                {s.icon} {s.label}
              </span>
            </div>
            <span className="text-[11.5px] text-stone-400">{item.region}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-stone-50 border border-stone-100">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Now</div>
            <div className="text-[15px] font-bold text-stone-800">{item.temp}°C</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Today</div>
            <div className="text-[13px] font-semibold text-stone-700">
              <span className="text-blue-500">{item.tempMin}°</span>
              <span className="text-stone-300 mx-1">/</span>
              <span className="text-red-400">{item.tempMax}°C</span>
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Wind</div>
            <div className="text-[13px] font-semibold text-stone-700">{item.windspeed} km/h</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">
              {item.snowfall > 0 ? "Snowfall" : "Precipitation"}
            </div>
            <div className="text-[13px] font-semibold text-stone-700">
              {item.snowfall > 0 ? `${item.snowfall} cm` : `${item.precipitation} mm`}
            </div>
          </div>
        </div>

        {/* Weather description */}
        <div className={`mb-4 px-3 py-2.5 rounded-xl text-[12.5px] font-medium border flex items-center gap-2
          ${item.status === "closed"  ? "bg-red-50 border-red-100 text-red-700"       :
            item.status === "caution" ? "bg-amber-50 border-amber-100 text-amber-700" :
                                        "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
          {item.desc}
          {item.snowfall > 0 && ` · ${item.snowfall}cm snow`}
        </div>

        {/* Trail quality bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10.5px] text-stone-400 uppercase tracking-wide">Trail Quality</span>
            <span className={`text-[11px] font-semibold ${t.color}`}>{t.label}</span>
          </div>
          <div className="h-1.5 rounded-full bg-stone-200">
            <div className={`h-full rounded-full transition-all ${t.bar} ${t.w}`} />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 text-[10.5px] text-stone-400">
          Updated {new Date(item.fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
}

/* ── Status pill ───────────────────────────────────────────────── */
function StatusPill({ status, count, active, onClick }) {
  const activeMap = {
    All:     "bg-stone-800 text-white border-stone-800",
    Open:    "bg-emerald-600 text-white border-emerald-600",
    Caution: "bg-amber-500 text-white border-amber-500",
    Closed:  "bg-red-600 text-white border-red-600",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3.5 py-[7px] rounded-xl border text-[13px] font-medium transition-all
        ${active ? activeMap[status] : "bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50"}`}
    >
      {status}
      <span className={`text-[11px] font-semibold px-1.5 rounded-full ${active ? "bg-white/20" : "bg-stone-100 text-stone-500"}`}>
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
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <Navbar />

      {/* ── Page header ── */}
      <div className="pt-[66px] bg-white border-b border-stone-200">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-10 sm:py-12">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest-500 font-semibold mb-3">
            <span className="w-5 h-px bg-forest-300" />
            Live · Real-time
          </span>
          <h1 className="font-serif text-[2.2rem] sm:text-[2.8rem] font-bold text-stone-900 leading-tight mb-3">
            Trail <span className="italic text-forest-500">Conditions</span>
          </h1>
          <p className="text-[15px] text-stone-500 max-w-[520px] leading-relaxed mb-6">
            Real-time weather across all {conditions.length || 46} Nepal trekking destinations — temperature, precipitation, wind and trail accessibility updated live.
          </p>

          {!loading && !error && (
            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[12px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {counts.open} open
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-[12px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {counts.caution} caution
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-full text-[12px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {counts.closed} closed
              </span>
              {fetchedAt && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 border border-stone-200 text-stone-500 rounded-full text-[12px]">
                  Fetched {new Date(fetchedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="sticky top-[66px] z-40 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-3 flex flex-wrap gap-2 items-center">
          {/* Status pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUSES.map((s) => (
              <StatusPill
                key={s} status={s}
                count={pillCounts[s]}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>

          <div className="hidden sm:block w-px h-6 bg-stone-200 mx-1" />

          {/* Region */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-[7px] text-[13px] text-stone-700 outline-none cursor-pointer hover:border-stone-300 transition-colors"
          >
            {regions.length > 0
              ? regions.map((r) => <option key={r} value={r}>{r}</option>)
              : <option value="All Regions">All Regions</option>}
          </select>

          {/* Search */}
          <div className="ml-auto flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-[7px] min-w-[180px] max-w-[240px] focus-within:border-forest-300 focus-within:ring-2 focus-within:ring-forest-100 transition-all">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-stone-400 shrink-0">
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
            className="flex items-center gap-1.5 px-3 py-[7px] rounded-xl border border-stone-200 text-[13px] text-stone-600 hover:border-forest-300 hover:text-forest-600 hover:bg-forest-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={loading ? "animate-spin" : ""}>
              <path d="M13 7A6 6 0 1 1 7 1a6 6 0 0 1 4.243 1.757L13 1v4H9l1.5-1.5A4 4 0 1 0 11 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-8 sm:py-10">

        {/* Error */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4">
            <div className="w-9 h-9 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-500 shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4" />
                <path d="M8 5v3.5M8 11v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold text-red-800 mb-0.5">Weather data unavailable</p>
              <p className="text-[13px] text-red-600">{error}</p>
            </div>
            <button onClick={load} className="text-[13px] text-red-600 hover:text-red-800 font-medium border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all">
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
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-stone-400">
                    <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10 10l8 8M18 10l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
                  </svg>
                </div>
                <p className="text-stone-500 text-[15px] mb-3">No locations match your filters.</p>
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
      <div className="border-t border-stone-200 bg-white py-6 text-center text-[12.5px] text-stone-400">
        Weather via{" "}
        <a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="text-forest-500 hover:underline">
          Open-Meteo
        </a>
        {" "}· Cached 5 min · Advisory only · Verify with your guide before departure
      </div>
    </div>
  );
}
