import { Link } from "react-router-dom";

function Stars({ n = 5 }) {
  return (
    <span className="inline-flex gap-[2px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill={i < Math.round(n) ? "#D97706" : "none"}>
          <path d="M6 1l1.39 2.81L10.5 4.27l-2.25 2.19.53 3.1L6 8l-2.78 1.46.53-3.1L1.5 4.27l3.11-.46L6 1z" stroke="#D97706" strokeWidth="0.8" />
        </svg>
      ))}
    </span>
  );
}

export default function GuideCard({ guide }) {
  return (
    <div className="group flex flex-col bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 hover:shadow-md transition-all hover:-translate-y-0.5">
      {/* Avatar + name */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center font-serif font-bold text-[1.1rem] text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${guide.color}CC, ${guide.color}99)` }}
        >
          {guide.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <h3 className="font-serif text-[1rem] font-semibold text-stone-900">{guide.name}</h3>
            {guide.verified && (
              <span title="NTB Verified">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5L3 4v5c0 3.314 2.24 5.397 5 6 2.76-.603 5-2.686 5-6V4L8 1.5z" fill="#2D6A4F" stroke="#2D6A4F" strokeWidth="0.5" />
                  <path d="M5.5 8l1.75 1.75 3.25-3.25" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
          </div>
          <div className="text-[12px] text-stone-400 mb-1.5">
            {guide.specialty} · {guide.experience} yrs exp
          </div>
          <div className="flex items-center gap-1.5">
            <Stars n={guide.rating} />
            <span className="text-[12px] text-amber-600 font-medium">{guide.rating}</span>
            <span className="text-[11px] text-stone-400">({guide.reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl bg-stone-50 border border-stone-100 text-center">
        <div>
          <div className="text-[11px] text-stone-400 mb-0.5">Treks</div>
          <div className="text-stone-800 font-semibold text-[14px]">{guide.treks}+</div>
        </div>
        <div>
          <div className="text-[11px] text-stone-400 mb-0.5">Rate/day</div>
          <div className="text-terra-500 font-semibold text-[14px]">${guide.ratePerDay}</div>
        </div>
        <div>
          <div className="text-[11px] text-stone-400 mb-0.5">Languages</div>
          <div className="text-[11px] text-stone-700 leading-tight">
            {guide.languages?.slice(0, 2).join(", ")}
            {guide.languages?.length > 2 ? ` +${guide.languages.length - 2}` : ""}
          </div>
        </div>
      </div>

      {/* Route tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {guide.routes?.slice(0, 3).map((r) => (
          <span key={r} className="text-[11px] px-2 py-[2px] rounded-full bg-forest-50 text-forest-600 border border-forest-100">
            {r}
          </span>
        ))}
        {guide.routes?.length > 3 && (
          <span className="text-[11px] px-2 py-[2px] rounded-full bg-stone-100 text-stone-500 border border-stone-200">
            +{guide.routes.length - 3} more
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex gap-2">
        <Link
          to={`/guides/${guide.id}`}
          className="flex-1 text-center py-[9px] rounded-xl bg-stone-50 border border-stone-200 text-[13px] text-stone-700 hover:bg-forest-50 hover:text-forest-600 hover:border-forest-200 transition-all font-medium"
        >
          View profile
        </Link>
        <button className="flex-1 py-[9px] rounded-xl bg-forest-500 text-white text-[13px] font-semibold transition-all hover:bg-forest-600 hover:shadow-md">
          Book now
        </button>
      </div>
    </div>
  );
}
