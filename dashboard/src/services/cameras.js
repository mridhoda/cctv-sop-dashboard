import { supabase } from "../lib/supabase";

/**
 * Fetch all cameras with extended config.
 */
export async function fetchCameras() {
  const { data, error } = await supabase
    .from("cameras")
    .select(
      `
      *,
      cameras_extended(*)
    `,
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch a single camera by ID.
 * @param {string} id
 */
export async function fetchCameraById(id) {
  const { data, error } = await supabase
    .from("cameras")
    .select("*, cameras_extended(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new camera.
 * @param {object} cameraData
 */
export async function createCamera(cameraData) {
  const { data, error } = await supabase
    .from("cameras")
    .insert(cameraData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a camera by ID.
 * @param {string} id
 * @param {object} cameraData
 */
export async function updateCamera(id, cameraData) {
  const { data, error } = await supabase
    .from("cameras")
    .update(cameraData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a camera by ID.
 * @param {string} id
 */
export async function deleteCamera(id) {
  const { error } = await supabase.from("cameras").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Start a camera (update status to online).
 * Note: actual engine start requires backend WS — this only updates DB status.
 * @param {string} id
 */
export async function startCamera(id) {
  const { data, error } = await supabase
    .from("cameras")
    .update({ status: "online", detection_state: "active" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Stop a camera (update status to offline).
 * @param {string} id
 */
export async function stopCamera(id) {
  const { data, error } = await supabase
    .from("cameras")
    .update({ status: "offline", detection_state: "inactive" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get current MJPEG snapshot URL (still goes through backend API).
 * @param {string} id
 */
export function getCameraSnapshotUrl(id) {
  const apiBase =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "https://api.foodiserver.my.id";
  return `${apiBase}/api/cameras/${id}/snapshot`;
}
