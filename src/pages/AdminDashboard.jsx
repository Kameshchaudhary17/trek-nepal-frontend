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

const TREK_PRICES_INIT = [
  { id: "ebc",       name: "Everest Base Camp",  minCost: 1200, maxCost: 1800, permits: 750, duration: "14 days" },
  { id: "annapurna", name: "Annapurna Circuit",  minCost: 900,  maxCost: 1400, permits: 200, duration: "18 days" },
  { id: "langtang",  name: "Langtang Valley",    minCost: 600,  maxCost: 900,  permits: 150, duration: "10 days" },
  { id: "mustang",   name: "Upper Mustang",      minCost: 1800, maxCost: 2800, permits: 500, duration: "12 days" },
  { id: "manaslu",   name: "Manaslu Circuit",    minCost: 1100, maxCost: 1600, permits: 350, duration: "16 days" },
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

  // Pricing state
  const [trekPrices,   setTrekPrices]   = useState(TREK_PRICES_INIT);
  const [savedRows,    setSavedRows]    = useState({});
  const [aiFactor,     setAiFactor]     = useState({ season: "Autumn", demand: 0.85, baseCost: 800 });
  const [aiResult,     setAiResult]     = useState(null);

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

  function updatePrice(id, field, val) {
    setTrekPrices((prev) => prev.map((t) => t.id === id ? { ...t, [field]: val } : t));
  }

  function saveRow(id) {
    setSavedRows((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => setSavedRows((prev) => ({ ...prev, [id]: false })), 2000);
    showToast("Pricing updated.");
  }

  function simulateAI() {
    const base    = parseFloat(aiFactor.baseCost) || 800;
    const mSeason = (aiFactor.season === "Spring" || aiFactor.season === "Autumn") ? 1.15 : 0.90;
    const mDemand = 1.0 + aiFactor.demand * 0.20;
    setAiResult({
      price:      Math.round(base * mSeason * mDemand),
      confidence: `${Math.floor(Math.random() * 8 + 86)}%`,
      seasonMult: mSeason.toFixed(2),
      demandMult: mDemand.toFixed(2),
    });
  }

  return (
    <div className="min-h-screen bg-[#05080f] text-[#f0e4c8] font-sans">
      <Navbar />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13.5px] font-medium shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
          toast.type === "error"
            ? "bg-[#c8503c]/20 border border-[#c8503c]/40 text-[#f08070]"
            : "bg-[#4a9a6a]/20 border border-[#4a9a6a]/40 text-[#88cc99]"
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

        <main className="flex-1 md:ml-[220px] min-w-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center gap-3 px-5 py-3 border-b border-white/[0.07]">
            <button
              onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
              className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#b0c0b8]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <span className="text-[13px] text-[#7a9080]">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </span>
          </div>

          <div className="px-5 sm:px-8 py-8 max-w-[1100px]">
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
            {activeTab === "users"    && <UsersSection users={MOCK_USERS} />}
            {activeTab === "pricing"  && (
              <PricingSection
                trekPrices={trekPrices}
                savedRows={savedRows}
                aiFactor={aiFactor}
                aiResult={aiResult}
                onUpdatePrice={updatePrice}
                onSaveRow={saveRow}
                onAiChange={(field, val) => setAiFactor((p) => ({ ...p, [field]: val }))}
                onSimulate={simulateAI}
              />
            )}
            {activeTab === "settings" && <SettingsSection />}
          </div>
        </main>
      </div>
    </div>
  );
}
