import { cn } from "../../utils/cn";

export function Toggle({ enabled, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!enabled)}
      className={cn(
        "group relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
        enabled ? "bg-slate-900" : "bg-slate-200",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-active:w-5",
          enabled ? "translate-x-5" : "translate-x-1",
        )}
      />
    </button>
  );
}

export default Toggle;
