import { useState, useEffect } from "react";
import Navbar from "../components/ui/Navbar";
import { TREK_PRICES } from "../data/pricing";

export default function AdminDashboard() {
  const [selectedTrek, setSelectedTrek] = useState(TREK_PRICES[0].id);
  const [phase, setPhase] = useState("Phase 1");
  const [aiFactor, setAiFactor] = useState({ season: "Autumn", demand: 0.85, baseCost: 800 });
  const [aiResult, setAiResult] = useState(null);
  
  // Simulated AI Call to the backend we just built
  const simulateAI = () => {
    // In a real app, this would use axios to /api/pricing/ai-recommendation
    const base = parseFloat(aiFactor.baseCost);
    const mSeason = aiFactor.season === "Spring" || aiFactor.season === "Autumn" ? 1.15 : 0.90;
    const mDemand = 1.0 + (aiFactor.demand * 0.20);
    const rec = Math.round(base * mSeason * mDemand);
    
    setAiResult({
      recommendedPrice: rec,
      confidenceScore: `${Math.floor(Math.random() * 10 + 85)}%`,
      seasonalMultiplier: mSeason.toFixed(2),
      demandMultiplier: mDemand.toFixed(2)
    });
  };

  return (
    <div className="min-h-screen bg-[#0e1a14] font-sans text-[#f0e4c8]">
      <Navbar />
      
      <div className="pt-28 pb-16 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#f5ead0] mb-2">Admin Control Center</h1>
            <p className="text-[#9ab0a0] font-light">Manage pricing rules, simulate AI algorithms, and control rollout phases.</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-1.5 flex gap-1">
            {["Phase 1", "Phase 2", "Phase 3"].map(p => (
              <button 
                key={p} 
                className={`px-4 py-2 text-sm rounded-lg transition-all ${phase === p ? "bg-[#e0b874] text-[#0e1a14] font-semibold shadow-md" : "text-[#9ab0a0] hover:text-[#f0e4c8] hover:bg-white/[0.05]"}`}
                onClick={() => setPhase(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Phase Context Notification */}
        <div className="mb-8 p-4 rounded-xl bg-[linear-gradient(160deg,rgba(224,184,116,0.15)_0%,rgba(200,150,80,0.05)_100%)] border border-[#e0b874]/30 flex gap-4">
          <div className="w-10 h-10 rounded-full bg-[#e0b874]/20 flex items-center justify-center shrink-0 text-xl">
             {phase === "Phase 1" ? "🔒" : phase === "Phase 2" ? "🤝" : "🧠"}
          </div>
          <div>
            <h3 className="text-[#e0b874] font-semibold mb-1">
              {phase === "Phase 1" && "Phase 1 Active: Admin-Controlled Pricing (MVP)"}
              {phase === "Phase 2" && "Phase 2 Active: Guide-Proposed Pricing"}
              {phase === "Phase 3" && "Phase 3 Active: AI Dynamic Pricing"}
            </h3>
            <p className="text-sm text-[#c8d0c0]/80">
              {phase === "Phase 1" && "You currently have absolute control over the base pricing and standard ranges. Guides follow your rules natively."}
              {phase === "Phase 2" && "Verified guides can propose their own rates. You must review and approve overrides via the dashboard."}
              {phase === "Phase 3" && "The AI engine is actively calculating seasonal dynamics, peak demand factors, and automatically adjusting margin limits."}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Pricing Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-xl font-serif font-bold text-[#f0e4c8] mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#e0b874] rounded-full inline-block" /> Base Cost Management
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10 text-[#7a9080]">
                      <th className="pb-3 font-medium px-4">Trek Route</th>
                      <th className="pb-3 font-medium px-4">Base Cost</th>
                      <th className="pb-3 font-medium px-4">Permits</th>
                      <th className="pb-3 font-medium px-4 text-center">Status</th>
                      <th className="pb-3 font-medium px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {TREK_PRICES.map((t) => (
                      <tr key={t.id} className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-medium">{t.name}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <input type="number" defaultValue={t.baseCost.min} className="w-20 bg-black/20 border border-white/20 rounded py-1 px-2 text-[#e0b874] focus:border-[#e0b874] outline-none" />
                            <span className="text-white/30 self-center">-</span>
                            <input type="number" defaultValue={t.baseCost.max} className="w-20 bg-black/20 border border-white/20 rounded py-1 px-2 text-[#e0b874] focus:border-[#e0b874] outline-none" />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[#9ab0a0]">${t.permits.reduce((acc, p) => acc + p.cost, 0)}</td>
                        <td className="py-4 px-4 text-center">
                           <span className="bg-[#4caf70]/10 border border-[#4caf70]/30 text-[#6acc80] px-2 py-0.5 rounded-full text-xs">Active</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button className="text-[#a0c0b0] hover:text-[#e0b874] transition-colors text-xs uppercase tracking-wider font-semibold">Save</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {phase === "Phase 2" && (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
                <h2 className="text-xl font-serif font-bold text-[#f0e4c8] mb-6 flex items-center gap-2">
                   <span className="w-1 h-6 bg-[#4a7a8a] rounded-full inline-block" /> Pending Proposals
                </h2>
                <div className="text-center py-10 text-[#6a8070]">
                  No pending guide rate proposals at this time.
                </div>
              </div>
            )}
          </div>

          {/* AI Simulator Sidebar */}
          <div className="space-y-6">
            <div className="bg-[linear-gradient(160deg,rgba(10,20,38,0.7)_0%,rgba(5,10,24,0.85)_100%)] backdrop-blur-xl border border-[#4a7a8a]/30 rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
               <h2 className="text-xl font-serif font-bold text-[#c8e8f0] mb-6 flex items-center gap-2">
                 <span className="w-1 h-6 bg-[#8ac8d8] rounded-full inline-block" /> AI Pricing Simulator
              </h2>
              <p className="text-[13px] text-[#6a8a9a] mb-6">Test the dynamic pricing heuristic algorithm before deploying to Phase 3.</p>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs uppercase tracking-wide text-[#7a9a8a] mb-1.5">Base Cost Constraint ($)</label>
                  <input type="number" value={aiFactor.baseCost} onChange={(e) => setAiFactor({...aiFactor, baseCost: e.target.value})} className="w-full bg-black/30 border border-[#4a7a8a]/40 rounded-lg py-2.5 px-3 text-[#c8e8f0] focus:border-[#8ac8d8] outline-none" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-[#7a9a8a] mb-1.5">Simulated Season</label>
                  <select value={aiFactor.season} onChange={(e) => setAiFactor({...aiFactor, season: e.target.value})} className="w-full bg-black/30 border border-[#4a7a8a]/40 rounded-lg py-2.5 px-3 text-[#c8e8f0] focus:border-[#8ac8d8] outline-none appearance-none cursor-pointer">
                    <option value="Spring">Spring (High)</option>
                    <option value="Summer">Summer (Low - Monsoon)</option>
                    <option value="Autumn">Autumn (Peak)</option>
                    <option value="Winter">Winter (Shoulder)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-[#7a9a8a] mb-1.5">Market Demand (0.0 to 1.0)</label>
                  <input type="range" min="0" max="1" step="0.05" value={aiFactor.demand} onChange={(e) => setAiFactor({...aiFactor, demand: parseFloat(e.target.value)})} className="w-full accent-[#8ac8d8]" />
                  <div className="flex justify-between text-[11px] text-[#4a6a7a] mt-1">
                    <span>Low Demand</span>
                    <span className="font-semibold text-[#8ac8d8]">{aiFactor.demand}</span>
                    <span>Peak Surge</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={simulateAI}
                className="w-full py-3 bg-[#4a7a8a]/20 hover:bg-[#4a7a8a]/40 border border-[#8ac8d8]/50 text-[#c8e8f0] rounded-xl font-semibold transition-all mb-6"
              >
                Run Cost Calculation
              </button>

              {aiResult && (
                <div className="pt-6 border-t border-[#4a7a8a]/30 animate-auth-float">
                   <div className="text-center mb-4">
                     <div className="text-[11px] uppercase tracking-widest text-[#7a9a8a] mb-1">Recommended Cost</div>
                     <div className="text-4xl font-serif font-bold text-[#8ac8d8]">${aiResult.recommendedPrice}</div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                     <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                        <div className="text-[10px] uppercase text-[#6a8a9a]">Confidence</div>
                        <div className="text-[#c8e8f0] font-medium text-sm">{aiResult.confidenceScore}</div>
                     </div>
                     <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                        <div className="text-[10px] uppercase text-[#6a8a9a]">Surge Target</div>
                        <div className="text-[#c8e8f0] font-medium text-sm">{(aiResult.demandMultiplier * aiResult.seasonalMultiplier).toFixed(2)}x</div>
                     </div>
                   </div>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
