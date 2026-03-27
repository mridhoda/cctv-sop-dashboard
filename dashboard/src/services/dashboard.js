import { supabase } from "../lib/supabase";

/**
 * Build an array of date strings for the past N days (oldest → newest).
 * e.g. ["2026-03-20", ..., "2026-03-26"]
 */
function lastNDays(n = 7) {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

/**
 * Fetch daily event counts for the given days.
 * metric: "total" | "violation" | "valid"
 */
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

/**
 * Calculate percentage change from yesterday → today.
 * Returns a formatted string like "+12% vs kemarin".
 */
function calcDelta(todayVal, yesterdayVal) {
  if (yesterdayVal === 0) {
    return todayVal > 0 ? "+100% vs kemarin" : "0% vs kemarin";
  }
  const pct = Math.round(((todayVal - yesterdayVal) / yesterdayVal) * 100);
  return pct >= 0 ? `+${pct}% vs kemarin` : `${pct}% vs kemarin`;
}

/**
 * Fetch dashboard summary: today's metrics + 7-day spark series + delta vs yesterday.
 */
export async function fetchDashboardSummary() {
  const days = lastNDays(7); // oldest → newest

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);

  try {
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

    const totalYesterday = totalSeries[yesterdayIdx];
    const violationsYesterday = violationSeries[yesterdayIdx];
    const validYesterday = validSeries[yesterdayIdx];

    const complianceRate =
      totalToday > 0
        ? parseFloat(((validToday / totalToday) * 100).toFixed(2))
        : 100;

    const complianceSeries = totalSeries.map((total, i) => {
      if (total === 0) return 0; // no data → show 0, not 100
      return parseFloat(((validSeries[i] / total) * 100).toFixed(1));
    });

    // Short date labels for tooltips, e.g. "20 Mar"
    const sparkLabels = days.map((d) => {
      const dt = new Date(d + "T00:00:00");
      return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    });

    return {
      // Today's totals
      total_detections: totalToday,
      total_incidents: violationsToday,
      compliance_rate: complianceRate,

      // 7-day spark series (oldest → newest)
      spark_total: totalSeries,
      spark_violations: violationSeries,
      spark_compliance: complianceSeries,

      // Delta strings vs yesterday
      delta_total: calcDelta(totalToday, totalYesterday),
      delta_violations: calcDelta(violationsToday, violationsYesterday),
      delta_compliance: calcDelta(
        Math.round(complianceRate),
        totalYesterday > 0
          ? Math.round((validYesterday / totalYesterday) * 100)
          : 100,
      ),

      // Tooltip labels per bar
      spark_labels: sparkLabels,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch recent incidents (violation events) for the dashboard.
 * @param {number} limit
 */
export async function fetchRecentIncidents(limit = 5) {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, timestamp, location, status, violation_type,
      staff_name, photo_path, confidence_person, ai_description,
      cameras(id, name, location)
    `,
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

/**
 * Fetch camera status for the dashboard overview.
 */
export async function fetchCameraStatus() {
  const { data, error } = await supabase
    .from("cameras")
    .select("id, name, location, status, is_enabled, detection_state")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}
