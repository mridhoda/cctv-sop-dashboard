import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─────────────────────────────────────────────────────────────
// TODO: MOCK DATA — hapus blok ini & uncomment import asli
//       di bawah ketika backend /api/cameras sudah siap.
// ─────────────────────────────────────────────────────────────
let mockCameras = [
  {
    id: 1,
    name: "CCTV 01 — Pintu Masuk",
    source_url: "rtsp://192.168.1.101:554/stream1",
    location: "Pintu Masuk Utama",
    rotation: 0,
    status: "online",
    is_active: true,
  },
  {
    id: 2,
    name: "CCTV 02 — Area Produksi A",
    source_url: "rtsp://192.168.1.102:554/stream1",
    location: "Area Produksi A",
    rotation: 0,
    status: "online",
    is_active: true,
  },
  {
    id: 3,
    name: "CCTV 03 — Gudang",
    source_url: "rtsp://192.168.1.103:554/stream1",
    location: "Gudang Bahan Baku",
    rotation: 90,
    status: "offline",
    is_active: false,
  },
  {
    id: 4,
    name: "CCTV 04 — Parkir",
    source_url: "rtsp://192.168.1.104:554/stream1",
    location: "Area Parkir",
    rotation: 0,
    status: "error",
    is_active: false,
  },
];

let nextId = 5;

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const mockService = {
  fetchCameras: async () => {
    await delay();
    return [...mockCameras];
  },
  createCamera: async (data) => {
    await delay();
    const cam = { id: nextId++, status: "offline", is_active: false, ...data };
    mockCameras.push(cam);
    return cam;
  },
  updateCamera: async (id, data) => {
    await delay();
    mockCameras = mockCameras.map((c) => (c.id === id ? { ...c, ...data } : c));
    return mockCameras.find((c) => c.id === id);
  },
  deleteCamera: async (id) => {
    await delay();
    mockCameras = mockCameras.filter((c) => c.id !== id);
  },
  startCamera: async (id) => {
    await delay();
    mockCameras = mockCameras.map((c) =>
      c.id === id ? { ...c, status: "online", is_active: true } : c,
    );
  },
  stopCamera: async (id) => {
    await delay();
    mockCameras = mockCameras.map((c) =>
      c.id === id ? { ...c, status: "offline", is_active: false } : c,
    );
  },
};
// ─────────────────────────────────────────────────────────────
// END MOCK — uncomment ini jika backend sudah siap:
// import {
//   fetchCameras, createCamera, updateCamera,
//   deleteCamera, startCamera, stopCamera,
// } from "../services/cameras";
// dan hapus semua mockService + mockCameras di atas.
// ─────────────────────────────────────────────────────────────

export function useCameras() {
  return useQuery({
    queryKey: ["cameras"],
    queryFn: mockService.fetchCameras,
  });
}

export function useCreateCamera() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockService.createCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });
}

export function useUpdateCamera() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => mockService.updateCamera(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });
}

export function useDeleteCamera() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: mockService.deleteCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });
}

export function useCameraControl() {
  const queryClient = useQueryClient();

  const start = useMutation({
    mutationFn: mockService.startCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });

  const stop = useMutation({
    mutationFn: mockService.stopCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });

  return { start, stop };
}
