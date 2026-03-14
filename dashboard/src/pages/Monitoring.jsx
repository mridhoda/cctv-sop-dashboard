import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Play,
  Square,
  RotateCcw,
  RotateCw,
  Loader2,
  Monitor,
  Activity,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Image,
  Video,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useSocket, useSocketEvent } from "../hooks/useSocket";
import { useCameras } from "../hooks/useCameras";
import { cn } from "../utils/cn";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

const API_BASE = import.meta.env.VITE_WS_URL || "https://api.foodiserver.my.id";

const SEVERITY_STYLES = {
  alert: {
    dot: "bg-rose-500",
    text: "text-rose-600",
    border: "border-rose-100",
    bg: "bg-rose-50/50",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-600",
    border: "border-amber-100",
    bg: "bg-amber-50/50",
  },
  info: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    border: "border-emerald-100",
    bg: "bg-emerald-50/50",
  },
};

// Default camera for fallback when DB has no cameras yet
const FALLBACK_CAMERA = {
  id: "fallback",
  name: "No Camera",
  area: "—",
  location: "—",
  online: false,
  resolution: "1080p",
  fps: 30,
  incidents: 0,
};

function StreamViewer({
  streamStatus,
  onRetry,
  resolution,
  fps,
  cameraName,
  onSnapshot,
  selectedCam,
}) {
  const [streamKey, setStreamKey] = useState(0);
  const [previewKey, setPreviewKey] = useState(0);
  const [isPreviewAvailable, setIsPreviewAvailable] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [clockTime, setClockTime] = useState("");
  const [rotation, setRotation] = useState(0);
  const hasNotifiedLive = useRef(false);

  const isPortrait = rotation === 90 || rotation === 270;

  const streamSrc = useMemo(
    () => `${API_BASE}/api/stream/video?k=${streamKey}`,
    [streamKey],
  );
  const previewSrc = useMemo(
    () => `${API_BASE}/api/stream/snapshot?t=${previewKey}`,
    [previewKey],
  );

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

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

  useEffect(() => {
    if (streamStatus !== "live") {
      hasNotifiedLive.current = false;
    }
  }, [streamStatus]);

  const handleImageError = () => {
    setIsImageLoaded(false);
    hasNotifiedLive.current = false;
    onRetry("error");
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
    if (!hasNotifiedLive.current) {
      hasNotifiedLive.current = true;
      onRetry("live");
    }
  };

  const showConnecting = streamStatus === "connecting";
  const showError = streamStatus === "error";
  const showOffline = streamStatus === "offline";
  const showPreview =
    (showConnecting || showOffline || showError) && isPreviewAvailable;

  useEffect(() => {
    if (streamStatus === "live") return;
    setPreviewKey(Date.now());
    const id = setInterval(() => setPreviewKey(Date.now()), 15000);
    return () => clearInterval(id);
  }, [streamStatus]);

  return (
    <div className="relative flex flex-1 min-h-0 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner">
      {/* Hidden image loader */}
      {(showConnecting || (streamStatus === "live" && !isImageLoaded)) && (
        <img
          src={streamSrc}
          alt=""
          className="hidden"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {/* Preview frame */}
      {(showConnecting || showOffline || showError) && (
        <img
          src={previewSrc}
          alt="Camera preview"
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            showPreview ? "opacity-45" : "opacity-0",
          )}
          onLoad={() => setIsPreviewAvailable(true)}
          onError={() => setIsPreviewAvailable(false)}
        />
      )}

      {/* Live stream */}
      {streamStatus === "live" && isImageLoaded && (
        <img
          src={streamSrc}
          alt="Live stream"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-in-out"
          style={{
            transform: `rotate(${rotation}deg)`,
            ...(isPortrait && {
              transformOrigin: "center center",
              width: "100%",
              height: "100%",
            }),
          }}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {/* Overlay Top */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-3">
        <div className="flex items-center space-x-2">
          {streamStatus === "live" && isImageLoaded && (
            <div className="flex items-center space-x-1.5 rounded-full border border-rose-500/30 bg-rose-500/20 px-2.5 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
              <span className="text-[10px] font-bold tracking-wide text-rose-500">
                LIVE
              </span>
            </div>
          )}
          <span className="text-xs font-medium text-white/90 drop-shadow-md">
            {cameraName} — {selectedCam.area}
          </span>
        </div>
        {streamStatus === "live" && isImageLoaded && (
          <button
            onClick={handleRotate}
            className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Rotate
          </button>
        )}
      </div>

      {/* Placeholder when not live */}
      {(showConnecting || showOffline || showError) && !isImageLoaded && (
        <div className="z-0 text-center">
          <Video
            className="mx-auto mb-3 h-12 w-12 text-slate-700"
            strokeWidth={1.5}
          />
          <h3 className="text-lg font-semibold tracking-wide text-white">
            MJPEG Live Stream
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            {resolution} • {fps} FPS
          </p>
          {showConnecting && (
            <div className="mt-4">
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-500" />
              <p className="mt-2 text-xs text-slate-500">
                Menghubungkan ke stream...
              </p>
            </div>
          )}
          {(showError || showOffline) && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setIsImageLoaded(false);
                  hasNotifiedLive.current = false;
                  setStreamKey((k) => k + 1);
                  onRetry("connecting");
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
              >
                <Play className="h-4 w-4" />
                {showError ? "Coba Lagi" : "Mulai Streaming"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent p-3">
        <span className="font-mono text-[10px] text-white/70 drop-shadow-md">
          {clockTime}
        </span>
        {streamStatus === "live" && isImageLoaded && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsImageLoaded(false);
                hasNotifiedLive.current = false;
                onRetry("offline");
              }}
              className="flex items-center gap-2 bg-rose-500/90 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            >
              <Square className="w-3 h-3" fill="currentColor" />
              Stop
            </button>
            <button
              onClick={onSnapshot}
              className="flex items-center gap-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              <Image className="w-3.5 h-3.5" />
              Snapshot
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Monitoring({ currentUser }) {
  // Fetch cameras from Supabase
  const { data: dbCameras = [] } = useCameras();

  // Map DB cameras to the UI format
  const cameras =
    dbCameras.length > 0
      ? dbCameras.map((cam) => ({
          id: cam.id,
          name: cam.name,
          area: cam.location,
          location: cam.location,
          online: cam.status === "online",
          resolution: cam.cameras_extended?.resolution
            ? `${cam.cameras_extended.resolution.width}x${cam.cameras_extended.resolution.height}`
            : "1080p",
          fps: cam.cameras_extended?.fps_limit || 30,
          incidents: 0,
        }))
      : [FALLBACK_CAMERA];

  const [selectedCam, setSelectedCam] = useState(cameras[0]);
  const [isEngineExpanded, setIsEngineExpanded] = useState(false);
  const [engineStatus, setEngineStatus] = useState("running");
  const [isLoading, setIsLoading] = useState(false);
  const [streamStatus, setStreamStatus] = useState("offline");
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    detections: 0,
    violations: 0,
    valid: 0,
    compliance: 0,
    fps: 0,
    activeTracks: 0,
  });

  // Update selectedCam when cameras change (e.g. first load)
  useEffect(() => {
    if (cameras.length > 0 && selectedCam.id === FALLBACK_CAMERA.id) {
      setSelectedCam(cameras[0]);
    }
  }, [cameras, selectedCam.id]);

  const isViewer = currentUser?.role === "viewer";
  const { isConnected, emit } = useSocket();

  // Socket event listeners
  useSocketEvent("engine_status", (data) => {
    if (data?.status) setEngineStatus(data.status);
  });

  useSocketEvent("stats_update", (data) => {
    if (!data) return;
    const totalValid = data.total_valid ?? data.valid ?? 0;
    const totalViolations = data.total_pelanggaran ?? data.violations ?? 0;
    const total = totalValid + totalViolations;
    setStats({
      detections: total,
      violations: totalViolations,
      valid: totalValid,
      compliance: total > 0 ? Math.round((totalValid / total) * 100) : 0,
      fps: data.fps ?? 0,
      activeTracks: data.active_tracks ?? 0,
    });
    if (data.engine_status) setEngineStatus(data.engine_status);
  });

  useSocketEvent("detection_event", (data) => {
    if (!data) return;
    const isViolation =
      data.status === "violation" || data.status === "pelanggaran";
    const newEvent = {
      id: data.id ?? `${data.track_id}-${data.timestamp}`,
      status: isViolation ? "Pelanggaran SOP" : "Valid SOP",
      person: data.name || "Unknown",
      type: data.type || data.status || "Detection",
      location: data.location || selectedCam.area,
      time: new Date(data.timestamp || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    setEvents((prev) => [newEvent, ...prev].slice(0, 50));
  });

  // Engine control
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
    if (nextStatus) setStreamStatus(nextStatus);
  };

  const handleSnapshot = () => {
    window.open(`${API_BASE}/api/stream/snapshot?t=${Date.now()}`, "_blank");
  };

  // REST polling fallback
  useEffect(() => {
    let isMounted = true;
    const statusInterval = isConnected ? 30000 : 5000;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status`, { mode: "cors" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (!isMounted) return;
        setEngineStatus(data.engine_status || engineStatus);
      } catch (err) {
        console.error("[Monitoring] Status fetch error:", err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, statusInterval);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isConnected, engineStatus]);

  return (
    <div className="h-[calc(100vh-120px)] min-h-0">
      {/* Grid Layout - Full Height */}
      <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
        {/* ── Left Column (Video Player) - Span 8 ── */}
        <div className="flex h-full min-h-0 flex-col lg:col-span-8">
          <Card className="flex flex-1 flex-col p-4 lg:p-5" animate={false}>
            {/* Header & Tabs - Compact */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Live Stream AI
                </h2>
                <p className="hidden text-[11px] text-slate-500 sm:block">
                  Streaming dengan overlay AI detection
                </p>
              </div>

              <div className="flex space-x-1.5 overflow-x-auto">
                {cameras.map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => setSelectedCam(cam)}
                    className={cn(
                      "flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                      selectedCam.id === cam.id
                        ? "bg-slate-900 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        cam.online ? "bg-emerald-400" : "bg-slate-300",
                      )}
                    />
                    <span>{cam.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Video Player Area */}
            <StreamViewer
              streamStatus={streamStatus}
              onRetry={handleRetryStream}
              resolution={selectedCam.resolution}
              fps={selectedCam.fps}
              cameraName={selectedCam.name}
              selectedCam={selectedCam}
              onSnapshot={handleSnapshot}
            />

            {/* Controls & Quick Stats - Compact */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex space-x-2">
                <button className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">Rotate</span>
                </button>
                <button
                  onClick={handleSnapshot}
                  className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                >
                  <Camera size={14} />
                  <span className="hidden sm:inline">Snapshot</span>
                </button>
                <button className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50">
                  <Monitor size={14} />
                  <span className="hidden sm:inline">
                    {selectedCam.resolution}
                  </span>
                </button>
              </div>

              <div className="flex space-x-2">
                <div className="flex items-center space-x-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Stream
                  </span>
                  <span
                    className={cn(
                      "text-xs font-bold",
                      streamStatus === "live"
                        ? "text-emerald-500"
                        : "text-rose-500",
                    )}
                  >
                    {streamStatus === "live" ? "Live" : "Offline"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Violations
                  </span>
                  <span className="text-xs font-bold text-rose-500">
                    {stats.violations}
                  </span>
                </div>
                <div className="hidden items-center space-x-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 md:flex">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">
                    Compliance
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {stats.compliance}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right Column (Panels) - Span 4 ── */}
        <div className="flex h-full min-h-0 flex-col gap-4 lg:col-span-4">
          {/* Engine Control - Collapsible */}
          {!isViewer && (
            <Card
              className="shrink-0 border-t-4 border-t-indigo-500 overflow-hidden"
              animate={false}
            >
              {/* Header - Always visible */}
              <button
                onClick={() => setIsEngineExpanded(!isEngineExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Play size={16} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-800">
                      Engine Control
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {isEngineExpanded
                        ? "Kontrol runtime AI"
                        : `AI ${engineStatus}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-1.5 rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-medium text-emerald-700 capitalize">
                      {engineStatus}
                    </span>
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                    {isEngineExpanded ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>
              </button>

              {/* Expandable Content */}
              <motion.div
                initial={false}
                animate={{
                  height: isEngineExpanded ? "auto" : 0,
                  opacity: isEngineExpanded ? 1 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 pt-1">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleEngineControl("start")}
                      disabled={isLoading || engineStatus === "running"}
                      className="flex items-center justify-center space-x-1.5 rounded-lg bg-slate-900 py-2 text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play size={14} />
                      <span className="text-[11px] font-medium">Start</span>
                    </button>
                    <button
                      onClick={() => handleEngineControl("stop")}
                      disabled={isLoading || engineStatus === "stopped"}
                      className="flex items-center justify-center space-x-1.5 rounded-lg border border-rose-200 bg-white py-2 text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Square size={14} />
                      <span className="text-[11px] font-medium">Stop</span>
                    </button>
                    <button
                      onClick={() => handleEngineControl("restart")}
                      disabled={isLoading}
                      className="flex items-center justify-center space-x-1.5 rounded-lg border border-slate-200 bg-white py-2 text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw
                        size={14}
                        className={isLoading ? "animate-spin" : ""}
                      />
                      <span className="text-[11px] font-medium">Restart</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </Card>
          )}

          {/* Detection Stats - Compact Grid */}
          <Card className="shrink-0 p-4" animate={false}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                Detection Stats
              </h3>
              <Activity size={14} className="text-indigo-400" />
            </div>

            <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Detections</span>
                <span className="text-xs font-bold text-slate-800">
                  {stats.detections}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Violations</span>
                <span className="text-xs font-bold text-rose-500">
                  {stats.violations}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Valid SOP</span>
                <span className="text-xs font-bold text-emerald-500">
                  {stats.valid}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Active</span>
                <span className="text-xs font-bold text-amber-500">
                  {stats.activeTracks} Tracks
                </span>
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Overall Compliance
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {stats.compliance}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-1.5 rounded-full bg-emerald-500"
                  style={{ width: `${stats.compliance}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Activity Feed - Flex-1 with internal scroll */}
          <Card
            className="flex min-h-0 flex-1 flex-col border-t-4 border-t-rose-400"
            animate={false}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Activity Feed
                </h3>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  Prioritas pantauan utama
                </p>
              </div>
              <span className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-sm">
                Live
              </span>
            </div>

            {/* Scrollable content only */}
            <div className="custom-scrollbar flex-1 overflow-y-auto p-3">
              <div className="space-y-2">
                {events.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="relative pl-5"
                  >
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-0 top-1.5 h-2 w-2 rounded-full ring-4",
                        item.status.includes("Pelanggaran")
                          ? "bg-rose-500 ring-rose-50"
                          : "bg-emerald-500 ring-emerald-50",
                      )}
                    />
                    {/* Connector line */}
                    {idx < events.length - 1 && (
                      <div className="absolute bottom-[-8px] left-[3px] top-4 w-[2px] bg-slate-100" />
                    )}

                    {/* Content */}
                    <div
                      className={cn(
                        "rounded-lg border p-2.5 shadow-sm",
                        item.status.includes("Pelanggaran")
                          ? "border-rose-100 bg-rose-50/50"
                          : "border-slate-100 bg-white",
                      )}
                    >
                      <div className="mb-0.5 flex items-start justify-between">
                        <span
                          className={cn(
                            "text-xs font-bold",
                            item.status.includes("Pelanggaran")
                              ? "text-rose-600"
                              : "text-slate-700",
                          )}
                        >
                          {item.status}
                        </span>
                        <span className="mt-0.5 font-mono text-[9px] text-slate-400">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {item.type} • {item.location}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
