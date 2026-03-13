import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Camera, MapPin, Link, RotateCw } from "lucide-react";

const cameraSchema = z.object({
  name: z.string().min(1, "Nama kamera wajib diisi"),
  source_url: z
    .string()
    .min(1, "URL stream wajib diisi")
    .refine(
      (v) =>
        v.startsWith("rtsp://") ||
        v.startsWith("http://") ||
        v.startsWith("https://") ||
        v.startsWith("0") || // webcam index
        /^\d+$/.test(v),
      "Format URL tidak valid. Gunakan rtsp://, http://, atau indeks kamera (0, 1, …)",
    ),
  location: z.string().optional(),
  rotation: z.coerce.number().min(0).max(360).optional(),
});

// ── Field wrapper for consistent layout ──
function FormField({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1 text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
      )}
      {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Input base style ──
const inputClass =
  "w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition text-sm text-slate-900 placeholder:text-slate-400 bg-white";

// ─────────────────────────────────────────────
// CameraFormModal
// ─────────────────────────────────────────────
export function CameraFormModal({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  isLoading,
}) {
  const isEditing = !!defaultValues?.id;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(cameraSchema),
    defaultValues: {
      name: "",
      source_url: "",
      location: "",
      rotation: 0,
    },
  });

  // Sync form when editing camera changes
  useEffect(() => {
    if (isOpen) {
      reset(
        isEditing
          ? {
              name: defaultValues.name || defaultValues.camera_name || "",
              source_url: defaultValues.source_url || "",
              location: defaultValues.location || "",
              rotation: defaultValues.rotation ?? 0,
            }
          : { name: "", source_url: "", location: "", rotation: 0 },
      );
    }
  }, [isOpen, isEditing, defaultValues, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl">
              <Camera size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? "Edit Kamera" : "Tambah Kamera Baru"}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? `ID: #${defaultValues.id}`
                  : "Hubungkan kamera CCTV ke dashboard"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── Form ── */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="px-6 py-5 space-y-4"
        >
          {/* Nama Kamera */}
          <FormField label="Nama Kamera" required error={errors.name?.message}>
            <div className="relative">
              <Camera
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                {...register("name")}
                className={`${inputClass} pl-9`}
                placeholder="Contoh: CCTV 01 — Area Produksi"
              />
            </div>
          </FormField>

          {/* URL Stream */}
          <FormField
            label="URL Stream"
            required
            hint="Format: rtsp://ip:port/stream  atau  http://  atau indeks webcam (0, 1, ...)"
            error={errors.source_url?.message}
          >
            <div className="relative">
              <Link
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                {...register("source_url")}
                className={`${inputClass} pl-9 font-mono`}
                placeholder="rtsp://192.168.1.100:554/stream"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </FormField>

          {/* Lokasi */}
          <FormField label="Lokasi" error={errors.location?.message}>
            <div className="relative">
              <MapPin
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                {...register("location")}
                className={`${inputClass} pl-9`}
                placeholder="Contoh: Area Produksi A, Pintu Masuk"
              />
            </div>
          </FormField>

          {/* Rotasi */}
          <FormField
            label="Rotasi (derajat)"
            hint="0 = normal, 90 / 180 / 270 untuk memutar tampilan kamera"
            error={errors.rotation?.message}
          >
            <div className="relative">
              <RotateCw
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="number"
                {...register("rotation")}
                className={`${inputClass} pl-9`}
                placeholder="0"
                min={0}
                max={360}
              />
            </div>
          </FormField>

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Menyimpan..."
                : isEditing
                  ? "Simpan Perubahan"
                  : "Tambah Kamera"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition disabled:opacity-50"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
