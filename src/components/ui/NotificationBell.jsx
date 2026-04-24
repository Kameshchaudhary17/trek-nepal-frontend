import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../services/api";
import { getSocket } from "../../services/socket";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const TYPE_ICON = {
  "booking.new":       "📋",
  "booking.confirmed": "✅",
  "booking.rejected":  "✕",
  "booking.cancelled": "✕",
  "booking.completed": "🏔️",
  "payment.paid":      "💳",
  "payment.failed":    "⚠️",
  "payment.refunded":  "↩️",
  "review.new":        "★",
  "message.new":       "💬",
};

export default function NotificationBell() {
  const [open, setOpen]       = useState(false);
  const [items, setItems]     = useState([]);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(false);
  const popRef = useRef(null);
  const navigate = useNavigate();

  /* Initial fetch (runs once while mounted + token present). */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    notificationService.list({ limit: 20 })
      .then((r) => { setItems(r.notifications || []); setUnread(r.unreadCount || 0); })
      .catch(() => {});
  }, []);

  /* Real-time: subscribe once on mount, react to notification:new. */
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onNew = (notif) => {
      setItems((prev) => [notif, ...prev].slice(0, 20));
      setUnread((n) => n + 1);
    };
    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, []);

  /* Close on outside click. */
  useEffect(() => {
    if (!open) return;
    function handler(e) {
      if (popRef.current && !popRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      // Refresh on each open so the list isn't stale if the socket dropped events.
      setLoading(true);
      try {
        const r = await notificationService.list({ limit: 20 });
        setItems(r.notifications || []);
        setUnread(r.unreadCount || 0);
      } catch {
        /* keep whatever's in state */
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleClick(notif) {
    // Optimistic mark-read; server follows.
    if (!notif.readAt) {
      setItems((prev) => prev.map((n) => n._id === notif._id ? { ...n, readAt: new Date().toISOString() } : n));
      setUnread((n) => Math.max(0, n - 1));
      notificationService.markRead(notif._id).catch(() => {});
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  }

  async function handleMarkAll() {
    if (unread === 0) return;
    setItems((prev) => prev.map((n) => n.readAt ? n : { ...n, readAt: new Date().toISOString() }));
    setUnread(0);
    notificationService.markAllRead().catch(() => {});
  }

  return (
    <div ref={popRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 flex items-center justify-center transition-colors bg-white"
        aria-label="Notifications"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="text-stone-600">
          <path d="M8 1.5a4.5 4.5 0 00-4.5 4.5v2.25L2 10.5h12L12.5 8.25V6A4.5 4.5 0 008 1.5zM6.5 12.5a1.5 1.5 0 003 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9.5px] font-bold flex items-center justify-center border-2 border-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] w-[340px] bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="font-serif text-[14px] font-semibold text-stone-900">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="text-[11.5px] text-forest-600 hover:text-forest-700 font-medium bg-transparent border-none cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && items.length === 0 ? (
              <div className="p-8 text-center text-[13px] text-stone-400">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center text-[18px]">
                  🔔
                </div>
                <p className="text-[13px] text-stone-500 font-medium">No notifications yet</p>
                <p className="text-[11.5px] text-stone-400 mt-1">You'll see booking updates, messages and payments here.</p>
              </div>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors text-left bg-transparent ${n.readAt ? "" : "bg-forest-50/30"}`}
                >
                  <span className="shrink-0 w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-[14px]">
                    {TYPE_ICON[n.type] || "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[12.5px] leading-snug ${n.readAt ? "text-stone-600" : "text-stone-900 font-semibold"}`}>
                        {n.title}
                      </p>
                      {!n.readAt && <span className="w-1.5 h-1.5 rounded-full bg-forest-500 shrink-0 mt-1.5" />}
                    </div>
                    {n.body && (
                      <p className="text-[11.5px] text-stone-500 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10.5px] text-stone-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
