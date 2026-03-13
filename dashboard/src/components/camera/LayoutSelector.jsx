import { useCameraLayout } from "../../contexts/CameraContext";

const LAYOUT_OPTIONS = [
  { id: "single", label: "1×1" },
  { id: "quad", label: "2×2" },
  { id: "nine", label: "3×3" },
  { id: "mainPlusSidebar", label: "1+4" },
];

export function LayoutSelector() {
  const { layout, changeLayout } = useCameraLayout();

  return (
    <div className="flex items-center gap-1.5">
      {LAYOUT_OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => changeLayout(option.id)}
          className={`
            px-3 py-1.5 rounded-lg text-xs font-bold transition
            ${
              layout === option.id
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
