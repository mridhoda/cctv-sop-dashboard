import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Camera,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Monitor,
  Settings as SettingsIcon,
  Shield,
  ShieldCheck,
  Siren,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Card from "./components/ui/Card";
import MetricCard from "./components/ui/MetricCard";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./components/ui/Toast";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import {
  NotificationProvider,
  useNotificationContext,
} from "./contexts/NotificationContext";
import NotificationDropdown from "./components/ui/NotificationDropdown";
import ProtectedRoute from "./components/ProtectedRoute";
import { useDashboardRealtime } from "./hooks/useDashboardRealtime";
import { useFaceRecognition } from "./hooks/useFaceRecognition";
import { useRealtimeEvents } from "./hooks/useRealtimeEvents";
import RefreshButton from "./components/ui/RefreshButton";
import LandingPage from "./LandingPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Monitoring from "./pages/Monitoring";
import HistoryPage from "./pages/History";
import Identities from "./pages/Identities";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import CameraManagementPage from "./pages/CameraManagementPage";
import ProfilePage from "./pages/ProfilePage";
import {
  getDashboardPath,
  getDefaultDashboardPath,
} from "./utils/dashboardRoutes";

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

function FullScreenLoading({ message = "Memverifikasi sesi..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <LoadingSpinner message={message} />
    </div>
  );
}

function PublicOnlyRoute({ children }) {
  const { user, loading, getAllowedTabs } = useAuth();

  if (loading) {
    return <FullScreenLoading />;
  }

  if (user) {
    return <Navigate to={getDefaultDashboardPath(getAllowedTabs())} replace />;
  }

  return children;
}

function LandingOrLoginRedirect() {
  const { user, loading, getAllowedTabs } = useAuth();

  if (loading) {
    return <FullScreenLoading />;
  }

  if (user) {
    return <Navigate to={getDefaultDashboardPath(getAllowedTabs())} replace />;
  }

  return <LandingPage />;
}

function NotFoundRedirect() {
  const { user, loading, getAllowedTabs } = useAuth();

  if (loading) {
    return <FullScreenLoading />;
  }

  return (
    <Navigate
      to={user ? getDefaultDashboardPath(getAllowedTabs()) : "/"}
      replace
    />
  );
}

function DashboardHomeTab() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const {
    summary: summaryData,
    incidents: incidentsData,
    cameras: camerasData,
    isLoading: summaryLoading,
    isDegraded: dashboardDegraded,
    error: summaryError,
    refetch: refetchAll,
  } = useDashboardRealtime();
  const { enabled: faceRecognitionEnabled } = useFaceRecognition();
  const [selectedIncident, setSelectedIncident] = useState(null);

  const summary = summaryData || {};
  const incidents = Array.isArray(incidentsData) ? incidentsData : [];
  const cameras = Array.isArray(camerasData) ? camerasData : [];

  const totalDetections =
    summary.total_detections ?? summary.totalDetections ?? "—";
  const totalIncidents =
    summary.total_incidents ?? summary.totalIncidents ?? "—";
  const complianceRate =
    summary.compliance_rate ?? summary.complianceRate ?? "—";

  const complianceVal =
    typeof complianceRate === "number"
      ? parseFloat(complianceRate.toFixed(2))
      : 85;
  const nonComplianceVal = parseFloat((100 - complianceVal).toFixed(2));

  const pieData = [
    { name: "Patuh", value: complianceVal, color: "#10B981" },
    { name: "Tidak Patuh", value: nonComplianceVal, color: "#EF4444" },
  ];

  const sparkTotal = summary.spark_total ?? [];
  const sparkViolations = summary.spark_violations ?? [];
  const sparkCompliance = summary.spark_compliance ?? [];
  const sparkLabels = summary.spark_labels ?? [];

  const deltaTotal = summary.delta_total ?? "...";
  const deltaViolations = summary.delta_violations ?? "...";
  const deltaCompliance = summary.delta_compliance ?? "...";

  const getRawDetectionId = (incident) =>
    incident?.detection_id ||
    incident?.detectionId ||
    incident?.event_id ||
    incident?.id ||
    "—";

  // Show only the first 8 chars so the UUID doesn't wrap across lines
  const formatDetectionId = (incident) => {
    const full = getRawDetectionId(incident);
    if (full === "—") return "—";
    return String(full).slice(0, 8).toUpperCase();
  };

  if (summaryLoading) {
    return <LoadingSpinner message="Memuat dashboard..." />;
  }

  if (summaryError) {
    return <ErrorMessage error={summaryError} onRetry={refetchAll} />;
  }

  return (
    <div className="space-y-6">
      {dashboardDegraded && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Dashboard sedang memakai data cache terakhir karena request terbaru
          lambat atau timeout.
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Dashboard Operasional
          </h2>
          <p className="text-slate-500">
            Pantauan real-time kepatuhan seragam SOP AI.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={refetchAll} />
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 shadow-sm flex items-center gap-2">
            <Clock size={16} /> Update terakhir: Baru saja
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          item={{
            title: "Total Deteksi (24 Jam)",
            value:
              typeof totalDetections === "number"
                ? totalDetections.toLocaleString()
                : totalDetections,
            delta: deltaTotal,
            tone: "slate",
            icon: Gauge,
            spark: sparkTotal,
            sparkLabels,
          }}
        />
        <MetricCard
          item={{
            title: "Insiden Pelanggaran",
            value:
              typeof totalIncidents === "number"
                ? totalIncidents.toLocaleString()
                : totalIncidents,
            delta: deltaViolations,
            tone: "rose",
            icon: Siren,
            spark: sparkViolations,
            sparkLabels,
          }}
        />
        <MetricCard
          item={{
            title: "Tingkat Kepatuhan",
            value:
              typeof complianceRate === "number"
                ? `${complianceRate.toFixed(2)}%`
                : `${complianceRate}%`,
            delta: deltaCompliance,
            tone: "emerald",
            icon: Shield,
            spark: sparkCompliance,
            sparkLabels,
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.36fr_0.84fr] gap-5">
        <Card
          title="Daftar Insiden Pelanggaran Terbaru"
          right={
            hasPermission("history") && (
              <button
                onClick={() => navigate(getDashboardPath("history"))}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium underline"
              >
                Lihat Semua
              </button>
            )
          }
          className="flex flex-col overflow-hidden"
          animate={false}
        >
          <div className="overflow-x-hidden">
            <table className="w-full table-auto text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] uppercase tracking-[0.14em]">
                  <th className="px-2.5 py-3 font-semibold whitespace-nowrap">
                    No
                  </th>
                  <th className="px-2.5 py-3 font-semibold whitespace-nowrap">
                    Detection ID
                  </th>
                  <th className="px-2.5 py-3 font-semibold whitespace-nowrap">
                    Waktu
                  </th>
                  <th className="w-full px-2.5 py-3 font-semibold">Lokasi</th>
                  {faceRecognitionEnabled && (
                    <th className="px-2.5 py-3 font-semibold whitespace-nowrap">
                      Nama
                    </th>
                  )}
                  <th className="px-2.5 py-3 font-semibold whitespace-nowrap">
                    Jenis
                  </th>
                  <th className="px-2.5 py-3 font-semibold text-center whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {incidents.length > 0 ? (
                  incidents.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 cursor-pointer transition"
                      onClick={() => setSelectedIncident(item)}
                    >
                      <td className="px-2.5 py-3 text-sm font-semibold text-slate-700">
                        {index + 1}
                      </td>
                      <td
                        className="px-2.5 py-3 text-[11px] font-mono text-slate-500 whitespace-nowrap"
                        title={getRawDetectionId(item)}
                      >
                        {formatDetectionId(item)}
                      </td>
                      <td className="px-2.5 py-3 text-sm font-medium text-slate-700 whitespace-nowrap">
                        {item.time || item.timestamp || "—"}
                      </td>
                      <td className="px-2.5 py-3 text-sm text-slate-600 max-w-0">
                        <div className="flex items-center gap-1.5">
                          <MapPin
                            size={13}
                            className="shrink-0 text-slate-400"
                          />
                          <span className="truncate">
                            {item.location || item.camera_name || "—"}
                          </span>
                        </div>
                      </td>
                      {faceRecognitionEnabled && (
                        <td className="px-2.5 py-3 text-sm text-slate-700 whitespace-nowrap">
                          {item.staff_name ||
                            item.person_name ||
                            item.identity_name ||
                            "—"}
                        </td>
                      )}
                      <td className="px-2.5 py-3">
                        <span className="inline-flex whitespace-nowrap bg-rose-100 text-rose-700 text-[11px] px-2 py-1 rounded-full font-semibold">
                          {item.type || item.event_type || item.name || "—"}
                        </span>
                      </td>
                      <td className="px-2.5 py-3 text-center">
                        <button className="text-slate-400 hover:text-slate-900">
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={faceRecognitionEnabled ? 7 : 6}
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
                    />
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
                    />
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

function SidebarNavLink({ to, icon: Icon, children, end = false, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 w-full p-3 rounded-lg transition shrink-0 ${isActive ? "bg-slate-800 text-white" : "hover:bg-slate-800"}`
      }
    >
      <Icon size={20} className="shrink-0" />
      <span className="truncate">{children}</span>
    </NavLink>
  );
}

function DashboardShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission, getAllowedTabs } = useAuth();
  const { addToast } = useToast();
  const { unreadCount } = useNotificationContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useRealtimeEvents();
  getAllowedTabs();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifDropdown(false);
    setShowUserDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest("[data-dropdown]")) {
        setShowNotifDropdown(false);
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      addToast({ type: "info", message: "Anda telah keluar" });
      navigate("/login", { replace: true });
    }
  };

  let displayRole = "User";
  let hasRoleError = false;

  if (user?._profileError || user?.role === null) {
    displayRole =
      typeof user?._profileError === "string"
        ? user._profileError
        : "Koneksi Terputus";
    hasRoleError = true;
  } else if (user?.role_label) {
    displayRole = user.role_label;
  } else if (user?.role) {
    displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex relative overflow-hidden">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 flex items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-400 shrink-0" />
            <span className="font-bold text-lg text-white truncate">
              VisionGuard AI
            </span>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white transition p-1"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-2 pb-1 shrink-0">
            Menu Utama
          </p>

          {hasPermission("home") && (
            <SidebarNavLink
              to={getDashboardPath("home")}
              icon={LayoutDashboard}
              end
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </SidebarNavLink>
          )}

          {hasPermission("monitoring") && (
            <SidebarNavLink
              to={getDashboardPath("monitoring")}
              icon={Monitor}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Live Monitoring
            </SidebarNavLink>
          )}

          {hasPermission("history") && (
            <SidebarNavLink
              to={getDashboardPath("history")}
              icon={AlertTriangle}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Riwayat Insiden
            </SidebarNavLink>
          )}

          {(hasPermission("identities") ||
            hasPermission("reports") ||
            hasPermission("cameras")) && (
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-4 pb-1 shrink-0">
              Manajemen
            </p>
          )}

          {hasPermission("identities") && (
            <SidebarNavLink
              to={getDashboardPath("identities")}
              icon={Users}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Identitas Staff
            </SidebarNavLink>
          )}

          {hasPermission("reports") && (
            <SidebarNavLink
              to={getDashboardPath("reports")}
              icon={FileText}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Laporan & Bukti
            </SidebarNavLink>
          )}

          {hasPermission("cameras") && (
            <SidebarNavLink
              to={getDashboardPath("cameras")}
              icon={Camera}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Manajemen Kamera
            </SidebarNavLink>
          )}

          {hasPermission("settings") && (
            <>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 pt-4 pb-1 shrink-0">
                Sistem
              </p>
              <SidebarNavLink
                to={getDashboardPath("settings")}
                icon={SettingsIcon}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pengaturan
              </SidebarNavLink>
            </>
          )}
        </nav>

        <div className="border-t border-slate-800 px-4 py-3 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-rose-900/20 hover:text-rose-400 transition text-sm text-left"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="truncate">Keluar</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-100 min-w-0">
        <header className="h-12 shrink-0 flex items-center justify-between px-3 lg:px-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-emerald-500 w-5 h-5 shrink-0" />
              <span className="font-bold text-sm text-slate-800 truncate">
                VisionGuard
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-1.5 ml-auto">
            <div className="relative" data-dropdown>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setShowNotifDropdown((value) => !value);
                  setShowUserDropdown(false);
                }}
                className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-700"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white ring-[1.5px] ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdown isOpen={showNotifDropdown} />
            </div>

            <div className="h-5 w-px bg-slate-200" />

            <div className="relative" data-dropdown>
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setShowUserDropdown((value) => !value);
                  setShowNotifDropdown(false);
                }}
                className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-100 transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                  <User size={14} />
                </div>
                <div className="hidden sm:flex flex-col items-start gap-0.5">
                  <span className="text-xs font-semibold text-slate-800 leading-none">
                    {user?.name || user?.username || "User"}
                  </span>
                  <span
                    className={`text-[9px] leading-none ${hasRoleError ? "text-rose-500 font-bold" : "text-slate-500"}`}
                  >
                    {displayRole}
                  </span>
                </div>
                <ChevronDown
                  size={12}
                  className="text-slate-400 hidden sm:block ml-0.5"
                />
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user?.name || user?.username || "User"}
                    </p>
                    <p
                      className={`text-[11px] ${hasRoleError ? "text-rose-500 font-bold" : "text-slate-500"}`}
                    >
                      {displayRole}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate(getDashboardPath("profile"));
                      setShowUserDropdown(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <User size={14} /> Profil
                  </button>
                  {hasPermission("settings") && (
                    <button
                      onClick={() => {
                        navigate(getDashboardPath("settings"));
                        setShowUserDropdown(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <SettingsIcon size={14} /> Pengaturan
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
                  >
                    <LogOut size={14} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function MonitoringRoute() {
  const { user } = useAuth();

  return <Monitoring currentUser={user} />;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingOrLoginRedirect />} />
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignUpPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardShell />
          </ProtectedRoute>
        }
      >
        <Route
          index
          element={
            <ProtectedRoute permission="home">
              <DashboardHomeTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="monitoring"
          element={
            <ProtectedRoute permission="monitoring">
              <MonitoringRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="history"
          element={
            <ProtectedRoute permission="history">
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="identities"
          element={
            <ProtectedRoute permission="identities">
              <Identities />
            </ProtectedRoute>
          }
        />
        <Route
          path="reports"
          element={
            <ProtectedRoute permission="reports">
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="cameras"
          element={
            <ProtectedRoute permission="cameras">
              <CameraManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute permission="settings">
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute permission="profile">
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <NotificationProvider>
            <AppContent />
          </NotificationProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
