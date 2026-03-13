import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "faceRecognitionEnabled";

/**
 * Custom hook untuk mengakses dan mengelola state Face Recognition
 * @returns {Object} { enabled: boolean, toggle: Function, setEnabled: Function }
 */
export function useFaceRecognition() {
  // Initialize dari localStorage, default false
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  // Listen untuk perubahan dari tab/browser lain
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setEnabled(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Function untuk toggle state
  const toggle = useCallback(
    (value) => {
      const newValue = typeof value === "boolean" ? value : !enabled;
      localStorage.setItem(STORAGE_KEY, String(newValue));
      setEnabled(newValue);
    },
    [enabled],
  );

  return {
    enabled,
    toggle,
    setEnabled,
  };
}

/**
 * Helper function untuk cek face recognition status tanpa hook
 * Berguna untuk digunakan di dalam fungsi non-React
 * @returns {boolean}
 */
export function isFaceRecognitionEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}
