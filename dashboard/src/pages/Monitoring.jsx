import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Play,
  Square,
  RotateCcw,
  RotateCw,
  Loader2,
  Sun,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Activity,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Image,
  Radio,
  ChevronDown,
  ChevronUp,
  Pin,
  Settings,
  Users,
  Gauge,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useSocket, useSocketEvent } from "../hooks/useSocket";

const API_BASE = "https://api.foodiserver.my.id";

const SEVERITY_STYLES = {
  alert: { dot: "bg-red-500", text: "text-red-400" },
  warning: { dot: "bg-amber-400", text: "text-amber-500" },
  info: { dot: "bg-sky-400", text: "text-sky-500" },
};

const MOCK_EVENTS = [
  {
    id: 1,
    message: "Helmet missing detected",
    severity: "alert",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
  {
    id: 2,
    message: "Safety shoes compliant",
    severity: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 6),
  },
  {
    id: 3,
    message: "Mask improperly worn",
    severity: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
  },
  {
    id: 4,
    message: "Valid SOP compliance confirmed",
    severity: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 18),
  },
];

const formatTimestamp = (date) => {
  const value = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(value.getTime())) return "--:--";
  return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getSeverityStyle = (severity) =>
  SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;

function StreamViewer({
  streamStatus,
  onRetry,
  resolution,
  fps,
  dark,
  cameraName,
  stats,
  onSnapshot,
}) {
  const [streamKey, setStreamKey] = useState(0);
  const [selectedResolution, setSelectedResolution] = useState("1080p (FHD)");
  const [showResDropdown, setShowResDropdown] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const [rotation, setRotation] = useState(0); // 0 = landscape, 90 = portrait CW, -90 = portrait CCW
  const hasNotifiedLive = useRef(false);

  const resolutions = ["480p (SD)", "720p (HD)", "1080p (FHD)", "1440p (QHD)"];

  // Stable stream URL - only changes when streamKey changes (manual retry)
  const streamSrc = useMemo(
    () => `${API_BASE}/api/stream/video?k=${streamKey}`,
    [streamKey],
  );

  const handleRotate = () => {
    setRotation((prev) => {
      // Cycle: 0 → 90 → 180 → 270 → 0
      return (prev + 90) % 360;
    });
  };

  // When rotated 90 or 270 degrees, swap width/height so image fits within the container
  const isPortrait = rotation === 90 || rotation === 270;
  const rotationLabel = {
    0: "Landscape",
    90: "Portrait ↻",
    180: "Inverted",
    270: "Portrait ↺",
  }[rotation];

  // Live clock that updates every second independently of re-renders
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setClockTime(
        `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}, ${pad(now.getHours())}.${pad(now.getMinutes())}.${pad(now.getSeconds())}`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Reset the "notified live" flag whenever stream goes non-live
  useEffect(() => {
    if (streamStatus !== "live") {
      hasNotifiedLive.current = false;
    }
  }, [streamStatus]);

  const handleImageError = (e) => {
    console.error("[StreamViewer] Image load error:", e);
    console.error("[StreamViewer] Failed URL:", streamSrc);
    setIsImageLoaded(false);
    hasNotifiedLive.current = false;
    onRetry("error");
  };

  const handleImageLoad = () => {
    console.log("[StreamViewer] Image loaded successfully");
    setIsImageLoaded(true);
    // Notify parent only once to transition to "live" — prevents re-render loop
    if (!hasNotifiedLive.current) {
      hasNotifiedLive.current = true;
      onRetry("live");
    }
  };

  const containerClass = dark ? "bg-slate-950" : "bg-slate-100";
  const innerBg = dark
    ? "bg-gradient-to-b from-slate-800 to-slate-950"
    : "bg-gradient-to-b from-slate-700 to-slate-800";

  // Preload image saat connecting untuk mencegah flicker
  const showConnecting = streamStatus === "connecting";
  const showError = streamStatus === "error";
  const showOffline = streamStatus === "offline";

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl ${containerClass} group`}
    >
      {/* Hidden image loader saat connecting - preload tapi UI tetap showing loader */}
      {(showConnecting || (streamStatus === "live" && !isImageLoaded)) && (
        <img
          src={streamSrc}
          alt=""
          className="hidden"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {/* Visible image hanya saat live dan sudah loaded */}
      {streamStatus === "live" && isImageLoaded && (
        <div className="h-full w-full flex items-center justify-center overflow-hidden">
          <img
            src={streamSrc}
            alt="Live stream"
            className="transition-transform duration-300 ease-in-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              // When portrait, swap so image fills the container correctly
              maxWidth: isPortrait ? "100vh" : "100%",
              maxHeight: isPortrait ? "100vw" : "100%",
              objectFit: "contain",
            }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        </div>
      )}

      {/* Connecting Overlay - tampil di atas image dengan backdrop blur */}
      {showConnecting && (
        <div
          className={`absolute inset-0 ${innerBg} flex flex-col items-center justify-center z-10`}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-white">
            <p className="text-lg font-medium italic">
              {cameraName || "Camera"}
            </p>
            <div className="w-20 h-20 rounded-full border-2 border-white/30 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white/70" />
            </div>
            <p className="text-sm text-white/60">Menghubungkan ke stream...</p>
          </div>
        </div>
      )}

      {/* Error/Offline Overlay */}
      {(showError || showOffline) && !isImageLoaded && (
        <div
          className={`absolute inset-0 ${innerBg} flex flex-col items-center justify-center z-10`}
        >
          <div className="flex flex-col items-center justify-center gap-4 text-white">
            <p className="text-lg font-medium italic">
              {cameraName || "Camera"}
            </p>
            <button
              onClick={() => {
                setIsImageLoaded(false);
                hasNotifiedLive.current = false;
                setStreamKey((k) => k + 1);
                onRetry("connecting");
              }}
              className="w-20 h-20 rounded-full border-2 border-white/30 hover:border-white/60 flex items-center justify-center transition-colors group"
            >
              <Play
                className="w-8 h-8 text-white/70 group-hover:text-white group-hover:scale-110 transition-all ml-1"
                fill="currentColor"
              />
            </button>
            <p className="text-sm text-white/60">
              {showError
                ? "Gagal memuat stream. Klik untuk mencoba lagi."
                : "Klik untuk memulai live streaming"}
            </p>
          </div>
        </div>
      )}

      {/* Live Badge - hanya tampil saat live dan loaded */}
      {streamStatus === "live" && isImageLoaded && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full z-20">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span className="text-white text-xs font-bold tracking-wide">
            LIVE
          </span>
        </div>
      )}

      {/* Timestamp - hanya tampil saat live dan loaded */}
      {streamStatus === "live" && isImageLoaded && (
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 z-20">
          <span className="text-amber-400 text-base font-mono font-medium">
            {clockTime}
          </span>
        </div>
      )}

      {/* Stop Button - hanya tampil saat live dan loaded */}
      {streamStatus === "live" && isImageLoaded && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => {
              setIsImageLoaded(false);
              hasNotifiedLive.current = false;
              onRetry("offline");
            }}
            className="flex items-center gap-2 bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <Square className="w-4 h-4" fill="currentColor" />
            Hentikan Streaming
          </button>
        </div>
      )}

      {/* Snapshot Button - hanya tampil saat live dan loaded */}
      {streamStatus === "live" && isImageLoaded && (
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <button
            onClick={onSnapshot}
            className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            <Image className="w-3.5 h-3.5" />
            Snapshot
          </button>
        </div>
      )}

      {/* Rotate Button - always visible when live */}
      {streamStatus === "live" && isImageLoaded && (
        <div className="absolute top-3 right-3 z-30">
          <button
            onClick={handleRotate}
            title="Rotate feed"
            className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            {rotationLabel}
          </button>
        </div>
      )}

      {/* Resolution Selector - tampil di semua state */}
      <div className="absolute bottom-6 right-6 z-30">
        <button
          onClick={() => setShowResDropdown(!showResDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-medium hover:bg-emerald-600/30 transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          {selectedResolution}
          <ChevronDown
            className={`w-3 h-3 transition-transform ${showResDropdown ? "rotate-180" : ""}`}
          />
        </button>

        {showResDropdown && (
          <div
            className={`absolute bottom-full right-0 mb-1 rounded-lg shadow-lg overflow-hidden ${dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}
          >
            {resolutions.map((res) => (
              <button
                key={res}
                onClick={() => {
                  setSelectedResolution(res);
                  setShowResDropdown(false);
                }}
                className={`block w-full text-left px-3 py-2 text-xs ${dark ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"} ${selectedResolution === res ? (dark ? "bg-slate-700" : "bg-slate-100") : ""}`}
              >
                {res}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MonitoringHeader({
  dark,
  connectionStatus,
  engineStatus,
  sidebarOpen,
  isSocketConnected,
  onToggleTheme,
  onToggleSidebar,
}) {
  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-red-500",
    connecting: "bg-amber-400",
  };

  const engineColors = {
    running: "bg-emerald-500",
    stopped: "bg-slate-400",
    error: "bg-red-500",
  };

  const headerBg = dark
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200";
  const textColor = dark ? "text-white" : "text-slate-900";
  const subTextColor = dark ? "text-slate-400" : "text-slate-500";

  return (
    <header
      className={`flex items-center justify-between px-5 py-3 border-b ${headerBg}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${dark ? "bg-slate-800" : "bg-slate-100"}`}
        >
          <Camera className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h1 className={`text-sm font-semibold ${textColor}`}>
            Live Monitoring
          </h1>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${statusColors[connectionStatus] || statusColors.connecting}`}
              />
              <span className={`text-xs ${subTextColor} capitalize`}>
                {connectionStatus}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${engineColors[engineStatus] || engineColors.stopped} ${engineStatus === "running" ? "animate-pulse" : ""}`}
              />
              <span className={`text-xs ${subTextColor} capitalize`}>
                {engineStatus}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                isSocketConnected
                  ? dark
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-emerald-100 text-emerald-600"
                  : dark
                    ? "bg-slate-800 text-slate-500"
                    : "bg-slate-100 text-slate-400"
              }`}
              title={
                isSocketConnected
                  ? "Real-time via Socket.IO"
                  : "Fallback: REST polling"
              }
            >
              {isSocketConnected ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isSocketConnected ? "Real-time" : "Polling"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"}`}
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-600"}`}
        >
          {sidebarOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}

function CollapsibleSection({
  title,
  icon: Icon,
  children,
  defaultExpanded = false,
  pinned = false,
  onTogglePin,
  dark,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const textColor = dark ? "text-slate-500" : "text-slate-400";
  const iconColor = dark ? "text-slate-500" : "text-slate-400";

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
          <h3
            className={`text-sm font-semibold uppercase tracking-wider ${textColor}`}
          >
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {onTogglePin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin();
              }}
              className={`p-1 rounded transition-colors ${
                pinned
                  ? dark
                    ? "text-emerald-400 bg-emerald-400/10"
                    : "text-emerald-600 bg-emerald-100"
                  : dark
                    ? "text-slate-600 hover:text-slate-400"
                    : "text-slate-400 hover:text-slate-600"
              }`}
              title={pinned ? "Unpin section" : "Pin section"}
            >
              <Pin className={`w-3 h-3 ${pinned ? "fill-current" : ""}`} />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className={`w-4 h-4 ${textColor}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${textColor}`} />
          )}
        </div>
      </button>
      {isExpanded && <div className="mt-2">{children}</div>}
    </div>
  );
}

function CameraInfoCard({ cameraInfo, dark }) {
  const cardBg = dark ? "bg-slate-800/50" : "bg-slate-50";
  const textColor = dark ? "text-white" : "text-slate-900";
  const subTextColor = dark ? "text-slate-400" : "text-slate-500";

  return (
    <div className={`p-4 ${cardBg} rounded-xl`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-semibold ${textColor}`}>{cameraInfo.name}</h3>
          <p className={`text-sm ${subTextColor}`}>{cameraInfo.location}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${cameraInfo.status === "online" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}
        >
          {cameraInfo.status}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className={`flex items-center gap-1.5 ${subTextColor}`}>
          <Radio className="w-3.5 h-3.5" />
          <span>{cameraInfo.resolution}</span>
        </div>
        <div className={`flex items-center gap-1.5 ${subTextColor}`}>
          <Activity className="w-3.5 h-3.5" />
          <span>{cameraInfo.fps} FPS</span>
        </div>
      </div>
    </div>
  );
}

function EngineControls({ engineStatus, isLoading, onAction, dark }) {
  const getButtonClasses = (action, isDisabled) => {
    const base =
      "flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all";
    const disabled = isDisabled
      ? " opacity-50 cursor-not-allowed"
      : " hover:scale-105";

    if (action === "start") {
      return `${base} bg-emerald-600 text-white hover:bg-emerald-500${disabled}`;
    }
    if (action === "stop") {
      return `${base} bg-red-600 text-white hover:bg-red-500${disabled}`;
    }
    return `${base} bg-amber-600 text-white hover:bg-amber-500${disabled}`;
  };

  const textColor = dark ? "text-white" : "text-slate-900";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-sm ${textColor}`}>Engine Status</span>
        <span
          className={`text-xs font-medium capitalize ${
            engineStatus === "running"
              ? "text-emerald-400"
              : engineStatus === "error"
                ? "text-red-400"
                : "text-slate-400"
          }`}
        >
          {engineStatus}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onAction("start")}
          disabled={isLoading || engineStatus === "running"}
          className={getButtonClasses(
            "start",
            isLoading || engineStatus === "running",
          )}
        >
          <Play className="w-4 h-4" />
          Start
        </button>
        <button
          onClick={() => onAction("stop")}
          disabled={isLoading || engineStatus === "stopped"}
          className={getButtonClasses(
            "stop",
            isLoading || engineStatus === "stopped",
          )}
        >
          <Square className="w-4 h-4" />
          Stop
        </button>
        <button
          onClick={() => onAction("restart")}
          disabled={isLoading}
          className={getButtonClasses("restart", isLoading)}
        >
          <RotateCcw className="w-4 h-4" />
          Restart
        </button>
      </div>
    </div>
  );
}

function DetectionStats({ stats, dark }) {
  const cardBg = dark ? "bg-slate-800/50" : "bg-slate-50";
  const textColor = dark ? "text-white" : "text-slate-900";
  const subTextColor = dark ? "text-slate-400" : "text-slate-500";

  const StatItem = ({ label, value, icon: Icon, color }) => (
    <div className={`${cardBg} rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color}`} />
        <p className={`text-[10px] uppercase tracking-wider ${subTextColor}`}>
          {label}
        </p>
      </div>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatItem
        label="Detections"
        value={stats.detections}
        icon={Eye}
        color="text-emerald-400"
      />
      <StatItem
        label="Violations"
        value={stats.violations}
        icon={ShieldAlert}
        color="text-red-400"
      />
      <StatItem
        label="Valid SOP"
        value={stats.valid}
        icon={ShieldCheck}
        color="text-sky-400"
      />
      <div className={`${cardBg} rounded-xl p-3`}>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <p className={`text-[10px] uppercase tracking-wider ${subTextColor}`}>
            Compliance
          </p>
        </div>
        <p className={`text-xl font-bold ${textColor}`}>{stats.compliance}%</p>
        <div
          className={`w-full h-1.5 ${dark ? "bg-slate-700" : "bg-slate-200"} rounded-full mt-2`}
        >
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${stats.compliance}%` }}
          />
        </div>
      </div>
      <StatItem
        label="Active Tracks"
        value={stats.activeTracks}
        icon={Users}
        color="text-violet-400"
      />
      <StatItem
        label="FPS"
        value={stats.fps}
        icon={Gauge}
        color="text-cyan-400"
      />
    </div>
  );
}

function ActivityFeed({ events, dark }) {
  const scrollRef = useRef(null);
  const [userScrolled, setUserScrolled] = useState(false);

  useEffect(() => {
    if (scrollRef.current && !userScrolled) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events, userScrolled]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop } = scrollRef.current;
      setUserScrolled(scrollTop > 10);
    }
  };

  const bgColor = dark ? "bg-slate-900" : "bg-white";
  const borderColor = dark ? "border-slate-800" : "border-slate-200";
  const textColor = dark ? "text-slate-200" : "text-slate-700";
  const subTextColor = dark ? "text-slate-500" : "text-slate-400";

  return (
    <div className={`flex-1 flex flex-col min-h-0 ${bgColor}`}>
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${borderColor}`}
      >
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${subTextColor}`} />
          <h3
            className={`text-sm font-semibold ${dark ? "text-slate-200" : "text-slate-700"}`}
          >
            Activity Feed
          </h3>
        </div>
        <span className={`text-xs ${subTextColor}`}>
          {events.length} events
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto"
      >
        {events.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-32 ${subTextColor}`}
          >
            <Activity className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No events yet</p>
          </div>
        ) : (
          events.map((event, index) => {
            const style = getSeverityStyle(event.severity);
            return (
              <div
                key={event.id}
                className={`flex items-start gap-2.5 px-4 py-2.5 ${dark ? "hover:bg-slate-800/50" : "hover:bg-slate-50"} transition-colors border-b ${borderColor} last:border-b-0`}
                style={{
                  animation: index < 3 ? "slideIn 200ms ease-out" : undefined,
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${style.dot}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${textColor} truncate`}>
                    {event.message}
                  </p>
                  <p className={`text-[10px] ${subTextColor} mt-0.5`}>
                    {formatTimestamp(event.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {userScrolled && (
        <button
          onClick={() => {
            if (scrollRef.current) {
              scrollRef.current.scrollTop = 0;
              setUserScrolled(false);
            }
          }}
          className={`absolute bottom-4 right-4 p-2 rounded-full shadow-lg ${dark ? "bg-slate-700 text-white" : "bg-white text-slate-900"} hover:scale-110 transition-transform`}
        >
          <Activity className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function InfoSidebar({
  dark,
  sidebarOpen,
  cameraInfo,
  stats,
  events,
  engineStatus,
  isLoading,
  onEngineAction,
  pinnedSections,
  onTogglePin,
}) {
  const sidebarBg = dark
    ? "bg-slate-900 border-slate-800"
    : "bg-white border-slate-200";
  const sectionBorder = dark ? "border-slate-800" : "border-slate-200";

  return (
    <aside
      className={`flex flex-col border-l transition-all duration-300 ease-in-out ${sidebarBg} ${
        sidebarOpen
          ? "w-80 translate-x-0"
          : "w-0 translate-x-full opacity-0 overflow-hidden"
      }`}
    >
      <div className={`p-4 border-b ${sectionBorder}`}>
        <CollapsibleSection
          title="Camera Overview"
          icon={Camera}
          defaultExpanded={pinnedSections.camera}
          pinned={pinnedSections.camera}
          onTogglePin={() => onTogglePin("camera")}
          dark={dark}
        >
          <CameraInfoCard cameraInfo={cameraInfo} dark={dark} />
        </CollapsibleSection>
      </div>

      <div className={`p-4 border-b ${sectionBorder}`}>
        <CollapsibleSection
          title="Engine Controls"
          icon={Settings}
          defaultExpanded={pinnedSections.engine}
          pinned={pinnedSections.engine}
          onTogglePin={() => onTogglePin("engine")}
          dark={dark}
        >
          <EngineControls
            engineStatus={engineStatus}
            isLoading={isLoading}
            onAction={onEngineAction}
            dark={dark}
          />
        </CollapsibleSection>
      </div>

      <div className={`p-4 border-b ${sectionBorder}`}>
        <CollapsibleSection
          title="Detection Summary"
          icon={ShieldCheck}
          defaultExpanded={pinnedSections.stats}
          pinned={pinnedSections.stats}
          onTogglePin={() => onTogglePin("stats")}
          dark={dark}
        >
          <DetectionStats stats={stats} dark={dark} />
        </CollapsibleSection>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className={`p-4 border-b ${sectionBorder}`}>
          <div className="flex items-center gap-2">
            <Radio
              className={`w-4 h-4 ${dark ? "text-slate-500" : "text-slate-400"}`}
            />
            <h3
              className={`text-sm font-semibold uppercase tracking-wider ${dark ? "text-slate-500" : "text-slate-400"}`}
            >
              Live Activity
            </h3>
          </div>
        </div>
        <ActivityFeed events={events} dark={dark} />
      </div>
    </aside>
  );
}

export default function Monitoring() {
  const [dark, setDark] = useState(false);
  const [engineStatus, setEngineStatus] = useState("running");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [streamStatus, setStreamStatus] = useState("connecting");
  const [autoPlay, setAutoPlay] = useState(true);
  const [cameraInfo, setCameraInfo] = useState({
    name: "Main Entrance",
    location: "Plant A",
    resolution: "1080p",
    fps: 30,
    status: "online",
  });
  const [stats, setStats] = useState({
    detections: 0,
    violations: 0,
    valid: 0,
    compliance: 0,
    fps: 0,
    activeTracks: 0,
  });
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [pinnedSections, setPinnedSections] = useState({
    camera: false,
    engine: false,
    stats: true,
  });

  const { isConnected, emit } = useSocket();
  const connectionStatus = isConnected ? "online" : "offline";

  const pageBg = dark
    ? "bg-slate-950 text-white"
    : "bg-slate-100 text-slate-900";

  // --- Helpers to map backend data to UI format ---

  const mapStatsFromBackend = useCallback((data) => {
    const totalValid = data.total_valid ?? data.valid ?? 0;
    const totalViolations = data.total_pelanggaran ?? data.violations ?? 0;
    const total = totalValid + totalViolations;
    return {
      detections: total,
      violations: totalViolations,
      valid: totalValid,
      compliance: total > 0 ? Math.round((totalValid / total) * 100) : 0,
      fps: data.fps ?? 0,
      activeTracks: data.active_tracks ?? 0,
    };
  }, []);

  const mapDetectionToEvent = useCallback((data) => {
    const isViolation = data.status === "violation" || data.status === "pelanggaran";
    return {
      id: data.id ?? `${data.track_id}-${data.timestamp}`,
      message: `${data.name || "Person"} — ${data.status || "detected"}`,
      severity: isViolation ? "alert" : "info",
      timestamp: data.timestamp || new Date().toISOString(),
      photoPath: data.photo_path || null,
    };
  }, []);

  // --- Socket event listeners ---

  useSocketEvent("engine_status", (data) => {
    if (data?.status) {
      setEngineStatus(data.status);
    }
  });

  useSocketEvent("stats_update", (data) => {
    if (!data) return;
    setStats(mapStatsFromBackend(data));
    if (data.engine_status) {
      setEngineStatus(data.engine_status);
    }
  });

  useSocketEvent("detection_event", (data) => {
    if (!data) return;
    const newEvent = mapDetectionToEvent(data);
    setEvents((prev) => [newEvent, ...prev].slice(0, 50));
  });

  useSocketEvent("log", (data) => {
    if (data) {
      console.log(`[Socket Log] [${data.level}] ${data.message}`);
    }
  });

  // --- Engine control: prefer socket when connected, fallback to REST ---

  const handleEngineControl = async (action) => {
    setIsLoading(true);
    try {
      if (isConnected) {
        emit("engine_command", { command: action });
        setEngineStatus(action === "stop" ? "stopped" : "running");
      } else {
        await fetch(`${API_BASE}/api/engine/${action}`, { method: "POST" });
        setEngineStatus(action === "stop" ? "stopped" : "running");
      }
    } catch {
      setEngineStatus("error");
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  const handleRetryStream = (nextStatus) => {
    if (nextStatus) {
      setStreamStatus(nextStatus);
    }
  };

  const handleSnapshot = () => {
    window.open(`${API_BASE}/api/stream/snapshot?t=${Date.now()}`, "_blank");
  };

  const handleTogglePin = (section) => {
    setPinnedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // --- REST polling with hybrid strategy ---
  // When socket is connected: slow down polling (health check only).
  // When socket is disconnected: poll at normal intervals as fallback.

  useEffect(() => {
    let isMounted = true;
    const statusInterval = isConnected ? 30000 : 5000;

    const fetchStatus = async () => {
      const url = `${API_BASE}/api/status`;
      try {
        const res = await fetch(url, { mode: "cors" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;
        setEngineStatus(data.engine_status || engineStatus);
        setCameraInfo((prev) => ({
          ...prev,
          name: data.camera_name || prev.name,
          location: data.camera_location || prev.location,
          resolution: data.resolution || prev.resolution,
          fps: data.fps || prev.fps,
          status: data.camera_status || prev.status,
        }));
        if (autoPlay) {
          const isLive =
            data.engine_status === "running" || data.stream_status === "live";
          setStreamStatus(isLive ? "live" : "offline");
        }
      } catch (err) {
        console.error("[Monitoring] Status fetch error:", err);
        if (!isMounted) return;
        if (autoPlay) {
          setStreamStatus("offline");
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, statusInterval);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [engineStatus, autoPlay, isConnected]);

  useEffect(() => {
    if (isConnected) return;
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/stats`);
        if (!res.ok) throw new Error("stats");
        const data = await res.json();
        if (!isMounted) return;
        setStats(mapStatsFromBackend(data));
      } catch {
        if (!isMounted) return;
        setStats((prev) => ({
          ...prev,
          compliance: prev.compliance || 76,
          detections: prev.detections || 320,
          violations: prev.violations || 24,
          valid: prev.valid || 296,
        }));
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isConnected, mapStatsFromBackend]);

  useEffect(() => {
    if (isConnected) return;
    let isMounted = true;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/events?limit=20`);
        if (!res.ok) throw new Error("events");
        const data = await res.json();
        if (!isMounted) return;
        const mapped = (data.events || data || []).map((event, index) => ({
          id: event.id ?? `${event.timestamp}-${index}`,
          message: event.message || event.description || "Detection event",
          severity: event.severity || "info",
          timestamp: event.timestamp || new Date(),
          photoPath: event.photo_path || null,
        }));
        setEvents(mapped.slice(0, 20));
      } catch {
        if (!isMounted) return;
        setEvents(MOCK_EVENTS);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isConnected]);

  const resolutionText = useMemo(
    () => cameraInfo.resolution || "--",
    [cameraInfo.resolution],
  );
  const fpsText = useMemo(() => cameraInfo.fps || "--", [cameraInfo.fps]);

  return (
    <div
      className={`h-full flex flex-col ${pageBg} transition-colors duration-300`}
    >
      <MonitoringHeader
        dark={dark}
        connectionStatus={connectionStatus}
        engineStatus={engineStatus}
        sidebarOpen={sidebarOpen}
        isSocketConnected={isConnected}
        onToggleTheme={() => setDark((prev) => !prev)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          <div className="flex-1 min-h-[320px]">
            <StreamViewer
              streamStatus={streamStatus}
              onRetry={handleRetryStream}
              resolution={resolutionText}
              fps={fpsText}
              dark={dark}
              cameraName={cameraInfo.name}
              stats={stats}
              onSnapshot={handleSnapshot}
            />
          </div>

          <div className="flex items-center justify-center gap-3 -mt-2">
            <button
              onClick={() => setAutoPlay((prev) => !prev)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                autoPlay
                  ? dark
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : dark
                    ? "bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full transition-colors ${autoPlay ? "bg-emerald-500" : "bg-slate-400"}`}
              />
              Auto Play Live Streaming
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`rounded-xl p-4 ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stream Status
                </p>
              </div>
              <p className="text-lg font-semibold capitalize">{streamStatus}</p>
            </div>
            <div
              className={`rounded-xl p-4 ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Violations
                </p>
              </div>
              <p className="text-lg font-semibold">{stats.violations}</p>
            </div>
            <div
              className={`rounded-xl p-4 ${dark ? "bg-slate-800/50" : "bg-slate-50"}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Compliance
                </p>
              </div>
              <p className="text-lg font-semibold">{stats.compliance}%</p>
            </div>
          </div>
        </main>

        <InfoSidebar
          dark={dark}
          sidebarOpen={sidebarOpen}
          cameraInfo={cameraInfo}
          stats={stats}
          events={events}
          engineStatus={engineStatus}
          isLoading={isLoading}
          onEngineAction={handleEngineControl}
          pinnedSections={pinnedSections}
          onTogglePin={handleTogglePin}
        />
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
