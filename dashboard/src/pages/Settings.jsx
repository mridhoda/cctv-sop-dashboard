import React, { useState, useEffect } from "react";
import { AlertTriangle, Bot, Save, RotateCcw } from "lucide-react";
import { useConfig, useUpdateConfig } from "../hooks/useConfig";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorMessage } from "../components/ui/ErrorMessage";
import { useToast } from "../components/ui/Toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Toggle from "../components/ui/Toggle";

const DEFAULT_CONFIG = {
  camera_source: "0",
  detection_duration: 3,
  cooldown_minutes: 5,
  conf_person: 0.65,
  conf_sop: 0.7,
  face_distance_threshold: 0.45,
  server_fps: 30,
  server_quality: 85,
  telegram_enabled: false,
  telegram_bot_token: "",
  telegram_chat_id: "",
  enable_face_recognition: false,
};

// Convert 0-1 float to 0-100 integer for slider
const toSliderValue = (val) => Math.round(val * 100);
const fromSliderValue = (val) => val / 100;

function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  displayValue,
}) {
  return (
    <div className="group">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
          {displayValue ?? `0.${value}`}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-200">
        <div
          className="absolute h-full rounded-full bg-slate-900 transition-all duration-200"
          style={{ width: `${((value - min) / (max - min)) * 100}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-2 w-full cursor-pointer opacity-0 z-10"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
          style={{ left: `${((value - min) / (max - min)) * 100}%` }}
        >
          <div className="h-5 w-5 -translate-x-1/2 rounded-full border-2 border-slate-900 bg-white shadow-md shadow-slate-300 transition-transform group-hover:scale-110" />
        </div>
      </div>
    </div>
  );
}

function SettingsInput({
  label,
  value,
  type = "text",
  onChange,
  disabled,
  placeholder,
}) {
  if (onChange) {
    return (
      <div>
        <p className="mb-2 text-sm font-bold text-slate-700">{label}</p>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
        />
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm font-bold text-slate-700">{label}</p>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500 font-medium">
        {value}
      </div>
    </div>
  );
}

export default function Settings() {
  const { data: apiConfig, isLoading, error, refetch } = useConfig();
  const updateConfig = useUpdateConfig();
  const { addToast } = useToast();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const isSaving = updateConfig.isPending;

  // Track if config has been modified
  const [hasChanges, setHasChanges] = useState(false);

  // Face Recognition local toggle
  const [faceRecognitionEnabled, setFaceRecognitionEnabled] = useState(() => {
    return localStorage.getItem("faceRecognitionEnabled") === "true";
  });

  // Sync local state with API data on load
  useEffect(() => {
    if (apiConfig) {
      const loaded = apiConfig.data || apiConfig;
      setConfig((prev) => ({ ...prev, ...loaded }));
      setHasChanges(false);
      if (loaded.enable_face_recognition !== undefined) {
        setFaceRecognitionEnabled(!!loaded.enable_face_recognition);
        localStorage.setItem(
          "faceRecognitionEnabled",
          String(!!loaded.enable_face_recognition),
        );
      }
    }
  }, [apiConfig]);

  const handleInputChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleRangeChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: fromSliderValue(value) }));
    setHasChanges(true);
  };

  const handleToggle = (field) => {
    setConfig((prev) => {
      const newVal = !prev[field];
      return { ...prev, [field]: newVal };
    });
    setHasChanges(true);
  };

  const handleFaceRecognitionToggle = (enabled) => {
    setFaceRecognitionEnabled(enabled);
    localStorage.setItem("faceRecognitionEnabled", String(enabled));
    setConfig((prev) => ({
      ...prev,
      enable_face_recognition: enabled ? 1 : 0,
    }));
    setHasChanges(true);
    addToast({
      type: enabled ? "success" : "info",
      message: enabled
        ? "Fitur Face Recognition diaktifkan!"
        : "Fitur Face Recognition dinonaktifkan.",
    });
  };

  const handleSaveConfig = () => {
    updateConfig.mutate(config, {
      onSuccess: () => {
        addToast({
          type: "success",
          message: "Konfigurasi berhasil disimpan!",
        });
        setHasChanges(false);
      },
      onError: (err) => {
        addToast({
          type: "error",
          message: err.response?.data?.message || "Gagal menyimpan konfigurasi",
        });
      },
    });
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_CONFIG });
    setFaceRecognitionEnabled(false);
    localStorage.setItem("faceRecognitionEnabled", "false");
    setHasChanges(true);
    addToast({ type: "info", message: "Pengaturan dikembalikan ke default." });
  };

  if (isLoading) return <LoadingSpinner message="Memuat konfigurasi..." />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Pengaturan Sistem
          </h2>
          <p className="mt-1 text-slate-500">
            Konfigurasi AI Engine & streaming.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset Default
          </Button>
          <Button onClick={handleSaveConfig} disabled={isSaving || !hasChanges}>
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Unsaved warning ── */}
      {hasChanges && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
          <div className="flex items-start gap-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p>
              Ada perubahan yang belum disimpan. Simpan konfigurasi untuk
              menerapkan ke backend Flask + Socket.IO.
            </p>
          </div>
        </div>
      )}

      {/* ── Settings grid ── */}
      <div className="grid gap-6 2xl:grid-cols-2">
        {/* Camera & Video Source */}
        <Card
          title="Kamera & Sumber Video"
          subtitle="RTSP source dan timing deteksi"
        >
          <div className="space-y-4">
            <SettingsInput
              label="Sumber Kamera"
              value={config.camera_source}
              onChange={(val) => handleInputChange("camera_source", val)}
            />
            <SettingsInput
              label="Durasi Konfirmasi Deteksi (detik)"
              value={config.detection_duration.toString()}
              onChange={(val) =>
                handleInputChange("detection_duration", Number(val))
              }
            />
            <SettingsInput
              label="Cooldown Re-alert (menit)"
              value={config.cooldown_minutes.toString()}
              onChange={(val) =>
                handleInputChange("cooldown_minutes", Number(val))
              }
            />
          </div>
        </Card>

        {/* AI Detection Threshold */}
        <Card
          title="AI Detection Threshold"
          subtitle="Slider confidence dan jarak wajah"
        >
          <div className="space-y-5">
            <SliderField
              label="Confidence Deteksi Orang"
              value={toSliderValue(config.conf_person)}
              onChange={(val) => handleRangeChange("conf_person", val)}
              displayValue={config.conf_person.toFixed(2)}
            />
            <SliderField
              label="Confidence Deteksi SOP"
              value={toSliderValue(config.conf_sop)}
              onChange={(val) => handleRangeChange("conf_sop", val)}
              displayValue={config.conf_sop.toFixed(2)}
            />
            <SliderField
              label="Threshold Jarak Wajah"
              value={toSliderValue(config.face_distance_threshold)}
              onChange={(val) =>
                handleRangeChange("face_distance_threshold", val)
              }
              displayValue={config.face_distance_threshold.toFixed(2)}
            />
          </div>
        </Card>

        {/* Server & Streaming */}
        <Card
          title="Server & Streaming"
          subtitle="FPS dan kualitas JPEG stream"
        >
          <div className="space-y-4">
            <SettingsInput
              label="Server FPS"
              value={config.server_fps.toString()}
              onChange={(val) => handleInputChange("server_fps", Number(val))}
            />
            <SliderField
              label="Kualitas JPEG Stream"
              value={config.server_quality}
              min={1}
              max={100}
              onChange={(val) => handleInputChange("server_quality", val)}
              displayValue={`${config.server_quality}%`}
            />
          </div>
        </Card>

        {/* Telegram Notification */}
        <Card
          title="Notifikasi Telegram"
          subtitle="Integrasi alert ke Telegram bot"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition-colors hover:bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">Aktifkan Notifikasi</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Status: {config.telegram_enabled ? "Aktif" : "Nonaktif"}
                </p>
              </div>
              <Toggle
                enabled={config.telegram_enabled}
                onChange={() => handleToggle("telegram_enabled")}
                label="Aktifkan notifikasi Telegram"
              />
            </div>

            <SettingsInput
              label="Bot Token"
              value={config.telegram_bot_token}
              type="password"
              placeholder="••••••••••••••••••••"
              disabled={!config.telegram_enabled}
              onChange={(val) => handleInputChange("telegram_bot_token", val)}
            />
            <SettingsInput
              label="Chat ID"
              value={config.telegram_chat_id}
              placeholder="-1001234567890"
              disabled={!config.telegram_enabled}
              onChange={(val) => handleInputChange("telegram_chat_id", val)}
            />

            <Button variant="secondary" disabled={!config.telegram_enabled}>
              <Bot className="h-4 w-4" />
              Kirim Pesan Test
            </Button>
          </div>
        </Card>

        {/* Face Recognition Feature */}
        <Card
          title="Fitur Face Recognition"
          subtitle="Aktifkan fitur pengenalan wajah dan manajemen identitas"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition-colors hover:bg-slate-50">
              <div>
                <p className="font-bold text-slate-800">
                  Aktifkan Face Recognition
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Status: {faceRecognitionEnabled ? "Aktif" : "Nonaktif"}
                </p>
              </div>
              <Toggle
                enabled={faceRecognitionEnabled}
                onChange={handleFaceRecognitionToggle}
                label="Aktifkan fitur Face Recognition"
              />
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="text-[13px] leading-relaxed text-amber-900">
                <span className="font-bold text-amber-700 uppercase text-[10px] tracking-wider block mb-1">
                  Catatan Penting
                </span>
                Fitur ini merupakan bagian dari plan premium. Saat diaktifkan,
                menu <span className="font-bold">"Manajemen Identitas"</span>{" "}
                akan muncul di sidebar dan nama staff akan ditampilkan di
                Riwayat Insiden serta Dashboard.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
