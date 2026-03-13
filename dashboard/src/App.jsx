import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Video,
  AlertTriangle,
  CheckCircle,
  User,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Clock,
  MapPin,
  ShieldCheck,
  X,
  Activity,
  Filter,
  Download,
  Maximize2,
  Users,
  FileText,
  History,
  Settings as SettingsIcon,
  Monitor,
  Camera,
  Loader2,
  Gauge,
  Siren,
  Shield,
} from "lucide-react";
import Card from "./components/ui/Card";
import MetricCard from "./components/ui/MetricCard";
import Tabs from "./components/ui/Tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./components/ui/Toast";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import {
  useDashboardSummary,
  useRecentIncidents,
  useCameraStatus,
} from "./hooks/useDashboard";
import { useFaceRecognition } from "./hooks/useFaceRecognition";

import LandingPage from "./LandingPage";
import LoginPage from "./pages/LoginPage";
const ErrorMessage = ({ error, onRetry }) => (
  <div className="p-8 text-center">
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 max-w-md mx-auto">
      <AlertTriangle className="text-rose-500 mx-auto mb-4" size={48} />
      <h3 className="text-lg font-bold text-rose-900 mb-2">
        Gagal Memuat Data
      </h3>
      <p className="text-rose-700 text-sm mb-6">
        {error?.message || "Terjadi kesalahan sistem"}
      </p>
      <button
        onClick={onRetry}
        className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700 transition"
      >
        Coba Lagi
      </button>
    </div>
  </div>
);

import Monitoring from "./pages/Monitoring";
import HistoryPage from "./pages/History";
import Identities from "./pages/Identities";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import CameraManagementPage from "./pages/CameraManagementPage";

// ─── Dashboard Home Tab ─────────────────────────────────────
function DashboardHomeTab({ onTabChange, hasPermission }) {
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useDashboardSummary();
  const { data: incidentsData, isLoading: incidentsLoading } =
    useRecentIncidents(5);
  const { data: camerasData, isLoading: camerasLoading } = useCameraStatus();
  const { enabled: faceRecognitionEnabled } = useFaceRecognition();
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Extract data from API responses, falling back gracefully
  const summary = summaryData?.data || summaryData || {};
  const incidents = Array.isArray(incidentsData)
    ? incidentsData
    : incidentsData?.data || [];
  const cameras = Array.isArray(camerasData)
    ? camerasData
    : camerasData?.data || [];

  // Build metrics from summary or use defaults
  const totalDetections =
    summary.total_detections ?? summary.totalDetections ?? "—";
  const totalIncidents =
    summary.total_incidents ?? summary.totalIncidents ?? "—";
  const complianceRate =
    summary.compliance_rate ?? summary.complianceRate ?? "—";

  const pieData = [
    {
      name: "Patuh",
      value: typeof complianceRate === "number" ? complianceRate : 85,
      color: "#10B981",
    },
    {
      name: "Tidak Patuh",
      value: typeof complianceRate === "number" ? 100 - complianceRate : 15,
      color: "#EF4444",
    },
  ];

  if (summaryLoading || incidentsLoading || camerasLoading) {
    return <LoadingSpinner message="Memuat dashboard..." />;
  }

  if (summaryError) {
    return <ErrorMessage error={summaryError} onRetry={refetchSummary} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Dashboard Operasional
          </h2>
          <p className="text-slate-500">
            Pantauan real-time kepatuhan seragam SOP AI.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
          <Clock size={16} /> Update terakhir: Baru saja
        </div>
      </div>

      {/* Top Row: Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          item={{
            title: "Total Deteksi (24 Jam)",
            value:
              typeof totalDetections === "number"
                ? totalDetections.toLocaleString()
                : totalDetections,
            delta: "+12% vs kemarin",
            tone: "slate",
            icon: Gauge,
            spark: [30, 42, 35, 48, 56, 59, 70],
          }}
        />
        <MetricCard
          item={{
            title: "Insiden Pelanggaran",
            value:
              typeof totalIncidents === "number"
                ? totalIncidents.toLocaleString()
                : totalIncidents,
            delta: "Perlu perhatian",
            tone: "rose",
            icon: Siren,
            spark: [22, 18, 24, 17, 19, 15, 14],
          }}
        />
        <MetricCard
          item={{
            title: "Tingkat Kepatuhan",
            value:
              typeof complianceRate === "number"
                ? `${complianceRate.toFixed(1)}%`
                : `${complianceRate}%`,
            delta: "Sesuai target",
            tone: "emerald",
            icon: Shield,
            spark: [72, 78, 80, 83, 86, 85, 85],
          }}
        />
      </div>

      {/* Middle Row: Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.9fr] gap-6">
        {/* Recent Incidents Table */}
        <Card
          title="Daftar Insiden Terbaru"
          right={
            hasPermission("history") && (
              <button
                onClick={() => onTabChange("history")}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium underline"
              >
                Lihat Semua
              </button>
            )
          }
          className="flex flex-col overflow-hidden"
          animate={false}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[11px] uppercase tracking-[0.14em]">
                  <th className="px-4 py-3 font-semibold">Waktu</th>
                  {faceRecognitionEnabled && (
                    <th className="px-4 py-3 font-semibold">Nama</th>
                  )}
                  <th className="px-4 py-3 font-semibold">Lokasi</th>
                  <th className="px-4 py-3 font-semibold">Jenis</th>
                  <th className="px-4 py-3 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.length > 0 ? (
                  incidents.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 cursor-pointer transition"
                      onClick={() => setSelectedIncident(item)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {item.time || item.timestamp || "—"}
                      </td>
                      {faceRecognitionEnabled && (
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {item.staff_name ||
                            item.person_name ||
                            item.identity_name ||
                            "—"}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-slate-600 flex items-center gap-2">
                        <MapPin size={14} />{" "}
                        {item.location || item.camera_name || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-rose-100 text-rose-700 text-xs px-2.5 py-1 rounded-full font-semibold">
                          {item.type || item.event_type || item.name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button className="text-slate-400 hover:text-slate-900">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={faceRecognitionEnabled ? 5 : 4}
                      className="px-6 py-8 text-center text-slate-400 text-sm"
                    >
                      Tidak ada insiden terbaru
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pie Chart Summary */}
        <Card
          title="Persentase Kepatuhan"
          className="flex flex-col"
          animate={false}
        >
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-8 mt-4 w-full">
              {pieData.map((item) => (
                <div key={item.name} className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm font-medium text-slate-700">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-xl font-bold">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Row: CCTV Status */}
      <Card title="Status CCTV & AI Deteksi" className="p-6" animate={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cameras.length > 0 ? (
            cameras.map((cam) => {
              const isOnline =
                cam.status === "Online" ||
                cam.status === "online" ||
                cam.status === "active" ||
                cam.is_active;
              return (
                <div
                  key={cam.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? "bg-emerald-500" : "bg-slate-300"}`}
                    ></div>
                    <span className="text-sm font-semibold text-slate-700">
                      {cam.name || cam.camera_name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${isOnline ? "text-emerald-700 bg-emerald-100" : "text-slate-500 bg-slate-200"}`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400 col-span-full text-center py-4">
              Tidak ada kamera terhubung
            </p>
          )}
        </div>
      </Card>

      {/* Modal: Incident Detail */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">
                Rincian Pelanggaran
              </h3>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-slate-100 aspect-video rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 group">
                  <Video
                    className="text-slate-400 group-hover:scale-110 transition mb-2"
                    size={48}
                  />
                  <p className="text-slate-500 text-xs font-medium">
                    Rekaman Bukti AI
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">
                      Waktu Kejadian
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedIncident.time ||
                        selectedIncident.timestamp ||
                        "—"}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-wider">
                      Lokasi Kamera
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {selectedIncident.location ||
                        selectedIncident.camera_name ||
                        "—"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Jenis Deteksi
                  </h4>
                  <span className="bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-sm font-bold inline-block border border-rose-200">
                    {selectedIncident.type ||
                      selectedIncident.event_type ||
                      selectedIncident.name ||
                      "—"}
                  </span>
                </div>
                {faceRecognitionEnabled && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Nama Staff
                    </h4>
                    <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedIncident.staff_name ||
                        selectedIncident.person_name ||
                        selectedIncident.identity_name ||
                        "Tidak teridentifikasi"}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Analisis AI
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                    "
                    {selectedIncident.detail ||
                      selectedIncident.description ||
                      "Tidak ada deskripsi"}
                    "
                  </p>
                </div>
                <div className="pt-4 flex gap-3">
                  <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition">
                    Validasi Insiden
                  </button>
                  <button
                    onClick={() => setSelectedIncident(null)}
                    className="px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition"
                  >
                    Abaikan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Shell ────────────────────────────────────────
function DashboardShell() {
  const { user, logout, hasPermission, getAllowedTabs } = useAuth();
  const { addToast } = useToast();
  const allowedTabs = getAllowedTabs();
  const [activeTab, setActiveTab] = useState(allowedTabs[0] || "home");

  // Guard: redirect to first allowed tab if current is not allowed
  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0] || "home");
    }
  }, [allowedTabs, activeTab]);

  const handleLogout = async () => {
    try {
      await logout();
      addToast({ type: "info", message: "Anda telah keluar" });
    } catch {
      // logout always clears local state
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <ShieldCheck className="text-emerald-400" />
          <span className="font-bold text-lg text-white">VisionGuard AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-2 pb-1">
            Menu Utama
          </p>
          {hasPermission("home") && (
            <button
              onClick={() => setActiveTab("home")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === "home" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}
            >
              <LayoutDashboard size={20} /> Dashboard
            </button>
          )}
          {hasPermission("monitoring") && (
            <button
              onClick={() => setActiveTab("monitoring")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === "monitoring" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}
            >
              <Monitor size={20} /> Live Monitoring
            </button>
          )}
          {hasPermission("history") && (
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === "history" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}
            >
              <AlertTriangle size={20} /> Riwayat Insiden
            </button>
          )}

          {(hasPermission("identities") ||
            hasPermission("reports") ||
            hasPermission("cameras")) && (
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-4 pb-1">
              Manajemen
            </p>
          )}
          {hasPermission("identities") && (
            <button
              onClick={() => setActiveTab("identities")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === "identities" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}
            >
              <Users size={20} /> Identitas Staff
            </button>
          )}
          {hasPermission("reports") && (
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === "reports" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}
            >
              <FileText size={20} /> Laporan & Bukti
            </button>
          )}
          {hasPermission("cameras") && (
            <button
              onClick={() => setActiveTab("cameras")}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === "cameras" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}
            >
              <Camera size={20} /> Manajemen Kamera
            </button>
          )}

          {hasPermission("settings") && (
            <>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-4 pb-1">
                Sistem
              </p>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition ${activeTab === "settings" ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`}
              >
                <SettingsIcon size={20} /> Pengaturan
              </button>
            </>
          )}
        </nav>

        {/* User Info */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-center gap-3 px-3 py-2">
            <div className="bg-slate-700 p-1.5 rounded-full text-slate-400">
              <User size={14} />
            </div>
            <span className="text-xs text-slate-400 font-medium truncate">
              {user?.name || user?.username || "User"}
            </span>
            <button className="relative text-slate-400 hover:text-white transition">
              <Bell size={16} />
            </button>
          </div>
        </div>
        <div className="border-t border-slate-800 px-4 py-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-rose-900/20 hover:text-rose-400 transition text-sm"
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100">
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === "home" && (
            <DashboardHomeTab
              onTabChange={setActiveTab}
              hasPermission={hasPermission}
            />
          )}
          {activeTab === "monitoring" && <Monitoring currentUser={user} />}
          {activeTab === "history" && <HistoryPage />}
          {activeTab === "identities" && <Identities />}
          {activeTab === "reports" && <Reports />}
          {activeTab === "cameras" && <CameraManagementPage />}
          {activeTab === "settings" && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

// ─── App Content (Auth Gate) ────────────────────────────────
function AppContent() {
  const { user, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  // Sync showLanding state: if user is logged in, we skip landing page from now on
  useEffect(() => {
    if (user) {
      setShowLanding(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <LoadingSpinner message="Memverifikasi sesi..." />
      </div>
    );
  }

  // Show Landing Page only if showLanding is true AND user is not logged in
  if (showLanding && !user) {
    return (
      <LandingPage
        onEnterApp={() => {
          // Set flag to skip auto-login if they manually enter from landing
          sessionStorage.setItem("skipAutoLogin", "true");
          setShowLanding(false);
        }}
      />
    );
  }

  // If already logged in, go to dashboard
  if (user) {
    return <DashboardShell />;
  }

  // Default: show login page (handles logout transition too)
  return <LoginPage />;
}

// ─── Root App with Providers ────────────────────────────────
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
