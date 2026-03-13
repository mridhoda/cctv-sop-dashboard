import { AlertTriangle, RefreshCcw } from "lucide-react";

export function ErrorMessage({ error, onRetry, className = "" }) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "Terjadi kesalahan. Silakan coba lagi.";

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 gap-4 ${className}`}
    >
      <div className="bg-rose-100 p-4 rounded-full">
        <AlertTriangle size={28} className="text-rose-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700 mb-1">
          Gagal Memuat Data
        </p>
        <p className="text-xs text-slate-500 max-w-xs">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 transition"
        >
          <RefreshCcw size={14} />
          Coba Lagi
        </button>
      )}
    </div>
  );
}
