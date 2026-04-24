import { useState } from "react";
import SectionHeader from "./SectionHeader";

export default function GuidesSection({ guides, loading, filter, setFilter, counts, onVerify, onReject, onRestore }) {
  const tabs = [
    { id: "pending",  label: "Pending",  count: counts.pending },
    { id: "verified", label: "Verified", count: counts.verified },
    { id: "rejected", label: "Rejected", count: counts.rejected },
  ];

  const tabActive = {
    pending:  "bg-amber-50 text-amber-700 border border-amber-200",
    verified: "bg-forest-50 text-forest-700 border border-forest-200",
    rejected: "bg-red-50 text-red-600 border border-red-200",
  };
  const badgeActive = {
    pending:  "bg-amber-100 text-amber-700",
    verified: "bg-forest-100 text-forest-700",
    rejected: "bg-red-100 text-red-600",
  };

  return (
    <div>
      <SectionHeader title="Guide Verification" sub="Review NTB credentials and manage guide listings" />

      <div className="flex gap-1 bg-stone-100 border border-stone-200 rounded-xl p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] transition-all font-medium ${
              filter === t.id ? tabActive[t.id] : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
            }`}
          >
            {t.label}
            <span className={`text-[11px] font-bold rounded-full px-1.5 py-0 ${
              filter === t.id ? badgeActive[t.id] : "bg-stone-200 text-stone-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-stone-100 border border-stone-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : guides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl mb-4">
            {filter === "pending" ? "🎉" : filter === "verified" ? "🏔️" : "📭"}
          </div>
          <p className="text-[14px] text-stone-500">
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
  const [rejecting, setRejecting] = useState(false);
  const [reasonText, setReasonText] = useState("");

  const name = guide.user?.fullName || "—";
  const email = guide.user?.email || "—";
  const phone = guide.user?.phone || "—";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
  const joinedAt = guide.createdAt
    ? new Date(guide.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden transition-all hover:border-stone-300 hover:shadow-sm">
      <div className="flex items-center gap-4 p-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center font-serif font-bold text-[0.9rem] text-white shrink-0"
          style={{
            background: `linear-gradient(135deg, ${guide.color || "#4a7aaa"}, ${guide.color || "#4a7aaa"}99)`,
            border: `1px solid ${guide.color || "#4a7aaa"}60`,
          }}
        >
          {guide.initials || initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-semibold text-stone-900">{name}</span>
            <StatusBadge status={guide.status} />
          </div>
          <p className="text-[12px] text-stone-500 truncate">
            {email} · {guide.region}{guide.specialty ? ` · ${guide.specialty}` : ""}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[12px] text-stone-400 shrink-0">
          <span>{guide.experience}y exp</span>
          <span>{joinedAt}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(!guide.status || guide.status === "pending") && (
            <>
              <button onClick={() => onVerify(guide._id)} className="px-3 py-1.5 rounded-lg bg-forest-50 border border-forest-200 text-forest-700 text-[12px] font-medium hover:bg-forest-100 transition-all">
                Approve
              </button>
              <button onClick={() => { setRejecting(true); setReasonText(""); }} className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium hover:bg-red-100 transition-all">
                Reject
              </button>
            </>
          )}
          {guide.status === "verified" && (
            <button onClick={() => { setRejecting(true); setReasonText(""); }} className="px-3 py-1.5 rounded-lg bg-stone-100 border border-stone-200 text-stone-500 text-[12px] hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all">
              Revoke
            </button>
          )}
          {guide.status === "rejected" && (
            <button onClick={() => onRestore(guide._id)} className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[12px] hover:bg-amber-100 transition-all">
              Restore
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-stone-100 px-4 py-3 grid sm:grid-cols-3 gap-3 text-[12.5px] bg-stone-50">
          <Detail label="Phone" value={phone} />
          <Detail label="Experience" value={`${guide.experience} years`} />
          <Detail label="Joined" value={joinedAt} />
          <Detail label="Specialty" value={guide.specialty || "—"} />
          <Detail label="Region" value={guide.region} />
          <Detail label="Status" value={(guide.status || "pending").charAt(0).toUpperCase() + (guide.status || "pending").slice(1)} />
          {guide.status === "rejected" && guide.rejectionReason && (
            <div className="sm:col-span-3">
              <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">Rejection reason</p>
              <p className="text-[12.5px] text-stone-700 whitespace-pre-wrap">{guide.rejectionReason}</p>
            </div>
          )}
        </div>
      )}

      {rejecting && (
        <div className="fixed inset-0 z-[120] bg-black/40 flex items-center justify-center p-4" onClick={() => setRejecting(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-[1.05rem] font-semibold text-stone-900 mb-1">Reject {name}?</h3>
            <p className="text-[12.5px] text-stone-500 mb-4">This note is emailed to the guide. They can address it and re-apply.</p>
            <textarea
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="e.g. License number could not be verified against NTB records. Please re-upload a clearer photo."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-[13px] text-stone-800 outline-none focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100 resize-none"
            />
            <div className="flex justify-between items-center mt-1 mb-4">
              <span className="text-[11px] text-stone-400">{reasonText.length}/1000</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRejecting(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-[13px] font-medium hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                disabled={!reasonText.trim()}
                onClick={() => { onReject(guide._id, reasonText.trim()); setRejecting(false); }}
                className="flex-[2] px-4 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Reject &amp; notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = status || "pending";
  const map = {
    pending:  "bg-amber-50 border-amber-200 text-amber-700",
    verified: "bg-forest-50 border-forest-200 text-forest-700",
    rejected: "bg-red-50 border-red-200 text-red-600",
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[s]}`}>
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-stone-400 mb-0.5">{label}</p>
      <p className="text-[12.5px] text-stone-700">{value}</p>
    </div>
  );
}
