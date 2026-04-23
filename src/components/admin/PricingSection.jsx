import { useState, useEffect } from "react";
import { pricingService } from "../../services/api";
import SectionHeader from "./SectionHeader";

function Skeleton() {
  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-stone-100 animate-pulse" />
      ))}
    </div>
  );
}

export default function PricingSection({ showToast }) {
  const [trekPrices, setTrekPrices]   = useState([]);
  const [config, setConfig]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState({});

  // AI simulator state
  const [aiFactor, setAiFactor]       = useState({ season: "Autumn", demand: 0.85, baseCost: 800 });
  const [aiResult, setAiResult]       = useState(null);

  useEffect(() => {
    pricingService.getConfig()
      .then((data) => {
        setTrekPrices(data.trekPrices.map((t) => ({ ...t, _minCost: t.baseCost.min, _maxCost: t.baseCost.max })));
        setConfig(data);
      })
      .catch(() => showToast("Failed to load pricing data.", "error"))
      .finally(() => setLoading(false));
    // showToast is a stable setter from the parent — safe to omit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateLocal(trekId, field, val) {
    setTrekPrices((prev) =>
      prev.map((t) => t.trekId === trekId ? { ...t, [field]: Number(val) } : t)
    );
  }

  async function saveRow(t) {
    setSaving((s) => ({ ...s, [t.trekId]: true }));
    try {
      await pricingService.adminUpdateTrekPrice(t.trekId, {
        baseCost: { min: t._minCost, max: t._maxCost },
      });
      showToast(`${t.name} pricing saved.`);
    } catch {
      showToast("Failed to save pricing.", "error");
    } finally {
      setSaving((s) => ({ ...s, [t.trekId]: false }));
    }
  }

  async function savePlatformFee() {
    try {
      const fee = parseFloat(document.getElementById("platformFeeInput").value);
      if (isNaN(fee) || fee < 0 || fee > 100) { showToast("Fee must be 0–100%.", "error"); return; }
      await pricingService.adminUpdateConfig({ platformFeePct: fee });
      setConfig((c) => ({ ...c, platformFeePct: fee }));
      showToast("Platform fee updated.");
    } catch {
      showToast("Failed to update platform fee.", "error");
    }
  }

  function simulateAI() {
    const base    = parseFloat(aiFactor.baseCost) || 800;
    const mSeason = (aiFactor.season === "Spring" || aiFactor.season === "Autumn") ? 1.15 : 0.90;
    const mDemand = 1.0 + aiFactor.demand * 0.20;
    setAiResult({
      price:      Math.round(base * mSeason * mDemand),
      confidence: `${Math.floor(Math.random() * 8 + 86)}%`,
      seasonMult: mSeason.toFixed(2),
      demandMult: mDemand.toFixed(2),
    });
  }

  return (
    <div>
      <SectionHeader title="Trek Pricing Management" sub="Live data from API — changes persist immediately" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trek price table */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-[1rem] font-semibold text-stone-900">Base Cost Ranges</h3>
                <p className="text-[12px] text-stone-500 mt-0.5">Min and max per-person cost in USD · edit and save per row</p>
              </div>
              {config && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-100 border border-forest-200 text-forest-700 font-semibold">
                  {trekPrices.length} routes
                </span>
              )}
            </div>
            {loading ? <Skeleton /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm whitespace-nowrap">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr className="text-stone-500 text-[11px] uppercase tracking-wide">
                      <th className="text-left py-3 px-5 font-semibold">Trek</th>
                      <th className="text-left py-3 px-5 font-semibold">Duration</th>
                      <th className="text-left py-3 px-5 font-semibold">Cost Range ($)</th>
                      <th className="text-left py-3 px-5 font-semibold">Permits</th>
                      <th className="py-3 px-5" />
                    </tr>
                  </thead>
                  <tbody>
                    {trekPrices.map((t) => {
                      const permitTotal = t.permits?.reduce((s, p) => s + p.cost, 0) ?? 0;
                      const isSaving = saving[t.trekId];
                      return (
                        <tr key={t.trekId} className="border-b border-stone-100 hover:bg-stone-50 transition-colors last:border-0">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                              <span className="text-stone-800 font-semibold text-[13px]">{t.name}</span>
                            </div>
                            <div className="text-[11px] text-stone-400 ml-4">{t.region}</div>
                          </td>
                          <td className="py-3.5 px-5 text-stone-500 text-[13px]">{t.minDays}–{t.maxDays} days</td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number" min="0"
                                value={t._minCost}
                                onChange={(e) => updateLocal(t.trekId, "_minCost", e.target.value)}
                                className="w-[72px] bg-white border border-stone-200 rounded-lg py-1.5 px-2 text-forest-700 font-semibold text-[13px] focus:border-forest-400 focus:ring-1 focus:ring-forest-100 outline-none"
                              />
                              <span className="text-stone-400">–</span>
                              <input
                                type="number" min="0"
                                value={t._maxCost}
                                onChange={(e) => updateLocal(t.trekId, "_maxCost", e.target.value)}
                                className="w-[72px] bg-white border border-stone-200 rounded-lg py-1.5 px-2 text-forest-700 font-semibold text-[13px] focus:border-forest-400 focus:ring-1 focus:ring-forest-100 outline-none"
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-stone-600 text-[13px]">
                            ${permitTotal}
                            <div className="text-[11px] text-stone-400">{t.permits?.length ?? 0} required</div>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => saveRow(t)}
                              disabled={isSaving}
                              className={`text-[12px] font-semibold px-3 py-1 rounded-lg transition-all ${
                                isSaving ? "text-stone-400 bg-stone-50 border border-stone-200 cursor-not-allowed"
                                : "text-stone-500 hover:text-forest-600 hover:bg-forest-50 border border-transparent hover:border-forest-200"
                              }`}
                            >
                              {isSaving ? "Saving…" : "Save"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Platform fee card */}
          <div className="bg-white border border-stone-200 rounded-2xl p-5">
            <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-1">Platform Fee</h3>
            <p className="text-[12px] text-stone-500 mb-4">Shown transparently to all users before booking confirmation.</p>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center">
                <input
                  id="platformFeeInput"
                  type="number" min="0" max="100" step="0.5"
                  defaultValue={config?.platformFeePct ?? 5}
                  key={config?.platformFeePct}
                  className="w-24 bg-stone-50 border border-stone-200 rounded-xl py-2.5 px-3 pr-7 text-stone-800 text-[14px] font-semibold focus:border-forest-400 focus:ring-1 focus:ring-forest-100 outline-none"
                />
                <span className="absolute right-2.5 text-stone-400 text-[13px] font-medium pointer-events-none">%</span>
              </div>
              <button
                onClick={savePlatformFee}
                className="px-4 py-2.5 bg-forest-500 text-white rounded-xl text-[13px] font-semibold hover:bg-forest-600 transition-all"
              >
                Update Fee
              </button>
              {config && (
                <span className="text-[12px] text-stone-400">Current: <strong className="text-stone-700">{config.platformFeePct}%</strong></span>
              )}
            </div>
          </div>

          {/* Guide tier bands (read-only overview) */}
          {config && (
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">
                <h3 className="font-serif text-[1rem] font-semibold text-stone-900">Guide Tier Rate Bands</h3>
                <p className="text-[12px] text-stone-500 mt-0.5">Admin-defined daily rate limits that guides must quote within</p>
              </div>
              <div className="divide-y divide-stone-100">
                {config.guideTiers.map((g) => (
                  <div key={g.id} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: g.color }} />
                      <div>
                        <div className="text-[13px] font-semibold text-stone-800">{g.label}</div>
                        <div className="text-[11.5px] text-stone-400">{g.desc}</div>
                      </div>
                    </div>
                    <div className="text-[13px] font-semibold text-terra-500 shrink-0">
                      ${g.ratePerDay.min}–${g.ratePerDay.max}<span className="text-[11px] font-normal text-stone-400">/day</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Simulator */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 h-fit">
          <h3 className="font-serif text-[1rem] font-semibold text-blue-900 mb-1">AI Pricing Simulator</h3>
          <p className="text-[12px] text-blue-600 mb-5">Test dynamic pricing before deploying.</p>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-blue-700 font-semibold mb-1.5">Base Cost ($)</label>
              <input
                type="number"
                value={aiFactor.baseCost}
                onChange={(e) => setAiFactor((p) => ({ ...p, baseCost: e.target.value }))}
                className="w-full bg-white border border-blue-200 rounded-lg py-2.5 px-3 text-stone-800 text-[13px] focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-blue-700 font-semibold mb-1.5">Season</label>
              <select
                value={aiFactor.season}
                onChange={(e) => setAiFactor((p) => ({ ...p, season: e.target.value }))}
                className="w-full bg-white border border-blue-200 rounded-lg py-2.5 px-3 text-stone-800 text-[13px] focus:border-blue-400 outline-none cursor-pointer"
              >
                <option value="Spring">Spring (High)</option>
                <option value="Summer">Summer – Monsoon (Low)</option>
                <option value="Autumn">Autumn (Peak)</option>
                <option value="Winter">Winter (Shoulder)</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-[0.14em] text-blue-700 font-semibold">Market Demand</label>
                <span className="text-[12px] font-bold text-blue-700">{aiFactor.demand}</span>
              </div>
              <input
                type="range" min="0" max="1" step="0.05"
                value={aiFactor.demand}
                onChange={(e) => setAiFactor((p) => ({ ...p, demand: parseFloat(e.target.value) }))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-blue-400 mt-0.5">
                <span>Low</span><span>Peak Surge</span>
              </div>
            </div>
          </div>

          <button
            onClick={simulateAI}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold transition-all mb-5 shadow-sm"
          >
            Run Simulation
          </button>

          {aiResult && (
            <div className="border-t border-blue-200 pt-4">
              <div className="text-center mb-4">
                <p className="text-[10px] uppercase tracking-widest text-blue-500 mb-1">Recommended Price</p>
                <p className="font-serif text-[2.2rem] font-bold text-blue-700">${aiResult.price}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Confidence", val: aiResult.confidence },
                  { label: "Season ×",   val: aiResult.seasonMult },
                  { label: "Demand ×",   val: aiResult.demandMult },
                ].map((r) => (
                  <div key={r.label} className="bg-white border border-blue-100 rounded-lg p-2">
                    <p className="text-[10px] text-blue-500 mb-0.5">{r.label}</p>
                    <p className="text-[12px] font-bold text-blue-700">{r.val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
