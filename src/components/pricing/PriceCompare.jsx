import { useState } from "react";
import { Link } from "react-router-dom";
import { TREK_PRICES, GUIDE_TIERS, SEASONS } from "../../data/pricing";

const DIFFICULTY_COLOR = {
  Hard: "#f08070",
  "Moderate–Hard": "#e0a860",
  Moderate: "#9acc70",
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
    <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7)_0%,rgba(10,14,28,0.85)_100%)] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.07]">
        <h3 className="font-serif text-[1.05rem] font-semibold text-[#f0e4c8] mb-1">Route Cost Compare</h3>
        <p className="text-[12px] text-[#5a7868]">Side-by-side · select 2–4 routes</p>
      </div>

      {/* Filters */}
      <div className="px-6 pt-5 pb-4 flex flex-wrap gap-4 border-b border-white/[0.05]">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.12em] text-[#5a7868] mb-1.5">Season</label>
          <div className="flex gap-2">
            {SEASONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSeasonId(s.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] border transition-all ${
                  seasonId === s.id ? "bg-[#e0b874]/10 border-[#e0b874]/35 text-[#e0b874]" : "bg-white/[0.03] border-white/[0.07] text-[#7a9080] hover:bg-white/[0.06]"
                }`}
              >
                {s.badge}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-[0.12em] text-[#5a7868] mb-1.5">Guide tier</label>
          <div className="flex gap-2">
            {GUIDE_TIERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setTierId(g.id)}
                className={`px-3 py-1.5 rounded-lg text-[12px] border transition-all ${
                  tierId === g.id ? "bg-white/[0.08] border-[#e0b874]/35 text-[#f0e4c8]" : "bg-white/[0.03] border-white/[0.07] text-[#7a9080] hover:bg-white/[0.06]"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Route selector chips */}
      <div className="px-6 pt-4 pb-3 flex flex-wrap gap-2">
        {TREK_PRICES.map((t) => {
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => toggleTrek(t.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] border transition-all flex items-center gap-1.5 ${
                active ? "border-white/20 text-[#f0e4c8] bg-white/[0.08]" : "border-white/[0.07] text-[#5a7868] bg-white/[0.02] hover:bg-white/[0.05]"
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: active ? t.color : "rgba(255,255,255,0.2)" }} />
              {t.name}
            </button>
          );
        })}
        <span className="text-[11px] text-[#3a5048] self-center ml-1">Pick 2–4</span>
      </div>

      {/* Comparison grid */}
      <div className="px-6 pb-6 overflow-x-auto">
        <div
          className="grid gap-4 mt-2"
          style={{ gridTemplateColumns: `repeat(${treks.length}, minmax(180px, 1fr))` }}
        >
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
                  isLowest ? "border-[#7aab50]/40 bg-[#7aab50]/[0.06]" : isHighest ? "border-[#e0b874]/30 bg-[#e0b874]/[0.04]" : "border-white/[0.07] bg-white/[0.02]"
                }`}
              >
                {/* Badge */}
                {isLowest && (
                  <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-[#7aab50]/20 text-[#9acc70] border border-[#7aab50]/30 font-medium">
                    Best Value
                  </span>
                )}
                {isHighest && treks.length > 2 && (
                  <span className="self-start text-[10px] px-2 py-0.5 rounded-full bg-[#e0b874]/15 text-[#e0b874] border border-[#e0b874]/25 font-medium">
                    Premium
                  </span>
                )}

                <div>
                  <div className="w-4 h-1 rounded-full mb-2" style={{ background: t.color }} />
                  <div className="font-serif text-[0.95rem] font-semibold text-[#f0e4c8] leading-snug mb-1">{t.name}</div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full border font-medium"
                    style={{ color: DIFFICULTY_COLOR[t.difficulty] || "#9acc70", borderColor: (DIFFICULTY_COLOR[t.difficulty] || "#9acc70") + "40", background: (DIFFICULTY_COLOR[t.difficulty] || "#9acc70") + "15" }}>
                    {t.difficulty}
                  </span>
                </div>

                <div className="space-y-1.5 text-[12px]">
                  <div className="flex justify-between"><span className="text-[#5a7868]">Base cost</span><span className="text-[#c0b090]">${base.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[#5a7868]">Guide ({avgDays}d)</span><span className="text-[#c0b090]">${guide.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-[#5a7868]">Permits</span><span className="text-[#c0b090]">${permits}</span></div>
                  <div className="flex justify-between"><span className="text-[#5a7868]">Duration</span><span className="text-[#c0b090]">{t.minDays}–{t.maxDays} days</span></div>
                  <div className="flex justify-between"><span className="text-[#5a7868]">Max alt.</span><span className="text-[#c0b090]">{t.altitude}</span></div>
                </div>

                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="text-[11px] text-[#5a7868] mb-0.5">Avg. total estimate</div>
                  <div className="text-[1.15rem] font-serif font-bold" style={{ color: isLowest ? "#9acc70" : "#e0b874" }}>
                    ${total.toLocaleString()}
                  </div>
                </div>

                <Link
                  to="/register"
                  className="block text-center py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[12px] text-[#9ab0a0] hover:bg-white/[0.1] hover:text-[#f0e4c8] transition-all"
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
