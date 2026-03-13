import api from "./api";

/**
 * Login with username + password.
 * @returns {{ token: string, user: object }}
 */
export async function login(credentials) {
  const { data } = await api.post("/auth/login", credentials);
  return data;
}

/**
 * Logout — invalidate token server-side.
 */
export async function logout() {
  try {
    await api.post("/auth/logout");
  } finally {
    localStorage.removeItem("token");
  }
}

/**
 * Get the current authenticated user profile.
 * @returns {object} user
 */
export async function getCurrentUser() {
  const { data } = await api.get("/auth/me");
  return data;
}
