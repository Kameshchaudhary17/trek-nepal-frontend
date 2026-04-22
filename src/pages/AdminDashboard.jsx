import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import { adminService } from "../services/api";
import AdminSidebar, { NAV_ITEMS } from "../components/admin/AdminSidebar";
import OverviewSection from "../components/admin/OverviewSection";
import GuidesSection from "../components/admin/GuidesSection";
import UsersSection from "../components/admin/UsersSection";
import PricingSection from "../components/admin/PricingSection";
import SettingsSection from "../components/admin/SettingsSection";
import TreksSection from "../components/admin/TreksSection";

/* ── Mock data ────────────────────────────────────────────────── */
const MOCK_STATS = {
  totalGuides: 24,
  totalTrekkers: 156,
  totalBookings: 43,
  revenue: 12840,
};

const MOCK_USERS = [
  { id: "1", name: "Alex Thompson",    email: "alex@gmail.com",      role: "trekker", joinedAt: "Apr 1, 2026",  bookings: 2 },
  { id: "2", name: "Sofia Müller",     email: "sofia@email.de",      role: "trekker", joinedAt: "Apr 5, 2026",  bookings: 1 },
  { id: "3", name: "Hiroshi Tanaka",   email: "hiroshi@jp.net",      role: "trekker", joinedAt: "Apr 8, 2026",  bookings: 3 },
  { id: "4", name: "Emma Wilson",      email: "emma@outlook.com",    role: "trekker", joinedAt: "Apr 12, 2026", bookings: 0 },
  { id: "5", name: "Kamesh Chaudhary", email: "tbibek180@gmail.com", role: "guide",   joinedAt: "Apr 20, 2026", bookings: 0 },
  { id: "6", name: "Lucas Ferreira",   email: "lucas@email.br",      role: "trekker", joinedAt: "Apr 3, 2026",  bookings: 1 },
];


const ACTIVITY = [
  { id: 1, text: "Kamesh Chaudhary registered as a guide",  time: "2 hours ago", icon: "👤" },
  { id: 2, text: "Alex Thompson booked Everest Base Camp",  time: "5 hours ago", icon: "📋" },
  { id: 3, text: "Tshering Wangchuk registered as a guide", time: "Yesterday",   icon: "👤" },
  { id: 4, text: "Nima Dorje was verified by admin",        time: "Apr 18",      icon: "✓"  },
  { id: 5, text: "Hiroshi Tanaka booked Annapurna Circuit", time: "Apr 17",      icon: "📋" },
];

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
    <div className="min-h-screen bg-stone-50 font-sans">
      <Navbar />

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

      <div className="flex pt-[68px] min-h-screen">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={guideCounts.pending}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="flex-1 md:ml-[260px] min-w-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center gap-3 px-5 py-3 border-b border-stone-200 bg-white">
            <button
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
              className="p-2 rounded-lg bg-stone-100 border border-stone-200 text-stone-600"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-[13px] text-stone-600 font-medium">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="px-6 sm:px-10 py-8 w-full">
            {activeTab === "overview" && (
              <OverviewSection
                stats={{ ...MOCK_STATS, pendingVerification: guideCounts.pending }}
                activity={ACTIVITY}
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
    </div>
  );
}
