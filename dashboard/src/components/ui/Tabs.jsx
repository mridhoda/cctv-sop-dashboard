import { cn } from "../../utils/cn";

export function Tabs({ items, active, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-sm">
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={cn(
            "rounded-lg px-4 py-2 transition",
            active === item
              ? "bg-slate-900 font-semibold text-white"
              : "text-slate-500 hover:bg-slate-50",
          )}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
