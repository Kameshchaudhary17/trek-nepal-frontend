import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import PriceCalculator from "../components/pricing/PriceCalculator";
import PriceCompare from "../components/pricing/PriceCompare";
import { pricingService } from "../services/api";

const PHASES = [
  {
    phase: "Phase 1", label: "Admin Controls (Current)", active: true,
    items: ["Platform admin sets all base trek costs", "Admin defines guide tier rate bands ($min–$max)", "Admin controls permit & seasonal pricing", "Consistent, scam-proof foundation"],
    color: "#2D6A4F",
  },
  {
    phase: "Phase 2", label: "Verified Guide Proposals", active: false,
    items: ["NTB-verified guides submit custom daily rates", "Rates must stay within admin-set min/max bands", "Admin reviews and approves before publishing", "Rejection flow with feedback to guide"],
    color: "#5E6BAD",
  },
  {
    phase: "Phase 3", label: "AI Dynamic Pricing", active: false,
    items: ["AI analyses season, demand, trek difficulty", "Suggests optimal price to guide and admin", "Historical booking data informs the model", "Admin retains final override at all times"],
    color: "#C05621",
  },
];

function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="mb-10 text-center">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-forest-500 font-semibold mb-4">
        <span className="w-6 h-px bg-forest-300" />
        {eyebrow}
        <span className="w-6 h-px bg-forest-300" />
      </span>
      <h2 className="font-serif text-[1.9rem] sm:text-[2.3rem] font-bold text-stone-900 leading-tight mb-3">{title}</h2>
      {sub && <p className="text-[15px] text-stone-500 max-w-[560px] mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

function Wrap({ children, className = "" }) {
  return <div className={`max-w-[1200px] mx-auto px-5 sm:px-8 ${className}`}>{children}</div>;
}

function TableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <div className="p-8 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-stone-100 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
        ))}
      </div>
    </div>
  );
}

function BasePricingTable({ trekPrices }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <table className="w-full min-w-[680px] text-[13.5px]">
        <thead>
          <tr className="bg-stone-50 border-b border-stone-200">
            {["Trek Route", "Difficulty", "Duration", "Base Cost Range", "Permits", "Season"].map((h) => (
              <th key={h} className="px-5 py-3.5 text-left text-[11px] uppercase tracking-[0.12em] text-stone-400 font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trekPrices.map((t, i) => {
            const permitTotal = t.permits.reduce((s, p) => s + p.cost, 0);
            const diffColor =
              t.difficulty === "Hard" ? "bg-red-50 text-red-700 border-red-200"
              : t.difficulty === "Easy" ? "bg-green-50 text-green-700 border-green-200"
              : t.difficulty === "Moderate" ? "bg-forest-50 text-forest-700 border-forest-200"
              : "bg-amber-50 text-amber-700 border-amber-200";
            return (
              <tr key={t.trekId} className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${i % 2 === 1 ? "bg-stone-50/50" : ""}`}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                    <span className="font-medium text-stone-900">{t.name}</span>
                  </div>
                  <div className="text-[11.5px] text-stone-400 ml-[18px]">{t.region} · {t.altitude}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[11.5px] px-2 py-0.5 rounded-full border font-medium ${diffColor}`}>{t.difficulty}</span>
                </td>
                <td className="px-5 py-4 text-stone-600">{t.minDays}–{t.maxDays} days</td>
                <td className="px-5 py-4">
                  <span className="text-terra-500 font-semibold">${t.baseCost.min.toLocaleString()}</span>
                  <span className="text-stone-300 mx-1">–</span>
                  <span className="text-terra-500 font-semibold">${t.baseCost.max.toLocaleString()}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-stone-700">${permitTotal}</span>
                  <div className="text-[11px] text-stone-400">{t.permits.length} required</div>
                </td>
                <td className="px-5 py-4 text-stone-500 text-[12.5px]">{t.season}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GuideTierTable({ guideTiers }) {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {guideTiers.map((g) => (
        <div key={g.id} className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm transition-all">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ background: g.color }} />
            <span className="font-serif text-[0.95rem] font-semibold text-stone-900">{g.label}</span>
          </div>
          <p className="text-[12.5px] text-stone-500 mb-4 leading-relaxed">{g.desc}</p>
          <div className="pt-3 border-t border-stone-100">
            <div className="text-[11px] text-stone-400 uppercase tracking-[0.1em] mb-1">Admin rate band</div>
            <div className="text-[1.2rem] font-serif font-bold text-terra-500">
              ${g.ratePerDay.min}–${g.ratePerDay.max}
              <span className="text-[13px] font-normal text-stone-400 ml-1">/ day</span>
            </div>
            <div className="text-[11.5px] text-stone-400 mt-1">Guides must quote within this range (Phase 2)</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Pricing() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    pricingService.getConfig()
      .then(setData)
      .catch(() => setError("Failed to load pricing data."))
      .finally(() => setLoading(false));
  }, []);

  const platformFeePct = data?.platformFeePct ?? 5;

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <div className="pt-[66px] bg-white border-b border-stone-200">
        <Wrap className="py-14 sm:py-18 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-5">
            <span className="w-8 h-px bg-forest-300" />
            Transparent Pricing
            <span className="w-8 h-px bg-forest-300" />
          </span>
          <h1 className="font-serif text-[2.4rem] sm:text-[3.2rem] font-bold text-stone-900 leading-tight mb-5">
            No agencies. No hidden fees.<br />
            <span className="italic text-forest-500">Just fair prices.</span>
          </h1>
          <p className="text-[15px] text-stone-500 max-w-[560px] mx-auto leading-relaxed mb-8">
            Admin-controlled base rates ensure consistency. Verified guides quote within set bands. Full breakdown shown before you book.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 hover:shadow-md transition-all">
              Find a guide
            </Link>
            <a href="#calculator" className="px-6 py-3 bg-stone-100 border border-stone-200 text-stone-700 rounded-xl text-[14px] font-medium hover:bg-stone-200 transition-all">
              Use calculator
            </a>
          </div>
        </Wrap>
      </div>

      {/* ── Platform fee notice ── */}
      <div className="border-b border-stone-200 bg-forest-50">
        <Wrap className="py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13px]">
          {[
            { icon: "✓", text: "NTB-verified guides only" },
            { icon: "ℹ", text: `${platformFeePct}% platform fee — shown upfront, no surprises` },
            { icon: "✓", text: "Admin approves all guide rate changes" },
          ].map((item) => (
            <span key={item.text} className="flex items-center gap-2 text-forest-700 font-medium">
              <span className="text-forest-500">{item.icon}</span>
              {item.text}
            </span>
          ))}
        </Wrap>
      </div>

      {/* ── Pricing Control Roadmap ── */}
      <div className="py-20 sm:py-24 bg-white">
        <Wrap>
          <SectionHead eyebrow="Pricing Control" title="How Prices Are Set" sub="A 3-phase hybrid system — admin-first, then verified guides, then AI-assisted." />
          <div className="grid sm:grid-cols-3 gap-5">
            {PHASES.map((p) => (
              <div key={p.phase} className={`rounded-2xl p-6 border transition-all relative overflow-hidden ${p.active ? "border-forest-200 bg-forest-50" : "border-stone-200 bg-white"}`}>
                {p.active && (
                  <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-forest-100 text-forest-700 border border-forest-200 font-semibold">
                    Active now
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-[0.15em] font-semibold" style={{ color: p.color }}>{p.phase}</span>
                </div>
                <h3 className="font-serif text-[1rem] font-semibold text-stone-900 mb-4">{p.label}</h3>
                <ul className="space-y-2.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0" style={{ background: p.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Wrap>
      </div>

      {/* ── Base prices table ── */}
      <div className="py-20 sm:py-24 bg-stone-50">
        <Wrap>
          <SectionHead eyebrow="Admin-set Rates" title="Trek Base Pricing" sub="Set and maintained by the platform admin. All costs are in USD per trekker." />
          {loading ? <TableSkeleton /> : error ? (
            <div className="p-8 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-center text-[14px]">{error}</div>
          ) : (
            <BasePricingTable trekPrices={data.trekPrices} />
          )}
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-blue-500 shrink-0 mt-0.5">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9 8v4M9 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-[12.5px] text-blue-700 leading-relaxed">
              Base cost = trek logistics (accommodation, food, transport). Guide fees are additional and vary by tier. Permits are fixed government costs. A <strong>{platformFeePct}%</strong> platform fee applies to the total — always shown before you confirm.
            </p>
          </div>
        </Wrap>
      </div>

      {/* ── Guide tiers ── */}
      <div className="py-20 sm:py-24 bg-white">
        <Wrap>
          <SectionHead eyebrow="Guide Rates" title="Admin-Defined Tier Bands" sub="Every guide must quote within these admin-approved ranges. No guide can set prices outside these limits." />
          {loading ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 rounded-2xl bg-stone-100 animate-pulse" />
              ))}
            </div>
          ) : error ? null : (
            <GuideTierTable guideTiers={data.guideTiers} />
          )}
          <p className="text-center text-[12.5px] text-stone-400 mt-6">
            Phase 2: Verified guides submit proposed daily rates → admin review → approved rates listed publicly.
          </p>
        </Wrap>
      </div>

      {/* ── Calculator ── */}
      <div id="calculator" className="py-20 sm:py-24 bg-stone-50">
        <Wrap>
          <SectionHead eyebrow="Estimate" title="Calculate Your Trek Cost" sub="Interactive breakdown using live admin base rates. Adjust route, duration, guide tier and season." />
          {loading ? <TableSkeleton /> : error ? null : (
            <PriceCalculator
              trekPrices={data.trekPrices}
              guideTiers={data.guideTiers}
              seasons={data.seasons}
              porterRatePerDay={data.porterRatePerDay}
              platformFeePct={data.platformFeePct}
              aiNotice={data.aiNotice}
            />
          )}
        </Wrap>
      </div>

      {/* ── Compare ── */}
      <div className="py-20 sm:py-24 bg-white">
        <Wrap>
          <SectionHead eyebrow="Compare" title="Side-by-Side Route Costs" sub="Compare any 2–4 routes at a glance. Filters apply to all columns simultaneously." />
          {loading ? <TableSkeleton /> : error ? null : (
            <PriceCompare
              trekPrices={data.trekPrices}
              guideTiers={data.guideTiers}
              seasons={data.seasons}
            />
          )}
        </Wrap>
      </div>

      {/* ── FAQ ── */}
      <div className="py-20 sm:py-24 bg-stone-50">
        <Wrap className="max-w-[760px]">
          <SectionHead eyebrow="FAQ" title="Pricing Questions" />
          <div className="space-y-3">
            {[
              { q: "Who sets the prices on TrekDirect?", a: "Currently, platform admin sets all base costs, permit fees, and guide rate bands. Guides cannot set unlimited prices — they must stay within admin-defined min/max tiers. This prevents scams and pricing manipulation." },
              { q: "Can guides set their own rates?", a: "Phase 2 will allow verified guides to propose a daily rate. It must fall inside the admin band for their tier. Admin reviews every proposal before it goes live — guides get feedback on rejections." },
              { q: "What is the platform fee?", a: `${platformFeePct}% of the total booking value. It is always displayed in the cost breakdown before you confirm — no hidden charges.` },
              { q: "What does 'base cost' cover?", a: "Trek logistics: tea house accommodation, standard meals on the trail, internal transport, and group equipment. Guide fees, porter fees and government permits are all itemised separately." },
              { q: "Why do prices vary by season?", a: "Peak season (Oct–Nov, Mar–Apr) has higher demand. We apply multipliers to base costs to reflect real market conditions. Low season can be 35% cheaper on the same route." },
              { q: "What is AI pricing (Phase 3)?", a: "An AI layer that analyses seasonal trends, route difficulty, and historical booking data to suggest fair prices to guides and admin. Admin still holds final approval — AI only recommends, never overrides." },
            ].map((item) => (
              <details key={item.q} className="group border border-stone-200 rounded-xl bg-white overflow-hidden hover:border-stone-300 transition-colors">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-[14px] text-stone-800 hover:text-stone-900 font-medium">
                  {item.q}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-stone-400 group-open:rotate-180 transition-transform">
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-[13.5px] text-stone-500 leading-relaxed border-t border-stone-100 pt-3">{item.a}</div>
              </details>
            ))}
          </div>
        </Wrap>
      </div>

      {/* ── CTA ── */}
      <div className="py-20 bg-forest-600 text-center">
        <Wrap>
          <h2 className="font-serif text-[2rem] sm:text-[2.4rem] font-bold text-white mb-4">
            Ready to book your trek?
          </h2>
          <p className="text-[15px] text-forest-200 mb-8 max-w-[440px] mx-auto">
            Full price breakdown shown before you confirm. No surprises at the trailhead.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-forest-700 rounded-xl text-[15px] font-semibold hover:bg-stone-50 hover:shadow-md transition-all">
            Get started free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </Wrap>
      </div>
    </div>
  );
}
