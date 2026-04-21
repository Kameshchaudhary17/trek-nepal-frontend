import { useState } from "react";
import { Link } from "react-router-dom";
import { TREK_PRICES, GUIDE_TIERS, SEASONS } from "../../data/pricing";

const DIFFICULTY_COLOR = {
  Hard: "bg-red-50 text-red-700 border-red-200",
  "Moderate–Hard": "bg-amber-50 text-amber-700 border-amber-200",
  Moderate: "bg-forest-50 text-forest-700 border-forest-200",
};

export default function PriceCompare() {
  const [selected, setSelected] = useState(["ebc", "annapurna", "langtang"]);
  const [seasonId, setSeasonId] = useState("peak");
  const [tierId, setTierId] = useState("senior");

  const season = SEASONS.find((s) => s.id === seasonId);
  const tier = GUIDE_TIERS.find((g) => g.id === tierId);

  const toggleTrek = (id) => {
    if (selected.includes(id)) {
      if (selected.length > 2) setSelected(selected.filter((s) => s !== id));
    } else {
      if (selected.length < 4) setSelected([...selected, id]);
    }
  };

  const treks = TREK_PRICES.filter((t) => selected.includes(t.id));

  const estimateTotal = (trek) => {
    const base = ((trek.baseCost.min + trek.baseCost.max) / 2) * season.multiplier;
    const avgDays = Math.round((trek.minDays + trek.maxDays) / 2);
    const guide = ((tier.ratePerDay.min + tier.ratePerDay.max) / 2) * avgDays;
    const permits = trek.permits.reduce((s, p) => s + p.cost, 0);
    return Math.round(base + guide + permits);
  };

  const lowestId = treks.reduce((a, b) => (estimateTotal(a) < estimateTotal(b) ? a : b)).id;
  const highestId = treks.reduce((a, b) => (estimateTotal(a) > estimateTotal(b) ? a : b)).id;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-stone-200 bg-stone-50">
        <h3 className="font-serif text-[1.05rem] font-semibold text-stone-900 mb-0.5">Route Cost Compare</h3>
        <p className="text-[12px] text-stone-400">Side-by-side · select 2–4 routes</p>
      </div>

      {/* Filters */}
      <div className="px-6 pt-5 pb-4 flex flex-wrap gap-4 border-b border-stone-100">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.12em] text-stone-400 font-semibold mb-1.5">Season</label>
          <div className="flex gap-2">
            {SEASONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeasonId(s.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] border font-medium transition-all ${
                  seasonId === s.id ? "bg-forest-50 border-forest-300 text-forest-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {s.badge}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.12em] text-stone-400 font-semibold mb-1.5">Guide tier</label>
          <div className="flex gap-2">
            {GUIDE_TIERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setTierId(g.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] border font-medium transition-all ${
                  tierId === g.id ? "bg-stone-200 border-stone-300 text-stone-800" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Route selector chips */}
      <div className="px-6 pt-4 pb-3 flex flex-wrap gap-2 border-b border-stone-100">
        {TREK_PRICES.map((t) => {
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => toggleTrek(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] border transition-all flex items-center gap-1.5 font-medium ${
                active ? "border-stone-300 text-stone-800 bg-stone-100" : "border-stone-200 text-stone-500 bg-stone-50 hover:bg-stone-100"
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? t.color : "#D1D5DB" }} />
              {t.name}
            </button>
          );
        })}
        <span className="text-[11px] text-stone-400 self-center ml-1">Pick 2–4</span>
      </div>

      {/* Comparison grid */}
      <div className="px-6 pb-6 overflow-x-auto">
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: `repeat(${treks.length}, minmax(180px, 1fr))` }}>
          {treks.map((t) => {
            const total = estimateTotal(t);
            const avgDays = Math.round((t.minDays + t.maxDays) / 2);
            const isLowest = t.id === lowestId;
            const isHighest = t.id === highestId;
            const permits = t.permits.reduce((s, p) => s + p.cost, 0);
            const base = Math.round(((t.baseCost.min + t.baseCost.max) / 2) * season.multiplier);
            const guide = Math.round(((tier.ratePerDay.min + tier.ratePerDay.max) / 2) * avgDays);

            return (
              <div
                key={t.id}
                className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
                  isLowest ? "border-forest-300 bg-forest-50" : isHighest ? "border-terra-200 bg-terra-50" : "border-stone-200 bg-stone-50"
                }`}
              >
                {isLowest && (
                  <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-forest-100 text-forest-700 border border-forest-200 font-semibold">
                    Best Value
                  </span>
                )}
                {isHighest && treks.length > 2 && (
                  <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-terra-100 text-terra-700 border border-terra-200 font-semibold">
                    Premium
                  </span>
                )}

                <div>
                  <div className="w-4 h-1.5 rounded-full mb-2" style={{ background: t.color }} />
                  <div className="font-serif text-[0.95rem] font-semibold text-stone-900 leading-snug mb-1.5">{t.name}</div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${DIFFICULTY_COLOR[t.difficulty] || DIFFICULTY_COLOR.Moderate}`}>
                    {t.difficulty}
                  </span>
                </div>

                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span className="text-stone-400">Base cost</span><span className="text-stone-700 font-medium">${base.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-stone-400">Guide ({avgDays}d)</span><span className="text-stone-700 font-medium">${guide.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-stone-400">Permits</span><span className="text-stone-700 font-medium">${permits}</span></div>
                  <div className="flex justify-between"><span className="text-stone-400">Duration</span><span className="text-stone-700">{t.minDays}–{t.maxDays} days</span></div>
                  <div className="flex justify-between"><span className="text-stone-400">Max alt.</span><span className="text-stone-700">{t.altitude}</span></div>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <div className="text-[11px] text-stone-400 mb-0.5">Avg. total estimate</div>
                  <div className="text-[1.15rem] font-serif font-bold" style={{ color: isLowest ? "#2D6A4F" : "#C05621" }}>
                    ${total.toLocaleString()}
                  </div>
                </div>

                <Link
                  to="/register"
                  className="block text-center py-2 rounded-lg bg-white border border-stone-200 text-[12px] text-stone-700 hover:bg-forest-50 hover:text-forest-600 hover:border-forest-200 transition-all font-medium"
                >
                  Find guides →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
