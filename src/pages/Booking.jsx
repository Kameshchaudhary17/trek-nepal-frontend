import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import PaymentModal from "../components/payments/PaymentModal";
import ReviewModal from "../components/reviews/ReviewModal";
import ChatModal from "../components/messages/ChatModal";
import { bookingService, reviewService } from "../services/api";
import { formatNPR } from "../utils/money";

const STATUS_TABS = ["All", "Pending", "Confirmed", "Rejected", "Cancelled"];

const STATUS_BADGE = {
  pending:   { cls: "bg-amber-50 border border-amber-200 text-amber-700",   label: "Awaiting guide" },
  confirmed: { cls: "bg-forest-50 border border-forest-200 text-forest-700", label: "Guide confirmed" },
  rejected:  { cls: "bg-red-50 border border-red-200 text-red-600",         label: "Guide declined" },
  cancelled: { cls: "bg-stone-100 border border-stone-200 text-stone-500",  label: "Cancelled" },
  completed: { cls: "bg-blue-50 border border-blue-200 text-blue-700",      label: "Completed" },
};

const PAY_BADGE = {
  unpaid:     { cls: "bg-amber-50 border border-amber-200 text-amber-700",   label: "Unpaid" },
  processing: { cls: "bg-sky-50 border border-sky-200 text-sky-700",         label: "Processing" },
  paid:       { cls: "bg-forest-50 border border-forest-200 text-forest-700", label: "Paid" },
  failed:     { cls: "bg-red-50 border border-red-200 text-red-600",         label: "Payment failed" },
  refunded:   { cls: "bg-violet-50 border border-violet-200 text-violet-700", label: "Refunded" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function GuideAvatar({ guide }) {
  const photo = guide?.user?.profilePhoto;
  if (photo) {
    return (
      <img
        src={photo}
        alt={guide?.user?.fullName || "Guide"}
        className="w-12 h-12 rounded-xl object-cover shrink-0"
      />
    );
  }
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-[0.9rem] text-white shrink-0"
      style={{ background: `linear-gradient(135deg, ${guide?.color || "#4a7aaa"}CC, ${guide?.color || "#4a7aaa"}99)` }}
    >
      {guide?.initials || "G"}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-stone-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-stone-200 rounded w-1/3" />
          <div className="h-3 bg-stone-100 rounded w-1/4" />
          <div className="h-3 bg-stone-100 rounded w-2/3" />
        </div>
        <div className="h-6 w-20 bg-stone-200 rounded-full" />
      </div>
    </div>
  );
}

export default function Booking() {
  const navigate = useNavigate();
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("All");
  const [cancelling, setCancelling] = useState(null);
  const [payingFor,    setPayingFor]   = useState(null);
  const [reviewingFor, setReviewingFor] = useState(null);   // { booking, existing? }
  const [chattingWith, setChattingWith] = useState(null);
  // bookingId → review object. Absence means "not reviewed yet".
  const [reviewsByBooking, setReviewsByBooking] = useState({});
  const [deletingReview, setDeletingReview]     = useState(null);

  /* ── Auth guard ── */
  useEffect(() => {
    const token  = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "guide") { navigate("/guide/dashboard"); return; }

    async function loadAll() {
      try {
        const res = await bookingService.getMyBookings();
        const list = res.bookings || [];
        setBookings(list);
        const completed = list.filter((b) => b.status === "completed");
        const results = await Promise.all(
          completed.map((b) =>
            reviewService.forBooking(b._id)
              .then((r) => (r.review ? [b._id, r.review] : null))
              .catch(() => null)
          )
        );
        setReviewsByBooking(Object.fromEntries(results.filter(Boolean)));
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [navigate]);

  function refreshBookings() {
    bookingService.getMyBookings()
      .then((res) => setBookings(res.bookings || []))
      .catch(() => {});
  }

  function isReviewEditable(review) {
    if (!review) return false;
    // Date.now() is intentionally called during render — the exact staleness
    // of the 48 h window doesn't need to be perfectly stable frame-to-frame.
    // eslint-disable-next-line react-hooks/purity
    return Date.now() - new Date(review.createdAt).getTime() < 48 * 60 * 60 * 1000;
  }

  async function handleDeleteReview(bookingId) {
    if (!window.confirm("Delete your review? This cannot be undone.")) return;
    setDeletingReview(bookingId);
    try {
      await reviewService.remove(bookingId);
      setReviewsByBooking((prev) => {
        const next = { ...prev };
        delete next[bookingId];
        return next;
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Couldn't delete review.");
    } finally {
      setDeletingReview(null);
    }
  }

  async function handleCancel(bookingId) {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(bookingId);
    try {
      const res = await bookingService.updateStatus(bookingId, "cancelled");
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? res.booking : b))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelling(null);
    }
  }

  const filtered =
    activeTab === "All"
      ? bookings
      : bookings.filter((b) => b.status === activeTab.toLowerCase());

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* Page header */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
            <span className="w-5 h-px bg-forest-300" /> Bookings
          </span>
          <h1 className="font-serif text-[2rem] font-bold text-stone-900">My Bookings</h1>
          <p className="text-[14px] text-stone-400 mt-1">
            Track all your guide booking requests in one place.
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "All"
                ? bookings.length
                : bookings.filter((b) => b.status === tab.toLowerCase()).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all border ${
                  isActive
                    ? "bg-forest-500 text-white border-forest-500 shadow-sm"
                    : "bg-white text-stone-600 border-stone-200 hover:border-forest-300 hover:text-forest-600"
                }`}
              >
                {tab}
                {tab === "All" && bookings.length > 0 && (
                  <span className={`text-[11px] px-1.5 py-px rounded-full font-semibold ${isActive ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="17" rx="2" stroke="#a8a29e" strokeWidth="1.5" />
                <path d="M8 2v4M16 2v4M3 10h18" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <h3 className="font-serif text-[1.1rem] font-semibold text-stone-800 mb-2">
              {activeTab === "All" ? "No bookings yet" : `No ${activeTab.toLowerCase()} bookings`}
            </h3>
            <p className="text-[13.5px] text-stone-400 max-w-[280px] leading-relaxed mb-6">
              {activeTab === "All"
                ? "Your trek bookings will appear here once you send a request to a guide."
                : `You have no bookings with ${activeTab.toLowerCase()} status.`}
            </p>
            {activeTab === "All" && (
              <Link
                to="/guides"
                className="px-6 py-2.5 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all"
              >
                Find a guide
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((booking) => {
              const guide     = booking.guide;
              const guideName = guide?.user?.fullName || "Guide";
              const guideId   = guide?._id;

              return (
                <div
                  key={booking._id}
                  className="bg-white border border-stone-200 rounded-2xl p-5 hover:border-stone-300 transition-colors"
                >
                  {/* Confirmed banner */}
                  {booking.status === "confirmed" && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-forest-50 border border-forest-200">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8.5l3.5 3.5 6.5-7" stroke="#2D6A4F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[12.5px] font-medium text-forest-700">
                        Your booking is confirmed! Check in with your guide before the start date.
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Guide avatar */}
                    <GuideAvatar guide={guide} />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          {guideId ? (
                            <Link
                              to={`/guides/${guideId}`}
                              className="text-[14.5px] font-semibold text-stone-900 hover:text-forest-600 transition-colors"
                            >
                              {guideName}
                            </Link>
                          ) : (
                            <span className="text-[14.5px] font-semibold text-stone-900">{guideName}</span>
                          )}
                          <div className="text-[12px] text-stone-400">{guide?.specialty || guide?.region || "—"}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <StatusBadge status={booking.status} />
                          {/* Payment pill — only relevant once the guide has confirmed.
                              Before that, there's nothing to pay so the label would be noise. */}
                          {["confirmed", "completed"].includes(booking.status) && (() => {
                            const p = PAY_BADGE[booking.paymentStatus] || PAY_BADGE.unpaid;
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${p.cls}`}>
                                {p.label}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Route + dates */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2.5">
                        <div>
                          <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold">Route</span>
                          <p className="text-[13px] text-stone-700 font-medium truncate">{booking.route || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold">Start date</span>
                          <p className="text-[13px] text-stone-700 font-medium">{formatDate(booking.startDate)}</p>
                        </div>
                        <div>
                          <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold">Duration</span>
                          <p className="text-[13px] text-stone-700 font-medium">{booking.days} day{booking.days !== 1 ? "s" : ""}</p>
                        </div>
                        {booking.totalCost > 0 && (
                          <div>
                            <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold">Est. cost</span>
                            <p className="text-[13px] font-bold text-terra-500">{formatNPR(booking.totalCost)}</p>
                          </div>
                        )}
                      </div>

                      {/* Cost breakdown — collapsible. Only renders if the
                          backend actually stored a breakdown (older bookings
                          might not have one). */}
                      {booking.costBreakdown && booking.costBreakdown.subtotal > 0 && (
                        <details className="mt-3 group">
                          <summary className="cursor-pointer text-[11.5px] text-stone-500 hover:text-stone-700 transition-colors list-none flex items-center gap-1.5 select-none">
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="transition-transform group-open:rotate-90 shrink-0">
                              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Cost breakdown
                          </summary>
                          <div className="mt-2 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[12px] space-y-1 tabular-nums">
                            <div className="flex justify-between">
                              <span className="text-stone-500">
                                {formatNPR(booking.ratePerDay)} × {booking.days} day{booking.days !== 1 ? "s" : ""}
                              </span>
                              <span className="text-stone-700">{formatNPR(booking.costBreakdown.base)}</span>
                            </div>
                            {booking.costBreakdown.seasonMultiplier !== 1 && (
                              <div className="flex justify-between">
                                <span className="text-stone-500 capitalize">
                                  {booking.costBreakdown.seasonId} season (×{booking.costBreakdown.seasonMultiplier})
                                </span>
                                <span className="text-stone-700">{formatNPR(booking.costBreakdown.subtotal)}</span>
                              </div>
                            )}
                            {booking.costBreakdown.platformFee > 0 && (
                              <div className="flex justify-between">
                                <span className="text-stone-500">Platform fee ({booking.costBreakdown.platformFeePct}%)</span>
                                <span className="text-stone-700">{formatNPR(booking.costBreakdown.platformFee)}</span>
                              </div>
                            )}
                            <div className="flex justify-between pt-1.5 mt-1.5 border-t border-stone-200">
                              <span className="font-semibold text-stone-700">Total</span>
                              <span className="font-bold text-terra-500">{formatNPR(booking.totalCost)}</span>
                            </div>
                          </div>
                        </details>
                      )}

                      {/* Guide note */}
                      {booking.guideNote && (
                        <div className="mt-3 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200">
                          <span className="text-[11px] uppercase tracking-[0.08em] text-stone-400 font-semibold block mb-0.5">Guide note</span>
                          <p className="text-[12.5px] text-stone-600 leading-relaxed">{booking.guideNote}</p>
                        </div>
                      )}

                      {/* Actions */}
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => setChattingWith(booking)}
                            className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            Message guide
                          </button>
                          {booking.status === "confirmed" && booking.paymentStatus !== "paid" && (
                            <button
                              onClick={() => setPayingFor(booking)}
                              className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold bg-forest-500 text-white hover:bg-forest-600 transition-colors"
                            >
                              Pay {formatNPR(booking.totalCost)}
                            </button>
                          )}
                          {booking.status === "confirmed" && booking.paymentStatus === "paid" && (
                            <span className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-forest-50 border border-forest-200 text-forest-700">
                              Paid
                            </span>
                          )}
                          <button
                            disabled={cancelling === booking._id}
                            onClick={() => handleCancel(booking._id)}
                            className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancelling === booking._id ? "Cancelling…" : "Cancel"}
                          </button>
                        </div>
                      )}
                      {booking.status === "completed" && !reviewsByBooking[booking._id] && (
                        <div className="mt-3">
                          <button
                            onClick={() => setReviewingFor({ booking })}
                            className="px-4 py-1.5 rounded-xl text-[12.5px] font-semibold hover:opacity-90 transition-opacity"
                            style={{ background: "#e0b874", color: "#1f2937" }}
                          >
                            Leave a review
                          </button>
                        </div>
                      )}
                      {booking.status === "completed" && reviewsByBooking[booking._id] && (() => {
                        const rv = reviewsByBooking[booking._id];
                        const editable = isReviewEditable(rv);
                        return (
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-stone-100 border border-stone-200 text-stone-600">
                              <span style={{ color: "#e0b874" }}>{"★".repeat(rv.rating)}</span>
                              <span className="text-stone-400">{"★".repeat(5 - rv.rating)}</span>
                              <span className="ml-1">Your review</span>
                            </span>
                            {editable ? (
                              <>
                                <button
                                  onClick={() => setReviewingFor({ booking, existing: rv })}
                                  className="px-3 py-1.5 rounded-xl text-[12px] font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  disabled={deletingReview === booking._id}
                                  onClick={() => handleDeleteReview(booking._id)}
                                  className="px-3 py-1.5 rounded-xl text-[12px] font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deletingReview === booking._id ? "Deleting…" : "Delete"}
                                </button>
                                <span className="text-[11px] text-stone-400">Edit window: 48 h from submission</span>
                              </>
                            ) : (
                              <span className="text-[11px] text-stone-400">Edit window expired</span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {payingFor && (
        <PaymentModal
          booking={payingFor}
          onClose={() => setPayingFor(null)}
          onPaid={() => {
            setPayingFor(null);
            refreshBookings();
          }}
        />
      )}

      {reviewingFor && (
        <ReviewModal
          booking={reviewingFor.booking}
          existing={reviewingFor.existing || null}
          onClose={() => setReviewingFor(null)}
          onSubmitted={() => {
            // Refetch so we capture the fresh createdAt (editable window resets with each PATCH timestamp? no — only on create).
            const id = reviewingFor.booking._id;
            reviewService.forBooking(id)
              .then((r) => {
                if (r.review) setReviewsByBooking((prev) => ({ ...prev, [id]: r.review }));
              })
              .catch(() => {});
            setReviewingFor(null);
          }}
        />
      )}

      {chattingWith && (
        <ChatModal booking={chattingWith} onClose={() => setChattingWith(null)} />
      )}
    </div>
  );
}
