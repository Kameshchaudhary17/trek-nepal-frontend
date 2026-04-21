import SectionHeader from "./SectionHeader";

export default function PricingSection({ trekPrices, savedRows, aiFactor, aiResult, onUpdatePrice, onSaveRow, onAiChange, onSimulate }) {
  return (
    <div>
      <SectionHeader title="Trek Pricing Management" sub="Set base cost ranges and simulate AI dynamic pricing" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trek price table */}
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-200 bg-stone-50">
            <h3 className="font-serif text-[1rem] font-semibold text-stone-900">Base Cost Ranges</h3>
            <p className="text-[12px] text-stone-500 mt-0.5">Min and max per-person cost in USD</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr className="text-stone-500 text-[11px] uppercase tracking-wide">
                  <th className="text-left py-3 px-5 font-semibold">Trek</th>
                  <th className="text-left py-3 px-5 font-semibold">Duration</th>
                  <th className="text-left py-3 px-5 font-semibold">Cost Range ($)</th>
                  <th className="text-left py-3 px-5 font-semibold">Permits ($)</th>
                  <th className="py-3 px-5" />
                </tr>
              </thead>
              <tbody>
                {trekPrices.map((t) => (
                  <tr key={t.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors last:border-0">
                    <td className="py-3.5 px-5 text-stone-800 font-semibold text-[13px]">{t.name}</td>
                    <td className="py-3.5 px-5 text-stone-500 text-[13px]">{t.duration}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={t.minCost}
                          onChange={(e) => onUpdatePrice(t.id, "minCost", Number(e.target.value))}
                          className="w-[72px] bg-white border border-stone-200 rounded-lg py-1.5 px-2 text-forest-700 font-semibold text-[13px] focus:border-forest-400 focus:ring-1 focus:ring-forest-100 outline-none"
                        />
                        <span className="text-stone-400">–</span>
                        <input
                          type="number"
                          value={t.maxCost}
                          onChange={(e) => onUpdatePrice(t.id, "maxCost", Number(e.target.value))}
                          className="w-[72px] bg-white border border-stone-200 rounded-lg py-1.5 px-2 text-forest-700 font-semibold text-[13px] focus:border-forest-400 focus:ring-1 focus:ring-forest-100 outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-stone-600 text-[13px]">${t.permits}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onSaveRow(t.id)}
                        className={`text-[12px] font-semibold px-3 py-1 rounded-lg transition-all ${
                          savedRows[t.id] ? "text-forest-700 bg-forest-50 border border-forest-200" : "text-stone-500 hover:text-forest-600 hover:bg-forest-50"
                        }`}
                      >
                        {savedRows[t.id] ? "Saved ✓" : "Save"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Simulator */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="font-serif text-[1rem] font-semibold text-blue-900 mb-1">AI Pricing Simulator</h3>
          <p className="text-[12px] text-blue-600 mb-5">Test dynamic pricing before deploying.</p>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-blue-700 font-semibold mb-1.5">Base Cost ($)</label>
              <input
                type="number"
                value={aiFactor.baseCost}
                onChange={(e) => onAiChange("baseCost", e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-lg py-2.5 px-3 text-stone-800 text-[13px] focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-blue-700 font-semibold mb-1.5">Season</label>
              <select
                value={aiFactor.season}
                onChange={(e) => onAiChange("season", e.target.value)}
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
                onChange={(e) => onAiChange("demand", parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-blue-400 mt-0.5">
                <span>Low</span><span>Peak Surge</span>
              </div>
            </div>
          </div>

          <button
            onClick={onSimulate}
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
                  { label: "Season ×", val: aiResult.seasonMult },
                  { label: "Demand ×", val: aiResult.demandMult },
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
