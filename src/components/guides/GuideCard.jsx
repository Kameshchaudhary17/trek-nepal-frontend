import { useState } from "react";
import { Link } from "react-router-dom";

export default function GuideCard({ guide }) {
  const [imgErr, setImgErr] = useState(false);
  const photo = guide.user?.profilePhoto;

  return (
    <div className="group flex flex-col bg-white border border-stone-100 rounded-xl p-6 hover:border-stone-300 transition-colors">
      {/* Avatar + name */}
      <div className="flex items-start gap-4 mb-5">
        {photo && !imgErr ? (
          <img
            src={photo}
            alt={guide.name}
            referrerPolicy="no-referrer"
            onError={() => setImgErr(true)}
            className="w-12 h-12 rounded-full object-cover border border-stone-100 shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-medium text-[14px] text-white shrink-0"
            style={{ background: guide.color || "#2D6A4F" }}
          >
            {guide.initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-[15px] font-medium text-stone-900">{guide.name}</h3>
            {guide.verified && (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" title="NTB Verified">
                <path d="M8 1.5L3 4v5c0 3.314 2.24 5.397 5 6 2.76-.603 5-2.686 5-6V4L8 1.5z" fill="#2D6A4F" />
                <path d="M5.5 8l1.75 1.75 3.25-3.25" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div className="text-[12.5px] text-stone-500">
            {guide.specialty} · {guide.experience} yrs
          </div>
          <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-stone-500">
            <span className="text-stone-900 font-medium tabular-nums">{guide.rating}</span>
            <span className="text-stone-300">·</span>
            <span>{guide.reviews} reviews</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 py-4 border-y border-stone-100 mb-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">Treks</div>
          <div className="text-[13.5px] font-medium text-stone-900 tabular-nums">{guide.treks}+</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">Rate / day</div>
          <div className="text-[13.5px] font-medium text-stone-900 tabular-nums">${guide.ratePerDay}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-stone-400 mb-0.5">Languages</div>
          <div className="text-[12px] text-stone-700 leading-tight">
            {guide.languages?.slice(0, 2).join(", ")}
            {guide.languages?.length > 2 ? ` +${guide.languages.length - 2}` : ""}
          </div>
        </div>
      </div>

      {/* Routes */}
      {guide.routes?.length > 0 && (
        <div className="text-[12px] text-stone-500 mb-5">
          <span className="text-stone-400">Routes </span>
          {guide.routes.slice(0, 3).join(" · ")}
          {guide.routes.length > 3 && ` +${guide.routes.length - 3}`}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-4">
        <Link
          to={`/guides/${guide.id}`}
          className="text-[13px] text-stone-600 hover:text-stone-900 font-medium transition-colors"
        >
          View profile
        </Link>
        <button className="inline-flex items-center gap-1.5 text-[13px] font-medium text-forest-600 hover:text-forest-700 transition-colors group/cta">
          Book now
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="transition-transform group-hover/cta:translate-x-0.5">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
