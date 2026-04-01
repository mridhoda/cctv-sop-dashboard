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
import { createTimer, reportDataAccess } from "../utils/dataAccessTelemetry";

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

function getRuntimeContext() {
  return {
    online: typeof navigator === "undefined" ? null : navigator.onLine,
    visibility:
      typeof document === "undefined" ? null : document.visibilityState,
  };
}

function traceAuth(eventName, payload = {}) {
  reportDataAccess(`auth:${eventName}`, {
    ...getRuntimeContext(),
    ...payload,
  });
}

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

    const stopTimer = createTimer();
    traceAuth("loadProfile:start", { userId: authUser.id });

    try {
      const data = await fetchProfile(authUser.id);
      setProfile(data);
      saveProfileCache(data); // ← persist for instant load on next visit
      traceAuth("loadProfile:success", {
        userId: authUser.id,
        durationMs: stopTimer(),
        usedCache: false,
      });
      return data;
    } catch (err) {
      // PGRST116: .single() got 0 rows — safe to ignore, happens on logout race
      if (err?.code === "PGRST116" || err?.message?.includes("PGRST116")) {
        setProfile(null);
        clearProfileCache();
        traceAuth("loadProfile:empty", {
          userId: authUser.id,
          durationMs: stopTimer(),
          level: "warn",
          error: err?.message,
        });
        return null;
      }
      // Network/other error — use cached profile if available
      const cached = getProfileCache();
      if (cached?.id === authUser.id) {
        console.warn("[Auth] Profile fetch failed, using cache:", err.message);
        setProfile(cached);
        traceAuth("loadProfile:cache_fallback", {
          userId: authUser.id,
          durationMs: stopTimer(),
          level: "warn",
          error: err?.message,
          usedCache: true,
        });
        return cached;
      }
      console.warn("[Auth] Profile fetch failed (no cache):", err.message);
      traceAuth("loadProfile:error", {
        userId: authUser.id,
        durationMs: stopTimer(),
        level: "error",
        error: err?.message,
        usedCache: false,
      });
      return null;
    }
  }, []);

  // Initialize: get session + listen for auth changes
  useEffect(() => {
    let mounted = true;

    const cached = getProfileCache();
    traceAuth("init:start", {
      hasCachedProfile: Boolean(cached),
      cachedProfileId: cached?.id || null,
    });

    if (cached) {
      setProfile(cached);
      setLoading(false);
    }

    const applySession = async (event, session) => {
      if (!mounted) return;

      traceAuth("authStateChange", {
        event,
        hasSessionUser: Boolean(session?.user),
        sessionUserId: session?.user?.id || null,
      });

      if (event === "SIGNED_OUT") {
        void clearClientCache();
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!session?.user) {
        if (event === "INITIAL_SESSION" || event === "BOOTSTRAP_SESSION") {
          setUser(null);
          setProfile(null);
          clearProfileCache();
          setLoading(false);
          return;
        }

        console.warn(
          `[Auth] Ignoring transient auth event without session: ${event}`,
        );
        setLoading(false);
        return;
      }

      setUser(session.user);

      const sameUserCache = cached?.id === session.user.id ? cached : null;
      if (sameUserCache) {
        setProfile(sameUserCache);
      }

      try {
        if (
          !sameUserCache ||
          event === "SIGNED_IN" ||
          event === "USER_UPDATED"
        ) {
          await loadProfile(session.user);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Listen for auth state changes first, so INITIAL_SESSION can hydrate us.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void applySession(event, session);
    });

    // Non-blocking bootstrap: helpful when INITIAL_SESSION is delayed.
    void supabase.auth
      .getSession()
      .then(({ data: { session } = {}, error }) => {
        traceAuth("bootstrapSession:result", {
          hasSessionUser: Boolean(session?.user),
          sessionUserId: session?.user?.id || null,
          authError: error?.message || null,
          level: error ? "warn" : undefined,
        });

        if (
          error?.message?.includes("Refresh Token") ||
          error?.status === 400
        ) {
          void supabase.auth.signOut().catch(() => {});
          return;
        }

        return applySession("BOOTSTRAP_SESSION", session);
      })
      .catch((error) => {
        traceAuth("bootstrapSession:error", {
          level: "warn",
          error: error?.message,
        });
        if (mounted) {
          setLoading(false);
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
      const stopTimer = createTimer();
      traceAuth("login:start");

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        traceAuth("login:success", {
          durationMs: stopTimer(),
          userId: data.user?.id || null,
        });

        setUser(data.user);
        const prof = await loadProfile(data.user);
        return prof;
      } catch (error) {
        traceAuth("login:error", {
          durationMs: stopTimer(),
          level: "error",
          error: error?.message,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [loadProfile],
  );

  const logout = useCallback(async () => {
    setUser(null);
    setProfile(null);
    await clearClientCache();

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
  }, []);

  /**
   * Get the merged user object (auth user + profile data).
   * This is what pages receive as "user".
   */
  const fallbackProfile =
    user && !profile
      ? (() => {
          const cached = getProfileCache();
          return cached?.id === user.id ? cached : null;
        })()
      : null;

  const resolvedProfile = profile || fallbackProfile;

  const currentUser = user
    ? {
        id: resolvedProfile?.id || user.id,
        email: user.email,
        username:
          resolvedProfile?.username || resolvedProfile?.email || user.email,
        name:
          resolvedProfile?.name ||
          resolvedProfile?.username ||
          user.email?.split("@")[0] ||
          "User",
        role: resolvedProfile?.role || null,
        _profileError: resolvedProfile?._profileError || false,
        role_label: resolvedProfile?.role_label,
        tenant_id: resolvedProfile?.tenant_id || null,
        avatar_url: resolvedProfile?.avatar_url,
        phone: resolvedProfile?.phone,
        is_active: resolvedProfile?.is_active,
        last_login: resolvedProfile?.last_login,
        created_at: resolvedProfile?.created_at || user.created_at,
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
