import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SidebarAvatarMenu from "../components/ui/SidebarAvatarMenu";
import ImageUpload from "../components/ui/ImageUpload";
import authService, { bookingService } from "../services/api";
import { formatNPR } from "../utils/money";
import PaymentModal from "../components/payments/PaymentModal";
import ChatModal from "../components/messages/ChatModal";

const NAV = [
  { id: "overview",  label: "Overview",  icon: OverviewIcon  },
  { id: "explore",   label: "Explore",   icon: ExploreIcon   },
  { id: "bookings",  label: "Bookings",  icon: BookingsIcon  },
  { id: "account",   label: "Account",   icon: AccountIcon   },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user,        setUser]        = useState(null);
  const [activeTab,   setActiveTab]   = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token  = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) { navigate("/login"); return; }
    const parsed = JSON.parse(stored);
    if (parsed.role === "guide")  { navigate("/guide/dashboard"); return; }
    if (parsed.role === "admin")  { navigate("/admin");           return; }
    setUser(parsed);
  }, [navigate]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const close = () => setSidebarOpen(false);
    document.addEventListener("click", close, { once: true });
    return () => document.removeEventListener("click", close);
  }, [sidebarOpen]);

  if (!user) return null;

  const initials = user.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  async function handleLogout() {
    await authService.logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-screen w-[240px] bg-white border-r border-stone-200 flex flex-col z-50 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        {/* Logo */}
        <div className="px-5 py-4 border-b border-stone-100">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setSidebarOpen(false)}>
            <span className="text-forest-500">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M8 24L14 12L20 24" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.55" />
              </svg>
            </span>
            <span className="font-serif text-[0.95rem] font-semibold tracking-wide text-stone-900 group-hover:text-forest-600 transition-colors">
              TrekDirect<span className="text-forest-500">Nepal</span>
            </span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-5 pt-5 pb-4 border-b border-stone-100">
          <SidebarAvatarMenu
            photo={user.profilePhoto}
            initials={initials}
            name={user.fullName}
            email={user.email}
            viewProfileAction={() => { setActiveTab("account"); setSidebarOpen(false); }}
            onPhotoChange={async (url) => {
              try {
                const res = await authService.updateMe({ profilePhoto: url });
                const updated = { ...user, ...res.user };
                setUser(updated);
                localStorage.setItem("user", JSON.stringify(updated));
              } catch { /* silently ignore — photo upload is non-critical */ }
            }}
          />
          <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 font-semibold">
            Trekker
          </span>
        </div>

        {/* Nav */}
        <nav className="px-4 pt-4 space-y-1 flex-1 overflow-y-auto">
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-3 px-2">Trekker Panel</p>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] transition-all text-left font-medium ${
                activeTab === id
                  ? "bg-forest-50 text-forest-700 border border-forest-200"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
              }`}
            >
              <Icon active={activeTab === id} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 pb-5 mt-auto space-y-3">
          <div className="bg-forest-50 border border-forest-200 rounded-xl p-3">
            <p className="text-[11px] text-forest-700 font-medium mb-0.5">Ready to trek?</p>
            <Link to="/treks" className="text-[11px] text-forest-600 hover:text-forest-700 font-semibold transition-colors">
              Browse routes →
            </Link>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2H2.5A1.5 1.5 0 001 3.5v7A1.5 1.5 0 002.5 12H5M9 10l3-3-3-3M13 7H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 md:ml-[240px] min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-5 py-3 border-b border-stone-200 bg-white sticky top-0 z-30">
          <button
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
            className="p-2 rounded-lg bg-stone-100 border border-stone-200 text-stone-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-forest-500"><svg width="20" height="20" viewBox="0 0 28 28" fill="none"><path d="M14 2L26 24H2L14 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg></span>
            <span className="font-serif text-[0.9rem] font-semibold text-stone-900">TrekDirect<span className="text-forest-500">Nepal</span></span>
          </Link>
          <span className="text-[12px] text-stone-400">{NAV.find((n) => n.id === activeTab)?.label}</span>
        </div>

          <div className="px-8 sm:px-14 lg:px-20 py-10">
            {activeTab === "overview" && <OverviewTab user={user} setActiveTab={setActiveTab} />}
            {activeTab === "explore"  && <ExploreTab />}
            {activeTab === "bookings" && <BookingsTab />}
            {activeTab === "account"  && <AccountTab user={user} setUser={setUser} />}
          </div>
        </main>
    </div>
  );
}

/* ── Overview Tab ───────────────────────────────────────────────── */
function OverviewTab({ user, setActiveTab }) {
  const stats = [
    { label: "Upcoming treks",  value: "0" },
    { label: "Saved guides",    value: "0" },
    { label: "Treks completed", value: "0" },
    { label: "Reviews given",   value: "0" },
  ];

  const actions = [
    { title: "Browse Treks",      desc: "12+ curated Nepal routes with difficulty and permits.", to: "/treks",      Icon: IconMountain },
    { title: "Find a Guide",       desc: "NTB-verified guides by route, language and rate.",      to: "/guides",     Icon: IconCompass },
    { title: "Calculate Cost",     desc: "Estimate your full trek budget.",                       to: "/pricing",    Icon: IconCoin },
    { title: "Trail Conditions",   desc: "Live weather and trail status across Nepal.",           to: "/conditions", Icon: IconCloud },
    { title: "My Bookings",        desc: "View upcoming and past bookings.",                      tab: "bookings",   Icon: IconClipboard },
    { title: "Account Settings",   desc: "Update profile details.",                               tab: "account",    Icon: IconUser },
  ];

  return (
    <div>
      <div className="mb-16">
        <h1 className="text-[2.5rem] font-medium text-stone-900 leading-tight tracking-tight">
          Welcome, {user.fullName?.split(" ")[0]}
        </h1>
        <p className="text-[16px] text-stone-500 mt-2">Plan your next Nepal adventure.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-y border-stone-100 divide-x divide-stone-100 mb-20">
        {stats.map((s) => (
          <div key={s.label} className="py-8 px-6 first:pl-0">
            <div className="text-[2.5rem] font-medium text-stone-900 tabular-nums leading-none">{s.value}</div>
            <div className="text-[13px] text-stone-500 mt-3">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-x-14 gap-y-0">
        {actions.map(({ title, desc, to, tab, Icon }) => {
          const content = (
            <>
              <span className="shrink-0 mt-1 text-stone-400 group-hover:text-forest-600 transition-colors">
                <Icon />
              </span>
              <div className="flex-1">
                <h3 className="text-[16px] font-medium text-stone-900 group-hover:text-forest-600 transition-colors">{title}</h3>
                <p className="text-[13.5px] text-stone-500 mt-1">{desc}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="text-stone-300 group-hover:text-forest-600 transition-colors shrink-0 mt-1.5">
                <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          );
          return to ? (
            <Link key={title} to={to} className="group flex items-start gap-5 py-6 border-b border-stone-100">
              {content}
            </Link>
          ) : (
            <button key={title} onClick={() => setActiveTab(tab)} className="group flex items-start gap-5 py-6 text-left border-b border-stone-100">
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Explore Tab ────────────────────────────────────────────────── */
function ExploreTab() {
  const links = [
    { label: "Trek Routes",     sub: "12 curated routes",            to: "/treks",      Icon: IconMountain },
    { label: "Verified Guides", sub: "NTB-certified professionals",  to: "/guides",     Icon: IconCompass },
    { label: "Pricing",         sub: "Transparent cost breakdown",   to: "/pricing",    Icon: IconCoin },
    { label: "Trail Conditions",sub: "Live weather and trail status",to: "/conditions", Icon: IconCloud },
  ];

  const seasons = [
    { season: "Spring",  months: "Mar–May", note: "High season" },
    { season: "Monsoon", months: "Jun–Aug", note: "Avoid if possible" },
    { season: "Autumn",  months: "Sep–Nov", note: "Peak season" },
    { season: "Winter",  months: "Dec–Feb", note: "Low season" },
  ];

  return (
    <div>
      <div className="mb-16">
        <h2 className="text-[2.5rem] font-medium text-stone-900 leading-tight tracking-tight">Plan your trek</h2>
        <p className="text-[16px] text-stone-500 mt-2">Everything to plan your Nepal trekking experience.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-14 gap-y-0 mb-20">
        {links.map(({ label, sub, to, Icon }) => (
          <Link key={to} to={to} className="group flex items-start gap-5 py-6 border-b border-stone-100">
            <span className="shrink-0 mt-1 text-stone-400 group-hover:text-forest-600 transition-colors">
              <Icon />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-medium text-stone-900 group-hover:text-forest-600 transition-colors">{label}</div>
              <div className="text-[13.5px] text-stone-500 mt-1">{sub}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none" className="text-stone-300 group-hover:text-forest-600 transition-colors shrink-0 mt-1.5">
              <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </div>

      <div>
        <h3 className="text-[13px] uppercase tracking-[0.14em] text-stone-400 mb-5">Best time to trek</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 border-y border-stone-100 divide-x divide-stone-100">
          {seasons.map((s) => (
            <div key={s.season} className="py-7 px-6 first:pl-0">
              <div className="text-[17px] font-medium text-stone-900">{s.season}</div>
              <div className="text-[13.5px] text-stone-500 mt-1 tabular-nums">{s.months}</div>
              <div className="text-[12.5px] text-stone-400 mt-1.5">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Bookings Tab ───────────────────────────────────────────────── */
const DASH_STATUS_BADGE = {
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

function DashBookingsTab() {
  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [payingFor,  setPayingFor]  = useState(null);
  const [chattingWith, setChattingWith] = useState(null);

  function load() {
    return bookingService.getMyBookings()
      .then((res) => setBookings(res.bookings || []))
      .catch(() => setBookings([]));
  }

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

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

  return (
    <div>
      <div className="mb-16">
        <h2 className="text-[2.5rem] font-medium text-stone-900 leading-tight tracking-tight">My bookings</h2>
        <p className="text-[16px] text-stone-500 mt-2">Upcoming and past trek bookings.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-stone-200 rounded-2xl p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-stone-200 rounded w-1/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
                <div className="h-6 w-20 bg-stone-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-10 flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="17" rx="2" stroke="#a8a29e" strokeWidth="1.5" />
              <path d="M8 2v4M16 2v4M3 10h18" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="font-serif text-[1.1rem] font-semibold text-stone-800 mb-2">No bookings yet</h3>
          <p className="text-[13.5px] text-stone-400 max-w-[280px] leading-relaxed mb-6">
            Your upcoming and past trek bookings will appear here once you book a guide.
          </p>
          <Link to="/guides" className="px-6 py-3 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all">
            Find a guide
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-5">
            {bookings.slice(0, 5).map((booking) => {
              const guide     = booking.guide;
              const guideName = guide?.user?.fullName || "Guide";
              const guideId   = guide?._id;
              const photo     = guide?.user?.profilePhoto;

              return (
                <div
                  key={booking._id}
                  className="bg-white border border-stone-200 rounded-2xl p-4 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {photo ? (
                      <img src={photo} alt={guideName} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[0.8rem] text-white shrink-0"
                        style={{ background: `linear-gradient(135deg, ${guide?.color || "#4a7aaa"}CC, ${guide?.color || "#4a7aaa"}99)` }}
                      >
                        {guide?.initials || "G"}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {guideId ? (
                          <Link to={`/guides/${guideId}`} className="text-[13.5px] font-semibold text-stone-900 hover:text-forest-600 transition-colors">
                            {guideName}
                          </Link>
                        ) : (
                          <span className="text-[13.5px] font-semibold text-stone-900">{guideName}</span>
                        )}
                        {(() => {
                          const s = DASH_STATUS_BADGE[booking.status] || DASH_STATUS_BADGE.pending;
                          return <span className={`inline-flex items-center px-2 py-px rounded-full text-[11px] font-medium ${s.cls}`}>{s.label}</span>;
                        })()}
                        {/* Payment pill — only shown once the guide has confirmed.
                            Before that, payment isn't due so the status is noise. */}
                        {["confirmed", "completed"].includes(booking.status) && (() => {
                          const p = PAY_BADGE[booking.paymentStatus] || PAY_BADGE.unpaid;
                          return <span className={`inline-flex items-center px-2 py-px rounded-full text-[11px] font-medium ${p.cls}`}>{p.label}</span>;
                        })()}
                      </div>
                      <div className="text-[12px] text-stone-400 truncate">
                        {booking.route || "—"} &middot; {booking.days} day{booking.days !== 1 ? "s" : ""}
                        {booking.totalCost > 0 && ` · ${formatNPR(booking.totalCost)}`}
                      </div>
                    </div>

                    {/* Inline actions — Pay takes priority so it's visible without deep clicks.
                        Status pills above already show payment state, so we only surface the
                        Pay button here when there's something actionable. */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      {booking.status === "confirmed" && (!booking.paymentStatus || booking.paymentStatus === "unpaid" || booking.paymentStatus === "failed") && (
                        <button
                          onClick={() => setPayingFor(booking)}
                          className="px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-forest-500 text-white hover:bg-forest-600 transition-colors"
                        >
                          Pay {formatNPR(booking.totalCost)}
                        </button>
                      )}
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <>
                          <button
                            onClick={() => setChattingWith(booking)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                          >
                            Message
                          </button>
                          <button
                            disabled={cancelling === booking._id}
                            onClick={() => handleCancel(booking._id)}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {cancelling === booking._id ? "…" : "Cancel"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {bookings.length > 5 && (
            <Link
              to="/bookings"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-forest-600 hover:text-forest-700 transition-colors"
            >
              View all {bookings.length} bookings
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
        </>
      )}

      {payingFor && (
        <PaymentModal
          booking={payingFor}
          onClose={() => setPayingFor(null)}
          onPaid={() => {
            setPayingFor(null);
            load();
          }}
        />
      )}
      {chattingWith && (
        <ChatModal booking={chattingWith} onClose={() => setChattingWith(null)} />
      )}
    </div>
  );
}

function BookingsTab() {
  return <DashBookingsTab />;
}

/* ── Account Tab ────────────────────────────────────────────────── */
function AccountTab({ user, setUser }) {
  const [form,   setForm]   = useState({ fullName: user.fullName || "", phone: user.phone || "", profilePhoto: user.profilePhoto || "" });
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);
  const [errors, setErrors] = useState({});

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function set(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await authService.updateMe({
        fullName:     form.fullName.trim(),
        phone:        form.phone,
        profilePhoto: form.profilePhoto,
      });
      const updated = { ...user, ...res.user };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      showToast("Profile saved successfully.");
    } catch {
      showToast("Failed to save. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  const initials = user.fullName?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div className="max-w-[680px]">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-4 py-2.5 rounded-lg text-[13px] border ${
          toast.type === "error" ? "bg-white border-red-200 text-red-600" : "bg-white border-forest-200 text-forest-700"
        }`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-forest-500 font-semibold mb-2">
          <span className="w-5 h-px bg-forest-300" /> Account
        </span>
        <h2 className="font-serif text-[1.7rem] font-bold text-stone-900">My Profile</h2>
        <p className="text-[13.5px] text-stone-400 mt-1">Manage your account details and photo.</p>
      </div>

      {/* ── Profile hero ── */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden mb-5">
        <div className="h-[72px] bg-gradient-to-br from-forest-800 via-forest-700 to-forest-500" />
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-9 mb-3">
            {form.profilePhoto ? (
              <img
                src={form.profilePhoto} alt={form.fullName}
                className="w-[68px] h-[68px] rounded-2xl object-cover border-[3px] border-white shadow ring-1 ring-stone-100"
              />
            ) : (
              <div className="w-[68px] h-[68px] rounded-2xl bg-forest-600 flex items-center justify-center font-serif font-bold text-[1.25rem] text-white border-[3px] border-white shadow">
                {initials}
              </div>
            )}
            <span className="mb-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-600 text-[11px] font-semibold">
              🥾 Trekker
            </span>
          </div>
          <h3 className="font-serif text-[1.15rem] font-bold text-stone-900 leading-snug">{form.fullName || user.fullName || "—"}</h3>
          <p className="text-[13px] text-stone-400 mt-0.5">{user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* ── Photo card ── */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-4">Profile Photo</p>
          <div className="flex items-center gap-4">
            {form.profilePhoto ? (
              <img src={form.profilePhoto} alt={form.fullName}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-stone-200" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-forest-600 flex items-center justify-center font-serif font-bold text-[1rem] text-white shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <ImageUpload
                uploadType="profile"
                accept="image/jpeg,image/png,image/webp"
                maxSizeMB={5}
                value={form.profilePhoto}
                onChange={({ url }) => set("profilePhoto", url)}
              />
            </div>
          </div>
        </div>

        {/* ── Personal info card ── */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400 font-semibold mb-4">Personal Information</p>
          <div className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">
                Full name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" width="15" height="15" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2 15c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="Your full name"
                  className={`w-full bg-stone-50 border rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:ring-2 focus:ring-forest-100 ${errors.fullName ? "border-red-300 bg-red-50" : "border-stone-200 focus:border-forest-400"}`}
                />
              </div>
              {errors.fullName && <p className="text-[12px] text-red-500 mt-1">{errors.fullName}</p>}
            </div>

            {/* Email + Phone side-by-side */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Email address</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none" width="15" height="15" viewBox="0 0 18 18" fill="none">
                    <rect x="1.5" y="4" width="15" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M1.5 6.5L9 11L16.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full bg-stone-100 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-stone-400 outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">Cannot be changed</p>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-stone-600 mb-1.5">Phone number</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" width="15" height="15" viewBox="0 0 18 18" fill="none">
                    <rect x="5" y="1.5" width="8" height="15" rx="2" stroke="currentColor" strokeWidth="1.4" />
                    <circle cx="9" cy="13.5" r=".75" fill="currentColor" />
                  </svg>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+977 98XXXXXXXX"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-10 pr-4 text-[14px] text-stone-800 outline-none transition-all placeholder:text-stone-400 focus:border-forest-400 focus:bg-white focus:ring-2 focus:ring-forest-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={saving}
            className="px-7 py-2.5 bg-forest-500 text-white rounded-xl text-[14px] font-semibold hover:bg-forest-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving
              ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving</>
              : "Save changes"
            }
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────────── */
function OverviewIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
    </svg>
  );
}

function ExploreIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M10.5 5.5l-2 5-2-2-1.5 1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BookingsIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="11" rx="1.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M5 1v4M11 1v4M2 7h12" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon({ active }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5.5" r="2.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" />
      <path d="M2.5 14c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke={active ? "#2D6A4F" : "currentColor"} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/* ── Action icons (minimal line) ────────────────────────────────── */
const ICON_PROPS = { width: 18, height: 18, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" };

function IconMountain() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M2 16l5-9 3.5 6 2-3.5L17 16H2z" />
      <path d="M6.5 10.5l1.2-2" opacity=".6" />
    </svg>
  );
}

function IconCompass() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M12.5 7.5l-1.5 4-4 1.5 1.5-4 4-1.5z" />
    </svg>
  );
}

function IconCoin() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6v8M12.5 7.5H8.8a1.3 1.3 0 000 2.6h2.4a1.3 1.3 0 010 2.6H7.5" />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M6 14.5h8.5a3 3 0 00.3-5.97A4.5 4.5 0 006 9a3.25 3.25 0 000 5.5z" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg {...ICON_PROPS}>
      <rect x="5" y="4" width="10" height="13" rx="1.5" />
      <path d="M8 3h4v3H8z" />
      <path d="M7.5 10h5M7.5 13h3" opacity=".6" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="10" cy="7" r="3" />
      <path d="M3.5 17a6.5 6.5 0 0113 0" />
    </svg>
  );
}
