import { useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * A standalone refresh button that:
 * - Spins while the refetch(s) are in-flight
 * - Accepts one or more refetch functions
 * - Shows a brief "Updated" label after success
 */
export function RefreshButton({ onRefresh, className = "" }) {
  const [spinning, setSpinning] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = useCallback(async () => {
    if (spinning) return;
    setSpinning(true);
    setDone(false);

    try {
      // onRefresh can be a single fn or an array of fns
      const fns = Array.isArray(onRefresh) ? onRefresh : [onRefresh];
      await Promise.all(fns.map((fn) => fn()));
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } finally {
      setSpinning(false);
    }
  }, [onRefresh, spinning]);

  return (
    <button
      onClick={handleClick}
      disabled={spinning}
      title="Refresh data"
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
        "border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        done && "border-emerald-300 text-emerald-600 bg-emerald-50",
        className,
      )}
    >
      <RefreshCw
        size={14}
        className={cn("shrink-0", spinning && "animate-spin")}
      />
      <span className="hidden sm:inline">
        {spinning ? "Memuat..." : done ? "Diperbarui!" : "Refresh"}
      </span>
    </button>
  );
}

export default RefreshButton;
