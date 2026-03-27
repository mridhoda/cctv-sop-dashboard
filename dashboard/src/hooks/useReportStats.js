import { useQuery } from "@tanstack/react-query";
import { fetchReportsSummary } from "../services/events";

/**
 * Hook to get report summary stats (total, violations, valid) based on a date range.
 */
export function useReportStats(date_from, date_to) {
  return useQuery({
    queryKey: ["reports", "summary", date_from, date_to],
    queryFn: () => fetchReportsSummary(date_from, date_to),
    keepPreviousData: true,
    refetchInterval: 30_000,
  });
}
