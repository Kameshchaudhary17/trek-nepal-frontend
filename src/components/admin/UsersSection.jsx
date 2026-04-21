import SectionHeader from "./SectionHeader";

export default function UsersSection({ trekkers, loading, search, onSearch }) {
  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "—";

  return (
    <div>
      <SectionHeader title="Trekkers" sub="All registered trekker accounts" />

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-[7px] mb-5 max-w-xs">
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" className="text-stone-400 shrink-0">
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
          <path d="M11 11l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="bg-transparent text-[13px] text-stone-800 placeholder:text-stone-400 outline-none w-full"
        />
        {search && (
          <button onClick={() => onSearch("")} className="text-stone-400 hover:text-stone-600 text-sm leading-none">✕</button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-0 divide-y divide-stone-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-stone-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-40" />
                  <div className="h-3 bg-stone-100 rounded w-56" />
                </div>
                <div className="h-3 bg-stone-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : trekkers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-2xl mb-4">🥾</div>
            <p className="text-[14px] text-stone-500 font-medium">
              {search ? `No trekkers matching "${search}"` : "No trekkers registered yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr className="text-stone-500 text-[11px] uppercase tracking-wide">
                  <th className="text-left py-3 px-5 font-semibold">Trekker</th>
                  <th className="text-left py-3 px-5 font-semibold">Email</th>
                  <th className="text-left py-3 px-5 font-semibold">Phone</th>
                  <th className="text-left py-3 px-5 font-semibold">Joined</th>
                  <th className="text-left py-3 px-5 font-semibold">Verified</th>
                </tr>
              </thead>
              <tbody>
                {trekkers.map((u, i) => {
                  const initials = u.fullName
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={u._id}
                      className={`border-b border-stone-100 hover:bg-stone-50 transition-colors ${
                        i === trekkers.length - 1 ? "border-0" : ""
                      }`}
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-forest-100 border border-forest-200 flex items-center justify-center text-[12px] font-bold text-forest-700 shrink-0">
                            {initials}
                          </div>
                          <span className="text-stone-800 text-[13px] font-medium">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-stone-500 text-[13px]">{u.email}</td>
                      <td className="py-3.5 px-5 text-stone-500 text-[13px]">{u.phone || <span className="text-stone-300">—</span>}</td>
                      <td className="py-3.5 px-5 text-stone-500 text-[13px]">{fmt(u.createdAt)}</td>
                      <td className="py-3.5 px-5">
                        {u.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-forest-50 text-forest-700 border border-forest-200">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && trekkers.length > 0 && (
          <div className="px-5 py-3 border-t border-stone-100 bg-stone-50">
            <p className="text-[12px] text-stone-400">
              {trekkers.length} trekker{trekkers.length !== 1 ? "s" : ""}{search ? ` matching "${search}"` : " total"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
