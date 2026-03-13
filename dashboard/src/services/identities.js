import api from "./api";

export async function fetchIdentities() {
  const { data } = await api.get("/identities");
  return data;
}

export async function createIdentity(identityData) {
  const { data } = await api.post("/identities", identityData);
  return data;
}

export async function deleteIdentity(id) {
  const { data } = await api.delete(`/identities/${id}`);
  return data;
}

/**
 * Upload a photo for an identity.
 * @param {string} id - Identity ID
 * @param {File} file - Photo file
 */
export async function uploadPhoto(id, file) {
  const formData = new FormData();
  formData.append("photo", file);
  const { data } = await api.post(`/identities/${id}/photos`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/**
 * Trigger face encoding for an identity.
 */
export async function triggerEncode(id) {
  const { data } = await api.post(`/identities/${id}/encode`);
  return data;
}
