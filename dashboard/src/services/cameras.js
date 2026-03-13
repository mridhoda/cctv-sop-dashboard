import api from "./api";

export async function fetchCameras() {
  const { data } = await api.get("/cameras");
  return data;
}

export async function fetchCameraById(id) {
  const { data } = await api.get(`/cameras/${id}`);
  return data;
}

export async function createCamera(cameraData) {
  const { data } = await api.post("/cameras", cameraData);
  return data;
}

export async function updateCamera(id, cameraData) {
  const { data } = await api.put(`/cameras/${id}`, cameraData);
  return data;
}

export async function deleteCamera(id) {
  const { data } = await api.delete(`/cameras/${id}`);
  return data;
}

export async function startCamera(id) {
  const { data } = await api.post(`/cameras/${id}/start`);
  return data;
}

export async function stopCamera(id) {
  const { data } = await api.post(`/cameras/${id}/stop`);
  return data;
}

export async function getCameraSnapshot(id) {
  const { data } = await api.get(`/cameras/${id}/snapshot`);
  return data;
}
