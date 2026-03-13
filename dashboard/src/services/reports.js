import api from "./api";

/**
 * Fetch photo evidence / reports.
 * @param {object} params - { page, limit, camera_id, date_from, date_to }
 */
export async function fetchReports(params = {}) {
  const { data } = await api.get("/events", {
    params: { ...params, has_photo: true },
  });
  return data;
}

export async function fetchReportById(id) {
  const { data } = await api.get(`/events/${id}`);
  return data;
}
