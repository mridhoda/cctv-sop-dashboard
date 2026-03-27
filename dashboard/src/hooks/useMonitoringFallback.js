/**
 * useMonitoringFallback
 *
 * Provides Supabase-based fallback data for the Monitoring page when
 * the Socket.IO connection is unavailable or disconnected.
 *
 * Strategy:
 *   - Stats (detections, violations, fps): query camera_heartbeats + events
 *   - Engine status: query cameras.status + cameras.detection_state
 *   - Recent events: query last 20 events for the selected camera (today)
 *
 * This hook is INACTIVE when `isSocketConnected` is true — zero overhead
 * when Socket.IO is healthy.
 */
import { useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

const FALLBACK_POLL_INTERVAL_MS = 5_000; // poll every 5s when socket is down

/**
 * Map raw events rows → UI event shape used in Monitoring.jsx
 */
function mapEventRow(row, fallbackLocation = "") {
  const isViolation =
    row.status === "violation" || row.status === "pelanggaran";
  return {
    id: row.id,
    status: isViolation ? "Pelanggaran SOP" : "Valid SOP",
    person: row.identity_id ? "Identified" : "Unknown",
    type: row.violation_type || row.detection_type || row.status || "Detection",
    location: row.location || fallbackLocation,
    time: new Date(row.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  };
}

/**
 * @param {object} params
 * @param {boolean}  params.isSocketConnected – skip polling when socket is healthy
 * @param {string}   params.cameraId          – UUID of the currently selected camera
 * @param {string}   params.cameraLocation    – fallback location label for events
 * @param {function} params.onStats           – (stats) => void
 * @param {function} params.onEngineStatus    – (status: string) => void
 * @param {function} params.onEvents          – (events[]) => void  (merged, deduped)
 */
export function useMonitoringFallback({
  isSocketConnected,
  cameraId,
  cameraLocation = "",
  onStats,
  onEngineStatus,
  onEvents,
}) {
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchFallbackData = useCallback(async () => {
    if (!cameraId || !mountedRef.current) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStartISO = todayStart.toISOString();

    // ── 1. Engine status + FPS from cameras + latest heartbeat ──────────
    const [cameraResult, heartbeatResult, eventsResult] = await Promise.all([
      supabase
        .from("cameras")
        .select("status, detection_state")
        .eq("id", cameraId)
        .single(),

      supabase
        .from("camera_heartbeats")
        .select("status, fps, active_tracks, created_at")
        .eq("camera_id", cameraId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),

      supabase
        .from("events")
        .select(
          "id, status, violation_type, detection_type, location, timestamp, identity_id",
        )
        .eq("camera_id", cameraId)
        .gte("timestamp", todayStartISO)
        .order("timestamp", { ascending: false })
        .limit(20),
    ]);

    if (!mountedRef.current) return;

    // ── 2. Engine status ────────────────────────────────────────────────
    if (cameraResult.data && onEngineStatus) {
      const cam = cameraResult.data;
      const derivedStatus =
        cam.detection_state === "active"
          ? "running"
          : cam.status === "online"
            ? "idle"
            : "stopped";
      onEngineStatus(derivedStatus);
    }

    // ── 3. Stats ────────────────────────────────────────────────────────
    if (onStats && eventsResult.data) {
      const rows = eventsResult.data;
      const totalValid = rows.filter(
        (r) => r.status !== "violation" && r.status !== "pelanggaran",
      ).length;
      const totalViolations = rows.length - totalValid;
      const total = rows.length;
      const hb = heartbeatResult.data;

      onStats({
        detections: total,
        violations: totalViolations,
        valid: totalValid,
        compliance: total > 0 ? Math.round((totalValid / total) * 100) : 0,
        fps: hb?.fps ?? 0,
        activeTracks: hb?.active_tracks ?? 0,
      });
    }

    // ── 4. Recent events list ───────────────────────────────────────────
    if (onEvents && eventsResult.data && eventsResult.data.length > 0) {
      const mapped = eventsResult.data.map((r) =>
        mapEventRow(r, cameraLocation),
      );
      onEvents(mapped);
    }
  }, [cameraId, cameraLocation, onStats, onEngineStatus, onEvents]);

  useEffect(() => {
    mountedRef.current = true;

    if (isSocketConnected) {
      // Socket is healthy — clear any running fallback interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Socket is down — start Supabase polling immediately
    fetchFallbackData();
    intervalRef.current = setInterval(
      fetchFallbackData,
      FALLBACK_POLL_INTERVAL_MS,
    );

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSocketConnected, fetchFallbackData]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
}
