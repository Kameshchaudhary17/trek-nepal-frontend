import { Link } from "react-router-dom";

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  top: Math.random() * 55,
  left: Math.random() * 100,
  size: Math.random() * 1.6 + 0.6,
  delay: Math.random() * 4,
}));

const FLAKES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  size: Math.random() * 3 + 2,
  delay: Math.random() * 18,
  dur: Math.random() * 12 + 14,
  opacity: Math.random() * 0.4 + 0.3,
}));

function CinematicBackdrop() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Sky wash: deep night -> dawn rose -> warm amber horizon */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#070b18_0%,#0d1430_22%,#1b1d3d_42%,#3b2648_58%,#7a4a3e_72%,#c48a4a_84%,#e8b368_92%,#d68a4a_100%)]" />

      {/* Soft sun/moon glow */}
      <div className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,210,140,0.55)_0%,rgba(255,170,90,0.25)_35%,transparent_70%)] blur-2xl" />

      {/* Aurora band */}
      <div className="absolute top-[18%] left-0 w-full h-[140px] bg-[linear-gradient(90deg,transparent,rgba(120,180,220,0.18),rgba(180,140,220,0.22),rgba(120,200,180,0.18),transparent)] blur-2xl animate-auth-aurora" />

      {/* Stars */}
      {STARS.map((s) => (
        <span
          key={s.id}
          className="absolute rounded-full bg-white animate-auth-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Snow / dust particles */}
      {FLAKES.map((f) => (
        <span
          key={f.id}
          className="absolute top-0 rounded-full bg-white animate-auth-drift"
          style={{
            left: `${f.left}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: f.opacity,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.dur}s`,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      {/* Mountain layer: far range (blue-violet haze) */}
      <svg className="absolute bottom-0 left-0 w-full h-[58%]" viewBox="0 0 1440 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="m-far" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4a3a5c" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1e1a38" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <path fill="url(#m-far)" d="M0,420 L0,320 L90,260 L180,310 L280,200 L380,290 L480,220 L600,300 L720,180 L850,280 L970,230 L1080,300 L1200,210 L1320,290 L1440,240 L1440,600 L0,600 Z" />
      </svg>

      {/* Mountain layer: mid range with snow caps */}
      <svg className="absolute bottom-0 left-0 w-full h-[48%]" viewBox="0 0 1440 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="m-mid" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2a2a44" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0f1428" stopOpacity="1" />
          </linearGradient>
        </defs>
        <path fill="url(#m-mid)" d="M0,600 L0,380 L120,260 L220,360 L340,220 L460,340 L580,240 L700,360 L820,210 L950,340 L1080,250 L1200,360 L1320,230 L1440,330 L1440,600 Z" />
        {/* snow cap highlights */}
        <path fill="#f3e7d0" fillOpacity="0.35" d="M338,224 L345,235 L352,225 L360,240 L370,228 L345,240 Z M818,214 L825,228 L834,218 L843,234 L852,224 L828,234 Z M118,264 L125,276 L134,266 L143,280 L152,270 L128,280 Z" />
      </svg>

      {/* Mountain layer: foreground dark ridge */}
      <svg className="absolute bottom-0 left-0 w-full h-[32%]" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path fill="#05080f" d="M0,400 L0,300 L80,220 L180,290 L290,180 L400,270 L520,190 L640,280 L760,200 L880,290 L1000,210 L1120,280 L1240,190 L1360,270 L1440,220 L1440,400 Z" />
      </svg>

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}

function PrayerFlags() {
  const flags = ["#3a7bd5", "#f0d062", "#f08070", "#7aab50", "#e0e0e0"];
  return (
    <svg
      className="absolute top-0 right-0 w-[340px] max-lg:w-[220px] max-sm:w-[160px] opacity-80 pointer-events-none"
      viewBox="0 0 340 110"
      aria-hidden="true"
    >
      <path d="M0,10 Q170,80 340,20" stroke="#2a2a44" strokeWidth="1" fill="none" />
      {flags.map((c, i) => {
        const t = (i + 1) / 7;
        const x = t * 340;
        const y = 10 + Math.sin(t * Math.PI) * 54;
        return (
          <g key={i} transform={`translate(${x - 12},${y})`}>
            <rect width="22" height="26" fill={c} opacity="0.85" />
            <rect width="22" height="2" fill={c} opacity="0.4" y="26" />
          </g>
        );
      })}
    </svg>
  );
}

export default function AuthLayout({ children, side }) {
  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-[#070b18]">
      <CinematicBackdrop />
      <PrayerFlags />

      {/* Brand */}
      <header className="relative z-40 flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8">
        <Link to="/" className="flex items-center gap-2.5 text-[#e8d5b0] group">
          <span className="flex items-center text-[#e0b874] animate-auth-float">
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.6" />
            </svg>
          </span>
          <span className="font-serif text-xl font-bold tracking-wide text-[#f5ead0]">
            TrekDirect<span className="text-[#e0b874]">Nepal</span>
          </span>
        </Link>
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-[#c0b090] hover:text-[#e8d5b0] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8 3L4 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to home
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-40 flex-1 flex items-center justify-center px-5 sm:px-8 py-8 sm:py-10">
        <div className="w-full max-w-[1100px] grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left: narrative / side panel */}
          <aside className="hidden lg:block text-[#f0e4c8] pr-2">
            {side || <DefaultSide />}
          </aside>

          {/* Right: form card */}
          <section className="w-full max-w-[480px] mx-auto lg:ml-auto">
            <div className="relative bg-[linear-gradient(160deg,rgba(20,24,40,0.75)_0%,rgba(10,14,28,0.85)_100%)] backdrop-blur-2xl border border-white/[0.08] rounded-[28px] p-8 sm:p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.07)]">
              {/* Gold edge glow */}
              <div className="absolute -inset-px rounded-[28px] bg-[linear-gradient(140deg,rgba(224,184,116,0.25)_0%,transparent_30%,transparent_70%,rgba(224,184,116,0.15)_100%)] pointer-events-none -z-10 blur-[1px]" />
              {children}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function DefaultSide() {
  return (
    <div className="max-w-md animate-auth-float">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#e0b874] font-medium mb-5">
        <span className="w-8 h-px bg-[#e0b874]" />
        Nepal · Himalaya
      </span>
      <h2 className="font-serif text-[2.6rem] leading-[1.1] font-bold text-[#f5ead0] mb-5">
        Where every step<br />
        <span className="italic text-[#e0b874]">meets the sky.</span>
      </h2>
      <p className="text-[15px] leading-relaxed text-[#c8d0c0]/85 font-light mb-8">
        Book verified guides, craft your own trek, and step into the quiet grandeur of the roof of the world.
      </p>
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
        <Stat value="1,200+" label="Verified guides" />
        <Stat value="80+" label="Trek routes" />
        <Stat value="4.9★" label="Avg. rating" />
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-serif text-2xl font-semibold text-[#e0b874] leading-none mb-1">{value}</div>
      <div className="text-[11.5px] text-[#8ba090] tracking-wide">{label}</div>
    </div>
  );
}
