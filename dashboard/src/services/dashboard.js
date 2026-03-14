import { supabase } from "../lib/supabase";

/**
 * Fetch dashboard summary: total detections, violations, and compliance rate for today.
 */
export async function fetchDashboardSummary() {
  const today = new Date().toISOString().split("T")[0];
  const startOfDay = `${today}T00:00:00`;

  const [totalResult, violationResult] = await Promise.all([
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("timestamp", startOfDay),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("status", "violation")
      .gte("timestamp", startOfDay),
  ]);

  const totalToday = totalResult.count || 0;
  const violationsToday = violationResult.count || 0;
  const complianceRate =
    totalToday > 0
      ? parseFloat(
          (((totalToday - violationsToday) / totalToday) * 100).toFixed(1),
        )
      : 100;

  return {
    total_detections: totalToday,
    total_incidents: violationsToday,
    compliance_rate: complianceRate,
  };
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
 * Returns cameras with their latest status.
 */
export async function fetchCameraStatus() {
  const { data, error } = await supabase
    .from("cameras")
    .select("id, name, location, status, is_enabled, detection_state")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}
