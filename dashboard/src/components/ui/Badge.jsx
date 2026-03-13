import { cn } from "../../utils/cn";

const TONE_STYLES = {
  slate: "bg-slate-50 text-slate-700 border-slate-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
  amber: "bg-amber-50 text-amber-600 border-amber-100",
  blue: "bg-blue-50 text-blue-900 border-blue-100",
};

export function Badge({ children, tone = "slate", className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        TONE_STYLES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export default Badge;
