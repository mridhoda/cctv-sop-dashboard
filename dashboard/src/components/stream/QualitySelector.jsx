import { cn } from "../../utils/cn";
import { Monitor, Loader2 } from "lucide-react";

/**
 * Compact pill-style quality selector for live stream.
 * Renders available quality tiers as clickable buttons.
 *
 * @param {{ qualities: Array, selectedQuality: string, onSelect: Function, isLoading: boolean }} props
 */
export default function QualitySelector({
  qualities,
  selectedQuality,
  onSelect,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5">
        <Loader2 size={14} className="animate-spin text-slate-400" />
        <span className="text-xs text-slate-400">Quality...</span>
      </div>
    );
  }

  if (qualities.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <Monitor size={14} className="text-slate-400 mr-0.5 shrink-0" />
      {qualities.map((q) => (
        <button
          key={q.key}
          onClick={() => onSelect(q.key)}
          className={cn(
            "rounded-md px-2 py-1 text-[11px] font-semibold transition-all",
            selectedQuality === q.key
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700",
          )}
          title={`Stream at ${q.label}`}
        >
          {q.label}
        </button>
      ))}
    </div>
  );
}
