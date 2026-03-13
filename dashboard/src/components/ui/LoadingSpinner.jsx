import { Loader2 } from "lucide-react";

export function LoadingSpinner({ message = "Memuat data...", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 gap-3 ${className}`}
    >
      <Loader2 size={32} className="animate-spin text-slate-400" />
      <p className="text-sm text-slate-500 font-medium">{message}</p>
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-200 rounded-lg" />
      ))}
    </div>
  );
}
