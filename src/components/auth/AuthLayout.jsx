import { Link } from "react-router-dom";

function MountainBackdrop() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #B8D4E8 0%, #C8DDD0 18%, #D8E8D4 38%, #E4DCC8 56%, #EEE4D4 75%, #F6F4EF 100%)" }} />
      <div className="absolute top-[10%] left-[8%] w-[380px] h-[180px] rounded-full bg-white/25 blur-3xl" />
      <div className="absolute top-[6%] right-[12%] w-[280px] h-[140px] rounded-full bg-white/20 blur-3xl" />
      <svg className="absolute bottom-0 left-0 w-full h-[45%]" viewBox="0 0 1440 500" preserveAspectRatio="none">
        <path fill="#9DC4B8" fillOpacity="0.35" d="M0,500 L0,320 L80,260 L160,310 L260,190 L360,280 L460,200 L560,290 L680,160 L800,270 L920,190 L1040,280 L1160,180 L1280,270 L1440,210 L1440,500 Z" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full h-[35%]" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path fill="#3D7A5E" fillOpacity="0.3" d="M0,400 L0,280 L100,200 L200,270 L310,160 L430,250 L550,170 L680,260 L800,170 L930,255 L1060,175 L1180,258 L1310,175 L1440,255 L1440,400 Z" />
        <path fill="#f3e7d0" fillOpacity="0.5" d="M308,164 L315,177 L323,165 L332,181 L341,170 L316,180 Z M798,174 L806,188 L815,177 L825,193 L834,183 L808,192 Z" />
      </svg>
      <svg className="absolute bottom-0 left-0 w-full h-[22%]" viewBox="0 0 1440 300" preserveAspectRatio="none">
        <path fill="#1E4D38" fillOpacity="0.85" d="M0,300 L0,220 L80,150 L170,210 L270,120 L380,195 L490,130 L610,205 L730,140 L850,210 L970,145 L1090,208 L1210,138 L1330,205 L1440,150 L1440,300 Z" />
      </svg>
      <div className="absolute bottom-0 left-0 w-full h-[7%] bg-[#163A2C]" />
    </div>
  );
}

function PrayerFlags() {
  const flags = ["#3a7bd5", "#f0d062", "#f08070", "#7aab50", "#e0e0e0"];
  return (
    <svg className="absolute top-0 right-0 w-[280px] max-lg:w-[200px] max-sm:w-[150px] opacity-75 pointer-events-none" viewBox="0 0 340 110" aria-hidden="true">
      <path d="M0,10 Q170,80 340,20" stroke="#9DC4B8" strokeWidth="1.2" fill="none" />
      {flags.map((c, i) => {
        const t = (i + 1) / 7;
        const x = t * 340;
        const y = 10 + Math.sin(t * Math.PI) * 54;
        return (
          <g key={i} transform={`translate(${x - 12},${y})`}>
            <rect width="22" height="26" fill={c} opacity="0.8" />
            <rect width="22" height="2" fill={c} opacity="0.4" y="26" />
          </g>
        );
      })}
    </svg>
  );
}

export default function AuthLayout({ children, side }) {
  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">
      <MountainBackdrop />
      <PrayerFlags />

      <header className="relative z-40 flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-7">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="text-forest-600">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.55" />
            </svg>
          </span>
          <span className="font-serif text-xl font-bold tracking-wide text-stone-900">
            TrekDirect<span className="text-forest-600">Nepal</span>
          </span>
        </Link>
        <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-[13px] text-stone-600 hover:text-stone-900 transition-colors font-medium bg-white/60 px-3 py-1.5 rounded-lg border border-stone-200/70">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8 3L4 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to home
        </Link>
      </header>

      <main className="relative z-40 flex-1 flex items-center justify-center px-5 sm:px-8 py-8 sm:py-10">
        <div className="w-full max-w-[1100px] grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center">
          <aside className="hidden lg:block pr-4">
            {side || <DefaultSide />}
          </aside>
          <section className="w-full max-w-[480px] mx-auto lg:ml-auto">
            <div className="bg-white/90 backdrop-blur-sm border border-stone-200/70 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-stone-900/10">
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
    <div className="max-w-md">
      <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-600 font-semibold mb-5">
        <span className="w-8 h-px bg-forest-500" />
        Nepal · Himalaya
      </span>
      <h2 className="font-serif text-[2.6rem] leading-[1.1] font-bold text-stone-900 mb-5">
        Where every step<br />
        <span className="italic text-forest-600">meets the sky.</span>
      </h2>
      <p className="text-[15px] leading-relaxed text-stone-600 mb-8">
        Book verified guides, craft your own trek, and step into the quiet grandeur of the roof of the world.
      </p>
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-300/50">
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
      <div className="font-serif text-2xl font-semibold text-forest-600 leading-none mb-1">{value}</div>
      <div className="text-[11.5px] text-stone-500 tracking-wide">{label}</div>
    </div>
  );
}
