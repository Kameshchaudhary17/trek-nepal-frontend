import { useCallback, useEffect, useState } from "react";
import { adminService } from "../../services/api";
import { formatNPR } from "../../utils/money";
import SectionHeader from "./SectionHeader";

const STATUS_FILTERS = ["all", "pending", "confirmed", "rejected", "cancelled", "completed"];
const PAYMENT_FILTERS = ["all", "unpaid", "processing", "paid", "failed", "refunded"];

const STATUS_STYLE = {
  pending:   "bg-amber-50 border-amber-200 text-amber-700",
  confirmed: "bg-forest-50 border-forest-200 text-forest-700",
  rejected:  "bg-red-50 border-red-200 text-red-600",
  cancelled: "bg-stone-100 border-stone-200 text-stone-500",
  completed: "bg-blue-50 border-blue-200 text-blue-700",
};
const PAY_STYLE = {
  unpaid:     "bg-stone-100 border-stone-200 text-stone-500",
  processing: "bg-amber-50 border-amber-200 text-amber-700",
  paid:       "bg-forest-50 border-forest-200 text-forest-700",
  failed:     "bg-red-50 border-red-200 text-red-600",
  refunded:   "bg-violet-50 border-violet-200 text-violet-700",
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function BookingsSection() {
  const [bookings, setBookings]   = useState([]);
  const [counts, setCounts]       = useState({});
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const [status, setStatus]       = useState("all");
  const [payment, setPayment]     = useState("all");
  const [search, setSearch]       = useState("");

  const load = useCallback((opts = {}) => {
    setLoading(true);
    setError("");
    adminService.listBookings({
      status: opts.status ?? (status === "all" ? undefined : status),
      paymentStatus: opts.payment ?? (payment === "all" ? undefined : payment),
      search: opts.search ?? (search || undefined),
      page: opts.page ?? page,
      limit: 25,
    })
      .then((res) => {
        setBookings(res.bookings || []);
        setCounts(res.counts || {});
        setTotal(res.total || 0);
      })
      .catch((err) => setError(err?.response?.data?.message || "Failed to load bookings."))
      .finally(() => setLoading(false));
  }, [status, payment, search, page]);

  // `load` is memoized with useCallback; listing `load` in deps would
  // loop because load's own identity changes whenever its inputs change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [status, payment, page]);

  function onSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    load({ page: 1, search });
  }

  const pages = Math.max(1, Math.ceil(total / 25));

  return (
    <div>
      <SectionHeader title="Bookings" sub="Every booking on the platform" />

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {STATUS_FILTERS.map((s) => {
          const isActive = status === s;
          const count = s === "all" ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[s] || 0;
          return (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all ${
                isActive ? "bg-forest-500 text-white border-forest-500" : "bg-white text-stone-600 border-stone-200 hover:border-forest-300"
              }`}
            >
              <span className="capitalize">{s}</span>
              <span className={`text-[10.5px] px-1.5 rounded-full ${isActive ? "bg-white/20" : "bg-stone-100"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Payment + search */}
      <div className="flex flex-wrap gap-2 items-center mb-5">
        <select
          value={payment}
          onChange={(e) => { setPayment(e.target.value); setPage(1); }}
          className="bg-white border border-stone-200 rounded-xl px-3 py-[7px] text-[12.5px] text-stone-700 outline-none cursor-pointer hover:border-stone-300"
        >
          {PAYMENT_FILTERS.map((p) => (
            <option key={p} value={p}>Payment: {p}</option>
          ))}
        </select>

        <form onSubmit={onSearchSubmit} className="flex-1 min-w-[200px] max-w-[320px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by route, trekker or guide…"
            maxLength={80}
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-[7px] text-[12.5px] text-stone-800 outline-none focus:border-forest-400 focus:ring-2 focus:ring-forest-100"
          />
        </form>

        <span className="ml-auto text-[12px] text-stone-400">
          Showing <span className="text-stone-700 font-medium">{bookings.length}</span> of{" "}
          <span className="text-stone-700 font-medium">{total}</span>
        </span>
      </div>

      {error && <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5 mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-[64px] bg-white border border-stone-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center text-[14px] text-stone-500">
          No bookings match these filters.
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr className="text-left text-[11px] uppercase tracking-[0.12em] text-stone-500 font-semibold">
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Trekker</th>
                <th className="px-4 py-3">Guide</th>
                <th className="px-4 py-3">Start</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-stone-800 truncate max-w-[220px]">{b.route}</div>
                    <div className="text-[10.5px] text-stone-400">{new Date(b.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{b.trekker?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-stone-700">{b.guide?.user?.fullName || "—"}</td>
                  <td className="px-4 py-3 text-stone-600 whitespace-nowrap">{fmtDate(b.startDate)}</td>
                  <td className="px-4 py-3 text-stone-600 tabular-nums">{b.days}</td>
                  <td className="px-4 py-3 tabular-nums font-medium text-stone-800 whitespace-nowrap">{formatNPR(b.totalCost)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-medium capitalize ${STATUS_STYLE[b.status] || STATUS_STYLE.pending}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[11px] font-medium capitalize ${PAY_STYLE[b.paymentStatus] || PAY_STYLE.unpaid}`}>
                      {b.paymentStatus || "unpaid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && pages > 1 && (
        <div className="mt-5 flex items-center justify-between text-[12.5px] text-stone-500">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span>Page {page} of {pages}</span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page >= pages}
            className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
