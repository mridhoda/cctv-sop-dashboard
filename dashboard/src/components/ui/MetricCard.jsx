import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const TONES = {
  slate: {
    iconWrap: "bg-slate-50",
    icon: "text-slate-900",
    delta: "text-slate-600",
    bar: "bg-slate-900",
  },
  emerald: {
    iconWrap: "bg-emerald-100",
    icon: "text-emerald-700",
    delta: "text-emerald-600",
    bar: "bg-emerald-500",
  },
  rose: {
    iconWrap: "bg-rose-100",
    icon: "text-rose-700",
    delta: "text-rose-600",
    bar: "bg-rose-500",
  },
  amber: {
    iconWrap: "bg-amber-50",
    icon: "text-amber-500",
    delta: "text-amber-500",
    bar: "bg-amber-400",
  },
};

// Default sparkline data if not provided
const DEFAULT_SPARK = [30, 42, 35, 48, 56, 59, 70];

export function MetricCard({ item }) {
  const Icon = item.icon;
  const spark = item.spark || DEFAULT_SPARK;
  const max = Math.max(...spark);
  const tone = TONES[item.tone] || TONES.slate;

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

      {/* Mini sparkline */}
      <div className="mt-5 flex h-10 items-end gap-1.5">
        {spark.map((value, idx) => (
          <motion.div
            key={idx}
            className="flex-1 rounded-full bg-slate-100"
            initial={{ height: 8 }}
            animate={{ height: Math.max((value / max) * 40, 8) }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
          >
            <div className={cn("h-full rounded-full", tone.bar)} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default MetricCard;
