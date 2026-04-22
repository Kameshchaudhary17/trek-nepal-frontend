import { useState, useMemo } from "react";
import { Link } from "react-router-dom";

function RowLine({ label, value, sub, highlight, indent }) {
  return (
    <div className={`flex items-start justify-between py-2.5 ${indent ? "pl-4" : ""} ${highlight ? "mt-1 pt-3 border-t border-stone-200" : "border-b border-stone-100"}`}>
      <div>
        <span className={`text-[13.5px] ${highlight ? "text-stone-900 font-semibold" : "text-stone-500"}`}>{label}</span>
        {sub && <div className="text-[11.5px] text-stone-400 mt-0.5">{sub}</div>}
      </div>
      <span className={`font-medium tabular-nums shrink-0 ml-4 ${highlight ? "text-terra-500 text-[16px]" : "text-stone-700 text-[14px]"}`}>
        {value}
      </span>
    </div>
  );
}

export default function PriceCalculator({ trekPrices, guideTiers, seasons, porterRatePerDay, platformFeePct, aiNotice }) {
  const [trekId, setTrekId] = useState(trekPrices[0]?.trekId ?? "");
  const [days, setDays] = useState(trekPrices[0]?.minDays ?? 12);
  const [guideTier, setGuideTier] = useState(guideTiers[1]?.id ?? "senior");
  const [seasonId, setSeasonId] = useState(seasons[0]?.id ?? "peak");
  const [porterCount, setPorterCount] = useState(0);
  const [group, setGroup] = useState(1);

  const trek = trekPrices.find((t) => t.trekId === trekId) ?? trekPrices[0];
  const tier = guideTiers.find((g) => g.id === guideTier) ?? guideTiers[0];
  const season = seasons.find((s) => s.id === seasonId) ?? seasons[0];

  if (!trek || !tier || !season) return null;

  const validDays = Math.max(trek.minDays, Math.min(trek.maxDays, days));

  const calc = useMemo(() => {
    const baseMin = trek.baseCost.min * season.multiplier;
    const baseMax = trek.baseCost.max * season.multiplier;
    const guideMin = tier.ratePerDay.min * validDays;
    const guideMax = tier.ratePerDay.max * validDays;
    const porterMin = porterCount * porterRatePerDay.min * validDays;
    const porterMax = porterCount * porterRatePerDay.max * validDays;
    const permitTotal = trek.permits.reduce((s, p) => s + p.cost, 0);
    const subtotalMin = baseMin + guideMin + porterMin + permitTotal;
    const subtotalMax = baseMax + guideMax + porterMax + permitTotal;
    const feeMin = Math.round(subtotalMin * (platformFeePct / 100));
    const feeMax = Math.round(subtotalMax * (platformFeePct / 100));
    const totalMin = Math.round(subtotalMin + feeMin);
    const totalMax = Math.round(subtotalMax + feeMax);
    const g = Math.max(1, group);
    return { baseMin, baseMax, guideMin, guideMax, porterMin, porterMax, permitTotal, feeMin, feeMax, totalMin, totalMax, perPersonMin: Math.round(totalMin / g), perPersonMax: Math.round(totalMax / g) };
  }, [trek, tier, season, validDays, porterCount, group, porterRatePerDay, platformFeePct]);

  const fmt = (n) => `$${Math.round(n).toLocaleString()}`;
  const fmtRange = (a, b) => `${fmt(a)}–${fmt(b)}`;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
        <div>
          <h3 className="font-serif text-[1.05rem] font-semibold text-stone-900">Price Calculator</h3>
          <p className="text-[12px] text-stone-400 mt-0.5">Live rates from platform · refreshed on load</p>
        </div>
        <span className="text-[11px] px-2.5 py-1 rounded-full bg-forest-100 border border-forest-200 text-forest-700 font-medium">
          Live estimate
        </span>
      </div>

      <div className="p-6 grid lg:grid-cols-2 gap-8">
        {/* ── Controls ── */}
        <div className="space-y-5">
          {/* Trek */}
          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.12em] text-stone-500 font-semibold mb-2">Trek Route</label>
            <select
              value={trekId}
              onChange={(e) => {
                setTrekId(e.target.value);
                const t = trekPrices.find((x) => x.trekId === e.target.value);
                if (t) setDays(t.minDays);
              }}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-[14px] text-stone-800 outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100 appearance-none cursor-pointer"
            >
              {trekPrices.map((t) => <option key={t.trekId} value={t.trekId}>{t.name}</option>)}
            </select>
          </div>

          {/* Days */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11.5px] uppercase tracking-[0.12em] text-stone-500 font-semibold">Duration</label>
              <span className="text-[13px] text-forest-600 font-semibold">{validDays} days</span>
            </div>
            <input
              type="range"
              min={trek.minDays}
              max={trek.maxDays}
              value={validDays}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-forest-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>{trek.minDays} days (min)</span>
              <span>{trek.maxDays} days (max)</span>
            </div>
          </div>

          {/* Guide tier */}
          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.12em] text-stone-500 font-semibold mb-2">Guide Tier</label>
            <div className="space-y-2">
              {guideTiers.map((g) => (
                <label key={g.id} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer border transition-all ${guideTier === g.id ? "bg-forest-50 border-forest-300" : "bg-stone-50 border-stone-200 hover:bg-stone-100"}`}>
                  <input type="radio" name="guideTier" value={g.id} checked={guideTier === g.id} onChange={() => setGuideTier(g.id)} className="hidden" />
                  <span className="w-3 h-3 mt-[3px] rounded-full shrink-0" style={{ background: guideTier === g.id ? g.color : "#D1D5DB" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-1">
                      <span className={`text-[13px] font-medium ${guideTier === g.id ? "text-forest-800" : "text-stone-700"}`}>{g.label}</span>
                      <span className="text-[12px] text-stone-500">${g.ratePerDay.min}–${g.ratePerDay.max}/day</span>
                    </div>
                    <span className="text-[11.5px] text-stone-400">{g.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Season */}
          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.12em] text-stone-500 font-semibold mb-2">Season</label>
            <div className="grid grid-cols-2 gap-2">
              {seasons.map((s) => (
                <label key={s.id} className={`p-3 rounded-xl cursor-pointer border text-center transition-all ${seasonId === s.id ? "bg-forest-50 border-forest-300 text-forest-700" : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"}`}>
                  <input type="radio" name="season" value={s.id} checked={seasonId === s.id} onChange={() => setSeasonId(s.id)} className="hidden" />
                  <div className="text-[12px] font-semibold leading-snug mb-0.5">{s.badge}</div>
                  <div className="text-[11px] opacity-70">×{s.multiplier.toFixed(2)}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Porter + Group */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Porters", val: porterCount, set: setPorterCount, max: 5, note: `$${porterRatePerDay.min}–${porterRatePerDay.max}/day each` },
              { label: "Group size", val: group, set: setGroup, max: 20, note: "Splits total cost" },
            ].map(({ label, val, set, max, note }) => (
              <div key={label}>
                <label className="block text-[11.5px] uppercase tracking-[0.12em] text-stone-500 font-semibold mb-2">{label}</label>
                <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5">
                  <button onClick={() => set(Math.max(label === "Group size" ? 1 : 0, val - 1))} className="w-6 h-6 rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300 flex items-center justify-center leading-none cursor-pointer text-base transition-colors">−</button>
                  <span className="flex-1 text-center text-[14px] text-stone-800 font-semibold">{val}</span>
                  <button onClick={() => set(Math.min(max, val + 1))} className="w-6 h-6 rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300 flex items-center justify-center leading-none cursor-pointer text-base transition-colors">+</button>
                </div>
                <div className="text-[11px] text-stone-400 mt-1">{note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Breakdown ── */}
        <div>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 mb-4">
            <h4 className="text-[11.5px] uppercase tracking-[0.12em] text-stone-400 font-semibold mb-3">
              Breakdown · {trek.name}
            </h4>
            <RowLine label="Trek base cost" value={fmtRange(calc.baseMin, calc.baseMax)} sub={`${season.badge} season ×${season.multiplier}`} />
            <RowLine label={`Guide · ${tier.label}`} value={fmtRange(calc.guideMin, calc.guideMax)} sub={`$${tier.ratePerDay.min}–${tier.ratePerDay.max}/day × ${validDays} days`} />
            {porterCount > 0 && <RowLine label={`Porters ×${porterCount}`} value={fmtRange(calc.porterMin, calc.porterMax)} sub={`$${porterRatePerDay.min}–${porterRatePerDay.max}/day each`} />}
            <div className="mt-2 mb-1">
              <div className="text-[11px] uppercase tracking-[0.1em] text-stone-400 mb-1.5">Required Permits</div>
              {trek.permits.map((p) => <RowLine key={p.name} label={p.name} value={fmt(p.cost)} indent />)}
            </div>
            <RowLine label={`Platform fee (${platformFeePct}%)`} value={fmtRange(calc.feeMin, calc.feeMax)} sub="Transparent · no hidden charges" />

            <div className="mt-4 p-4 rounded-xl bg-forest-50 border border-forest-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-stone-600">Total estimate</span>
                <span className="text-[1.4rem] font-serif font-bold text-terra-500">{fmtRange(calc.totalMin, calc.totalMax)}</span>
              </div>
              {group > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-stone-400">Per person ({group} people)</span>
                  <span className="text-[14px] font-semibold text-stone-700">{fmtRange(calc.perPersonMin, calc.perPersonMax)}</span>
                </div>
              )}
            </div>
          </div>

          {aiNotice && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex gap-3 mb-4">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-blue-500 shrink-0 mt-0.5">
                <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10 6v4M10 12.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <div>
                <div className="text-[12px] font-semibold text-blue-700 mb-0.5">AI Pricing · Phase 3 (coming soon)</div>
                <p className="text-[11.5px] text-blue-600 leading-relaxed">{aiNotice}</p>
              </div>
            </div>
          )}

          <Link
            to="/register"
            className="block w-full text-center py-3.5 bg-forest-500 text-white rounded-xl text-[14px] font-semibold transition-all hover:bg-forest-600 hover:shadow-md"
          >
            Find guides for this trek →
          </Link>
        </div>
      </div>
    </div>
  );
}
