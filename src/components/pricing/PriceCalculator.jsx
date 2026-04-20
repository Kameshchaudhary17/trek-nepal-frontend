import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  TREK_PRICES,
  GUIDE_TIERS,
  SEASONS,
  PORTER_RATE_PER_DAY,
  PLATFORM_FEE_PCT,
  AI_NOTICE,
} from "../../data/pricing";

function RowLine({ label, value, sub, highlight, indent }) {
  return (
    <div className={`flex items-start justify-between py-2.5 ${indent ? "pl-4" : ""} ${highlight ? "mt-1 pt-3 border-t border-white/10" : "border-b border-white/[0.04]"}`}>
      <div>
        <span className={`text-[13.5px] ${highlight ? "text-[#f0e4c8] font-semibold" : "text-[#8aa898]"}`}>{label}</span>
        {sub && <div className="text-[11.5px] text-[#5a7868] mt-0.5">{sub}</div>}
      </div>
      <span className={`font-medium tabular-nums shrink-0 ml-4 ${highlight ? "text-[#e0b874] text-[16px]" : "text-[#c0b090] text-[14px]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function PriceCalculator() {
  const [trekId, setTrekId] = useState("ebc");
  const [days, setDays] = useState(14);
  const [guideTier, setGuideTier] = useState("senior");
  const [seasonId, setSeasonId] = useState("peak");
  const [porterCount, setPorterCount] = useState(0);
  const [group, setGroup] = useState(1);

  const trek = TREK_PRICES.find((t) => t.id === trekId);
  const tier = GUIDE_TIERS.find((g) => g.id === guideTier);
  const season = SEASONS.find((s) => s.id === seasonId);

  const validDays = Math.max(trek.minDays, Math.min(trek.maxDays, days));

  const calc = useMemo(() => {
    const baseMin = trek.baseCost.min * season.multiplier;
    const baseMax = trek.baseCost.max * season.multiplier;
    const guideMin = tier.ratePerDay.min * validDays;
    const guideMax = tier.ratePerDay.max * validDays;
    const porterMin = porterCount * PORTER_RATE_PER_DAY.min * validDays;
    const porterMax = porterCount * PORTER_RATE_PER_DAY.max * validDays;
    const permitTotal = trek.permits.reduce((s, p) => s + p.cost, 0);
    const subtotalMin = baseMin + guideMin + porterMin + permitTotal;
    const subtotalMax = baseMax + guideMax + porterMax + permitTotal;
    const feeMin = Math.round(subtotalMin * (PLATFORM_FEE_PCT / 100));
    const feeMax = Math.round(subtotalMax * (PLATFORM_FEE_PCT / 100));
    const totalMin = Math.round(subtotalMin + feeMin);
    const totalMax = Math.round(subtotalMax + feeMax);
    const g = Math.max(1, group);
    return {
      baseMin, baseMax, guideMin, guideMax, porterMin, porterMax,
      permitTotal, feeMin, feeMax, totalMin, totalMax,
      perPersonMin: Math.round(totalMin / g),
      perPersonMax: Math.round(totalMax / g),
    };
  }, [trek, tier, season, validDays, porterCount, group]);

  const fmt = (n) => `$${Math.round(n).toLocaleString()}`;
  const fmtRange = (a, b) => `${fmt(a)}–${fmt(b)}`;

  return (
    <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7)_0%,rgba(10,14,28,0.85)_100%)] backdrop-blur-sm border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/[0.07] flex items-center justify-between">
        <div>
          <h3 className="font-serif text-[1.05rem] font-semibold text-[#f0e4c8]">Price Calculator</h3>
          <p className="text-[12px] text-[#5a7868] mt-0.5">Admin-set base rates · Phase 1 MVP</p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#4a7a8a]/15 border border-[#4a7a8a]/30 text-[#8ac8d8]">
          Live estimate
        </span>
      </div>

      <div className="p-6 grid lg:grid-cols-2 gap-8">
        {/* ── Controls ── */}
        <div className="space-y-5">
          {/* Trek */}
          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.12em] text-[#7a9080] font-medium mb-2">Trek Route</label>
            <select
              value={trekId}
              onChange={(e) => {
                setTrekId(e.target.value);
                const t = TREK_PRICES.find((x) => x.id === e.target.value);
                setDays(t.minDays);
              }}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-[#f0e4c8] outline-none focus:border-[#e0b874]/50 focus:ring-2 focus:ring-[#e0b874]/10 appearance-none cursor-pointer"
            >
              {TREK_PRICES.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#0d1428]">{t.name}</option>
              ))}
            </select>
          </div>

          {/* Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11.5px] uppercase tracking-[0.12em] text-[#7a9080] font-medium">Duration</label>
              <span className="text-[13px] text-[#e0b874] font-medium">{validDays} days</span>
            </div>
            <input
              type="range"
              min={trek.minDays}
              max={trek.maxDays}
              value={validDays}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-[#e0b874] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-[#4a6858] mt-1">
              <span>{trek.minDays} days (min)</span>
              <span>{trek.maxDays} days (max)</span>
            </div>
          </div>

          {/* Guide tier */}
          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.12em] text-[#7a9080] font-medium mb-2">Guide Tier</label>
            <div className="space-y-2">
              {GUIDE_TIERS.map((g) => (
                <label
                  key={g.id}
                  className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                    guideTier === g.id ? "bg-white/[0.07] border-[#e0b874]/35" : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]"
                  }`}
                >
                  <input type="radio" name="guideTier" value={g.id} checked={guideTier === g.id} onChange={() => setGuideTier(g.id)} className="hidden" />
                  <span className="w-3 h-3 mt-[3px] rounded-full shrink-0" style={{ background: guideTier === g.id ? g.color : "rgba(255,255,255,0.1)" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className={`text-[13px] font-medium ${guideTier === g.id ? "text-[#f0e4c8]" : "text-[#9ab0a0]"}`}>{g.label}</span>
                      <span className="text-[12px] text-[#8aa888]">${g.ratePerDay.min}–${g.ratePerDay.max}/day</span>
                    </div>
                    <span className="text-[11.5px] text-[#5a7868]">{g.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.12em] text-[#7a9080] font-medium mb-2">Season</label>
            <div className="grid grid-cols-2 gap-2">
              {SEASONS.map((s) => (
                <label
                  key={s.id}
                  className={`p-3 rounded-xl cursor-pointer border text-center transition-all ${
                    seasonId === s.id ? "bg-[#e0b874]/10 border-[#e0b874]/35 text-[#e0b874]" : "bg-white/[0.03] border-white/[0.06] text-[#7a9080] hover:bg-white/[0.05]"
                  }`}
                >
                  <input type="radio" name="season" value={s.id} checked={seasonId === s.id} onChange={() => setSeasonId(s.id)} className="hidden" />
                  <div className="text-[12px] font-medium leading-snug mb-0.5">{s.badge}</div>
                  <div className="text-[11px] opacity-70">×{s.multiplier.toFixed(2)}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Porter + Group */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Porters", val: porterCount, set: setPorterCount, max: 5, note: `$${PORTER_RATE_PER_DAY.min}–${PORTER_RATE_PER_DAY.max}/day each` },
              { label: "Group size", val: group, set: setGroup, max: 20, note: "Splits total cost" },
            ].map(({ label, val, set, max, note }) => (
              <div key={label}>
                <label className="block text-[11.5px] uppercase tracking-[0.12em] text-[#7a9080] font-medium mb-2">{label}</label>
                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5">
                  <button onClick={() => set(Math.max(label === "Group size" ? 1 : 0, val - 1))} className="w-6 h-6 rounded-lg bg-white/10 text-[#9ab0a0] hover:bg-white/20 flex items-center justify-center leading-none cursor-pointer text-base">−</button>
                  <span className="flex-1 text-center text-[14px] text-[#f0e4c8] font-medium">{val}</span>
                  <button onClick={() => set(Math.min(max, val + 1))} className="w-6 h-6 rounded-lg bg-white/10 text-[#9ab0a0] hover:bg-white/20 flex items-center justify-center leading-none cursor-pointer text-base">+</button>
                </div>
                <div className="text-[11px] text-[#4a6858] mt-1">{note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Breakdown ── */}
        <div>
          <div className="bg-[#04060f]/60 border border-white/[0.07] rounded-xl p-5 mb-4">
            <h4 className="text-[11.5px] uppercase tracking-[0.12em] text-[#5a7868] font-medium mb-3">
              Breakdown · {trek.name}
            </h4>

            <RowLine label="Trek base cost" value={fmtRange(calc.baseMin, calc.baseMax)} sub={`${season.badge} season ×${season.multiplier}`} />
            <RowLine
              label={`Guide · ${tier.label}`}
              value={fmtRange(calc.guideMin, calc.guideMax)}
              sub={`$${tier.ratePerDay.min}–${tier.ratePerDay.max}/day × ${validDays} days`}
            />
            {porterCount > 0 && (
              <RowLine label={`Porters ×${porterCount}`} value={fmtRange(calc.porterMin, calc.porterMax)} sub={`$${PORTER_RATE_PER_DAY.min}–${PORTER_RATE_PER_DAY.max}/day each`} />
            )}

            <div className="mt-2 mb-1">
              <div className="text-[11px] uppercase tracking-[0.1em] text-[#4a6858] mb-1.5">Required Permits</div>
              {trek.permits.map((p) => (
                <RowLine key={p.name} label={p.name} value={fmt(p.cost)} indent />
              ))}
            </div>

            <RowLine label={`Platform fee (${PLATFORM_FEE_PCT}%)`} value={fmtRange(calc.feeMin, calc.feeMax)} sub="Transparent · no hidden charges" />

            {/* Total */}
            <div className="mt-4 p-4 rounded-xl bg-[#e0b874]/[0.06] border border-[#e0b874]/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[#c0b090]">Total estimate</span>
                <span className="text-[1.4rem] font-serif font-bold text-[#e0b874]">
                  {fmtRange(calc.totalMin, calc.totalMax)}
                </span>
              </div>
              {group > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-[#5a7868]">Per person ({group} people)</span>
                  <span className="text-[14px] font-semibold text-[#c0b090]">
                    {fmtRange(calc.perPersonMin, calc.perPersonMax)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI Phase 3 teaser */}
          <div className="p-4 rounded-xl bg-[#3a4a7a]/10 border border-[#3a4a7a]/25 flex gap-3 mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-[#8a9ac8] shrink-0 mt-0.5">
              <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10 6v4M10 12.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <div>
              <div className="text-[12px] font-medium text-[#8a9ac8] mb-0.5">AI Pricing · Phase 3 (coming soon)</div>
              <p className="text-[11.5px] text-[#5a6888] leading-relaxed">{AI_NOTICE}</p>
            </div>
          </div>

          <Link
            to="/register"
            className="block w-full text-center py-3.5 bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl text-[14px] font-semibold transition-all shadow-[0_8px_24px_-6px_rgba(224,184,116,0.45)] hover:shadow-[0_12px_30px_-6px_rgba(224,184,116,0.55)] hover:-translate-y-[1px]"
          >
            Find guides for this trek →
          </Link>
        </div>
      </div>
    </div>
  );
}
