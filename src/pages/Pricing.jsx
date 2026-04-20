import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import PriceCalculator from "../components/pricing/PriceCalculator";
import PriceCompare from "../components/pricing/PriceCompare";
import { TREK_PRICES, GUIDE_TIERS, PLATFORM_FEE_PCT } from "../data/pricing";

/* ─── Admin pricing control phases roadmap ──────────────────────── */
const PHASES = [
  {
    phase: "Phase 1",
    label: "Admin Controls (Current)",
    active: true,
    items: [
      "Platform admin sets all base trek costs",
      "Admin defines guide tier rate bands ($min–$max)",
      "Admin controls permit & seasonal pricing",
      "Consistent, scam-proof foundation",
    ],
    color: "#e0b874",
  },
  {
    phase: "Phase 2",
    label: "Verified Guide Proposals",
    active: false,
    items: [
      "NTB-verified guides submit custom daily rates",
      "Rates must stay within admin-set min/max bands",
      "Admin reviews and approves before publishing",
      "Rejection flow with feedback to guide",
    ],
    color: "#4a9a6a",
  },
  {
    phase: "Phase 3",
    label: "AI Dynamic Pricing",
    active: false,
    items: [
      "AI analyses season, demand, trek difficulty",
      "Suggests optimal price to guide and admin",
      "Historical booking data informs the model",
      "Admin retains final override at all times",
    ],
    color: "#4a7aaa",
  },
];

/* ─── Helpers ───────────────────────────────────────────────────── */
function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="mb-10 text-center">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[#e0b874] font-medium mb-4">
        <span className="w-6 h-px bg-[#e0b874]" />
        {eyebrow}
        <span className="w-6 h-px bg-[#e0b874]" />
      </span>
      <h2 className="font-serif text-[1.9rem] sm:text-[2.3rem] font-bold text-[#f5ead0] leading-tight mb-3">{title}</h2>
      {sub && <p className="text-[15px] text-[#9ab0a0] max-w-[560px] mx-auto leading-relaxed">{sub}</p>}
    </div>
  );
}

function Wrap({ children, className = "" }) {
  return (
    <div className={`max-w-[1200px] mx-auto px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Base pricing table ─────────────────────────────────────────── */
function BasePricingTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
      <table className="w-full min-w-[680px] text-[13.5px]">
        <thead>
          <tr className="bg-white/[0.04] border-b border-white/[0.07]">
            {["Trek Route", "Difficulty", "Duration", "Base Cost Range", "Permits", "Seasonal Adj."].map((h) => (
              <th key={h} className="px-5 py-3.5 text-left text-[11px] uppercase tracking-[0.12em] text-[#5a7868] font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TREK_PRICES.map((t, i) => {
            const permitTotal = t.permits.reduce((s, p) => s + p.cost, 0);
            return (
              <tr
                key={t.id}
                className={`border-b border-white/[0.04] transition-colors hover:bg-white/[0.03] ${i % 2 === 0 ? "" : "bg-white/[0.02]"}`}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                    <span className="font-medium text-[#f0e4c8]">{t.name}</span>
                  </div>
                  <div className="text-[11.5px] text-[#5a7868] ml-[18px]">{t.region} · {t.altitude}</div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className="text-[11.5px] px-2 py-0.5 rounded-full border font-medium"
                    style={{
                      color: t.difficulty === "Hard" ? "#f08070" : t.difficulty === "Moderate" ? "#9acc70" : "#e0a860",
                      borderColor: (t.difficulty === "Hard" ? "#f08070" : t.difficulty === "Moderate" ? "#9acc70" : "#e0a860") + "40",
                      background: (t.difficulty === "Hard" ? "#f08070" : t.difficulty === "Moderate" ? "#9acc70" : "#e0a860") + "15",
                    }}
                  >
                    {t.difficulty}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#c0b090]">{t.minDays}–{t.maxDays} days</td>
                <td className="px-5 py-4">
                  <span className="text-[#e0b874] font-semibold">${t.baseCost.min.toLocaleString()}</span>
                  <span className="text-[#5a7868]">–</span>
                  <span className="text-[#e0b874] font-semibold">${t.baseCost.max.toLocaleString()}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="text-[#c0b090]">${permitTotal}</span>
                  <div className="text-[11px] text-[#4a6858]">{t.permits.length} required</div>
                </td>
                <td className="px-5 py-4 text-[#8aa898] text-[12.5px]">{t.season}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Guide tier table ───────────────────────────────────────────── */
function GuideTierTable() {
  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {GUIDE_TIERS.map((g) => (
        <div
          key={g.id}
          className="p-5 rounded-2xl border border-white/[0.08] bg-[linear-gradient(160deg,rgba(20,24,40,0.5)_0%,rgba(10,14,28,0.7)_100%)] hover:border-white/[0.16] transition-colors"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full" style={{ background: g.color }} />
            <span className="font-serif text-[0.95rem] font-semibold text-[#f0e4c8]">{g.label}</span>
          </div>
          <p className="text-[12.5px] text-[#7a9080] mb-4 leading-relaxed">{g.desc}</p>
          <div className="pt-3 border-t border-white/[0.07]">
            <div className="text-[11px] text-[#5a7868] uppercase tracking-[0.1em] mb-1">Admin rate band</div>
            <div className="text-[1.2rem] font-serif font-bold" style={{ color: g.color }}>
              ${g.ratePerDay.min}–${g.ratePerDay.max}
              <span className="text-[13px] font-normal text-[#5a7868] ml-1">/ day</span>
            </div>
            <div className="text-[11.5px] text-[#4a6858] mt-1">Guides must quote within this range (Phase 2)</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Pricing page ───────────────────────────────────────────────── */
export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#05080f] font-sans text-[#f0e4c8] overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <div className="pt-[100px] pb-16 sm:pb-20 bg-[linear-gradient(180deg,#07091a_0%,#05080f_100%)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(224,184,116,0.07)_0%,transparent_60%)]" />
        <svg className="absolute bottom-0 left-0 w-full h-[40%] pointer-events-none opacity-60" viewBox="0 0 1440 200" preserveAspectRatio="none" aria-hidden="true">
          <path fill="#04060f" d="M0,200 L0,130 L120,90 L260,140 L400,80 L540,135 L680,75 L820,130 L960,80 L1100,130 L1240,85 L1380,130 L1440,100 L1440,200 Z" />
        </svg>

        <Wrap className="relative z-10 text-center">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#e0b874] font-medium mb-5">
            <span className="w-8 h-px bg-[#e0b874]" />
            Transparent Pricing
            <span className="w-8 h-px bg-[#e0b874]" />
          </span>
          <h1 className="font-serif text-[2.4rem] sm:text-[3.2rem] font-bold text-[#f5ead0] leading-tight mb-5">
            No agencies. No hidden fees.<br />
            <span className="italic text-[#e0b874]">Just fair prices.</span>
          </h1>
          <p className="text-[15px] text-[#9ab0a0] max-w-[560px] mx-auto leading-relaxed mb-8">
            Admin-controlled base rates ensure consistency. Verified guides quote within set bands. Full breakdown shown before you book.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="px-6 py-3 bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl text-[14px] font-semibold hover:shadow-[0_8px_24px_rgba(224,184,116,0.4)] hover:-translate-y-[1px] transition-all">
              Find a guide
            </Link>
            <a href="#calculator" className="px-6 py-3 bg-white/[0.05] border border-white/[0.12] text-[#c0d0c0] rounded-xl text-[14px] font-medium hover:bg-white/[0.09] transition-all">
              Use calculator
            </a>
          </div>
        </Wrap>
      </div>

      {/* ── Platform fee notice ── */}
      <div className="border-y border-white/[0.06] bg-[#07091a]/60">
        <Wrap className="py-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13px]">
          <span className="flex items-center gap-2 text-[#8aa898]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L2 5v4c0 2.485 1.792 4.31 5 5 3.208-.69 5-2.515 5-5V5L7 1.5z" stroke="#e0b874" strokeWidth="1.2" strokeLinejoin="round" /><path d="M4.5 7l1.75 1.75L9.5 6" stroke="#e0b874" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            NTB-verified guides only
          </span>
          <span className="flex items-center gap-2 text-[#8aa898]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#e0b874" strokeWidth="1.2" /><path d="M7 4.5v3M7 9v.5" stroke="#e0b874" strokeWidth="1.4" strokeLinecap="round" /></svg>
            {PLATFORM_FEE_PCT}% platform fee — shown upfront, no surprises
          </span>
          <span className="flex items-center gap-2 text-[#8aa898]">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1.5" y="3" width="11" height="8" rx="1.5" stroke="#e0b874" strokeWidth="1.2" /><path d="M5 6.5h4M5 8.5h2" stroke="#e0b874" strokeWidth="1.2" strokeLinecap="round" /></svg>
            Admin approves all guide rate changes
          </span>
        </Wrap>
      </div>

      {/* ── Admin Pricing Control Roadmap ── */}
      <div className="py-20 sm:py-24">
        <Wrap>
          <SectionHead
            eyebrow="Pricing Control"
            title="How Prices Are Set"
            sub="A 3-phase hybrid system — admin-first, then verified guides, then AI-assisted."
          />
          <div className="grid sm:grid-cols-3 gap-5">
            {PHASES.map((p) => (
              <div
                key={p.phase}
                className={`rounded-2xl p-6 border transition-all relative overflow-hidden ${
                  p.active ? "border-[#e0b874]/30 bg-[#e0b874]/[0.04]" : "border-white/[0.07] bg-white/[0.02]"
                }`}
              >
                {p.active && (
                  <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-[#e0b874]/15 text-[#e0b874] border border-[#e0b874]/25 font-medium">
                    Active now
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-[0.15em] font-medium" style={{ color: p.color }}>{p.phase}</span>
                </div>
                <h3 className="font-serif text-[1rem] font-semibold text-[#f0e4c8] mb-4">{p.label}</h3>
                <ul className="space-y-2.5">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-[#8aa898]">
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
      <div className="py-20 sm:py-24 bg-[linear-gradient(180deg,#05080f_0%,#07091a_50%,#05080f_100%)]">
        <Wrap>
          <SectionHead
            eyebrow="Admin-set Rates"
            title="Trek Base Pricing"
            sub="Set and maintained by the platform admin. All costs are in USD per trekker."
          />
          <BasePricingTable />

          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-[#3a4a7a]/10 border border-[#3a4a7a]/20">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#8a9ac8] shrink-0 mt-0.5">
              <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.3" />
              <path d="M9 8v4M9 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-[12.5px] text-[#6a8888] leading-relaxed">
              Base cost = trek logistics (accommodation, food, transport). Guide fees are additional and vary by tier. Permits are fixed government costs. A <strong className="text-[#8a9ac8]">{PLATFORM_FEE_PCT}%</strong> platform fee applies to the total — always shown before you confirm.
            </p>
          </div>
        </Wrap>
      </div>

      {/* ── Guide tiers ── */}
      <div className="py-20 sm:py-24">
        <Wrap>
          <SectionHead
            eyebrow="Guide Rates"
            title="Admin-Defined Tier Bands"
            sub="Every guide must quote within these admin-approved ranges. No guide can set prices outside these limits."
          />
          <GuideTierTable />
          <p className="text-center text-[12.5px] text-[#4a6858] mt-6">
            Phase 2: Verified guides submit proposed daily rates → admin review → approved rates listed publicly.
          </p>
        </Wrap>
      </div>

      {/* ── Calculator ── */}
      <div id="calculator" className="py-20 sm:py-24 bg-[linear-gradient(180deg,#05080f_0%,#07091a_50%,#05080f_100%)]">
        <Wrap>
          <SectionHead
            eyebrow="Estimate"
            title="Calculate Your Trek Cost"
            sub="Interactive breakdown using admin base rates. Adjust route, duration, guide tier and season."
          />
          <PriceCalculator />
        </Wrap>
      </div>

      {/* ── Compare ── */}
      <div className="py-20 sm:py-24">
        <Wrap>
          <SectionHead
            eyebrow="Compare"
            title="Side-by-Side Route Costs"
            sub="Compare any 2–4 routes at a glance. Filters apply to all columns simultaneously."
          />
          <PriceCompare />
        </Wrap>
      </div>

      {/* ── FAQ ── */}
      <div className="py-20 sm:py-24 bg-[linear-gradient(180deg,#05080f_0%,#07091a_50%,#05080f_100%)]">
        <Wrap className="max-w-[760px]">
          <SectionHead eyebrow="FAQ" title="Pricing Questions" />
          <div className="space-y-4">
            {[
              {
                q: "Who sets the prices on TrekDirect?",
                a: "Currently, platform admin sets all base costs, permit fees, and guide rate bands. Guides cannot set unlimited prices — they must stay within admin-defined min/max tiers. This prevents scams and pricing manipulation.",
              },
              {
                q: "Can guides set their own rates?",
                a: "Phase 2 will allow verified guides to propose a daily rate. It must fall inside the admin band for their tier. Admin reviews every proposal before it goes live — guides get feedback on rejections.",
              },
              {
                q: "What is the platform fee?",
                a: `${PLATFORM_FEE_PCT}% of the total booking value. It is always displayed in the cost breakdown before you confirm — no hidden charges.`,
              },
              {
                q: "What does 'base cost' cover?",
                a: "Trek logistics: tea house accommodation, standard meals on the trail, internal transport, and group equipment. Guide fees, porter fees and government permits are all itemised separately.",
              },
              {
                q: "Why do prices vary by season?",
                a: "Peak season (Oct–Nov, Mar–Apr) has higher demand. We apply multipliers to base costs to reflect real market conditions. Low season can be 35% cheaper on the same route.",
              },
              {
                q: "What is AI pricing (Phase 3)?",
                a: "An AI layer that analyses seasonal trends, route difficulty, and historical booking data to suggest fair prices to guides and admin. Admin still holds final approval — AI only recommends, never overrides.",
              },
            ].map((item) => (
              <details key={item.q} className="group border border-white/[0.07] rounded-xl bg-white/[0.02] overflow-hidden">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-[14px] text-[#d0c8b8] hover:text-[#f0e4c8] transition-colors font-medium">
                  {item.q}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 text-[#5a7868] group-open:rotate-180 transition-transform">
                    <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-[13.5px] text-[#7a9888] leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </Wrap>
      </div>

      {/* ── CTA ── */}
      <div className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(224,184,116,0.07)_0%,transparent_70%)]" />
        <Wrap className="relative z-10">
          <h2 className="font-serif text-[2rem] sm:text-[2.4rem] font-bold text-[#f5ead0] mb-4">
            Ready to book your trek?
          </h2>
          <p className="text-[15px] text-[#9ab0a0] mb-8 max-w-[440px] mx-auto">
            Full price breakdown shown before you confirm. No surprises at the trailhead.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-br from-[#e8c07c] via-[#d0a45a] to-[#a8853a] text-[#0e1a14] rounded-xl text-[15px] font-semibold hover:shadow-[0_10px_30px_-8px_rgba(224,184,116,0.5)] hover:-translate-y-[1px] transition-all"
          >
            Get started free
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </Wrap>
      </div>
    </div>
  );
}
