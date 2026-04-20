import SectionHeader from "./SectionHeader";

export default function PricingSection({ trekPrices, savedRows, aiFactor, aiResult, onUpdatePrice, onSaveRow, onAiChange, onSimulate }) {
  return (
    <div>
      <SectionHeader title="Trek Pricing Management" sub="Set base cost ranges and simulate AI dynamic pricing" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Trek price table */}
        <div className="lg:col-span-2 bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.07]">
            <h3 className="font-serif text-[1rem] font-semibold text-[#f0e4c8]">Base Cost Ranges</h3>
            <p className="text-[12px] text-[#5a7868] mt-0.5">Min and max per-person cost in USD</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/[0.07] text-[#5a7868] text-[11px] uppercase tracking-wide">
                  <th className="text-left py-3 px-5 font-medium">Trek</th>
                  <th className="text-left py-3 px-5 font-medium">Duration</th>
                  <th className="text-left py-3 px-5 font-medium">Cost Range ($)</th>
                  <th className="text-left py-3 px-5 font-medium">Permits ($)</th>
                  <th className="py-3 px-5" />
                </tr>
              </thead>
              <tbody>
                {trekPrices.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                    <td className="py-3.5 px-5 text-[#d0c8b0] font-medium text-[13px]">{t.name}</td>
                    <td className="py-3.5 px-5 text-[#5a7868] text-[13px]">{t.duration}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={t.minCost}
                          onChange={(e) => onUpdatePrice(t.id, "minCost", Number(e.target.value))}
                          className="w-[72px] bg-black/30 border border-white/[0.12] rounded-lg py-1.5 px-2 text-[#e0b874] text-[13px] focus:border-[#e0b874]/40 outline-none"
                        />
                        <span className="text-[#3a5848]">–</span>
                        <input
                          type="number"
                          value={t.maxCost}
                          onChange={(e) => onUpdatePrice(t.id, "maxCost", Number(e.target.value))}
                          className="w-[72px] bg-black/30 border border-white/[0.12] rounded-lg py-1.5 px-2 text-[#e0b874] text-[13px] focus:border-[#e0b874]/40 outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[#9ab0a0] text-[13px]">${t.permits}</td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onSaveRow(t.id)}
                        className={`text-[12px] font-medium px-3 py-1 rounded-lg transition-all ${
                          savedRows[t.id] ? "text-[#88cc99] bg-[#4a9a6a]/10" : "text-[#9ab0a0] hover:text-[#e0b874]"
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
        <div className="bg-[linear-gradient(160deg,rgba(10,20,38,0.8),rgba(5,10,24,0.9))] border border-[#4a7a8a]/25 rounded-2xl p-5">
          <h3 className="font-serif text-[1rem] font-semibold text-[#c8e8f0] mb-1">AI Pricing Simulator</h3>
          <p className="text-[12px] text-[#4a7a8a] mb-5">Test dynamic pricing before deploying.</p>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-[#5a8a9a] mb-1.5">Base Cost ($)</label>
              <input
                type="number"
                value={aiFactor.baseCost}
                onChange={(e) => onAiChange("baseCost", e.target.value)}
                className="w-full bg-black/30 border border-[#4a7a8a]/30 rounded-lg py-2.5 px-3 text-[#c8e8f0] text-[13px] focus:border-[#8ac8d8]/50 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-[#5a8a9a] mb-1.5">Season</label>
              <select
                value={aiFactor.season}
                onChange={(e) => onAiChange("season", e.target.value)}
                className="w-full bg-black/30 border border-[#4a7a8a]/30 rounded-lg py-2.5 px-3 text-[#c8e8f0] text-[13px] focus:border-[#8ac8d8]/50 outline-none cursor-pointer"
              >
                <option value="Spring">Spring (High)</option>
                <option value="Summer">Summer – Monsoon (Low)</option>
                <option value="Autumn">Autumn (Peak)</option>
                <option value="Winter">Winter (Shoulder)</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-[0.14em] text-[#5a8a9a]">Market Demand</label>
                <span className="text-[12px] font-semibold text-[#8ac8d8]">{aiFactor.demand}</span>
              </div>
              <input
                type="range" min="0" max="1" step="0.05"
                value={aiFactor.demand}
                onChange={(e) => onAiChange("demand", parseFloat(e.target.value))}
                className="w-full accent-[#8ac8d8]"
              />
              <div className="flex justify-between text-[10px] text-[#3a5a6a] mt-0.5">
                <span>Low</span><span>Peak Surge</span>
              </div>
            </div>
          </div>

          <button
            onClick={onSimulate}
            className="w-full py-2.5 rounded-xl bg-[#4a7a8a]/20 hover:bg-[#4a7a8a]/35 border border-[#8ac8d8]/35 text-[#c8e8f0] text-[13px] font-semibold transition-all mb-5"
          >
            Run Simulation
          </button>

          {aiResult && (
            <div className="border-t border-[#4a7a8a]/25 pt-4">
              <div className="text-center mb-4">
                <p className="text-[10px] uppercase tracking-widest text-[#4a7a8a] mb-1">Recommended Price</p>
                <p className="font-serif text-[2.2rem] font-bold text-[#8ac8d8]">${aiResult.price}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Confidence", val: aiResult.confidence },
                  { label: "Season ×", val: aiResult.seasonMult },
                  { label: "Demand ×", val: aiResult.demandMult },
                ].map((r) => (
                  <div key={r.label} className="bg-black/20 border border-white/[0.05] rounded-lg p-2">
                    <p className="text-[10px] text-[#4a7a8a] mb-0.5">{r.label}</p>
                    <p className="text-[12px] font-semibold text-[#8ac8d8]">{r.val}</p>
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
