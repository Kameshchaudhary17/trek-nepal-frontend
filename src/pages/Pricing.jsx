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
    <div className="mb-12 text-center">
      {eyebrow && (
        <div className="text-[11px] uppercase tracking-[0.18em] text-stone-400 mb-4">{eyebrow}</div>
      )}
      <h2 className="text-[2rem] sm:text-[2.4rem] font-medium text-stone-900 leading-tight tracking-tight mb-3">{title}</h2>
      {sub && <p className="text-[15px] text-stone-500 max-w-[560px] mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

function Wrap({ children, className = "" }) {
  return <div className={`max-w-[1200px] mx-auto px-5 sm:px-8 ${className}`}>{children}</div>;
}

function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="space-y-3 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-stone-100 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
        ))}
      </div>
    </div>
  );
}

function BasePricingTable({ trekPrices }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-[13.5px]">
        <thead>
          <tr className="border-b border-stone-200">
            {["Trek route", "Difficulty", "Duration", "Base cost range", "Permits", "Season"].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[11px] uppercase tracking-[0.12em] text-stone-400 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trekPrices.map((t) => {
            const permitTotal = t.permits.reduce((s, p) => s + p.cost, 0);
            return (
              <tr key={t.trekId} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                <td className="px-4 py-4">
                  <div className="font-medium text-stone-900">{t.name}</div>
                  <div className="text-[11.5px] text-stone-400">{t.region} · {t.altitude}</div>
                </td>
                <td className="px-4 py-4 text-stone-600">{t.difficulty}</td>
                <td className="px-4 py-4 text-stone-600 tabular-nums">{t.minDays}–{t.maxDays}d</td>
                <td className="px-4 py-4 text-stone-900 font-medium tabular-nums">
                  ${t.baseCost.min.toLocaleString()} <span className="text-stone-300">–</span> ${t.baseCost.max.toLocaleString()}
                </td>
                <td className="px-4 py-4">
                  <span className="text-stone-700 tabular-nums">${permitTotal}</span>
                  <div className="text-[11px] text-stone-400">{t.permits.length} required</div>
                </td>
                <td className="px-4 py-4 text-stone-500 text-[12.5px]">{t.season}</td>
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
    <div className="grid sm:grid-cols-3 border-y border-stone-100 divide-x divide-stone-100">
      {guideTiers.map((g) => (
        <div key={g.id} className="py-8 px-6 first:pl-0">
          <div className="text-[11px] uppercase tracking-[0.14em] text-stone-400 mb-2">{g.label}</div>
          <div className="text-[1.6rem] font-medium text-stone-900 tabular-nums leading-none">
            ${g.ratePerDay.min}–${g.ratePerDay.max}
            <span className="text-[13px] text-stone-400 ml-1 font-normal">/ day</span>
          </div>
          <p className="text-[12.5px] text-stone-500 mt-3 leading-relaxed">{g.desc}</p>
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
    <div className="min-h-screen bg-white font-sans text-stone-900 overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <div className="pt-[66px] border-b border-stone-100">
        <Wrap className="py-16 sm:py-20 text-center">
          <h1 className="text-[2.5rem] sm:text-[3rem] font-medium text-stone-900 leading-tight tracking-tight mb-4">
            Transparent pricing.<br />No hidden fees.
          </h1>
          <p className="text-[15px] text-stone-500 max-w-[560px] mx-auto leading-relaxed mb-10">
            Admin-controlled base rates ensure consistency. Verified guides quote within set bands. Full breakdown shown before you book.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link to="/register" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest-600 text-white rounded-md text-[13.5px] font-medium hover:bg-forest-700 transition-colors">
              Find a guide
            </Link>
            <a href="#calculator" className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-stone-700 hover:text-forest-600 transition-colors">
              Use calculator →
            </a>
          </div>
        </Wrap>
      </div>

      {/* ── Platform fee notice ── */}
      <div className="border-b border-stone-100">
        <Wrap className="py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[12.5px] text-stone-500">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-forest-500" /> NTB-verified guides only</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-forest-500" /> {platformFeePct}% platform fee, shown upfront</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-forest-500" /> Admin approves all rate changes</span>
        </Wrap>
      </div>

      {/* ── Pricing Control Roadmap ── */}
      <div className="py-20 sm:py-24">
        <Wrap>
          <SectionHead eyebrow="Pricing Control" title="How prices are set" sub="A 3-phase hybrid system — admin-first, then verified guides, then AI-assisted." />
          <div className="grid sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 border-y border-stone-100">
            {PHASES.map((p) => (
              <div key={p.phase} className={`p-8 relative ${p.active ? "bg-forest-50/40" : ""}`}>
                {p.active && (
                  <span className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.14em] text-forest-600 font-medium">Active</span>
                )}
                <div className="text-[11px] uppercase tracking-[0.14em] text-stone-400 mb-2">{p.phase}</div>
                <h3 className="text-[16px] font-medium text-stone-900 mb-5">{p.label}</h3>
                <ul className="space-y-2.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-stone-600">
                      <span className="w-1 h-1 rounded-full mt-[8px] shrink-0 bg-stone-400" />
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
      <div className="py-20 sm:py-24 border-t border-stone-100">
        <Wrap>
          <SectionHead eyebrow="Admin-set rates" title="Trek base pricing" sub="Set and maintained by the platform admin. All costs are in USD per trekker." />
          {loading ? <TableSkeleton /> : error ? (
            <div className="p-6 border border-red-100 rounded-lg text-red-600 text-center text-[13.5px]">{error}</div>
          ) : (
            <BasePricingTable trekPrices={data.trekPrices} />
          )}
          <p className="mt-8 text-[12.5px] text-stone-500 leading-relaxed max-w-[720px] mx-auto text-center">
            Base cost = trek logistics (accommodation, food, transport). Guide fees are additional and vary by tier. Permits are fixed government costs. A <strong className="text-stone-700 font-medium">{platformFeePct}%</strong> platform fee applies to the total — always shown before you confirm.
          </p>
        </Wrap>
      </div>

      {/* ── Guide tiers ── */}
      <div className="py-20 sm:py-24 border-t border-stone-100">
        <Wrap>
          <SectionHead eyebrow="Guide rates" title="Admin-defined tier bands" sub="Every guide must quote within these admin-approved ranges." />
          {loading ? (
            <div className="grid sm:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-36 bg-stone-100 animate-pulse rounded" />
              ))}
            </div>
          ) : error ? null : (
            <GuideTierTable guideTiers={data.guideTiers} />
          )}
          <p className="text-center text-[12px] text-stone-400 mt-8">
            Phase 2: Verified guides submit proposed daily rates → admin review → approved rates listed publicly.
          </p>
        </Wrap>
      </div>

      {/* ── Calculator ── */}
      <div id="calculator" className="py-20 sm:py-24 border-t border-stone-100">
        <Wrap>
          <SectionHead eyebrow="Estimate" title="Calculate your trek cost" sub="Interactive breakdown using live admin base rates. Adjust route, duration, guide tier and season." />
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
      <div className="py-20 sm:py-24 border-t border-stone-100">
        <Wrap>
          <SectionHead eyebrow="Compare" title="Side-by-side route costs" sub="Compare any 2–4 routes at a glance. Filters apply to all columns simultaneously." />
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
      <div className="py-20 sm:py-24 border-t border-stone-100">
        <Wrap className="max-w-[760px]">
          <SectionHead eyebrow="FAQ" title="Pricing questions" />
          <div className="divide-y divide-stone-100 border-y border-stone-100">
            {[
              { q: "Who sets the prices on TrekDirect?", a: "Currently, platform admin sets all base costs, permit fees, and guide rate bands. Guides cannot set unlimited prices — they must stay within admin-defined min/max tiers. This prevents scams and pricing manipulation." },
              { q: "Can guides set their own rates?", a: "Phase 2 will allow verified guides to propose a daily rate. It must fall inside the admin band for their tier. Admin reviews every proposal before it goes live — guides get feedback on rejections." },
              { q: "What is the platform fee?", a: `${platformFeePct}% of the total booking value. It is always displayed in the cost breakdown before you confirm — no hidden charges.` },
              { q: "What does 'base cost' cover?", a: "Trek logistics: tea house accommodation, standard meals on the trail, internal transport, and group equipment. Guide fees, porter fees and government permits are all itemised separately." },
              { q: "Why do prices vary by season?", a: "Peak season (Oct–Nov, Mar–Apr) has higher demand. We apply multipliers to base costs to reflect real market conditions. Low season can be 35% cheaper on the same route." },
              { q: "What is AI pricing (Phase 3)?", a: "An AI layer that analyses seasonal trends, route difficulty, and historical booking data to suggest fair prices to guides and admin. Admin still holds final approval — AI only recommends, never overrides." },
            ].map((item) => (
              <details key={item.q} className="group">
                <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none text-[14px] text-stone-900 font-medium">
                  {item.q}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-stone-400 group-open:rotate-180 transition-transform">
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="pb-5 text-[13.5px] text-stone-500 leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </Wrap>
      </div>

      {/* ── CTA ── */}
      <div className="py-20 border-t border-stone-100 text-center">
        <Wrap>
          <h2 className="text-[2rem] sm:text-[2.4rem] font-medium text-stone-900 leading-tight tracking-tight mb-4">
            Ready to book your trek?
          </h2>
          <p className="text-[15px] text-stone-500 mb-10 max-w-[440px] mx-auto">
            Full price breakdown shown before you confirm. No surprises at the trailhead.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-md text-[13.5px] font-medium hover:bg-forest-700 transition-colors">
            Get started free
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </Wrap>
      </div>
    </div>
  );
}
