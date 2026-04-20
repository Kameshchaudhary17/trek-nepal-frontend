import { useState } from "react";
import SectionHeader from "./SectionHeader";

export default function GuidesSection({ guides, loading, filter, setFilter, counts, onVerify, onReject, onRestore }) {
  const tabs = [
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "verified", label: "Verified", count: counts.verified },
    { id: "rejected", label: "Rejected", count: counts.rejected },
  ];

  return (
    <div>
      <SectionHeader title="Guide Verification" sub="Review NTB credentials and manage guide listings" />

      {/* Status tabs */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.08] rounded-xl p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all ${
              filter === t.id
                ? t.id === "pending"
                  ? "bg-[#e0b874]/15 text-[#e0b874] border border-[#e0b874]/25"
                  : t.id === "verified"
                  ? "bg-[#4a9a6a]/15 text-[#88cc99] border border-[#4a9a6a]/25"
                  : "bg-[#c8503c]/10 text-[#f08070] border border-[#c8503c]/20"
                : "text-[#7a9080] hover:text-[#c0d0c0]"
            }`}
          >
            {t.label}
            <span className={`text-[11px] font-bold rounded-full px-1.5 py-0 ${
              filter === t.id
                ? t.id === "pending" ? "bg-[#e0b874]/20 text-[#e0b874]"
                : t.id === "verified" ? "bg-[#4a9a6a]/20 text-[#88cc99]"
                : "bg-[#c8503c]/15 text-[#f08070]"
                : "bg-white/[0.06] text-[#5a7868]"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Guide list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-white/[0.03] border border-white/[0.06] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center text-2xl mb-4">
            {filter === "pending" ? "🎉" : filter === "verified" ? "🏔️" : "📭"}
          </div>
          <p className="text-[14px] text-[#5a7868]">
            {filter === "pending" ? "No guides awaiting verification" : filter === "verified" ? "No verified guides yet" : "No rejected guides"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {guides.map((g) => (
            <GuideRow key={g._id} guide={g} onVerify={onVerify} onReject={onReject} onRestore={onRestore} />
          ))}
        </div>
      )}
    </div>
  );
}

function GuideRow({ guide, onVerify, onReject, onRestore }) {
  const [expanded, setExpanded] = useState(false);

  const name = guide.user?.fullName || "—";
  const email = guide.user?.email || "—";
  const phone = guide.user?.phone || "—";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const joinedAt = guide.createdAt
    ? new Date(guide.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div className="bg-[linear-gradient(160deg,rgba(20,24,40,0.7),rgba(10,14,28,0.85))] border border-white/[0.08] rounded-2xl overflow-hidden transition-all hover:border-white/[0.14]">
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center font-serif font-bold text-[0.9rem] text-white shrink-0"
          style={{
            background: `linear-gradient(135deg, ${guide.color || "#4a7aaa"}60, ${guide.color || "#4a7aaa"}30)`,
            border: `1px solid ${guide.color || "#4a7aaa"}40`,
          }}
        >
          {guide.initials || initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-medium text-[#f0e4c8]">{name}</span>
            <StatusBadge status={guide.status} />
          </div>
          <p className="text-[12px] text-[#5a7868] truncate">
            {email} · {guide.region}{guide.specialty ? ` · ${guide.specialty}` : ""}
          </p>
        </div>

        {/* Meta */}
        <div className="hidden sm:flex items-center gap-4 text-[12px] text-[#5a7868] shrink-0">
          <span>{guide.experience}y exp</span>
          <span>{joinedAt}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {(!guide.status || guide.status === "pending") && (
            <>
              <button
                onClick={() => onVerify(guide._id)}
                className="px-3 py-1.5 rounded-lg bg-[#4a9a6a]/15 border border-[#4a9a6a]/30 text-[#88cc99] text-[12px] font-medium hover:bg-[#4a9a6a]/25 transition-all"
              >
                Approve
              </button>
              <button
                onClick={() => onReject(guide._id)}
                className="px-3 py-1.5 rounded-lg bg-[#c8503c]/10 border border-[#c8503c]/25 text-[#f08070] text-[12px] font-medium hover:bg-[#c8503c]/20 transition-all"
              >
                Reject
              </button>
            </>
          )}
          {guide.status === "verified" && (
            <button
              onClick={() => onReject(guide._id)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#7a9080] text-[12px] hover:border-[#c8503c]/30 hover:text-[#f08070] transition-all"
            >
              Revoke
            </button>
          )}
          {guide.status === "rejected" && (
            <button
              onClick={() => onRestore(guide._id)}
              className="px-3 py-1.5 rounded-lg bg-[#e0b874]/10 border border-[#e0b874]/25 text-[#e0b874] text-[12px] hover:bg-[#e0b874]/18 transition-all"
            >
              Restore
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#5a7868] hover:text-[#b0c0b0] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-4 py-3 grid sm:grid-cols-3 gap-3 text-[12.5px]">
          <Detail label="Phone" value={phone} />
          <Detail label="Experience" value={`${guide.experience} years`} />
          <Detail label="Joined" value={joinedAt} />
          <Detail label="Specialty" value={guide.specialty || "—"} />
          <Detail label="Region" value={guide.region} />
          <Detail
            label="Status"
            value={(guide.status || "pending").charAt(0).toUpperCase() + (guide.status || "pending").slice(1)}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status || "pending";
  const map = {
    pending: "bg-[#e0b874]/12 border-[#e0b874]/25 text-[#e0b874]",
    verified: "bg-[#4a9a6a]/12 border-[#4a9a6a]/25 text-[#88cc99]",
    rejected: "bg-[#c8503c]/10 border-[#c8503c]/20 text-[#f08070]",
  };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${map[s]}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-[#3a5848] mb-0.5">{label}</p>
      <p className="text-[12.5px] text-[#9ab0a0]">{value}</p>
    </div>
  );
}
