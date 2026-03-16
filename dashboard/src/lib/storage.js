import { supabase } from "./supabase";

/**
 * Resolve photo_path dari events table menjadi URL yang bisa ditampilkan.
 *
 * Mendukung dua format photo_path:
 *   1. URL lengkap (from local storage via Cloudflare Tunnel):
 *      "https://api.foodiserver.my.id/api/reports/Andi_Pelanggaran_20260316.jpg"
 *      → dikembalikan as-is.
 *
 *   2. Supabase Storage path (format lama, legacy):
 *      "cam-001/2026/03/14/foto.jpg"
 *      → generate public URL dari Supabase Storage bucket.
 *
 * @param {string} bucket - Bucket name untuk fallback legacy path (e.g. "event-evidence")
 * @param {string|null} path - photo_path dari events table
 * @returns {string|null} URL gambar yang siap dipakai di <img src>, atau null
 */
export function getPhotoUrl(bucket, path) {
  if (!path) return null;

  // Jika sudah berupa URL lengkap (local storage via tunnel), langsung pakai
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // Fallback: generate public URL dari Supabase Storage (format path lama)
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get public URL for a file in a Supabase Storage bucket.
 * @param {string} bucket - Bucket name (e.g. "event-evidence")
 * @param {string} path - File path within the bucket
 * @returns {string|null} Public URL or null if path is missing
 */
export function getPublicUrl(bucket, path) {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get a signed/temporary URL for a file in a private bucket.
 * @param {string} bucket - Bucket name
 * @param {string} path - File path within the bucket
 * @param {number} expiresIn - Seconds until URL expires (default: 1 hour)
 * @returns {Promise<string|null>} Signed URL or null
 */
export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  if (!path) return null;
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) {
    console.error("[Storage] Signed URL error:", error.message);
    return null;
  }
  return data.signedUrl;
}
