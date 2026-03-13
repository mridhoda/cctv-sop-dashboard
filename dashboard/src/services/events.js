import api from "./api";

/**
 * Fetch paginated events list.
 * @param {object} params - { page, limit, status, camera_id, date_from, date_to }
 */
export async function fetchEvents(params = {}) {
  const { data } = await api.get("/events", { params });
  return data;
}

export async function fetchEventById(id) {
  const { data } = await api.get(`/events/${id}`);
  return data;
}

export async function exportEventsCSV(params = {}) {
  const { data } = await api.get("/events/export/csv", {
    params,
    responseType: "blob",
  });
  return data;
}
