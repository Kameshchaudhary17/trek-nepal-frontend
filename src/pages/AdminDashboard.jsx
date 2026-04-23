import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../services/api";
import AdminSidebar, { NAV_ITEMS } from "../components/admin/AdminSidebar";
import OverviewSection from "../components/admin/OverviewSection";
import GuidesSection from "../components/admin/GuidesSection";
import UsersSection from "../components/admin/UsersSection";
import PricingSection from "../components/admin/PricingSection";
import SettingsSection from "../components/admin/SettingsSection";
import TreksSection from "../components/admin/TreksSection";

const EMPTY_STATS = {
  totalGuides: 0,
  totalTrekkers: 0,
  totalBookings: 0,
  revenue: 0,
  pendingVerification: 0,
};

function relativeTime(iso) {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab,    setActiveTab]    = useState("overview");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [toast,        setToast]        = useState(null);

  // Guide verification state
  const [guides,       setGuides]       = useState([]);
  const [guideCounts,  setGuideCounts]  = useState({ pending: 0, verified: 0, rejected: 0 });
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [guideFilter,  setGuideFilter]  = useState("pending");

  // Trekkers state
  const [trekkers,      setTrekkers]      = useState([]);
  const [trekkersLoading, setTrekkersLoading] = useState(false);
  const [trekkerSearch, setTrekkerSearch] = useState("");

  // Overview stats state
  const [stats,    setStats]    = useState(EMPTY_STATS);
  const [activity, setActivity] = useState([]);


  // Auth guard
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user  = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
    if (!token || user?.role !== "admin") navigate("/login");
  }, [navigate]);

  // Close sidebar on outside click
  useEffect(() => {
    if (!sidebarOpen) return;
    const close = () => setSidebarOpen(false);
    document.addEventListener("click", close, { once: true });
    return () => document.removeEventListener("click", close);
  }, [sidebarOpen]);

  // Fetch guides when tab/filter changes
  const fetchGuides = useCallback(async (status) => {
    setGuidesLoading(true);
    try {
      const data = await adminService.listGuides(status);
      setGuides(data.guides || []);
      if (data.counts) setGuideCounts(data.counts);
    } catch {
      showToast("Failed to load guides.", "error");
    } finally {
      setGuidesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "guides") fetchGuides(guideFilter);
  }, [activeTab, guideFilter, fetchGuides]);

  // Fetch badge count on mount
  useEffect(() => {
    adminService.listGuides().then((d) => { if (d.counts) setGuideCounts(d.counts); }).catch(() => {});
  }, []);

  // Fetch overview stats when overview tab is active
  useEffect(() => {
    if (activeTab !== "overview") return;
    adminService.getStats()
      .then((d) => {
        if (d.stats) setStats(d.stats);
        if (d.activity) setActivity(d.activity);
      })
      .catch(() => showToast("Failed to load dashboard stats.", "error"));
  }, [activeTab]);

  // Fetch trekkers when tab active or search changes
  const fetchTrekkers = useCallback(async (search = "") => {
    setTrekkersLoading(true);
    try {
      const data = await adminService.listTrekkers(search);
      setTrekkers(data.trekkers || []);
    } catch {
      showToast("Failed to load trekkers.", "error");
    } finally {
      setTrekkersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchTrekkers(trekkerSearch);
    // trekkerSearch intentionally excluded — handleTrekkerSearch already
    // invokes fetchTrekkers on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, fetchTrekkers]);

  function handleTrekkerSearch(q) {
    setTrekkerSearch(q);
    fetchTrekkers(q);
  }

  /* ── Helpers ── */
  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function verifyGuide(id) {
    try {
      await adminService.setGuideStatus(id, "verified");
      setGuides((prev) => prev.filter((g) => g._id !== id));
      setGuideCounts((c) => ({ ...c, pending: Math.max(0, c.pending - 1), verified: c.verified + 1 }));
      showToast("Guide verified — will now appear in listings.");
    } catch {
      showToast("Failed to verify guide.", "error");
    }
  }

  async function rejectGuide(id) {
    try {
      const fromVerified = guides.find((g) => g._id === id)?.status === "verified";
      await adminService.setGuideStatus(id, "rejected");
      setGuides((prev) => prev.filter((g) => g._id !== id));
      setGuideCounts((c) => ({
        ...c,
        pending:  fromVerified ? c.pending  : Math.max(0, c.pending - 1),
        verified: fromVerified ? Math.max(0, c.verified - 1) : c.verified,
        rejected: c.rejected + 1,
      }));
      showToast("Guide rejected.", "error");
    } catch {
      showToast("Failed to reject guide.", "error");
    }
  }

  async function restoreGuide(id) {
    try {
      await adminService.setGuideStatus(id, "pending");
      setGuides((prev) => prev.filter((g) => g._id !== id));
      setGuideCounts((c) => ({ ...c, rejected: Math.max(0, c.rejected - 1), pending: c.pending + 1 }));
      showToast("Guide moved back to pending.");
    } catch {
      showToast("Failed to restore guide.", "error");
    }
  }


  return (
    <div className="min-h-screen bg-stone-50 font-sans flex">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13.5px] font-semibold shadow-lg border ${
          toast.type === "error"
            ? "bg-red-50 border-red-200 text-red-700"
            : "bg-forest-50 border-forest-200 text-forest-700"
        }`}>
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          {toast.msg}
        </div>
      )}

      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingCount={guideCounts.pending}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 md:ml-[260px] min-w-0">
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
          <span className="text-[12px] text-stone-400">
            {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
          </span>
        </div>

          <div className="px-6 sm:px-10 py-8 w-full">
            {activeTab === "overview" && (
              <OverviewSection
                stats={{ ...stats, pendingVerification: guideCounts.pending }}
                activity={activity.map((a) => ({ ...a, time: relativeTime(a.time) }))}
                onGoToGuides={() => setActiveTab("guides")}
              />
            )}
            {activeTab === "guides" && (
              <GuidesSection
                guides={guides}
                loading={guidesLoading}
                filter={guideFilter}
                setFilter={setGuideFilter}
                counts={guideCounts}
                onVerify={verifyGuide}
                onReject={rejectGuide}
                onRestore={restoreGuide}
              />
            )}
            {activeTab === "users" && (
              <UsersSection
                trekkers={trekkers}
                loading={trekkersLoading}
                search={trekkerSearch}
                onSearch={handleTrekkerSearch}
              />
            )}
            {activeTab === "pricing" && <PricingSection showToast={showToast} />}
            {activeTab === "treks"    && <TreksSection showToast={showToast} />}
            {activeTab === "settings" && <SettingsSection />}
          </div>
        </main>
    </div>
  );
}
