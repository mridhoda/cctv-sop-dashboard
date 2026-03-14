import { supabase } from "../lib/supabase";

/**
 * Fetch paginated events with filtering.
 * @param {object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 * @param {string} [params.status] - "valid" | "violation" | "pending"
 * @param {string} [params.camera_id]
 * @param {string} [params.date_from]
 * @param {string} [params.date_to]
 * @param {string} [params.search]
 */
export async function fetchEvents(params = {}) {
  const { page = 1, limit = 20, status, camera_id, date_from, date_to, search } = params;

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
  if (camera_id) query = query.eq("camera_id", camera_id);
  if (date_from) query = query.gte("timestamp", date_from);
  if (date_to) query = query.lte("timestamp", date_to);
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

/**
 * Fetch a single event by ID.
 * @param {string} id
 */
export async function fetchEventById(id) {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      cameras(id, name, location)
    `,
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update event review status.
 * @param {string} id
 * @param {{ is_reviewed: boolean, review_notes?: string, reviewed_by?: string }} reviewData
 */
export async function reviewEvent(id, reviewData) {
  const { data, error } = await supabase
    .from("events")
    .update({
      ...reviewData,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Export events as CSV.
 * Fetches all matching events and generates a CSV download client-side.
 * @param {object} params - Same filters as fetchEvents
 */
export async function exportEventsCSV(params = {}) {
  const { status, camera_id, date_from, date_to } = params;

  let query = supabase
    .from("events")
    .select(
      `id, timestamp, location, status, violation_type, staff_name,
       confidence_person, ai_description, cameras(name)`,
    )
    .order("timestamp", { ascending: false })
    .limit(5000);

  if (status) query = query.eq("status", status);
  if (camera_id) query = query.eq("camera_id", camera_id);
  if (date_from) query = query.gte("timestamp", date_from);
  if (date_to) query = query.lte("timestamp", date_to);

  const { data, error } = await query;
  if (error) throw error;

  // Build CSV
  const headers = [
    "ID",
    "Waktu",
    "Lokasi",
    "Status",
    "Jenis Pelanggaran",
    "Staff",
    "Confidence",
    "Deskripsi AI",
    "Kamera",
  ];
  const rows = (data || []).map((e) => [
    e.id,
    e.timestamp,
    e.location,
    e.status,
    e.violation_type || "",
    e.staff_name || "",
    e.confidence_person ?? "",
    `"${(e.ai_description || "").replace(/"/g, '""')}"`,
    e.cameras?.name || "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `events_export_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
