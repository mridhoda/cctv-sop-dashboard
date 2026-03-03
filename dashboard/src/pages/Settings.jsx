import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Camera,
  Cpu,
  Server,
  Bell,
  Save,
  RotateCcw,
  Check,
  Sliders,
  Wifi,
  X,
  AlertCircle,
} from 'lucide-react';

export default function Settings() {
  // TODO: GET /api/config to load current config
  const [config, setConfig] = useState({
    // Section 1: Kamera & Sumber Video
    camera_source: '0',
    detection_duration: 3,
    cooldown_minutes: 5,
    
    // Section 2: AI Detection Threshold
    conf_person: 0.65,
    conf_sop: 0.70,
    face_distance_threshold: 0.45,
    
    // Section 3: Server & Streaming
    server_fps: 30,
    server_quality: 85,
    
    // Section 4: Notifikasi
    telegram_enabled: false,
    telegram_bot_token: '',
    telegram_chat_id: '',
  });

  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Handle input changes for text and number inputs
  const handleInputChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle range slider changes
  const handleRangeChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: parseFloat(value),
    }));
  };

  // Handle toggle switch
  const handleToggle = (field) => {
    setConfig((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Save configuration
  const handleSaveConfig = async () => {
    setIsSaving(true);
    // TODO: PUT /api/config to save config
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default values
  const handleReset = () => {
    setConfig({
      camera_source: '0',
      detection_duration: 3,
      cooldown_minutes: 5,
      conf_person: 0.65,
      conf_sop: 0.70,
      face_distance_threshold: 0.45,
      server_fps: 30,
      server_quality: 85,
      telegram_enabled: false,
      telegram_bot_token: '',
      telegram_chat_id: '',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-slate-900 p-2.5 rounded-lg text-white">
              <SettingsIcon size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
          </div>
          <p className="text-slate-500 ml-11">Konfigurasi sistem CCTV SOP Compliance Detection</p>
        </div>
      </div>

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="fixed top-8 right-8 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-lg p-4 flex items-center gap-3 z-50 animate-fade-in">
          <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
            <Check size={20} />
          </div>
          <div>
            <p className="font-bold text-emerald-900">Konfigurasi Tersimpan</p>
            <p className="text-sm text-emerald-700">Semua perubahan telah berhasil disimpan ke sistem.</p>
          </div>
          <button
            onClick={() => setShowSuccessBanner(false)}
            className="ml-4 text-emerald-600 hover:text-emerald-700 transition"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="px-8 py-8 max-w-6xl">
        <div className="space-y-8">
          {/* ========== SECTION 1: Kamera & Sumber Video ========== */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-transparent px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-lg text-white">
                <Camera size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Kamera & Sumber Video</h2>
                <p className="text-sm text-slate-500 mt-0.5">Konfigurasi sumber input kamera CCTV dan parameter deteksi</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Camera Source */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Sumber Kamera (RTSP URL atau Index)
                </label>
                <input
                  type="text"
                  value={config.camera_source}
                  onChange={(e) => handleInputChange('camera_source', e.target.value)}
                  placeholder="Contoh: 0 atau rtsp://192.168.1.100:554/stream"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition bg-white text-slate-900 placeholder-slate-400"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Masukkan index kamera (0, 1, 2...) atau URL RTSP lengkap untuk streaming
                </p>
              </div>

              {/* Detection Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Durasi Deteksi (detik)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={config.detection_duration}
                    onChange={(e) => handleInputChange('detection_duration', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition bg-white text-slate-900"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Lama waktu untuk mengonfirmasi deteksi sebelum alert
                  </p>
                </div>

                {/* Cooldown Minutes */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Cooldown (menit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={config.cooldown_minutes}
                    onChange={(e) => handleInputChange('cooldown_minutes', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition bg-white text-slate-900"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Jeda sebelum alert untuk pelanggaran yang sama dapat muncul kembali
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========== SECTION 2: AI Detection Threshold ========== */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-transparent px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-lg text-white">
                <Cpu size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">AI Detection Threshold</h2>
                <p className="text-sm text-slate-500 mt-0.5">Atur tingkat kepercayaan diri (confidence) untuk berbagai deteksi AI</p>
              </div>
            </div>
            <div className="p-6 space-y-8">
              {/* Confidence Person */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Confidence Threshold Deteksi Orang
                  </label>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                    {config.conf_person.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.conf_person}
                  onChange={(e) => handleRangeChange('conf_person', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Semakin tinggi nilai, semakin ketat deteksi. Range: 0.0 - 1.0 (default: 0.65)
                </p>
              </div>

              {/* Confidence SOP */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Confidence Threshold Deteksi SOP
                  </label>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                    {config.conf_sop.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.conf_sop}
                  onChange={(e) => handleRangeChange('conf_sop', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Kepercayaan diri untuk mendeteksi pelanggaran SOP (helm, masker, dst). Range: 0.0 - 1.0 (default: 0.70)
                </p>
              </div>

              {/* Face Distance Threshold */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Threshold Pengenalan Wajah
                  </label>
                  <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                    {config.face_distance_threshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.face_distance_threshold}
                  onChange={(e) => handleRangeChange('face_distance_threshold', e.target.value)}
                  className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer slider"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Jarak embedding wajah untuk pencocokan identitas. Lebih rendah = lebih ketat. Range: 0.0 - 1.0 (default: 0.45)
                </p>
              </div>
            </div>
          </div>

          {/* ========== SECTION 3: Server & Streaming ========== */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-transparent px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-lg text-white">
                <Server size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Server & Streaming</h2>
                <p className="text-sm text-slate-500 mt-0.5">Konfigurasi output stream dan performa server</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Server FPS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    FPS Output Stream
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={config.server_fps}
                    onChange={(e) => handleInputChange('server_fps', parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition bg-white text-slate-900"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Frame rate untuk streaming output. Default: 30 FPS
                  </p>
                </div>

                {/* Server Quality */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-900">
                      Kualitas JPEG
                    </label>
                    <span className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                      {config.server_quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={config.server_quality}
                    onChange={(e) => handleRangeChange('server_quality', e.target.value)}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer slider"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">
                    Kualitas kompresi JPEG untuk streaming. Range: 1 - 100 (default: 85)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========== SECTION 4: Notifikasi ========== */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-transparent px-6 py-5 border-b border-slate-100 flex items-center gap-3">
              <div className="bg-slate-900 p-2.5 rounded-lg text-white">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Notifikasi</h2>
                <p className="text-sm text-slate-500 mt-0.5">Konfigurasi pengiriman notifikasi ke Telegram</p>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Telegram Enabled Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Wifi size={20} className="text-slate-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Aktifkan Notifikasi Telegram</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kirim alert insiden ke Telegram secara otomatis
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle('telegram_enabled')}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    config.telegram_enabled ? 'bg-slate-900' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${
                      config.telegram_enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Telegram Bot Token */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Bot Token Telegram
                </label>
                <input
                  type="password"
                  value={config.telegram_bot_token}
                  onChange={(e) => handleInputChange('telegram_bot_token', e.target.value)}
                  placeholder="Masukkan Bot Token dari @BotFather"
                  disabled={!config.telegram_enabled}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition bg-white text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Token sensitif — disimpan terenkripsi di server. Dapatkan dari Telegram @BotFather
                </p>
              </div>

              {/* Telegram Chat ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Chat ID Telegram
                </label>
                <input
                  type="text"
                  value={config.telegram_chat_id}
                  onChange={(e) => handleInputChange('telegram_chat_id', e.target.value)}
                  placeholder="Contoh: 123456789 atau -100123456789"
                  disabled={!config.telegram_enabled}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition bg-white text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  ID chat atau group dimana notifikasi akan dikirim. Gunakan @userinfobot untuk menemukan Chat ID Anda
                </p>
              </div>

              {!config.telegram_enabled && (
                <div className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <AlertCircle size={16} className="text-slate-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600">
                    Aktifkan toggle di atas untuk mengkonfigurasi notifikasi Telegram
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Simpan Konfigurasi
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="px-8 py-4 border-2 border-slate-900 text-slate-900 rounded-2xl font-bold text-lg hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Reset ke Default
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0f172a;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #0f172a;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.15);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
