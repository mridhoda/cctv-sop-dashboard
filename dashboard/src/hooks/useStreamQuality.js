import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "../utils/url";

const API_BASE = getApiBaseUrl();
const DEFAULT_QUALITY = "720p";

/**
 * Hook that fetches available quality tiers from the backend
 * and manages the currently selected quality.
 *
 * @returns {{ qualities: Array, selectedQuality: string, setSelectedQuality: Function, isLoading: boolean }}
 */
export function useStreamQuality() {
  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState(DEFAULT_QUALITY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchQualities() {
      try {
        const res = await fetch(`${API_BASE}/api/stream/qualities`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        const list = data.qualities ?? [];
        setQualities(list);

        // Pick the server-designated default, or fall back to 720p
        const defaultTier = list.find((q) => q.default);
        if (defaultTier) setSelectedQuality(defaultTier.key);
      } catch (err) {
        console.warn("[useStreamQuality] Failed to fetch qualities:", err);
        // Provide a sensible fallback so the UI still renders
        if (!cancelled) {
          setQualities([
            { key: "360p", label: "360p", default: false },
            { key: "720p", label: "720p", default: true },
            { key: "1080p", label: "1080p", default: false },
          ]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchQualities();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectQuality = useCallback((key) => {
    setSelectedQuality(key);
  }, []);

  return { qualities, selectedQuality, selectQuality, isLoading };
}
