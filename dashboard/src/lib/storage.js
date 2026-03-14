import { supabase } from "./supabase";

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
