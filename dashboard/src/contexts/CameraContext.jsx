import { createContext, useContext, useState, useCallback } from "react";

const CameraContext = createContext(null);

const LAYOUTS = {
  single: { grid: "grid-cols-1", max: 1, label: "1×1" },
  quad: { grid: "grid-cols-2", max: 4, label: "2×2" },
  nine: { grid: "grid-cols-3", max: 9, label: "3×3" },
  mainPlusSidebar: { grid: "grid-cols-4", max: 5, label: "1+4" },
};

export function CameraProvider({ children }) {
  const [layout, setLayout] = useState("single");
  const [activeCameras, setActiveCameras] = useState([]);

  const addCamera = useCallback(
    (cameraId) => {
      setActiveCameras((prev) => {
        if (prev.length >= LAYOUTS[layout].max || prev.includes(cameraId))
          return prev;
        return [...prev, cameraId];
      });
    },
    [layout],
  );

  const removeCamera = useCallback((cameraId) => {
    setActiveCameras((prev) => prev.filter((id) => id !== cameraId));
  }, []);

  const changeLayout = useCallback((newLayout) => {
    setLayout(newLayout);
    setActiveCameras((prev) => {
      const max = LAYOUTS[newLayout].max;
      return prev.length > max ? prev.slice(0, max) : prev;
    });
  }, []);

  return (
    <CameraContext.Provider
      value={{
        layout,
        layoutConfig: LAYOUTS[layout],
        activeCameras,
        addCamera,
        removeCamera,
        changeLayout,
        layouts: LAYOUTS,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export function useCameraLayout() {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error("useCameraLayout must be used within a CameraProvider");
  }
  return context;
}
