/**
 * useDashboardRealtime
 *
 * Supabase-First hook for Dashboard Home page.
 * Replaces 3 React Query polling hooks:
 *   - useDashboardSummary (30s polling) → direct query + realtime
 *   - useRecentIncidents  (10s polling) → direct query + realtime
 *   - useCameraStatus     (5s polling)  → direct query + realtime
 *
 * Architecture:
 *   1. Initial fetch on mount (all 3 datasets in parallel)
 *   2. Realtime subscriptions:
 *      - events partition (INSERT) → increment today's stats + prepend incident
 *      - cameras (UPDATE) → live status changes
 *   3. Safety-net full refresh every 2 minutes
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

// ── Helpers ────────────────────────────────────────────────────────────────

function currentEventsPartition() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `events_y${y}m${m}`;
}

/** Build array of date strings for past N days (oldest → newest) */
function lastNDays(n = 7) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

/** Calculate percentage change string */
function calcDelta(todayVal, yesterdayVal) {
  if (yesterdayVal === 0) {
    return todayVal > 0 ? "+100% vs kemarin" : "0% vs kemarin";
  }
  const pct = Math.round(((todayVal - yesterdayVal) / yesterdayVal) * 100);
  return pct >= 0 ? `+${pct}% vs kemarin` : `${pct}% vs kemarin`;
}

// ── Fetch helpers ──────────────────────────────────────────────────────────

async function fetchDailyCounts(metric, days) {
  const queries = days.map((day) => {
    let q = supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", `${day}T00:00:00`)
      .lte("timestamp", `${day}T23:59:59`);

    if (metric === "violation") q = q.eq("status", "violation");
    if (metric === "valid") q = q.eq("status", "valid");

    return q;
  });

  const results = await Promise.all(queries);
  return results.map((r) => r.count || 0);
}

async function fetchSummary() {
  const days = lastNDays(7);

  const [totalSeries, violationSeries, validSeries] = await Promise.all([
    fetchDailyCounts("total", days),
    fetchDailyCounts("violation", days),
    fetchDailyCounts("valid", days),
  ]);

  const todayIdx = days.length - 1;
  const yesterdayIdx = days.length - 2;

  const totalToday = totalSeries[todayIdx];
  const violationsToday = violationSeries[todayIdx];
  const validToday = validSeries[todayIdx];

  const complianceRate =
    totalToday > 0
      ? parseFloat(((validToday / totalToday) * 100).toFixed(2))
      : 100;

  const complianceSeries = totalSeries.map((total, i) => {
    if (total === 0) return 0;
    return parseFloat(((validSeries[i] / total) * 100).toFixed(1));
  });

  const sparkLabels = days.map((d) => {
    const dt = new Date(d + "T00:00:00");
    return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  });

  return {
    total_detections: totalToday,
    total_incidents: violationsToday,
    compliance_rate: complianceRate,
    spark_total: totalSeries,
    spark_violations: violationSeries,
    spark_compliance: complianceSeries,
    delta_total: calcDelta(totalToday, totalSeries[yesterdayIdx]),
    delta_violations: calcDelta(violationsToday, violationSeries[yesterdayIdx]),
    delta_compliance: calcDelta(
      Math.round(complianceRate),
      totalSeries[yesterdayIdx] > 0
        ? Math.round(
            (validSeries[yesterdayIdx] / totalSeries[yesterdayIdx]) * 100,
          )
        : 100,
    ),
    spark_labels: sparkLabels,
  };
}

async function fetchRecentIncidents(limit = 5) {
  const { data, error } = await supabase
    .from("events")
    .select(
      `id, timestamp, location, status, violation_type,
       staff_name, photo_path, confidence_person, ai_description,
       cameras(id, name, location)`,
    )
    .eq("status", "violation")
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    time: new Date(item.timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: item.timestamp,
    staff_name: item.staff_name,
    location: item.cameras?.location || item.location,
    camera_name: item.cameras?.name,
    type: item.violation_type || "Pelanggaran SOP",
    event_type: item.violation_type,
    photo_path: item.photo_path,
    description: item.ai_description,
  }));
}

async function fetchCameraStatus() {
  const { data, error } = await supabase
    .from("cameras")
    .select("id, name, location, status, is_enabled, detection_state")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ── Constants ──────────────────────────────────────────────────────────────
const REFRESH_INTERVAL_MS = 2 * 60 * 1000;
const INCIDENT_LIMIT = 5;

// ── Main Hook ──────────────────────────────────────────────────────────────

/**
 * Returns:
 *   summary   – metrics + sparklines (same shape as fetchDashboardSummary)
 *   incidents – 5 recent violations
 *   cameras   – all cameras with status
 *   loading   – true during initial load only
 *   error     – Error | null
 *   refetch   – () => void, full manual refresh
 */
export function useDashboardRealtime() {
  const [summary, setSummary] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const mountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  // ── Fetch all data ─────────────────────────────────────────────────────
  const fetchAll = useCallback(async (showLoading = true) => {
    const fetchId = ++fetchCountRef.current;

    if (showLoading) setLoading(true);
    setError(null);

    try {
      const [summaryResult, incidentsResult, camerasResult] = await Promise.all(
        [
          fetchSummary(),
          fetchRecentIncidents(INCIDENT_LIMIT),
          fetchCameraStatus(),
        ],
      );

      if (!mountedRef.current || fetchId !== fetchCountRef.current) return;

      setSummary(summaryResult);
      setIncidents(incidentsResult);
      setCameras(camerasResult);
    } catch (err) {
      if (!mountedRef.current || fetchId !== fetchCountRef.current) return;
      console.error("[DashboardRT] Fetch error:", err.message);
      setError(err);
    } finally {
      if (mountedRef.current && fetchId === fetchCountRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // ── Initial fetch on mount ─────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    fetchAll(true);
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAll]);

  // ── Safety-net refresh every 2 minutes ─────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (mountedRef.current) {
        console.log("[DashboardRT] Safety-net refresh");
        fetchAll(false);
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchAll]);

  // ── Realtime: events partition (INSERT) ────────────────────────────────
  useEffect(() => {
    const partition = currentEventsPartition();
    const channelName = `dashboard-events-${partition}-${Date.now()}`;

    console.log(`[DashboardRT] Subscribing to ${partition}`);

    const eventsChannel = supabase
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

          const row = payload.new;
          console.log("[DashboardRT] New event:", row.id, row.status);

          // Update summary: increment today's counts
          setSummary((prev) => {
            if (!prev) return prev;
            const isViolation = row.status === "violation";
            const isValid =
              row.status === "valid" || row.status === "compliant";

            const newTotal = prev.total_detections + 1;
            const newViolations = prev.total_incidents + (isViolation ? 1 : 0);
            const newValid =
              (prev._validToday ??
                Math.round(
                  (prev.compliance_rate / 100) * prev.total_detections,
                )) + (isValid ? 1 : 0);

            const complianceRate =
              newTotal > 0
                ? parseFloat(((newValid / newTotal) * 100).toFixed(2))
                : 100;

            // Update today's spark value (last element)
            const sparkTotal = [...prev.spark_total];
            sparkTotal[sparkTotal.length - 1] = newTotal;
            const sparkViolations = [...prev.spark_violations];
            sparkViolations[sparkViolations.length - 1] = newViolations;
            const sparkCompliance = [...prev.spark_compliance];
            sparkCompliance[sparkCompliance.length - 1] =
              newTotal > 0
                ? parseFloat(((newValid / newTotal) * 100).toFixed(1))
                : 0;

            return {
              ...prev,
              total_detections: newTotal,
              total_incidents: newViolations,
              compliance_rate: complianceRate,
              spark_total: sparkTotal,
              spark_violations: sparkViolations,
              spark_compliance: sparkCompliance,
              delta_total: calcDelta(
                newTotal,
                prev.spark_total[prev.spark_total.length - 2] ?? 0,
              ),
              delta_violations: calcDelta(
                newViolations,
                prev.spark_violations[prev.spark_violations.length - 2] ?? 0,
              ),
              _validToday: newValid,
            };
          });

          // Prepend to incidents if violation
          if (row.status === "violation") {
            const newIncident = {
              id: row.id,
              time: new Date(row.timestamp).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              }),
              timestamp: row.timestamp,
              staff_name: row.staff_name,
              location: row.location,
              type: row.violation_type || "Pelanggaran SOP",
              event_type: row.violation_type,
              photo_path: row.photo_path,
              description: row.ai_description,
            };

            setIncidents((prev) =>
              [newIncident, ...prev].slice(0, INCIDENT_LIMIT),
            );
          }
        },
      )
      .subscribe((status) => {
        console.log(`[DashboardRT] Events subscription: ${status}`);
      });

    return () => {
      console.log(`[DashboardRT] Unsubscribing events`);
      supabase.removeChannel(eventsChannel);
    };
  }, []);

  // ── Realtime: cameras (UPDATE) ─────────────────────────────────────────
  useEffect(() => {
    const channelName = `dashboard-cameras-${Date.now()}`;

    console.log("[DashboardRT] Subscribing to cameras");

    const camerasChannel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "cameras",
        },
        (payload) => {
          if (!mountedRef.current) return;

          const updated = payload.new;
          console.log(
            "[DashboardRT] Camera update:",
            updated.id,
            updated.status,
          );

          setCameras((prev) =>
            prev.map((cam) =>
              cam.id === updated.id ? { ...cam, ...updated } : cam,
            ),
          );
        },
      )
      .subscribe((status) => {
        console.log(`[DashboardRT] Cameras subscription: ${status}`);
      });

    return () => {
      console.log("[DashboardRT] Unsubscribing cameras");
      supabase.removeChannel(camerasChannel);
    };
  }, []);

  return {
    summary,
    incidents,
    cameras,
    isLoading: loading,
    error,
    refetch: () => fetchAll(true),
  };
}
