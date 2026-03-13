import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchIdentities,
  createIdentity,
  deleteIdentity,
  uploadPhoto,
  triggerEncode,
} from "../services/identities";

export function useIdentities() {
  return useQuery({
    queryKey: ["identities"],
    queryFn: fetchIdentities,
  });
}

export function useCreateIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createIdentity,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["identities"] }),
  });
}

export function useDeleteIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteIdentity,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["identities"] }),
  });
}

export function useUploadPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }) => uploadPhoto(id, file),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["identities"] }),
  });
}

export function useTriggerEncode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: triggerEncode,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["identities"] }),
  });
}
