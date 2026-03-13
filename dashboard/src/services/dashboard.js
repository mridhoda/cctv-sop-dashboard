import api from "./api";

export async function fetchDashboardSummary() {
  const { data } = await api.get("/stats");
  return data;
}

export async function fetchRecentIncidents(limit = 5) {
  const { data } = await api.get(`/events?limit=${limit}`);
  return data;
}

export async function fetchCameraStatus() {
  const { data } = await api.get("/status");
  // Wrap in array if frontend expects multiple cameras
  return Array.isArray(data) ? data : [data];
}
