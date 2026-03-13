import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../services/events";

/**
 * Paginated events query with filtering.
 * @param {object} params - { page, limit, status, camera_id, date_from, date_to }
 */
export function useEvents(params = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => fetchEvents(params),
    keepPreviousData: true,
  });
}
