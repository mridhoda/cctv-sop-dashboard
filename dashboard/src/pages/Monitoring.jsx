import React, { useState, useEffect } from 'react';
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
  Power,
} from 'lucide-react';

// TODO: Connect WebSocket socket.io-client for real-time events
// TODO: GET /api/status to populate camera status

export default function Monitoring() {
  const [engineStatus, setEngineStatus] = useState('running'); // 'running', 'stopped', 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [recentLogs, setRecentLogs] = useState([
    { id: 1, timestamp: '14:32:15', event: 'Deteksi Pelanggaran - Area Koridor Utama', severity: 'high' },
    { id: 2, timestamp: '14:15:42', event: 'Kamera 3 Offline', severity: 'critical' },
    { id: 3, timestamp: '14:01:28', event: 'Deteksi Pelanggaran - Ruang Server', severity: 'high' },
    { id: 4, timestamp: '13:45:09', event: 'Engine Started Successfully', severity: 'info' },
    { id: 5, timestamp: '13:30:55', event: 'Deteksi Pelanggaran - Area Pintu Masuk', severity: 'high' },
  ]);
  const [cameraStatus, setCameraStatus] = useState([
    { id: 1, name: 'Koridor Utama', online: true, lastSeen: '14:32:15' },
    { id: 2, name: 'Ruang Server', online: true, lastSeen: '14:32:18' },
    { id: 3, name: 'Area Gudang', online: false, lastSeen: '13:20:45' },
    { id: 4, name: 'Pintu Masuk', online: true, lastSeen: '14:32:12' },
    { id: 5, name: 'Ruang Rapat', online: true, lastSeen: '14:32:20' },
    { id: 6, name: 'Parkir Area', online: false, lastSeen: '12:15:30' },
  ]);

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
        // restart doesn't change status visually
      }
    } catch (error) {
      console.error(`Engine ${action} failed:`, error);
      setEngineStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (engineStatus) {
      case 'running':
        return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' };
      case 'stopped':
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
      case 'error':
        return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' };
      default:
        return { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-rose-600';
      case 'high':
        return 'text-orange-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-slate-600';
    }
  };

  const statusColors = getStatusColor();

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-slate-100">
            <Video className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Live Monitoring</h1>
            <p className="text-sm text-slate-500">Real-time CCTV stream dan kontrol engine</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Stream Section */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video Stream Card */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-slate-600" />
                MJPEG Stream
              </h2>
              <button className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <Maximize2 className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="bg-slate-900 aspect-video flex items-center justify-center relative overflow-hidden">
              <img
                src="http://localhost:5001/api/stream/video"
                alt="Live MJPEG Stream"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              <div
                style={{ display: 'none' }}
                className="w-full h-full flex items-center justify-center bg-slate-800 absolute inset-0"
              >
                <img
                  src="http://localhost:5001/api/stream/snapshot"
                  alt="Snapshot Fallback"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
                <div
                  style={{ display: 'none' }}
                  className="w-full h-full flex flex-col items-center justify-center bg-slate-900 absolute inset-0 text-slate-400"
                >
                  <AlertTriangle className="w-12 h-12 mb-3" />
                  <p className="text-sm">Stream tidak tersedia</p>
                </div>
              </div>
            </div>
          </div>

          {/* Engine Control Panel */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-slate-600" />
                Engine Control
              </h2>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusColors.bg} ${statusColors.border}`}>
                <div className={`w-2 h-2 rounded-full ${statusColors.dot} animate-pulse`}></div>
                <span className={`text-sm font-medium ${statusColors.text}`}>
                  {engineStatus === 'running' ? 'Running' : engineStatus === 'stopped' ? 'Stopped' : 'Error'}
                </span>
              </div>
            </div>

            {/* Engine Status Card */}
            <div className={`rounded-lg p-4 mb-6 border ${statusColors.bg} ${statusColors.border}`}>
              <div className="flex items-center gap-3">
                {engineStatus === 'running' && (
                  <>
                    <Activity className={`w-5 h-5 ${statusColors.text} animate-pulse`} />
                    <div>
                      <p className={`font-medium ${statusColors.text}`}>Engine Berjalan</p>
                      <p className="text-xs text-slate-600">Deteksi pelanggaran aktif</p>
                    </div>
                  </>
                )}
                {engineStatus === 'stopped' && (
                  <>
                    <Power className={`w-5 h-5 ${statusColors.text}`} />
                    <div>
                      <p className={`font-medium ${statusColors.text}`}>Engine Berhenti</p>
                      <p className="text-xs text-slate-600">Deteksi pelanggaran tidak aktif</p>
                    </div>
                  </>
                )}
                {engineStatus === 'error' && (
                  <>
                    <AlertTriangle className={`w-5 h-5 ${statusColors.text} animate-pulse`} />
                    <div>
                      <p className={`font-medium ${statusColors.text}`}>Error</p>
                      <p className="text-xs text-slate-600">Terjadi kesalahan pada engine</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleEngineControl('start')}
                disabled={isLoading || engineStatus === 'running'}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
              <button
                onClick={() => handleEngineControl('stop')}
                disabled={isLoading || engineStatus === 'stopped'}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
              <button
                onClick={() => handleEngineControl('restart')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                <RotateCcw className="w-4 h-4" />
                Restart
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Real-time Logs */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200 flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-600" />
                Recent Events
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2 p-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getSeverityColor(log.severity)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500">{log.timestamp}</p>
                        <p className="text-sm text-slate-700 mt-1">{log.event}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Camera Status */}
          <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-slate-600" />
                Camera Status
              </h2>
            </div>
            <div className="space-y-2 p-4">
              {cameraStatus.map((camera) => (
                <div
                  key={camera.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{camera.name}</p>
                    <p className="text-xs text-slate-500">{camera.lastSeen}</p>
                  </div>
                  {camera.online ? (
                    <Wifi className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-rose-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
