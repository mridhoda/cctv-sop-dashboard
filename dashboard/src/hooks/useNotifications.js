import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useSocket, useSocketEvent } from "./useSocket";

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_NOTIFICATIONS = 50;

/**
 * Compliance milestones (%) that trigger a positive notification.
 * Only fire once per milestone per session.
 */
const COMPLIANCE_MILESTONES = [70, 80, 90, 95, 100];

// ── Helpers ────────────────────────────────────────────────────────────────

function buildId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function relativeTime(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return "Baru saja";
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

/**
 * Map a raw Supabase `events` row to a notification object.
 * Returns null if we don't want to surface this event as a notif.
 */
function mapSupabaseEventToNotif(row) {
  const isViolation =
    row.status === "violation" || row.status === "pelanggaran";

  // Only surface violations from Supabase stream
  // (valid SOP are handled separately via compliance milestone logic)
  if (!isViolation) return null;

  return {
    id: `sb-${row.id}`,
    type: "violation",
    title: "Pelanggaran SOP Terdeteksi",
    // Field persons in DB is `staff_name`, location is `location`
    description: [row.staff_name || "Unknown", row.location]
      .filter((v) => v && v.trim() !== "")
      .join(" — "),
    severity: "critical", // rose
    read: false,
    createdAt: row.created_at || row.timestamp || new Date().toISOString(),
  };
}

/**
 * Map a Socket.IO `detection_event` payload to a notification.
 */
function mapSocketEventToNotif(data) {
  const isViolation =
    data.status === "violation" || data.status === "pelanggaran";
  if (!isViolation) return null;

  return {
    id: `sk-${data.id ?? buildId()}`,
    type: "violation",
    title: "Pelanggaran SOP Terdeteksi",
    description: [data.name || "Unknown", data.location]
      .filter(Boolean)
      .join(" — "),
    severity: "critical",
    read: false,
    createdAt: new Date().toISOString(),
  };
}

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * Core notification hook.
 *
 * Data sources:
 *   1. Supabase Realtime — INSERT on `events` table (primary/persistent)
 *   2. Socket.IO `detection_event` — instant AI detections (pre-DB)
 *   3. Socket.IO `stats_update` — compliance milestone tracking
 *
 * Rules:
 *   - Violations always create a notification.
 *   - SOP Valid never creates individual notifications (too noisy).
 *   - Compliance milestones (70/80/90/95/100%) create one positive notif per milestone per session.
 *   - Max 50 notifications kept in memory (FIFO).
 *   - Deduplication by `id`.
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const seenIds = useRef(new Set());
  const reachedMilestones = useRef(new Set());

  // ── Helpers ──────────────────────────────────────────────────────────────

  const pushNotification = useCallback((notif) => {
    if (!notif) return;
    if (seenIds.current.has(notif.id)) return;
    seenIds.current.add(notif.id);

    setNotifications((prev) => [notif, ...prev].slice(0, MAX_NOTIFICATIONS));
  }, []);

  // ── Supabase Realtime ─────────────────────────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel("notifications-events")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events" },
        (payload) => {
          const notif = mapSupabaseEventToNotif(payload.new);
          pushNotification(notif);
        },
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [pushNotification]);

  // ── Socket.IO ─────────────────────────────────────────────────────────────

  useSocketEvent("detection_event", (data) => {
    if (!data) return;

    // Skip events already captured by Supabase (avoid double-notif for same row)
    // We prefix Supabase IDs with "sb-" and socket IDs with "sk-", so they
    // won't collide — but if the same `id` arrives from both we deduplicate.
    const notif = mapSocketEventToNotif(data);
    if (notif && data.id) {
      // If Supabase already pushed this id, skip
      if (seenIds.current.has(`sb-${data.id}`)) return;
    }
    pushNotification(notif);
  });

  useSocketEvent("stats_update", (data) => {
    if (!data) return;

    const totalValid = data.total_valid ?? data.valid ?? 0;
    const totalViolations = data.total_pelanggaran ?? data.violations ?? 0;
    const total = totalValid + totalViolations;
    if (total === 0) return;

    const compliance = Math.round((totalValid / total) * 100);

    for (const milestone of COMPLIANCE_MILESTONES) {
      if (
        compliance >= milestone &&
        !reachedMilestones.current.has(milestone)
      ) {
        reachedMilestones.current.add(milestone);

        pushNotification({
          id: `milestone-${milestone}`,
          type: "sop_compliant",
          title: `Compliance ${milestone}% Tercapai`,
          description: `Tingkat kepatuhan SOP saat ini: ${compliance}%`,
          severity: "info", // emerald
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    seenIds.current.clear();
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    relativeTime,
  };
}
