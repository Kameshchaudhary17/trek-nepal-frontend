import { useEffect, useRef, useState } from "react";
import { messageService } from "../../services/api";

const POLL_MS = 15000;

function meId() {
  try {
    return JSON.parse(localStorage.getItem("user"))?.id;
  } catch {
    return null;
  }
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" }) +
      " · " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatModal({ booking, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const lastAtRef = useRef(null);
  const meUserId = meId();

  async function loadInitial() {
    try {
      const { messages: list } = await messageService.list(booking._id);
      setMessages(list);
      if (list.length) lastAtRef.current = list[list.length - 1].createdAt;
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't load messages.");
    }
  }

  async function pollNew() {
    if (!lastAtRef.current) return;
    try {
      const { messages: newOnes } = await messageService.list(booking._id, lastAtRef.current);
      if (newOnes.length) {
        setMessages((prev) => [...prev, ...newOnes]);
        lastAtRef.current = newOnes[newOnes.length - 1].createdAt;
      }
    } catch {
      /* silent on poll errors */
    }
  }

  useEffect(() => {
    loadInitial();
    const id = setInterval(pollNew, POLL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking._id]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setError("");
    try {
      const { message } = await messageService.send(booking._id, text.trim());
      setMessages((prev) => [...prev, message]);
      lastAtRef.current = message.createdAt;
      setText("");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full flex flex-col overflow-hidden"
        style={{ height: "min(540px, 90vh)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="px-5 py-3 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-[1rem] font-semibold text-stone-900">Messages</h3>
            <p className="text-[11.5px] text-stone-400">{booking.route}</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 bg-transparent border-none cursor-pointer"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50">
          {messages.length === 0 && (
            <p className="text-center text-[13px] text-stone-400 mt-10">
              No messages yet. Say hello to your {meUserId === booking.trekker?._id ? "guide" : "trekker"}.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.from?._id === meUserId;
            return (
              <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-[13.5px] leading-relaxed ${
                    mine
                      ? "bg-forest-500 text-white rounded-br-md"
                      : "bg-white border border-stone-200 text-stone-800 rounded-bl-md"
                  }`}
                >
                  {!mine && (
                    <div className="text-[11px] font-semibold text-stone-500 mb-0.5">{m.from?.fullName || "Them"}</div>
                  )}
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                  <div className={`text-[10.5px] mt-1 ${mine ? "text-white/70" : "text-stone-400"}`}>
                    {formatTime(m.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-[12px] text-red-600 bg-red-50 border-t border-red-200 px-4 py-2">{error}</p>
        )}

        <form onSubmit={handleSend} className="flex items-end gap-2 p-3 border-t border-stone-200">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            rows={1}
            maxLength={4000}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-[13.5px] text-stone-800 outline-none focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100 resize-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="px-4 py-2 rounded-xl bg-forest-500 text-white text-[13px] font-semibold hover:bg-forest-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
