# Live Monitoring Redesign Implementation Plan

**Goal:** Rewrite the Live Monitoring page into a stream-centric command center for a single MJPEG camera with collapsible info sidebar, polling-driven data, and robust stream connection states.

**Architecture:** Keep the single-file page pattern in `src/pages/Monitoring.jsx` with local subcomponents, mock fallbacks at top, helpers next, subcomponents in the middle, and the main component at the bottom. Use native `fetch` with isolated error states per section, and manage all UI state via `useState` and `useEffect` (no new dependencies).

**Design:** `thoughts/shared/designs/2026-03-04-live-monitoring-redesign.md`

---

## Dependency Graph

```
Batch 1 (parallel): 1.1 [single-file rewrite]
```

---

## Batch 1: Single File Rewrite (parallel - 1 implementer)

### Task 1.1: Live Monitoring Page Rewrite
**File:** `src/pages/Monitoring.jsx`
**Test:** `src/pages/Monitoring.test.jsx`
**Depends:** none

```jsx
// src/pages/Monitoring.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import Monitoring from "./Monitoring";

describe("Monitoring page", () => {
  const mockStatus = {
    camera_name: "Main Entrance Camera",
    location: "Front Gate",
    resolution: "1080p",
    fps: 30,
    online: true,
    engine_status: "running",
  };

  const mockStats = {
    detections_today: 12,
    violations: 3,
    valid_sop: 9,
    compliance_rate: 75,
  };

  const mockEvents = [
    { id: "e1", severity: "alert", event: "Violation Detected", camera: "Main Entrance Camera", timestamp: "2026-03-04T10:00:00Z" },
    { id: "e2", severity: "info", event: "Person Identified", camera: "Main Entrance Camera", timestamp: "2026-03-04T09:58:00Z" },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, "fetch").mockImplementation((url) => {
      if (String(url).includes("/api/status")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStatus) });
      }
      if (String(url).includes("/api/stats")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStats) });
      }
      if (String(url).includes("/api/events")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockEvents) });
      }
      if (String(url).includes("/api/engine")) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders header and stream viewer", async () => {
    render(<Monitoring />);

    expect(screen.getByText("Live Monitoring")).toBeInTheDocument();
    expect(screen.getByTestId("stream-viewer")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Camera Info")).toBeInTheDocument();
      expect(screen.getByText("Detection Stats")).toBeInTheDocument();
      expect(screen.getByText("Activity Log")).toBeInTheDocument();
    });
  });

  it("toggles sidebar", () => {
    render(<Monitoring />);

    const toggle = screen.getByTitle("Collapse sidebar");
    fireEvent.click(toggle);
    expect(screen.getByTitle("Expand sidebar")).toBeInTheDocument();
  });

  it("calls engine control endpoint", async () => {
    render(<Monitoring />);

    const startButton = screen.getByText("Start Engine");
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:5001/api/engine/start", { method: "POST" });
    });
  });
});
```

```jsx
// src/pages/Monitoring.jsx
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Camera,
  Maximize2,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
  Sun,
  WifiOff,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────
const API_BASE_URL = "http://localhost:5001";
const STREAM_URL = `${API_BASE_URL}/api/stream/video`;
const SNAPSHOT_URL = `${API_BASE_URL}/api/stream/snapshot`;
const STATUS_INTERVAL_MS = 5000;
const STATS_INTERVAL_MS = 10000;
const EVENTS_INTERVAL_MS = 5000;
const STREAM_RETRY_MS = 5000;
const STREAM_RETRY_MAX = 5;

const DEFAULT_CAMERA_INFO = {
  camera_name: "Main Entrance Camera",
  location: "Main Entrance",
  resolution: "1080p",
  fps: 30,
  online: true,
  engine_status: "running",
};

const DEFAULT_STATS = {
  detections_today: 0,
  violations: 0,
  valid_sop: 0,
  compliance_rate: 0,
};

const DEFAULT_EVENTS = [];

const SEVERITY_STYLES = {
  alert: { dot: "bg-red-500", text: "text-red-400" },
  error: { dot: "bg-red-400", text: "text-red-400" },
  warning: { dot: "bg-amber-400", text: "text-amber-400" },
  info: { dot: "bg-blue-400", text: "text-blue-400" },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getSeverityStyle = (severity) => SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;

const formatTimestamp = (value) => {
  if (!value) return "--";
  const date = typeof value === "string" || typeof value === "number" ? new Date(value) : value;
  if (Number.isNaN(date?.getTime?.())) return String(value);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const getEngineStyle = (status) => {
  switch (status) {
    case "running":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "error":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-slate-700/60 text-slate-300 border-slate-600/50";
  }
};

// ─── Subcomponents ───────────────────────────────────────────────────────────
function StreamViewer({
  dark,
  status,
  streamSrc,
  onRetry,
  onSnapshot,
  onFullscreen,
  onStreamLoad,
  onStreamError,
  resolution,
  fps,
  alert,
  retryCount,
}) {
  const isLive = status === "live";
  const isConnecting = status === "connecting";
  const isOffline = status === "offline";
  const isError = status === "error";

  return (
    <div
      className={`relative w-full h-full rounded-xl overflow-hidden border ${dark ? "border-slate-800" : "border-slate-200"} bg-black`}
      data-testid="stream-viewer"
    >
      {isLive && (
        <img
          src={streamSrc}
          alt="Live stream"
          className="w-full h-full object-contain"
          onLoad={onStreamLoad}
          onError={onStreamError}
        />
      )}

      {!isLive && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {isConnecting && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-14 rounded-lg bg-slate-900/80 animate-pulse" />
              <p className="text-sm">Connecting to stream...</p>
            </div>
          )}

          {isOffline && (
            <div className="flex flex-col items-center gap-3">
              <WifiOff className="w-12 h-12" />
              <p className="text-sm font-medium">Camera Offline</p>
              <button
                onClick={onRetry}
                className="mt-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-white hover:bg-slate-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-3">
              <AlertTriangle className="w-12 h-12 text-red-400" />
              <p className="text-sm font-medium">Unable to connect to stream</p>
              <p className="text-xs text-slate-500">Retrying {Math.min(retryCount, STREAM_RETRY_MAX)} / {STREAM_RETRY_MAX}</p>
              <button
                onClick={onRetry}
                className="mt-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors"
              >
                Retry now
              </button>
            </div>
          )}
        </div>
      )}

      {(isLive || isConnecting) && (
        <>
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="bg-black/70 text-slate-200 text-[10px] px-2 py-1 rounded">{resolution}</span>
            <span className="bg-black/70 text-slate-200 text-[10px] px-2 py-1 rounded">{fps} FPS</span>
          </div>

          {alert && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 bg-amber-500/90 text-white text-xs font-medium px-3 py-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{alert.event} — {formatTimestamp(alert.timestamp)}</span>
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 bg-black/60 rounded-full px-3 py-2">
              <button
                onClick={onFullscreen}
                className="p-1.5 rounded-full text-white hover:bg-white/10"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={onSnapshot}
                className="p-1.5 rounded-full text-white hover:bg-white/10"
                title="Snapshot"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MonitoringHeader({
  dark,
  sidebarOpen,
  onToggleTheme,
  onToggleSidebar,
  onFullscreen,
  streamStatus,
  engineStatus,
  connectionLabel,
}) {
  const headerBg = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const dotColor = streamStatus === "live" ? "bg-emerald-400" : "bg-red-400";

  return (
    <header className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 border-b ${headerBg} transition-colors duration-300`}>
      <div className="flex items-center gap-2">
        <Camera className={`w-4 h-4 ${textSecondary}`} />
        <h1 className="text-sm font-semibold">Live Monitoring</h1>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          <span className={textSecondary}>{connectionLabel}</span>
        </div>
        <span className={`text-[11px] px-2 py-1 rounded-full border ${getEngineStyle(engineStatus)}`}>
          {engineStatus}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg transition-colors ${dark ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          title="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${dark ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
        <button
          onClick={onFullscreen}
          className={`p-2 rounded-lg transition-colors ${dark ? "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

function CameraInfoCard({ dark, cameraInfo, error }) {
  const cardBg = dark ? "bg-slate-800" : "bg-slate-100";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";

  const info = cameraInfo || DEFAULT_CAMERA_INFO;
  const online = info.online ?? true;

  return (
    <div className={`px-4 py-3 border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
      <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Camera Info</h3>
      <div className={`mt-3 p-3 rounded-lg ${cardBg}`}>
        <p className="text-sm font-semibold">{info.camera_name || "Unknown Camera"}</p>
        <p className={`text-xs mt-1 ${textSecondary}`}>{info.location || "Unknown Location"}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className={`text-[10px] px-2 py-1 rounded bg-black/30 text-slate-200`}>{info.resolution || "--"}</span>
          <span className={`text-[10px] px-2 py-1 rounded bg-black/30 text-slate-200`}>{info.fps || "--"} FPS</span>
          <span className={`text-[10px] px-2 py-1 rounded ${online ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
            {online ? "Online" : "Offline"}
          </span>
        </div>
        {error && <p className="text-[10px] text-red-400 mt-2">Unable to load camera status</p>}
      </div>
    </div>
  );
}

function EngineControls({ engineStatus, isLoading, onAction, dark }) {
  const base = dark
    ? "border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white"
    : "border-slate-200 hover:bg-slate-100 text-slate-700";

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

function DetectionStats({ dark, stats, error }) {
  const cardBg = dark ? "bg-slate-800" : "bg-slate-100";
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const data = stats || DEFAULT_STATS;

  return (
    <div className={`px-4 py-3 border-b ${dark ? "border-slate-800" : "border-slate-200"}`}>
      <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Detection Stats</h3>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className={`p-3 rounded-lg ${cardBg}`}>
          <p className={`text-[10px] ${textSecondary}`}>Detections Today</p>
          <p className="text-lg font-semibold transition-opacity duration-300">{data.detections_today ?? "--"}</p>
        </div>
        <div className={`p-3 rounded-lg ${cardBg}`}>
          <p className={`text-[10px] ${textSecondary}`}>Violations</p>
          <p className="text-lg font-semibold text-red-400 transition-opacity duration-300">{data.violations ?? "--"}</p>
        </div>
        <div className={`p-3 rounded-lg ${cardBg}`}>
          <p className={`text-[10px] ${textSecondary}`}>Valid SOP</p>
          <p className="text-lg font-semibold text-emerald-400 transition-opacity duration-300">{data.valid_sop ?? "--"}</p>
        </div>
        <div className={`p-3 rounded-lg ${cardBg}`}>
          <p className={`text-[10px] ${textSecondary}`}>Compliance Rate</p>
          <p className="text-lg font-semibold transition-opacity duration-300">{data.compliance_rate ?? "--"}%</p>
          <div className="mt-2 w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400"
              style={{ width: `${Math.min(Math.max(Number(data.compliance_rate) || 0, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>
      {error && <p className="text-[10px] text-red-400 mt-2">Unable to load stats</p>}
    </div>
  );
}

function ActivityFeed({ dark, events, error, scrollRef, onScroll }) {
  const textSecondary = dark ? "text-slate-400" : "text-slate-500";
  const divider = dark ? "divide-slate-800" : "divide-slate-200";
  const bg = dark ? "bg-slate-900" : "bg-white";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className={`px-4 py-3 border-b sticky top-0 ${dark ? "border-slate-800" : "border-slate-200"} ${bg} z-10`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Activity Log</h3>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
            {events.length}
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 overflow-y-auto"
      >
        {error && (
          <div className="px-4 py-3 text-xs text-red-400">Unable to load events</div>
        )}
        {!error && events.length === 0 && (
          <div className={`px-4 py-3 text-xs ${textSecondary}`}>No activity yet</div>
        )}
        <ul className={`divide-y ${divider}`}>
          {events.map((event) => {
            const style = getSeverityStyle(event.severity);
            return (
              <li key={event.id || `${event.timestamp}-${event.event}`} className={`px-4 py-3 ${event.isNew ? "animate-slide-in" : ""}`}>
                <div className="flex items-start gap-2.5">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{event.event}</p>
                    <p className={`text-[10px] truncate ${textSecondary}`}>{event.camera || "Main Camera"}</p>
                    <p className={`text-[10px] mt-0.5 ${textSecondary}`}>{formatTimestamp(event.timestamp)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function InfoSidebar({
  open,
  dark,
  cameraInfo,
  stats,
  events,
  engineStatus,
  isLoading,
  onEngineAction,
  statusError,
  statsError,
  eventsError,
  scrollRef,
  onFeedScroll,
}) {
  const bg = dark ? "bg-slate-900" : "bg-white";
  const border = dark ? "border-slate-800" : "border-slate-200";

  return (
    <aside
      className={`flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${open ? "w-80" : "w-0"} ${bg} border-l ${border}`}
      data-testid="info-sidebar"
    >
      <div className="w-80 h-full flex flex-col overflow-hidden">
        <CameraInfoCard dark={dark} cameraInfo={cameraInfo} error={statusError} />
        <div className={`px-4 py-3 border-b ${border}`}>
          <h3 className={`text-xs font-semibold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>Engine Control</h3>
          <div className={`mt-3 px-3 py-2 rounded-lg ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className={`w-2 h-2 rounded-full ${engineStatus === "running" ? "bg-emerald-400 animate-pulse" : engineStatus === "error" ? "bg-red-400" : "bg-slate-500"}`} />
              <span className="capitalize">{engineStatus}</span>
            </div>
          </div>
          <div className="mt-3">
            <EngineControls engineStatus={engineStatus} isLoading={isLoading} onAction={onEngineAction} dark={dark} />
          </div>
        </div>
        <DetectionStats dark={dark} stats={stats} error={statsError} />
        <ActivityFeed dark={dark} events={events} error={eventsError} scrollRef={scrollRef} onScroll={onFeedScroll} />
      </div>
    </aside>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Monitoring() {
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [engineStatus, setEngineStatus] = useState("running");
  const [isLoading, setIsLoading] = useState(false);

  const [cameraInfo, setCameraInfo] = useState(DEFAULT_CAMERA_INFO);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [events, setEvents] = useState(DEFAULT_EVENTS);

  const [statusError, setStatusError] = useState(false);
  const [statsError, setStatsError] = useState(false);
  const [eventsError, setEventsError] = useState(false);

  const [streamStatus, setStreamStatus] = useState("connecting");
  const [streamSrc, setStreamSrc] = useState(`${STREAM_URL}?ts=${Date.now()}`);
  const [streamRetries, setStreamRetries] = useState(0);

  const feedRef = useRef(null);
  const feedNearTopRef = useRef(true);
  const streamContainerRef = useRef(null);

  const bgPage = dark ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900";

  const latestAlert = events.find((event) => ["alert", "warning"].includes(event.severity));
  const connectionLabel = streamStatus === "live" ? "Connected" : "Disconnected";

  const handleStreamRetry = () => {
    setStreamRetries(0);
    setStreamStatus("connecting");
    setStreamSrc(`${STREAM_URL}?ts=${Date.now()}`);
  };

  const handleStreamLoad = () => {
    setStreamRetries(0);
    setStreamStatus("live");
  };

  const handleStreamError = () => {
    setStreamStatus("error");
  };

  const handleSnapshot = () => {
    window.open(SNAPSHOT_URL, "_blank", "noopener,noreferrer");
  };

  const handleStreamFullscreen = () => {
    if (streamContainerRef.current?.requestFullscreen) {
      streamContainerRef.current.requestFullscreen();
    }
  };

  const handlePageFullscreen = () => {
    if (document.documentElement?.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  const handleEngineControl = async (action) => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE_URL}/api/engine/${action}`, { method: "POST" });
      setEngineStatus(action === "stop" ? "stopped" : "running");
    } catch {
      setEngineStatus("error");
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/status`);
      if (!response.ok) throw new Error("status fetch failed");
      const data = await response.json();
      setCameraInfo({
        camera_name: data.camera_name || data.cameraName || DEFAULT_CAMERA_INFO.camera_name,
        location: data.location || DEFAULT_CAMERA_INFO.location,
        resolution: data.resolution || DEFAULT_CAMERA_INFO.resolution,
        fps: data.fps ?? DEFAULT_CAMERA_INFO.fps,
        online: data.online ?? true,
        engine_status: data.engine_status || data.engineStatus || engineStatus,
      });
      setEngineStatus(data.engine_status || data.engineStatus || engineStatus);
      setStatusError(false);
    } catch {
      setStatusError(true);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      if (!response.ok) throw new Error("stats fetch failed");
      const data = await response.json();
      setStats({
        detections_today: data.detections_today ?? data.detectionsToday ?? DEFAULT_STATS.detections_today,
        violations: data.violations ?? DEFAULT_STATS.violations,
        valid_sop: data.valid_sop ?? data.validSop ?? DEFAULT_STATS.valid_sop,
        compliance_rate: data.compliance_rate ?? data.complianceRate ?? DEFAULT_STATS.compliance_rate,
      });
      setStatsError(false);
    } catch {
      setStatsError(true);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events?limit=20`);
      if (!response.ok) throw new Error("events fetch failed");
      const data = await response.json();
      const incoming = Array.isArray(data) ? data : data.events || [];
      const previousTop = events[0]?.id || events[0]?.timestamp;
      const nextEvents = incoming.map((event) => ({
        id: event.id || event.event_id || event.timestamp,
        severity: event.severity || "info",
        event: event.event || event.message || "Event",
        camera: event.camera || event.camera_name || "Main Camera",
        timestamp: event.timestamp || event.time || new Date().toISOString(),
        isNew: Boolean(previousTop && (event.id || event.timestamp) !== previousTop),
      }));

      setEvents(nextEvents);
      setEventsError(false);
    } catch {
      setEventsError(true);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchStats();
    fetchEvents();

    const statusInterval = setInterval(fetchStatus, STATUS_INTERVAL_MS);
    const statsInterval = setInterval(fetchStats, STATS_INTERVAL_MS);
    const eventsInterval = setInterval(fetchEvents, EVENTS_INTERVAL_MS);

    return () => {
      clearInterval(statusInterval);
      clearInterval(statsInterval);
      clearInterval(eventsInterval);
    };
  }, []);

  useEffect(() => {
    if (streamStatus !== "error") return;
    if (streamRetries >= STREAM_RETRY_MAX) return;

    const timer = setTimeout(() => {
      setStreamStatus("connecting");
      setStreamRetries((count) => count + 1);
      setStreamSrc(`${STREAM_URL}?ts=${Date.now()}`);
    }, STREAM_RETRY_MS);

    return () => clearTimeout(timer);
  }, [streamStatus, streamRetries]);

  useEffect(() => {
    if (cameraInfo?.online === false) {
      setStreamStatus("offline");
    }
  }, [cameraInfo]);

  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 1024;
      if (shouldCollapse) setSidebarOpen(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!feedRef.current) return;
    if (!feedNearTopRef.current) return;
    feedRef.current.scrollTop = 0;
  }, [events]);

  const handleFeedScroll = () => {
    if (!feedRef.current) return;
    feedNearTopRef.current = feedRef.current.scrollTop < 12;
  };

  const effectiveStreamStatus = cameraInfo?.online === false ? "offline" : streamStatus;

  return (
    <div className={`flex flex-col h-full ${bgPage} transition-colors duration-300`}>
      <style>{`
        @keyframes slideIn {
          0% { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in {
          animation: slideIn 200ms ease-out;
        }
      `}</style>

      <MonitoringHeader
        dark={dark}
        sidebarOpen={sidebarOpen}
        onToggleTheme={() => setDark((prev) => !prev)}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        onFullscreen={handlePageFullscreen}
        streamStatus={effectiveStreamStatus}
        engineStatus={engineStatus}
        connectionLabel={connectionLabel}
      />

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4" ref={streamContainerRef}>
          <StreamViewer
            dark={dark}
            status={effectiveStreamStatus}
            streamSrc={streamSrc}
            onRetry={handleStreamRetry}
            onSnapshot={handleSnapshot}
            onFullscreen={handleStreamFullscreen}
            onStreamLoad={handleStreamLoad}
            onStreamError={handleStreamError}
            resolution={cameraInfo?.resolution || DEFAULT_CAMERA_INFO.resolution}
            fps={cameraInfo?.fps ?? DEFAULT_CAMERA_INFO.fps}
            alert={latestAlert}
            retryCount={streamRetries}
          />
        </div>

        <InfoSidebar
          open={sidebarOpen}
          dark={dark}
          cameraInfo={cameraInfo}
          stats={stats}
          events={events}
          engineStatus={engineStatus}
          isLoading={isLoading}
          onEngineAction={handleEngineControl}
          statusError={statusError}
          statsError={statsError}
          eventsError={eventsError}
          scrollRef={feedRef}
          onFeedScroll={handleFeedScroll}
        />
      </div>
    </div>
  );
}
```

**Verify:** `npm run test -- src/pages/Monitoring.test.jsx`
**Commit:** `feat(monitoring): redesign live monitoring command center`

---

**Decisions made due to missing .mindmodel:** No project-specific patterns were found, so the plan follows the existing `Monitoring.jsx` structure (mock data + helpers + subcomponents + main component) and reuses the engine control pattern and dark/light toggle behavior from the current file.
