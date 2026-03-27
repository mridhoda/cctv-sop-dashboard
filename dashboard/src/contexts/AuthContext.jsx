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

// Profile cache helpers — store profile in localStorage so UI loads instantly
// on refresh without waiting for a Supabase round-trip.
const PROFILE_CACHE_KEY = "vg_profile";

const saveProfileCache = (data) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* ignore storage errors */
  }
};

const getProfileCache = () => {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_CACHE_KEY));
  } catch {
    return null;
  }
};

const clearProfileCache = () => {
  try {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  } catch {
    /* ignore */
  }
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

  // Load profile from DB, save to cache, fall back to cache on error.
  // No artificial timeout — Supabase client manages its own request queue.
  const loadProfile = useCallback(async (authUser) => {
    if (!authUser?.id) {
      setProfile(null);
      clearProfileCache();
      return null;
    }
    try {
      const data = await fetchProfile(authUser.id);
      setProfile(data);
      saveProfileCache(data); // ← persist for instant load on next visit
      return data;
    } catch (err) {
      // PGRST116: .single() got 0 rows — safe to ignore, happens on logout race
      if (err?.code === "PGRST116" || err?.message?.includes("PGRST116")) {
        setProfile(null);
        clearProfileCache();
        return null;
      }
      // Network/other error — use cached profile if available
      const cached = getProfileCache();
      if (cached?.id === authUser.id) {
        console.warn("[Auth] Profile fetch failed, using cache:", err.message);
        setProfile(cached);
        return cached;
      }
      console.warn("[Auth] Profile fetch failed (no cache):", err.message);
      return null;
    }
  }, []);

  // Initialize: get session + listen for auth changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      // Step 1: Show cached profile immediately — UI appears without any wait
      const cached = getProfileCache();
      if (cached && mounted) {
        setProfile(cached);
        setLoading(false); // ← user sees dashboard instantly
      }

      // Step 2: Validate session in background
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error || !session?.user) {
          // No valid session — clear everything
          // If caused by an expired/invalid refresh token, sign out to clean server state
          if (
            error?.message?.includes("Refresh Token") ||
            error?.status === 400
          ) {
            await supabase.auth.signOut().catch(() => {});
          }
          setUser(null);
          setProfile(null);
          clearProfileCache();
        } else {
          setUser(session.user);
          // Only fetch from DB if cache is empty or belongs to a different user
          if (!cached || cached.id !== session.user.id) {
            await loadProfile(session.user);
          }
        }
      } catch (err) {
        console.warn("[Auth] Session init error:", err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Treat any missing session as a logout — covers expired refresh tokens
      // that don't always emit SIGNED_OUT (e.g. revoked on another device)
      if (!session?.user) {
        setUser(null);
        setProfile(null);
        clearProfileCache();
        return;
      }

      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        clearProfileCache();
        return;
      }

      setUser(session.user);
      // TOKEN_REFRESHED fires every hour — skip DB fetch, use existing state
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        await loadProfile(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    return loadProfile(user);
  }, [user, loadProfile]);

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
    clearProfileCache(); // ← also clear cache on logout
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
        role: profile.role || null,
        _profileError: profile._profileError || false,
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
        profileError: profile?._profileError || false,
        refreshProfile,
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
