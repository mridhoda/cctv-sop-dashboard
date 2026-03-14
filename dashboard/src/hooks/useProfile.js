import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

/**
 * Fetch full profile with tenant data joined.
 * Returns: { ...profile, tenants: { name, plan_tier, timezone } }
 */
async function fetchFullProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, tenants(name, plan_tier, timezone)")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}

/**
 * Update editable profile fields (name, phone).
 */
async function updateProfileFields(userId, fields) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Hook: useProfile
 * - Fetches full profile + tenant data
 * - Provides updateProfile mutation
 */
export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchFullProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const mutation = useMutation({
    mutationFn: (fields) => updateProfileFields(userId, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateProfile: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
  };
}
