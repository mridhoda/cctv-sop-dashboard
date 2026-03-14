import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Subscribe to Supabase Realtime INSERT on `camera_heartbeats`.
 * Returns a map of cameraId → { status, fps, lastSeen }.
 */
export function useRealtimeCameraStatus() {
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    const channel = supabase
      .channel("camera-heartbeats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "camera_heartbeats" },
        (payload) => {
          const hb = payload.new;
          setStatuses((prev) => ({
            ...prev,
            [hb.camera_id]: {
              status: hb.status,
              fps: hb.fps,
              lastSeen: hb.created_at,
              cpuUsage: hb.cpu_usage,
              memoryUsage: hb.memory_usage,
            },
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return statuses;
}
