import api from "./api";

export async function fetchConfig() {
  const { data } = await api.get("/config");
  return data;
}

export async function updateConfig(configData) {
  const { data } = await api.put("/config", configData);
  return data;
}
