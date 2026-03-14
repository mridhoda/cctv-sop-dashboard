import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../lib/supabase";
import { fetchProfile } from "../services/auth";
import { isFaceRecognitionEnabled } from "../hooks/useFaceRecognition";

const AuthContext = createContext(null);

const withTimeout = (promise, ms, errorMessage) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(errorMessage || "Request timed out")),
      ms,
    ),
  );
  return Promise.race([promise, timeout]);
};

const ROLE_PERMISSIONS = {
  superadmin: [
    "home",
    "monitoring",
    "history",
    "identities",
    "reports",
    "cameras",
    "settings",
    "profile",
  ],
  admin: [
    "home",
    "monitoring",
    "history",
    "identities",
    "reports",
    "cameras",
    "settings",
    "profile",
  ],
  operator: ["home", "monitoring", "history", "reports", "profile"],
  viewer: ["monitoring", "profile"],
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile from Supabase profiles table
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return null;
    }
    try {
      const data = await withTimeout(
        fetchProfile(authUser.id),
        8000,
        "Profile fetch timeout",
      );
      setProfile(data);
      return data;
    } catch (err) {
      console.warn("[Auth] Profile fetch failed:", err.message);
      // Fallback: use auth user metadata
      const fallback = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email?.split("@")[0],
        role: authUser.user_metadata?.role || "viewer",
        username: authUser.email,
      };
      setProfile(fallback);
      return fallback;
    }
  }, []);

  // Initialize: get session + listen for auth changes
  useEffect(() => {
    const skipAutoLogin = sessionStorage.getItem("skipAutoLogin");

    if (skipAutoLogin === "true") {
      setLoading(false);
      return;
    }

    // Get initial session with timeout and error handling
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await withTimeout(
          supabase.auth.getSession(),
          8000,
          "Session fetch timeout",
        );
        if (error) throw error;
        if (session?.user) {
          setUser(session.user);
          await loadProfile(session.user);
        }
      } catch (err) {
        console.warn("[Auth] Session check failed:", err.message);
        // Clear any stale session data
        setUser(null);
        setProfile(null);
      } finally {
        // Always set loading to false, even on error
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        const authUser = session?.user ?? null;
        setUser(authUser);
        if (authUser) {
          await loadProfile(authUser);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("[Auth] onAuthStateChange error:", err);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const login = useCallback(
    async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Clear skip auto-login flag after successful login
      sessionStorage.removeItem("skipAutoLogin");
      setUser(data.user);
      const prof = await loadProfile(data.user);
      return prof;
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // signOut may fail (network) — still clear local state
    }
    sessionStorage.removeItem("skipAutoLogin");
    setUser(null);
    setProfile(null);
  }, []);

  /**
   * Get the merged user object (auth user + profile data).
   * This is what pages receive as "user".
   */
  const currentUser = profile
    ? {
        id: profile.id,
        email: user?.email,
        username: profile.username || profile.email || user?.email,
        name: profile.name || profile.username,
        role: profile.role || "viewer",
        role_label: profile.role_label,
        tenant_id: profile.tenant_id,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
        is_active: profile.is_active,
        last_login: profile.last_login,
        created_at: profile.created_at,
      }
    : null;

  const getAllowedTabs = useCallback(() => {
    if (!currentUser) return [];
    const basePermissions =
      ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.viewer;

    if (!isFaceRecognitionEnabled()) {
      return basePermissions.filter((tab) => tab !== "identities");
    }
    return basePermissions;
  }, [currentUser]);

  const hasPermission = useCallback(
    (tab) => {
      if (tab === "identities" && !isFaceRecognitionEnabled()) return false;
      return getAllowedTabs().includes(tab);
    },
    [getAllowedTabs],
  );

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        rawUser: user,
        profile,
        login,
        logout,
        loading,
        getAllowedTabs,
        hasPermission,
      }}
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
