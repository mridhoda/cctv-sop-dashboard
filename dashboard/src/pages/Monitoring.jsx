import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  Square,
  RotateCcw,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Wifi,
  WifiOff,
  Maximize2,
  Minimize2,
  Power,
  ChevronLeft,
  Camera,
  Eye,
  RefreshCw,
  Circle,
  Info,
} from 'lucide-react';

// TODO: Connect WebSocket socket.io-client for real-time events
// TODO: GET /api/status to populate camera list and status
// TODO: GET /api/stream/snapshot?camera_id={id} for tile preview frames

const MOCK_CAMERAS = [
  { id: 1, name: 'Koridor Utama', location: 'Lantai 1 - Pintu A', online: true, hasAlert: true, lastAlert: 'No Helmet', alertTime: '14:32', fps: 25, resolution: '1080p' },
  { id: 2, name: 'Ruang Server', location: 'Lantai 2 - Ruang IT', online: true, hasAlert: false, lastAlert: null, alertTime: null, fps: 20, resolution: '720p' },
  { id: 3, name: 'Area Gudang', location: 'Lantai 1 - Gudang B', online: false, hasAlert: false, lastAlert: null, alertTime: null, fps: 0, resolution: '1080p' },
  { id: 4, name: 'Pintu Masuk', location: 'Lobby - Utama', online: true, hasAlert: false, lastAlert: null, alertTime: null, fps: 30, resolution: '1080p' },
  { id: 5, name: 'Ruang Rapat', location: 'Lantai 3 - R. Rapat A', online: true, hasAlert: true, lastAlert: 'No Vest', alertTime: '14:15', fps: 15, resolution: '720p' },
  { id: 6, name: 'Parkir Area', location: 'Basement - Area P1', online: false, hasAlert: false, lastAlert: null, alertTime: null, fps: 0, resolution: '1080p' },
  { id: 7, name: 'Jalur Produksi A', location: 'Lantai 1 - Produksi', online: true, hasAlert: false, lastAlert: null, alertTime: null, fps: 25, resolution: '1080p' },
  { id: 8, name: 'Jalur Produksi B', location: 'Lantai 1 - Produksi', online: true, hasAlert: false, lastAlert: null, alertTime: null, fps: 25, resolution: '720p' },
];

const MOCK_LOGS = [
  { id: 1, timestamp: '14:32:15', camera: 'Koridor Utama', event: 'Pelanggaran: No Helmet terdeteksi', severity: 'high', cameraId: 1 },
  { id: 2, timestamp: '14:15:42', camera: 'Ruang Rapat', event: 'Pelanggaran: No Safety Vest', severity: 'high', cameraId: 5 },
  { id: 3, timestamp: '14:01:28', camera: 'Area Gudang', event: 'Kamera offline', severity: 'critical', cameraId: 3 },
  { id: 4, timestamp: '13:55:09', camera: 'System', event: 'Engine started successfully', severity: 'info', cameraId: null },
  { id: 5, timestamp: '13:45:55', camera: 'Pintu Masuk', event: 'Deteksi wajah: Budi Santoso', severity: 'info', cameraId: 4 },
  { id: 6, timestamp: '13:30:12', camera: 'Jalur Produksi A', event: 'SOP Valid: Semua APD lengkap', severity: 'ok', cameraId: 7 },
  { id: 7, timestamp: '13:22:48', camera: 'Parkir Area', event: 'Kamera offline', severity: 'critical', cameraId: 6 },
];

export default function Monitoring() {
  const [engineStatus, setEngineStatus] = useState('running');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null); // null = grid view
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [cameras, setCameras] = useState(MOCK_CAMERAS);
  const [gridLayout, setGridLayout] = useState('auto'); // 'auto', '2x2', '3x3', '4x4'
  const [snapshotTimestamps, setSnapshotTimestamps] = useState({});
  const snapshotRefreshRef = useRef(null);

  // Refresh snapshot timestamps every 5 seconds to bust cache and get fresh frame
  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      const updated = {};
      cameras.filter(c => c.online).forEach(c => { updated[c.id] = now; });
      setSnapshotTimestamps(updated);
    };
    refresh();
    snapshotRefreshRef.current = setInterval(refresh, 5000);
    return () => clearInterval(snapshotRefreshRef.current);
  }, []);

  const handleEngineControl = async (action) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/engine/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        if (action === 'start') setEngineStatus('running');
        else if (action === 'stop') setEngineStatus('stopped');
      }
    } catch (error) {
      console.error(`Engine ${action} failed:`, error);
      setEngineStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const onlineCameras = cameras.filter(c => c.online).length;
  const offlineCameras = cameras.filter(c => !c.online).length;
  const alertCameras = cameras.filter(c => c.hasAlert).length;

  const getStatusColors = () => {
    switch (engineStatus) {
      case 'running': return { bg: 'bg-emerald-500', text: 'Running', dot: 'bg-emerald-400' };
      case 'stopped': return { bg: 'bg-slate-500', text: 'Stopped', dot: 'bg-slate-400' };
      case 'error': return { bg: 'bg-rose-500', text: 'Error', dot: 'bg-rose-400' };
      default: return { bg: 'bg-slate-500', text: 'Unknown', dot: 'bg-slate-400' };
    }
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical': return { icon: <Circle className="w-2 h-2 fill-rose-500 text-rose-500" />, text: 'text-rose-600', bg: 'bg-rose-50' };
      case 'high': return { icon: <Circle className="w-2 h-2 fill-orange-500 text-orange-500" />, text: 'text-orange-600', bg: 'bg-orange-50' };
      case 'ok': return { icon: <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />, text: 'text-emerald-600', bg: 'bg-emerald-50' };
      default: return { icon: <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />, text: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  const getGridClass = () => {
    switch (gridLayout) {
      case '2x2': return 'grid-cols-2';
      case '3x3': return 'grid-cols-3';
      case '4x4': return 'grid-cols-4';
      default: return cameras.length <= 4 ? 'grid-cols-2' : cameras.length <= 6 ? 'grid-cols-3' : 'grid-cols-4';
    }
  };

  const statusColors = getStatusColors();

  // ── SINGLE CAMERA VIEW ──
  if (selectedCamera) {
    const cam = cameras.find(c => c.id === selectedCamera);
    return (
      <div className="flex flex-col h-full bg-slate-950">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedCamera(null)}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali ke Grid
            </button>
            <div className="w-px h-5 bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${cam.online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-white font-semibold text-sm">{cam.name}</span>
              <span className="text-slate-400 text-xs">{cam.location}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {cam.online && (
              <div className="flex items-center gap-1.5 bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                LIVE
              </div>
            )}
            <span className="text-slate-400 text-xs">{cam.resolution} • {cam.fps} FPS</span>
          </div>
        </div>

        {/* Main stream area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Video */}
          <div className="flex-1 bg-slate-950 relative flex items-center justify-center">
            {cam.online ? (
              <>
                <img
                  src={`http://localhost:5001/api/stream/video?camera_id=${cam.id}`}
                  alt={`Live stream ${cam.name}`}
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                />
                <div style={{ display: 'none' }} className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                  <Video className="w-16 h-16 mb-3 opacity-30" />
                  <p className="text-sm">Stream tidak tersedia</p>
                  <p className="text-xs text-slate-600 mt-1">Pastikan backend V2_Project berjalan</p>
                </div>
                {/* Overlay info */}
                <div className="absolute top-4 left-4 font-mono text-[11px] text-white/60 bg-black/40 px-2 py-1 rounded">
                  CAM-{String(cam.id).padStart(2,'0')} • {new Date().toLocaleTimeString('id-ID')}
                </div>
                {cam.hasAlert && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-rose-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {cam.lastAlert} — {cam.alertTime}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600 gap-3">
                <WifiOff className="w-16 h-16 opacity-40" />
                <p className="text-lg font-semibold">Kamera Offline</p>
                <p className="text-sm">Koneksi ke {cam.name} terputus</p>
              </div>
            )}
          </div>

          {/* Side panel: logs filtered by camera */}
          <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col">
            <div className="p-3 border-b border-slate-800">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Log Kamera Ini</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {logs.filter(l => l.cameraId === cam.id).length === 0 && (
                <p className="text-slate-600 text-xs text-center mt-8">Tidak ada log untuk kamera ini</p>
              )}
              {logs.filter(l => l.cameraId === cam.id).map(log => {
                const style = getSeverityStyle(log.severity);
                return (
                  <div key={log.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center gap-2 mb-1">
                      {style.icon}
                      <span className="text-slate-400 text-[10px] font-mono">{log.timestamp}</span>
                    </div>
                    <p className={`text-xs font-medium ${style.text}`}>{log.event}</p>
                  </div>
                );
              })}
            </div>
            <div className="p-3 border-t border-slate-800 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleEngineControl('start')} disabled={isLoading || engineStatus === 'running'}
                  className="flex flex-col items-center gap-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white rounded-lg transition-colors text-[10px] font-bold disabled:cursor-not-allowed">
                  <Play className="w-3.5 h-3.5" /> Start
                </button>
                <button onClick={() => handleEngineControl('stop')} disabled={isLoading || engineStatus === 'stopped'}
                  className="flex flex-col items-center gap-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-700 text-white rounded-lg transition-colors text-[10px] font-bold disabled:cursor-not-allowed">
                  <Square className="w-3.5 h-3.5" /> Stop
                </button>
                <button onClick={() => handleEngineControl('restart')} disabled={isLoading}
                  className="flex flex-col items-center gap-1 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 text-white rounded-lg transition-colors text-[10px] font-bold disabled:cursor-not-allowed">
                  <RotateCcw className="w-3.5 h-3.5" /> Restart
                </button>
              </div>
              <div className={`flex items-center justify-center gap-2 py-2 rounded-lg ${engineStatus === 'running' ? 'bg-emerald-900/50' : engineStatus === 'error' ? 'bg-rose-900/50' : 'bg-slate-800'}`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusColors.dot}`} />
                <span className="text-[10px] font-bold text-slate-300">Engine: {statusColors.text}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GRID VIEW ──
  return (
    <div className="flex flex-col gap-0 h-full">

      {/* ── Top Stats Bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Live Monitoring</h1>
            <p className="text-xs text-slate-500">Klik kamera untuk melihat live stream penuh</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
              <Wifi className="w-3 h-3" /> {onlineCameras} Online
            </span>
            <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1.5 rounded-full border border-rose-200">
              <WifiOff className="w-3 h-3" /> {offlineCameras} Offline
            </span>
            {alertCameras > 0 && (
              <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200 animate-pulse">
                <AlertTriangle className="w-3 h-3" /> {alertCameras} Alert
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid layout selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {[['auto', 'Auto'], ['2x2', '2×2'], ['3x3', '3×3'], ['4x4', '4×4']].map(([val, label]) => (
              <button key={val} onClick={() => setGridLayout(val)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-md transition-colors ${gridLayout === val ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Engine control compact */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg text-white ${statusColors.bg}`}>
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusColors.dot}`} />
              {statusColors.text}
            </div>
            <button onClick={() => handleEngineControl('start')} disabled={isLoading || engineStatus === 'running'}
              className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white rounded-lg transition-colors disabled:cursor-not-allowed" title="Start Engine">
              <Play className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleEngineControl('stop')} disabled={isLoading || engineStatus === 'stopped'}
              className="p-2 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white rounded-lg transition-colors disabled:cursor-not-allowed" title="Stop Engine">
              <Square className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleEngineControl('restart')} disabled={isLoading}
              className="p-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white rounded-lg transition-colors disabled:cursor-not-allowed" title="Restart Engine">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Camera Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
          <div className={`grid ${getGridClass()} gap-3`}>
            {cameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => cam.online && setSelectedCamera(cam.id)}
                className={`
                  relative rounded-xl overflow-hidden border-2 transition-all group
                  ${cam.online
                    ? 'border-slate-700 hover:border-blue-500 cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-0.5'
                    : 'border-slate-800 opacity-60 cursor-not-allowed'}
                  ${cam.hasAlert ? 'border-orange-500 shadow-orange-500/30 shadow-md' : ''}
                  bg-slate-900
                `}
              >
                {/* Snapshot / Preview Frame */}
                <div className="aspect-video relative bg-slate-950 flex items-center justify-center overflow-hidden">
                  {cam.online ? (
                    <>
                      {/* Single snapshot frame for preview — refreshed every 5s */}
                      <img
                        src={`http://localhost:5001/api/stream/snapshot?camera_id=${cam.id}&t=${snapshotTimestamps[cam.id] || ''}`}
                        alt={`Preview ${cam.name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      {/* Fallback jika snapshot gagal */}
                      <div style={{ display: 'none' }} className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
                        <Camera className="w-8 h-8 mb-1 opacity-40" />
                        <p className="text-[10px]">Preview tidak tersedia</p>
                      </div>

                      {/* Hover overlay: klik untuk live */}
                      <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/90 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                          <Eye className="w-3.5 h-3.5" /> Lihat Live Stream
                        </div>
                      </div>

                      {/* Alert badge */}
                      {cam.hasAlert && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-orange-500 text-white text-[9px] font-bold px-2 py-1 rounded-full animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {cam.lastAlert}
                        </div>
                      )}

                      {/* REC indicator */}
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                        REC
                      </div>

                      {/* Timestamp overlay */}
                      <div className="absolute bottom-2 left-2 text-[9px] font-mono text-white/50">
                        {new Date().toLocaleTimeString('id-ID')}
                      </div>

                      {/* Snapshot refresh indicator */}
                      <div className="absolute bottom-2 right-2 text-[9px] text-white/40 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5" /> 5s
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-700 gap-2">
                      <WifiOff className="w-8 h-8 opacity-50" />
                      <p className="text-[10px] font-bold uppercase tracking-wider">Offline</p>
                    </div>
                  )}
                </div>

                {/* Camera Info Footer */}
                <div className="px-3 py-2 bg-slate-900 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-bold truncate">{cam.name}</p>
                      <p className="text-slate-500 text-[10px] truncate">{cam.location}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      {cam.online && (
                        <span className="text-slate-500 text-[9px] font-mono">{cam.fps}fps</span>
                      )}
                      <div className={`w-2 h-2 rounded-full ${cam.online ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Log Panel ── */}
        <div className="w-72 bg-white border-l border-slate-200 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" />
              Event Log
            </h3>
            <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse uppercase">LIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {logs.map((log) => {
              const style = getSeverityStyle(log.severity);
              return (
                <div
                  key={log.id}
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${log.cameraId ? '' : ''}`}
                  onClick={() => log.cameraId && setSelectedCamera(log.cameraId)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {style.icon}
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    {log.cameraId && (
                      <span className="ml-auto text-[9px] text-blue-500 font-bold hover:underline">→ Lihat</span>
                    )}
                  </div>
                  <p className={`text-[11px] font-semibold ${style.text}`}>{log.event}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{log.camera}</p>
                </div>
              );
            })}
          </div>

          {/* Summary footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Engine Status</p>
            <div className={`flex items-center gap-2 text-white text-xs font-bold px-3 py-2 rounded-lg ${statusColors.bg}`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${statusColors.dot}`} />
              AI Detection: {statusColors.text}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button onClick={() => handleEngineControl('start')} disabled={isLoading || engineStatus === 'running'}
                className="py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white text-[10px] font-bold rounded-lg transition-colors disabled:cursor-not-allowed flex flex-col items-center gap-0.5">
                <Play className="w-3 h-3" /> Start
              </button>
              <button onClick={() => handleEngineControl('stop')} disabled={isLoading || engineStatus === 'stopped'}
                className="py-2 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-200 text-white text-[10px] font-bold rounded-lg transition-colors disabled:cursor-not-allowed flex flex-col items-center gap-0.5">
                <Square className="w-3 h-3" /> Stop
              </button>
              <button onClick={() => handleEngineControl('restart')} disabled={isLoading}
                className="py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white text-[10px] font-bold rounded-lg transition-colors disabled:cursor-not-allowed flex flex-col items-center gap-0.5">
                <RotateCcw className="w-3 h-3" /> Restart
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
