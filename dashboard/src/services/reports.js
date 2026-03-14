import { supabase } from "../lib/supabase";

/**
 * Fetch events that have photo evidence (reports).
 * @param {object} params - { page, limit, camera_id, date_from, date_to }
 */
export async function fetchReports(params = {}) {
  const { page = 1, limit = 20, camera_id, date_from, date_to } = params;

  let query = supabase
    .from("events")
    .select(
      `
      id, timestamp, location, status, violation_type,
      staff_name, photo_path, ai_description, confidence_person,
      cameras(id, name, location)
    `,
      { count: "exact" },
    )
    .not("photo_path", "is", null)
    .order("timestamp", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (camera_id) query = query.eq("camera_id", camera_id);
  if (date_from) query = query.gte("timestamp", date_from);
  if (date_to) query = query.lte("timestamp", date_to);

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
 * Fetch a single report/event by ID.
 * @param {string} id
 */
export async function fetchReportById(id) {
  const { data, error } = await supabase
    .from("events")
    .select("*, cameras(id, name, location)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}
