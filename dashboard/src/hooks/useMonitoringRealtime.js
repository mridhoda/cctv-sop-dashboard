/**
 * useMonitoringRealtime
 *
 * Supabase Realtime subscriptions untuk Monitoring page.
 * Menggantikan 3 useSocketEvent hooks:
 *   - "engine_status"   → cameras.detection_state
 *   - "stats_update"    → camera_heartbeats (latest row)
 *   - "detection_event" → events (INSERT baru)
 *
 * Socket.IO TETAP dipakai untuk mengirim perintah (emit engine_command).
 * Hook ini hanya untuk MENERIMA data — arah sebaliknya.
 */
import { useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

/**
 * Supabase partitions the events table by month (events_y2026m03, etc.).
 * Realtime CDC fires from the PARTITION table, not the parent.
 * Returns the correct partition name for today.
 */
function currentEventsPartition() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `events_y${y}m${m}`;
}

/** Map row camera_heartbeats → stats shape yang dipakai Monitoring.jsx */
function mapHeartbeatToStats(row) {
  const totalValid = row.total_valid ?? 0;
  const totalViol = row.total_pelanggaran ?? 0;
  const total = totalValid + totalViol;
  return {
    detections: total,
    violations: totalViol,
    valid: totalValid,
    compliance: total > 0 ? Math.round((totalValid / total) * 100) : 0,
    fps: row.fps ?? 0,
    activeTracks: row.active_tracks ?? 0,
  };
}

/** Map row events → event shape yang dipakai Monitoring.jsx */
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
 * @param {object}   params
 * @param {string}   params.cameraId        – UUID kamera yang dipilih
 * @param {string}   params.cameraLocation  – label lokasi untuk fallback event
 * @param {function} params.onStats         – (stats) => void
 * @param {function} params.onEngineStatus  – (status: string) => void
 * @param {function} params.onEvent         – (event) => void  (satu event baru)
 */
export function useMonitoringRealtime({
  cameraId,
  cameraLocation = "",
  onStats,
  onEngineStatus,
  onEvent,
}) {
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!cameraId) return;
    mountedRef.current = true;

    // ── 1. Engine status via cameras table ────────────────────────────
    const cameraChannel = supabase
      .channel(`monitoring-camera-${cameraId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cameras",
          filter: `id=eq.${cameraId}`,
        },
        (payload) => {
          if (!mountedRef.current || !onEngineStatus) return;
          const row = payload.new;
          // detection_state: "active" → "running", "inactive" → "stopped"
          const status =
            row.detection_state === "active"
              ? "running"
              : row.detection_state === "error"
                ? "error"
                : "stopped";
          onEngineStatus(status);
        },
      )
      .subscribe();

    // ── 2. Stats via camera_heartbeats (INSERT baru) ──────────────────
    const statsChannel = supabase
      .channel(`monitoring-heartbeat-${cameraId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "camera_heartbeats",
          filter: `camera_id=eq.${cameraId}`,
        },
        (payload) => {
          if (!mountedRef.current || !onStats) return;
          onStats(mapHeartbeatToStats(payload.new));
          // Engine status juga ada di heartbeat (status field)
          if (onEngineStatus && payload.new.status) {
            const hbStatus =
              payload.new.status === "online" ? "running" : "stopped";
            onEngineStatus(hbStatus);
          }
        },
      )
      .subscribe();

    // ── 3. Detection events (INSERT baru ke partisi bulan ini) ────────
    const eventsPartition = currentEventsPartition();
    const eventsChannel = supabase
      .channel(`monitoring-events-${cameraId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: eventsPartition, // e.g. events_y2026m03
          filter: `camera_id=eq.${cameraId}`,
        },
        (payload) => {
          if (!mountedRef.current || !onEvent) return;
          onEvent(mapEventRow(payload.new, cameraLocation));
        },
      )
      .subscribe();

    return () => {
      mountedRef.current = false;
      supabase.removeChannel(cameraChannel);
      supabase.removeChannel(statsChannel);
      supabase.removeChannel(eventsChannel);
    };
  }, [cameraId, cameraLocation, onStats, onEngineStatus, onEvent]);
}
