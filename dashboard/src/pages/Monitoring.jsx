import { useState, useEffect, useRef } from "react";
import {
  Camera,
  Activity,
  Play,
  Square,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Sun,
  Moon,
  Grid2x2,
  Grid3x3,
  LayoutGrid,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
} from "lucide-react";

// ─── Mock Data ───────────────────────────────────────────────────────────────
const MOCK_CAMERAS = [
  { id: 1, name: "Entrance Gate A", location: "Main Entrance", online: true, hasAlert: false, lastAlert: null, alertTime: null, fps: 30, resolution: "1080p" },
  { id: 2, name: "Parking Lot B", location: "North Wing", online: true, hasAlert: true, lastAlert: "Motion Detected", alertTime: "2 min ago", fps: 25, resolution: "720p" },
  { id: 3, name: "Lobby Camera", location: "Building A", online: true, hasAlert: false, lastAlert: null, alertTime: null, fps: 30, resolution: "1080p" },
  { id: 4, name: "Server Room", location: "Basement", online: false, hasAlert: false, lastAlert: "Connection Lost", alertTime: "1 hr ago", fps: 0, resolution: "1080p" },
  { id: 5, name: "Corridor C2", location: "Floor 2", online: true, hasAlert: false, lastAlert: null, alertTime: null, fps: 28, resolution: "720p" },
  { id: 6, name: "Emergency Exit", location: "South Wing", online: true, hasAlert: true, lastAlert: "Door Opened", alertTime: "5 min ago", fps: 30, resolution: "1080p" },
  { id: 7, name: "Rooftop Cam", location: "Top Floor", online: true, hasAlert: false, lastAlert: null, alertTime: null, fps: 15, resolution: "4K" },
  { id: 8, name: "Loading Bay", location: "Warehouse", online: false, hasAlert: false, lastAlert: "Signal Weak", alertTime: "3 hr ago", fps: 0, resolution: "720p" },
];

const MOCK_LOGS = [
  { id: 1, timestamp: "14:32:01", camera: "Parking Lot B", event: "Motion Detected", severity: "warning", cameraId: 2 },
  { id: 2, timestamp: "14:28:45", camera: "Emergency Exit", event: "Door Opened", severity: "alert", cameraId: 6 },
  { id: 3, timestamp: "14:15:30", camera: "Entrance Gate A", event: "Person Identified", severity: "info", cameraId: 1 },
  { id: 4, timestamp: "13:59:12", camera: "Server Room", event: "Connection Lost", severity: "error", cameraId: 4 },
  { id: 5, timestamp: "13:45:00", camera: "Lobby Camera", event: "System Started", severity: "info", cameraId: 3 },
  { id: 6, timestamp: "13:30:55", camera: "Corridor C2", event: "Night Mode On", severity: "info", cameraId: 5 },
  { id: 7, timestamp: "13:10:22", camera: "Rooftop Cam", event: "Wind Detected", severity: "warning", cameraId: 7 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getSeverityStyle = (severity) => {
  switch (severity) {
    case "alert":  return { dot: "bg-red-500",    text: "text-red-400",    badge: "bg-red-500/10 text-red-400 border-red-500/20" };
    case "error":  return { dot: "bg-red-400",    text: "text-red-400",    badge: "bg-red-400/10 text-red-400 border-red-400/20" };
    case "warning":return { dot: "bg-amber-400",  text: "text-amber-400",  badge: "bg-amber-400/10 text-amber-400 border-amber-400/20" };
    default:       return { dot: "bg-blue-400",   text: "text-blue-400",   badge: "bg-blue-400/10 text-blue-400 border-blue-400/20" };
  }
};

const getGridClass = (layout) => {
  switch (layout) {
    case "2x2": return "grid-cols-2";
    case "3x3": return "grid-cols-3";
    case "4x4": return "grid-cols-4";
    default:    return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Single camera tile used in both grid and theatre strip */
function CameraTile({ camera, onClick, isSelected = false, compact = false }) {
  const isOffline = !camera.online;

  return (
    <div
      onClick={() => onClick && onClick(camera)}
      className={`
        group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200
        ${isSelected
          ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900"
          : "hover:ring-2 hover:ring-white/20 hover:ring-offset-1 hover:ring-offset-slate-900"
        }
        bg-slate-800 dark:bg-slate-800
      `}
    >
      {/* Snapshot / Placeholder */}
      <div className={`relative w-full ${compact ? "aspect-video" : "aspect-video"} bg-slate-900 flex items-center justify-center overflow-hidden`}>
        {isOffline ? (
          <div className="flex flex-col items-center gap-2 text-slate-600">
            <WifiOff className={compact ? "w-5 h-5" : "w-8 h-8"} />
            {!compact && <span className="text-xs">Offline</span>}
          </div>
        ) : (
          <img
            src={`https://picsum.photos/seed/cam${camera.id}/640/360`}
            alt={camera.name}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        )}

        {/* Top-left: LIVE badge */}
        {!isOffline && (
          <span className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
        )}

        {/* Top-right: Alert badge */}
        {camera.hasAlert && (
          <span className="absolute top-2 right-2 bg-amber-500/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" />
            {!compact && "Alert"}
          </span>
        )}

        {/* Bottom overlay: name + stats */}
        {!compact && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2">
            <p className="text-white text-xs font-medium truncate">{camera.name}</p>
            <p className="text-slate-400 text-[10px] truncate">{camera.location}</p>
          </div>
        )}

        {/* Expand icon on hover */}
        {!compact && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/60 rounded-full p-2">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Compact label below */}
      {compact && (
        <div className="px-2 py-1">
          <p className="text-white text-[10px] font-medium truncate">{camera.name}</p>
        </div>
      )}
    </div>
  );
}

/** Engine control buttons - reusable */
function EngineControls({ engineStatus, isLoading, onAction, dark = false }) {
  const base = dark ? "border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white" : "border-slate-200 hover:bg-slate-100 text-slate-700";
  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => onAction("start")}
        disabled={engineStatus === "running" || isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${base}`}
      >
        <Play className="w-3.5 h-3.5 text-emerald-400" />
        Start Engine
      </button>
      <button
        onClick={() => onAction("stop")}
        disabled={engineStatus === "stopped" || isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${base}`}
      >
        <Square className="w-3.5 h-3.5 text-red-400" />
        Stop Engine
      </button>
      <button
        onClick={() => onAction("restart")}
        disabled={isLoading}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${base}`}
      >
        <RotateCcw className={`w-3.5 h-3.5 text-blue-400 ${isLoading ? "animate-spin" : ""}`} />
        Restart Engine
      </button>
    </div>
  );
}

/** Collapsible sidebar */
function Sidebar({ open, logs, engineStatus, isLoading, onEngineAction, dark }) {
  const textPrimary  = dark ? "text-slate-100" : "text-slate-800";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const borderColor  = dark ? "border-slate-700" : "border-slate-200";
  const bg           = dark ? "bg-slate-900" : "bg-white";
  const divider      = dark ? "divide-slate-700/50" : "divide-slate-100";

  return (
    <aside
      className={`
        flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out
        ${open ? "w-72" : "w-0"}
        ${bg} border-l ${borderColor}
      `}
    >
      <div className="w-72 h-full flex flex-col overflow-hidden">
        {/* Engine Status */}
        <div className={`px-4 pt-4 pb-3 border-b ${borderColor}`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textSecondary}`}>Engine Control</h3>

          {/* Status pill */}
          <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${dark ? "bg-slate-800" : "bg-slate-50"}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${engineStatus === "running" ? "bg-emerald-400 animate-pulse" : engineStatus === "error" ? "bg-red-400" : "bg-slate-500"}`} />
            <span className={`text-xs font-medium capitalize ${textPrimary}`}>{engineStatus}</span>
          </div>

          <EngineControls engineStatus={engineStatus} isLoading={isLoading} onAction={onEngineAction} dark={dark} />
        </div>

        {/* Activity Log */}
        <div className="flex-1 overflow-y-auto">
          <div className={`px-4 py-3 border-b ${borderColor} sticky top-0 ${bg} z-10`}>
            <div className="flex items-center justify-between">
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Activity Log</h3>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>{logs.length}</span>
            </div>
          </div>

          <ul className={`divide-y ${divider}`}>
            {logs.map((log) => {
              const style = getSeverityStyle(log.severity);
              return (
                <li key={log.id} className={`px-4 py-3 hover:${dark ? "bg-slate-800/50" : "bg-slate-50"} transition-colors`}>
                  <div className="flex items-start gap-2.5">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${textPrimary}`}>{log.event}</p>
                      <p className={`text-[10px] truncate ${textSecondary}`}>{log.camera}</p>
                      <p className={`text-[10px] mt-0.5 ${textSecondary}`}>{log.timestamp}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Monitoring() {
  const [dark, setDark]                   = useState(true);
  const [engineStatus, setEngineStatus]   = useState("running");
  const [isLoading, setIsLoading]         = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [logs]                            = useState(MOCK_LOGS);
  const [cameras]                         = useState(MOCK_CAMERAS);
  const [gridLayout, setGridLayout]       = useState("auto");
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  // Theme classes
  const bgPage       = dark ? "bg-slate-950 text-white"         : "bg-slate-100 text-slate-900";
  const bgHeader     = dark ? "bg-slate-900 border-slate-800"   : "bg-white border-slate-200";
  const textSecondary = dark ? "text-slate-400"                 : "text-slate-500";

  const onlineCount = cameras.filter((c) => c.online).length;
  const alertCount  = cameras.filter((c) => c.hasAlert).length;

  const handleEngineControl = async (action) => {
    setIsLoading(true);
    try {
      await fetch(`http://localhost:5001/api/engine/${action}`, { method: "POST" });
      setEngineStatus(action === "stop" ? "stopped" : "running");
    } catch {
      setEngineStatus("error");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  // ── Theatre Mode ───────────────────────────────────────────────────────────
  const TheatreView = () => {
    const others = cameras.filter((c) => c.id !== selectedCamera.id);

    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Main large stream */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {selectedCamera.online ? (
            <img
              src={`https://picsum.photos/seed/cam${selectedCamera.id}/1280/720`}
              alt={selectedCamera.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-3">
              <WifiOff className="w-16 h-16" />
              <p className="text-lg font-medium">Camera Offline</p>
            </div>
          )}

          {/* Overlay: top-left info */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {selectedCamera.online && (
              <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
            )}
            <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
              <p className="text-white text-sm font-semibold">{selectedCamera.name}</p>
              <p className="text-slate-300 text-xs">{selectedCamera.location}</p>
            </div>
          </div>

          {/* Overlay: top-right stats */}
          <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
            <span className="bg-black/70 backdrop-blur-sm text-slate-300 text-xs px-2 py-1 rounded">{selectedCamera.resolution}</span>
            <span className="bg-black/70 backdrop-blur-sm text-slate-300 text-xs px-2 py-1 rounded">{selectedCamera.fps} FPS</span>
          </div>

          {/* Overlay: alert banner */}
          {selectedCamera.hasAlert && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {selectedCamera.lastAlert} — {selectedCamera.alertTime}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        <div className={`flex-shrink-0 border-t ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-50"} px-4 py-3`}>
          <p className={`text-xs font-medium mb-2 ${textSecondary}`}>Other Cameras ({others.length})</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {others.map((cam) => (
              <div key={cam.id} className="w-36 flex-shrink-0">
                <CameraTile camera={cam} onClick={setSelectedCamera} compact />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ── Grid View ──────────────────────────────────────────────────────────────
  const GridView = () => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className={`grid ${getGridClass(gridLayout)} gap-3`}>
        {cameras.map((cam) => (
          <CameraTile key={cam.id} camera={cam} onClick={setSelectedCamera} />
        ))}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col h-full ${bgPage} transition-colors duration-300`}>

      {/* ── Header ── */}
      <header className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b ${bgHeader} transition-colors duration-300`}>

        {/* Back button (theatre mode only) */}
        {selectedCamera && (
          <button
            onClick={() => setSelectedCamera(null)}
            className={`flex items-center gap-1.5 text-sm font-medium ${textSecondary} hover:text-white transition-colors mr-1`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {/* Title */}
        <div className="flex items-center gap-2">
          <Camera className={`w-4 h-4 ${textSecondary}`} />
          <h1 className="text-sm font-semibold">
            {selectedCamera ? selectedCamera.name : "Live Monitoring"}
          </h1>
        </div>

        {/* Stats badges */}
        {!selectedCamera && (
          <div className="flex items-center gap-2 ml-2">
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
              <Wifi className="w-3 h-3" />
              {onlineCount} Online
            </span>
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
              <WifiOff className="w-3 h-3" />
              {cameras.length - onlineCount} Offline
            </span>
            {alertCount > 0 && (
              <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-500/10 text-amber-400">
                <Bell className="w-3 h-3" />
                {alertCount} Alert
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Grid layout selector (grid view only) */}
        {!selectedCamera && (
          <div className={`flex items-center gap-1 p-1 rounded-lg ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
            {[
              { value: "auto", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { value: "2x2",  icon: <Grid2x2  className="w-3.5 h-3.5" /> },
              { value: "3x3",  icon: <Grid3x3  className="w-3.5 h-3.5" /> },
            ].map(({ value, icon }) => (
              <button
                key={value}
                onClick={() => setGridLayout(value)}
                className={`p-1.5 rounded-md transition-colors text-xs ${
                  gridLayout === value
                    ? dark ? "bg-slate-700 text-white" : "bg-white text-slate-900 shadow-sm"
                    : textSecondary
                }`}
                title={value}
              >
                {icon}
              </button>
            ))}
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setDark((d) => !d)}
          className={`p-2 rounded-lg transition-colors ${dark ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          title="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className={`p-2 rounded-lg transition-colors ${dark ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedCamera ? <TheatreView /> : <GridView />}
        </div>

        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          logs={logs}
          engineStatus={engineStatus}
          isLoading={isLoading}
          onEngineAction={handleEngineControl}
          dark={dark}
        />
      </div>
    </div>
  );
}
