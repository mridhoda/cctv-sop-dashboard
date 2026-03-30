/**
 * useEventsRealtime
 *
 * Supabase-First hook for Reports & History pages.
 * Replaces useEvents (React Query polling) with:
 *   1. Direct Supabase query for initial load + filter changes
 *   2. Supabase Realtime subscription for live INSERT updates
 *   3. setInterval safety-net refresh every 2 minutes
 *
 * Follows the same pattern as useMonitoringRealtime.js which has
 * proven stable for Live Monitoring.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { supabase } from "../lib/supabase";

// ── Helpers ────────────────────────────────────────────────────────────────

/** Build the partition table name for the current month */
function currentEventsPartition() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `events_y${y}m${m}`;
}

/** Stable serialization for dependency comparison */
function stableKey(obj) {
  return JSON.stringify(obj);
}

// ── Fetch helpers (direct Supabase queries, no React Query) ────────────────

async function queryEvents({
  page = 1,
  limit = 20,
  status,
  date_from,
  date_to,
  has_photo,
  search,
}) {
  let query = supabase
    .from("events")
    .select(
      `
      id, timestamp, location, status, violation_type,
      missing_sops, confidence_person, confidence_sop,
      staff_name, photo_path, ai_description, track_id,
      is_reviewed, review_notes, detection_type,
      cameras(id, name, location)
    `,
      { count: "exact" },
    )
    .order("timestamp", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status) query = query.eq("status", status);
  if (date_from) query = query.gte("timestamp", date_from);
  if (date_to) query = query.lte("timestamp", date_to);
  if (has_photo) query = query.not("photo_path", "is", null);
  if (search) query = query.textSearch("search_vector", search);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

async function queryStats(date_from, date_to) {
  let queryAll = supabase
    .from("events")
    .select("*", { count: "exact", head: true });

  let queryViolations = supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "violation");

  let queryValid = supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .in("status", ["valid", "compliant"]);

  // NOTE: has_photo filter intentionally NOT applied on stats.
  // Stats show totals for ALL events; the table list may show only photo events.

  if (date_from) {
    queryAll = queryAll.gte("timestamp", date_from);
    queryViolations = queryViolations.gte("timestamp", date_from);
    queryValid = queryValid.gte("timestamp", date_from);
  }
  if (date_to) {
    queryAll = queryAll.lte("timestamp", date_to);
    queryViolations = queryViolations.lte("timestamp", date_to);
    queryValid = queryValid.lte("timestamp", date_to);
  }

  const [allRes, violationRes, validRes] = await Promise.all([
    queryAll,
    queryViolations,
    queryValid,
  ]);

  const firstError = allRes.error || violationRes.error || validRes.error;
  if (firstError) throw firstError;

  return {
    total: allRes.count || 0,
    violations: violationRes.count || 0,
    valid: validRes.count || 0,
  };
}

// ── Safety net interval (ms) ───────────────────────────────────────────────
const REFRESH_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

// ── Main Hook ──────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {string} [params.status]       - "violation" | "valid" | undefined
 * @param {string} [params.date_from]    - ISO date string
 * @param {string} [params.date_to]      - ISO date string
 * @param {boolean} [params.has_photo]   - only events with photo_path
 * @param {string} [params.search]       - full-text search query
 *
 * @returns {{ data: Array, stats: { total, violations, valid }, loading: boolean, error: Error|null, refetch: () => void }}
 */
export function useEventsRealtime(params = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    date_from,
    date_to,
    has_photo,
    search,
  } = params;

  // ── State ──────────────────────────────────────────────────────────────
  const [eventsData, setEventsData] = useState(null);
  const [stats, setStats] = useState({ total: 0, violations: 0, valid: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  // Stabilize params for dependency tracking
  const paramsKey = useMemo(
    () =>
      stableKey({ page, limit, status, date_from, date_to, has_photo, search }),
    [page, limit, status, date_from, date_to, has_photo, search],
  );

  // ── Fetch function ─────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (showLoading = true) => {
      const fetchId = ++fetchCountRef.current;

      if (showLoading) setLoading(true);
      setError(null);

      // Gunakan parameter terbaru dari state dependen, BUKAN dari closure mount pertama
      const queryEventsParams = {
        page,
        limit,
        status,
        date_from,
        date_to,
        has_photo,
        search,
      };

      console.log("[EventsRT] Fetching with params:", queryEventsParams);

      try {
        const [eventsResult, statsResult] = await Promise.all([
          queryEvents(queryEventsParams),
          queryStats(date_from, date_to),
        ]);

        if (!mountedRef.current || fetchId !== fetchCountRef.current) return;

        console.log(
          "[EventsRT] Fetched raw event data length:",
          eventsResult?.data?.length,
        );
        setEventsData(eventsResult);
        setStats(statsResult);
      } catch (err) {
        if (!mountedRef.current || fetchId !== fetchCountRef.current) return;
        console.error("[EventsRT] fetch error:", err);
        setError(err);
      } finally {
        if (mountedRef.current && fetchId === fetchCountRef.current) {
          setLoading(false);
        }
      }
    },
    [paramsKey, page, limit, status, date_from, date_to, has_photo, search],
  );

  // ── Initial fetch + re-fetch on filter change ──────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    fetchData(true);

    return () => {
      mountedRef.current = false;
    };
    // paramsKey changes when any filter changes
  }, [paramsKey, fetchData]);

  // ── Safety net: periodic refetch every 2 min ───────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (mountedRef.current) {
        console.log("[EventsRT] Safety-net refresh");
        fetchData(false); // silent refresh, no loading spinner
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Supabase Realtime subscription ─────────────────────────────────────
  useEffect(() => {
    const partition = currentEventsPartition();
    const channelName = `events-realtime-${partition}-${Date.now()}`;

    console.log(`[EventsRT] Subscribing to ${partition}`);

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: partition,
        },
        (payload) => {
          if (!mountedRef.current) return;

          const newRow = payload.new;
          console.log("[EventsRT] New event via Realtime:", newRow.id);

          // Check if new event matches current filters
          const matchesStatus = !status || newRow.status === status;
          const matchesPhoto = !has_photo || !!newRow.photo_path;
          const matchesDateFrom =
            !date_from || new Date(newRow.timestamp) >= new Date(date_from);
          const matchesDateTo =
            !date_to || new Date(newRow.timestamp) <= new Date(date_to);

          // Always update stats (count-based, not paginated)
          setStats((prev) => {
            const isViolation = newRow.status === "violation";
            const isValid =
              newRow.status === "valid" || newRow.status === "compliant";

            // Only count if it matches date + photo filters
            if (!matchesDateFrom || !matchesDateTo || !matchesPhoto)
              return prev;

            return {
              total: prev.total + 1,
              violations: prev.violations + (isViolation ? 1 : 0),
              valid: prev.valid + (isValid ? 1 : 0),
            };
          });

          // Only add to data list if it matches ALL filters and we're on page 1
          if (
            matchesStatus &&
            matchesPhoto &&
            matchesDateFrom &&
            matchesDateTo
          ) {
            if (page === 1) {
              setEventsData((prev) => {
                if (!prev) return prev;
                const newData = [newRow, ...prev.data].slice(0, limit);
                return {
                  ...prev,
                  data: newData,
                  total: prev.total + 1,
                  totalPages: Math.ceil((prev.total + 1) / limit),
                };
              });
            }
          }
        },
      )
      .subscribe((status) => {
        console.log(`[EventsRT] Subscription status: ${status}`);
      });

    return () => {
      console.log(`[EventsRT] Unsubscribing from ${partition}`);
      supabase.removeChannel(channel);
    };
    // Only re-subscribe when filters or pagination change
  }, [paramsKey, page, limit, status, date_from, date_to, has_photo]);

  // ── Return ─────────────────────────────────────────────────────────────
  return {
    data: eventsData,
    stats,
    isLoading: loading,
    error,
    refetch: () => fetchData(true),
  };
}
