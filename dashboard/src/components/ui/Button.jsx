import { cn } from "../../utils/cn";

const VARIANT_STYLES = {
  primary:
    "bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-200 active:bg-slate-950",
  secondary:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100",
  soft: "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 active:bg-slate-200",
  dangerSoft:
    "border border-rose-100 bg-rose-50 text-rose-700 hover:bg-rose-100 active:bg-rose-200",
  ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
        VARIANT_STYLES[variant],
        disabled && "pointer-events-none opacity-50 grayscale",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
