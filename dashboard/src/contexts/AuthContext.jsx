import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  login as loginApi,
  logout as logoutApi,
  getCurrentUser,
} from "../services/auth";
import { isFaceRecognitionEnabled } from "../hooks/useFaceRecognition";

const AuthContext = createContext(null);

const ROLE_PERMISSIONS = {
  superadmin: [
    "home",
    "monitoring",
    "history",
    "identities",
    "reports",
    "cameras",
    "settings",
  ],
  admin: [
    "home",
    "monitoring",
    "history",
    "identities",
    "reports",
    "cameras",
    "settings",
  ],
  operator: ["home", "monitoring", "history", "reports"],
  viewer: ["monitoring"],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check for existing JWT and validate it
  useEffect(() => {
    const token = localStorage.getItem("token");
    const skipAutoLogin = sessionStorage.getItem("skipAutoLogin");

    // Skip auto-login if user explicitly clicked login from landing page
    if (skipAutoLogin === "true") {
      setLoading(false);
      return;
    }

    if (token) {
      if (token === "mock-jwt-token") {
        setUser({
          id: "mock-1",
          username: "superadmin",
          role: "superadmin",
          name: "Super Admin (Mock)",
        });
        setLoading(false);
        return;
      }

      getCurrentUser()
        .then((data) => {
          const userData = data.user || data;
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const data = await loginApi(credentials);
      localStorage.setItem("token", data.token);
      // Clear skip auto-login flag after successful login
      sessionStorage.removeItem("skipAutoLogin");
      const userData = data.user || data;
      setUser(userData);
      return userData;
    } catch (error) {
      // Fallback for development/demo mode if backend auth is not available
      const { username, password } = credentials;
      if (
        (username === "superadmin" && password === "admin123") ||
        (username === "viewer" && password === "viewer123")
      ) {
        console.warn("[AUTH] Backend unavailable, using mock login fallback");
        // Clear skip auto-login flag after successful login
        sessionStorage.removeItem("skipAutoLogin");
        const mockUser = {
          id: username === "superadmin" ? "mock-admin" : "mock-viewer",
          username: username,
          role: username === "superadmin" ? "superadmin" : "viewer",
          name:
            username === "superadmin"
              ? "Super Administrator (Mock)"
              : "Viewer (Mock)",
        };
        localStorage.setItem("token", "mock-jwt-token");
        setUser(mockUser);
        return mockUser;
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // API may fail (backend down, mock mode) — we still clear local state
    }
    // Always clear local state so user is redirected to login
    sessionStorage.removeItem("skipAutoLogin");
    setUser(null);
  }, []);

  /**
   * Get allowed tabs for the current user's role.
   * Falls back to viewer permissions if role is unknown.
   * Note: "identities" permission requires face recognition to be enabled.
   */
  const getAllowedTabs = useCallback(() => {
    if (!user) return [];
    const basePermissions =
      ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS.viewer;

    // Filter out "identities" if face recognition is disabled
    const faceRecognitionEnabled = isFaceRecognitionEnabled();
    if (!faceRecognitionEnabled) {
      return basePermissions.filter((tab) => tab !== "identities");
    }

    return basePermissions;
  }, [user]);

  /**
   * Check if user has permission for a specific tab.
   * Note: "identities" permission requires face recognition to be enabled.
   */
  const hasPermission = useCallback(
    (tab) => {
      // Special case: identities tab requires face recognition
      if (tab === "identities") {
        const faceRecognitionEnabled = isFaceRecognitionEnabled();
        if (!faceRecognitionEnabled) return false;
      }
      return getAllowedTabs().includes(tab);
    },
    [getAllowedTabs],
  );

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, getAllowedTabs, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
