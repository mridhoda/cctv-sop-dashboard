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
const EVENTS_CACHE_PREFIX = "events_cache:";

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

const clearEventsCache = () => {
  try {
    if (typeof sessionStorage === "undefined") return;
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith(EVENTS_CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch {
    /* ignore */
  }
};

const clearClientCache = async () => {
  clearProfileCache();
  clearEventsCache();

  try {
    if (typeof caches === "undefined") return;
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
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
      if (cached) {
        setProfile(cached);
        setLoading(false); // ← user sees dashboard instantly
      }

      // Step 2: Validate session in background (with 5s timeout guard)
      try {
        const sessionResult = await Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("getSession timeout")), 5000),
          ),
        ]);

        if (!mounted) return;

        const { data: { session } = {}, error } = sessionResult;

        if (error) {
          // Hard auth failures: clear session explicitly
          if (
            error?.message?.includes("Refresh Token") ||
            error?.status === 400
          ) {
            await supabase.auth.signOut().catch(() => {});
            setUser(null);
            setProfile(null);
            clearProfileCache();
          } else {
            // Transient/network auth error: keep cached UI state
            console.warn(
              "[Auth] getSession returned transient error, keeping cache:",
              error.message,
            );
          }
        } else if (!session?.user) {
          // No valid session
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
        // On timeout/network jitter, keep cached profile to avoid false logout.
        // A later auth event or manual refresh will reconcile state.
        if (err.message === "getSession timeout") {
          console.warn(
            "[Auth] getSession timeout, preserving cached profile state",
          );
        }
      } finally {
        // Always resolve loading — React 18 ignores state updates on unmounted
        // components safely, and StrictMode remounts need this to complete.
        setLoading(false);
      }
    };

    init();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        void clearClientCache();
        setUser(null);
        setProfile(null);
        return;
      }

      // Avoid hard logout on transient auth event jitter.
      // We only hard-clear on explicit SIGNED_OUT above.
      if (!session?.user) {
        console.warn(
          `[Auth] Ignoring transient auth event without session: ${event}`,
        );
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
      setLoading(true);
      try {
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
      } finally {
        setLoading(false);
      }
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    // 1. Clear local state immediately
    sessionStorage.removeItem("skipAutoLogin");
    await clearClientCache();

    // 2. Sign out globally with a timeout to prevent GoTrue queue deadlock.
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: "global" }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("signOut timeout")), 3000),
        ),
      ]);
    } catch (err) {
      console.warn("[Auth] Global signOut failed, doing local:", err.message);
      try {
        await Promise.race([
          supabase.auth.signOut({ scope: "local" }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("local signOut timeout")), 2000),
          ),
        ]);
      } catch {
        /* ignore */
      }
    }

    // 3. Hard reload to fully reset GoTrue's internal request queue.
    //    Without this, signInWithPassword on the next login can hang
    //    because the GoTrue client retains stale pending state.
    window.location.reload();
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
