import { supabase } from "../lib/supabase";

/**
 * Fetch all identities with their face photos.
 */
export async function fetchIdentities() {
  const { data, error } = await supabase
    .from("identities")
    .select(
      `
      *,
      face_photos(id, storage_path, is_primary, photo_type)
    `,
    )
    .order("nama", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new identity.
 * @param {object} identityData - { nama, jabatan, department, employee_id, email, phone }
 */
export async function createIdentity(identityData) {
  const { data, error } = await supabase
    .from("identities")
    .insert(identityData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an identity.
 * @param {string} id
 * @param {object} identityData
 */
export async function updateIdentity(id, identityData) {
  const { data, error } = await supabase
    .from("identities")
    .update(identityData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an identity by ID.
 * @param {string} id
 */
export async function deleteIdentity(id) {
  const { error } = await supabase.from("identities").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Upload a face photo to Supabase Storage and create a face_photos record.
 * @param {string} identityId
 * @param {File} file
 */
export async function uploadPhoto(identityId, file) {
  const filePath = `faces/${identityId}/${Date.now()}_${file.name}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("identity-photos")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Create face_photos DB record
  const { data, error } = await supabase
    .from("face_photos")
    .insert({
      identity_id: identityId,
      storage_path: filePath,
      is_primary: false,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Trigger face encoding for an identity.
 * Note: This requires the backend engine to be running.
 * Falls back to marking identity as "pending encoding" in DB.
 * @param {string} id
 */
export async function triggerEncode(id) {
  // Try the backend API first (requires engine running)
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  try {
    const res = await fetch(`${apiBase}/identities/${id}/encode`, {
      method: "POST",
    });
    if (res.ok) return await res.json();
  } catch {
    // Backend not available — ignore
  }

  // Fallback: update DB status to indicate encoding is needed
  const { data, error } = await supabase
    .from("identities")
    .update({ is_encoded: false })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
