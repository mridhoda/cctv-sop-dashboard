import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCameras,
  createCamera,
  updateCamera,
  deleteCamera,
  startCamera,
  stopCamera,
} from "../services/cameras";

export function useCameras() {
  return useQuery({
    queryKey: ["cameras"],
    queryFn: fetchCameras,
  });
}

export function useCreateCamera() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });
}

export function useUpdateCamera() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCamera(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });
}

export function useDeleteCamera() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });
}

export function useCameraControl() {
  const queryClient = useQueryClient();

  const start = useMutation({
    mutationFn: startCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });

  const stop = useMutation({
    mutationFn: stopCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });

  return { start, stop };
}
