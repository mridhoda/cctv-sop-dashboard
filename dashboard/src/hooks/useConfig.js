import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchConfig, updateConfig, updateConfigSetting } from "../services/config";

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: fetchConfig,
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConfig,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["config"] }),
  });
}

/**
 * Update a single config setting by ID.
 * Usage: updateSetting.mutate({ id, value })
 */
export function useUpdateConfigSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, value }) => updateConfigSetting(id, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["config"] }),
  });
}
