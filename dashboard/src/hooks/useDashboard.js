import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardSummary,
  fetchRecentIncidents,
  fetchCameraStatus,
} from "../services/dashboard";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    refetchInterval: 30_000,
  });
}

export function useRecentIncidents(limit = 5) {
  return useQuery({
    queryKey: ["events", "recent", limit],
    queryFn: () => fetchRecentIncidents(limit),
    refetchInterval: 10_000,
  });
}

export function useCameraStatus() {
  return useQuery({
    queryKey: ["cameras", "status"],
    queryFn: fetchCameraStatus,
    refetchInterval: 5_000,
  });
}
