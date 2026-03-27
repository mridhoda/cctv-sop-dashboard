import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../utils/cn";

const TONES = {
  slate: {
    iconWrap: "bg-slate-50",
    icon: "text-slate-900",
    delta: "text-slate-600",
    bar: "bg-slate-900",
    tooltip: "bg-slate-900 text-white",
  },
  emerald: {
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-700",
    delta: "text-emerald-600",
    bar: "bg-emerald-500",
    tooltip: "bg-emerald-700 text-white",
  },
  rose: {
    iconWrap: "bg-rose-100",
    icon: "text-rose-700",
    delta: "text-rose-600",
    bar: "bg-rose-500",
    tooltip: "bg-rose-600 text-white",
  },
  amber: {
    iconWrap: "bg-amber-50",
    icon: "text-amber-500",
    delta: "text-amber-500",
    bar: "bg-amber-400",
    tooltip: "bg-amber-500 text-white",
  },
};

const DEFAULT_SPARK = [30, 42, 35, 48, 56, 59, 70];

export function MetricCard({ item }) {
  const Icon = item.icon;
  const spark = item.spark || DEFAULT_SPARK;
  const labels = item.sparkLabels || spark.map((_, i) => `Hari ${i + 1}`);
  const max = Math.max(...spark, 1);
  const tone = TONES[item.tone] || TONES.slate;

  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{item.title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {item.value}
          </p>
          <p className={cn("mt-2 text-xs font-medium", tone.delta)}>
            {item.delta}
          </p>
        </div>
        <div className={cn("rounded-2xl p-3", tone.iconWrap)}>
          <Icon className={cn("h-5 w-5", tone.icon)} />
        </div>
      </div>

      {/* Spark bars with hover tooltip */}
      <div className="mt-5 flex h-10 items-end gap-1.5 relative">
        {spark.map((value, idx) => (
          <div
            key={idx}
            className="relative flex-1 flex flex-col items-center justify-end h-full"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Tooltip */}
            <AnimatePresence>
              {hoveredIdx === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    "absolute bottom-full mb-2 left-1/2 -translate-x-1/2",
                    "whitespace-nowrap rounded-lg px-2 py-1 text-[10px] font-semibold shadow-lg z-10",
                    "pointer-events-none",
                    tone.tooltip,
                  )}
                >
                  <div className="text-center leading-tight">
                    <div>{labels[idx]}</div>
                    <div className="font-bold">{value}</div>
                  </div>
                  {/* Caret */}
                  <div
                    className={cn(
                      "absolute top-full left-1/2 -translate-x-1/2 w-0 h-0",
                      "border-l-[4px] border-l-transparent",
                      "border-r-[4px] border-r-transparent",
                      "border-t-[4px]",
                    )}
                    style={{
                      borderTopColor: tone.tooltip.includes("emerald")
                        ? "#047857"
                        : tone.tooltip.includes("rose")
                          ? "#e11d48"
                          : tone.tooltip.includes("amber")
                            ? "#f59e0b"
                            : "#0f172a",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bar itself */}
            <motion.div
              className={cn(
                "w-full rounded-full cursor-pointer transition-opacity",
                hoveredIdx !== null && hoveredIdx !== idx
                  ? "opacity-40"
                  : "opacity-100",
              )}
              style={{ backgroundColor: "transparent" }}
              initial={{ height: 8 }}
              animate={{
                height:
                  value === 0
                    ? 2 // zero = very thin stub to visually signal "no data"
                    : Math.max((value / max) * 40, 4),
              }}
              transition={{ delay: idx * 0.05, duration: 0.4 }}
            >
              <div className={cn("h-full w-full rounded-full", tone.bar)} />
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default MetricCard;
