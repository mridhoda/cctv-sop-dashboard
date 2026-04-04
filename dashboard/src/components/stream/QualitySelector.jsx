import { Monitor, Loader2, ChevronDown } from "lucide-react";

/**
 * Dropdown quality selector for live stream.
 * Replaces pill buttons with a clean native select for better UX
 * especially when quality tiers grow (144p/360p/480p/720p/1080p).
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
    <div className="relative flex items-center">
      {/* Icon */}
      <Monitor
        size={14}
        className="pointer-events-none absolute left-2.5 z-10 text-slate-400"
      />

      {/* Native select — accessible, zero JS overhead */}
      <select
        id="quality-selector"
        value={selectedQuality}
        onChange={(e) => onSelect(e.target.value)}
        className="
          appearance-none
          rounded-lg border border-slate-200 bg-white
          py-1.5 pl-7 pr-7
          text-xs font-semibold text-slate-700
          shadow-sm
          transition-colors
          hover:border-slate-300 hover:bg-slate-50
          focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-300
          cursor-pointer
        "
        title="Pilih kualitas stream"
      >
        {qualities.map((q) => (
          <option key={q.key} value={q.key}>
            {q.label}
          </option>
        ))}
      </select>

      {/* Custom chevron icon */}
      <ChevronDown
        size={12}
        className="pointer-events-none absolute right-2 text-slate-400"
      />
    </div>
  );
}
