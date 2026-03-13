# 🔗 Frontend ↔ Supabase Integration Steps

> **Step-by-step guide** untuk mengintegrasikan React (Vite) frontend dengan Supabase database  
> **Supabase Project**: `cctv-sop-db` (`evgvnmnllpgxcsmxfjrn`)

---

## 📋 Prerequisites

- [ ] Node.js ≥ 18
- [ ] Supabase project active (`ACTIVE_HEALTHY`)
- [ ] Supabase `anon` key & `URL` tersedia
- [ ] Frontend project running (Vite + React + Tailwind)

---

## Phase 1: Dependencies & Configuration

### 1.1 Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 1.2 Environment Variables

Buat file `.env` di root frontend:

```env
# .env
VITE_SUPABASE_URL=https://evgvnmnllpgxcsmxfjrn.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key_dari_supabase_dashboard>
```

> ⚠️ **JANGAN** commit `.env` ke git. Tambahkan ke `.gitignore`.

### 1.3 Create Supabase Client

```javascript
// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Phase 2: Authentication Integration

### 2.1 Auth Context (Supabase Auth)

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  }

  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 2.2 Login Page Update

```javascript
// Ganti mock login dengan Supabase Auth
const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    await login({ email: data.username, password: data.password });
    addToast({ type: "success", message: "Login berhasil!" });
  } catch (error) {
    addToast({ type: "error", message: error.message });
  } finally {
    setIsLoading(false);
  }
};
```

### 2.3 Protected Routes

```javascript
// src/components/ProtectedRoute.jsx
import { useAuth } from "../contexts/AuthContext";
import LoginPage from "../pages/LoginPage";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  return children;
}
```

---

## Phase 3: Data Service Layer (Supabase Queries)

### 3.1 Dashboard Service

```javascript
// src/services/dashboard.js
import { supabase } from "../lib/supabase";

export async function fetchDashboardSummary() {
  const today = new Date().toISOString().split("T")[0];

  // Total events hari ini
  const { count: totalToday } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .gte("timestamp", `${today}T00:00:00`);

  // Violations hari ini
  const { count: violationsToday } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("status", "violation")
    .gte("timestamp", `${today}T00:00:00`);

  // Compliance rate
  const complianceRate =
    totalToday > 0
      ? (((totalToday - violationsToday) / totalToday) * 100).toFixed(1)
      : 100;

  return {
    totalDetections: totalToday || 0,
    totalViolations: violationsToday || 0,
    complianceRate: parseFloat(complianceRate),
  };
}

export async function fetchRecentIncidents(limit = 5) {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      id, timestamp, location, status, violation_type,
      staff_name, photo_path, confidence_person,
      cameras(name)
    `,
    )
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}
```

### 3.2 Cameras Service

```javascript
// src/services/cameras.js
import { supabase } from "../lib/supabase";

export async function fetchCameras() {
  const { data, error } = await supabase
    .from("cameras")
    .select(
      `
      *,
      cameras_extended(*),
      camera_heartbeats(status, fps, created_at)
    `,
    )
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createCamera(camera) {
  const { data, error } = await supabase
    .from("cameras")
    .insert(camera)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCamera(id, updates) {
  const { data, error } = await supabase
    .from("cameras")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCamera(id) {
  const { error } = await supabase.from("cameras").delete().eq("id", id);

  if (error) throw error;
}
```

### 3.3 Events Service

```javascript
// src/services/events.js
import { supabase } from "../lib/supabase";

export async function fetchEvents({
  page = 1,
  pageSize = 20,
  status,
  cameraId,
  search,
}) {
  let query = supabase
    .from("events")
    .select(
      `
      id, timestamp, location, status, violation_type,
      missing_sops, confidence_person, confidence_sop,
      staff_name, photo_path, ai_description, track_id,
      is_reviewed, review_notes,
      cameras(id, name, location)
    `,
      { count: "exact" },
    )
    .order("timestamp", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (status) query = query.eq("status", status);
  if (cameraId) query = query.eq("camera_id", cameraId);
  if (search) query = query.textSearch("search_vector", search);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data, total: count, page, pageSize };
}
```

### 3.4 Identities Service

```javascript
// src/services/identities.js
import { supabase } from "../lib/supabase";

export async function fetchIdentities() {
  const { data, error } = await supabase
    .from("identities")
    .select(
      `
      *, face_photos(id, storage_path, is_primary, photo_type)
    `,
    )
    .order("nama", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createIdentity(identity) {
  const { data, error } = await supabase
    .from("identities")
    .insert(identity)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function uploadFacePhoto(identityId, file) {
  const filePath = `faces/${identityId}/${Date.now()}_${file.name}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("identity-photos")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Create face_photos record
  const { data, error } = await supabase
    .from("face_photos")
    .insert({
      identity_id: identityId,
      storage_path: filePath,
      is_primary: false,
      file_size: file.size,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### 3.5 Config Service

```javascript
// src/services/config.js
import { supabase } from "../lib/supabase";

export async function fetchConfig() {
  const { data, error } = await supabase
    .from("config_settings")
    .select(
      `
      id, key, value, data_type, display_name, description,
      is_sensitive, is_readonly, sort_order,
      config_categories(name, display_name, icon, sort_order)
    `,
    )
    .order("sort_order", { ascending: true });

  if (error) throw error;

  // Group by category
  const grouped = data.reduce((acc, item) => {
    const category = item.config_categories?.name || "general";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  return grouped;
}

export async function updateConfigSetting(id, value) {
  const { error } = await supabase
    .from("config_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
```

---

## Phase 4: React Query Hooks

### 4.1 Query Client Setup

```javascript
// src/lib/queryClient.js
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 4.2 Hooks Pattern

```javascript
// src/hooks/useDashboard.js
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardSummary,
  fetchRecentIncidents,
} from "../services/dashboard";

export const useDashboardSummary = () =>
  useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    refetchInterval: 30_000,
  });

export const useRecentIncidents = (limit = 5) =>
  useQuery({
    queryKey: ["events", "recent", limit],
    queryFn: () => fetchRecentIncidents(limit),
    refetchInterval: 10_000,
  });
```

```javascript
// src/hooks/useCameras.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCameras,
  createCamera,
  updateCamera,
  deleteCamera,
} from "../services/cameras";

export const useCameras = () =>
  useQuery({ queryKey: ["cameras"], queryFn: fetchCameras });

export const useCreateCamera = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCamera,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cameras"] }),
  });
};

export const useUpdateCamera = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateCamera(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cameras"] }),
  });
};

export const useDeleteCamera = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCamera,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cameras"] }),
  });
};
```

```javascript
// src/hooks/useEvents.js
import { useQuery } from "@tanstack/react-query";
import { fetchEvents } from "../services/events";

export const useEvents = (filters = {}) =>
  useQuery({
    queryKey: ["events", filters],
    queryFn: () => fetchEvents(filters),
    keepPreviousData: true,
  });
```

---

## Phase 5: Supabase Realtime Integration

### 5.1 Realtime Events Hook

```javascript
// src/hooks/useRealtimeEvents.js
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useRealtimeEvents() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("events-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "events" },
        (payload) => {
          // Invalidate dashboard & events queries
          queryClient.invalidateQueries({ queryKey: ["dashboard"] });
          queryClient.invalidateQueries({ queryKey: ["events"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
```

### 5.2 Camera Heartbeat Realtime

```javascript
// src/hooks/useRealtimeCameraStatus.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useRealtimeCameraStatus() {
  const [statuses, setStatuses] = useState({});

  useEffect(() => {
    const channel = supabase
      .channel("camera-heartbeats")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "camera_heartbeats" },
        (payload) => {
          const hb = payload.new;
          setStatuses((prev) => ({
            ...prev,
            [hb.camera_id]: {
              status: hb.status,
              fps: hb.fps,
              lastSeen: hb.created_at,
            },
          }));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return statuses;
}
```

---

## Phase 6: Supabase Storage Integration

### 6.1 Image URLs Helper

```javascript
// src/lib/storage.js
import { supabase } from "./supabase";

export function getPublicUrl(bucket, path) {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function getSignedUrl(bucket, path, expiresIn = 3600) {
  if (!path) return null;
  return supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
}

// Usage in components:
// const photoUrl = getPublicUrl('event-evidence', event.photo_path)
// <img src={photoUrl} alt="Evidence" />
```

### 6.2 Storage Buckets Required

| Bucket            | Purpose                     |     Public?      |
| :---------------- | :-------------------------- | :--------------: |
| `event-evidence`  | SOP violation/valid photos  | No (signed URLs) |
| `identity-photos` | Face photos for recognition | No (signed URLs) |
| `config-exports`  | CSV/PDF exports             | No (signed URLs) |

---

## Phase 7: App Entry Point

### 7.1 Updated App.jsx

```javascript
// src/App.jsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui/Toast";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useRealtimeEvents } from "./hooks/useRealtimeEvents";
import DashboardShell from "./components/layout/DashboardShell";

function AppContent() {
  useRealtimeEvents(); // Subscribe to realtime changes
  return <DashboardShell />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        </ToastProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

---

## 📁 Final Frontend Structure

```
src/
├── lib/
│   ├── supabase.js          ← Supabase client instance
│   ├── queryClient.js       ← React Query config
│   └── storage.js           ← Storage URL helpers
├── contexts/
│   ├── AuthContext.jsx       ← Supabase Auth state
│   └── CameraContext.jsx     ← Multi-camera layout state
├── services/
│   ├── dashboard.js          ← Dashboard Supabase queries
│   ├── cameras.js            ← Camera CRUD via Supabase
│   ├── events.js             ← Events queries
│   ├── identities.js         ← Identity management
│   └── config.js             ← Config settings
├── hooks/
│   ├── useDashboard.js       ← React Query hooks
│   ├── useCameras.js
│   ├── useEvents.js
│   ├── useIdentities.js
│   ├── useConfig.js
│   ├── useRealtimeEvents.js  ← Supabase Realtime
│   └── useRealtimeCameraStatus.js
├── components/
│   ├── ProtectedRoute.jsx
│   └── ...existing components
└── pages/
    └── ...existing pages (now use real data)
```

---

## ✅ Integration Checklist

### Phase 1: Setup

- [ ] Install `@supabase/supabase-js`
- [ ] Create `.env` with Supabase URL + anon key
- [ ] Create `src/lib/supabase.js`

### Phase 2: Auth

- [ ] Create AuthContext with Supabase Auth
- [ ] Update LoginPage to use `supabase.auth.signInWithPassword`
- [ ] Create ProtectedRoute component
- [ ] Test login/logout flow

### Phase 3: Data Layer

- [ ] Create service files (dashboard, cameras, events, identities, config)
- [ ] Verify RLS policies allow reads with auth token

### Phase 4: React Query

- [ ] Install `@tanstack/react-query`
- [ ] Create query client
- [ ] Create hooks for each service
- [ ] Replace mock data imports in each page

### Phase 5: Realtime

- [ ] Enable Realtime on `events` table in Supabase dashboard
- [ ] Enable Realtime on `camera_heartbeats` table
- [ ] Create realtime hooks
- [ ] Verify live updates propagate to UI

### Phase 6: Storage

- [ ] Create Storage buckets in Supabase dashboard
- [ ] Create storage helper functions
- [ ] Update photo display components to use signed URLs

### Phase 7: Polish

- [ ] Add loading skeletons to all pages
- [ ] Add error boundaries per page
- [ ] Add empty state components
- [ ] Test all CRUD operations
- [ ] Verify tenant isolation via RLS

---

## 🔗 Database Tables → Frontend Pages Mapping

| Supabase Table                          | Frontend Page                    | Hook                        | Operations                  |
| :-------------------------------------- | :------------------------------- | :-------------------------- | :-------------------------- |
| `auth.users` + `profiles`               | LoginPage                        | `useAuth`                   | signIn, signOut, getSession |
| `events`                                | DashboardPage, IncidentsPage     | `useDashboard`, `useEvents` | SELECT, filter, paginate    |
| `cameras` + `cameras_extended`          | MonitoringPage, CameraManagement | `useCameras`                | CRUD                        |
| `camera_heartbeats`                     | MonitoringPage                   | `useRealtimeCameraStatus`   | Realtime INSERT             |
| `identities` + `face_photos`            | IdentityPage                     | `useIdentities`             | CRUD + Storage upload       |
| `config_settings` + `config_categories` | SettingsPage                     | `useConfig`                 | SELECT, UPDATE              |
| `daily_summaries`                       | DashboardPage (analytics)        | `useDashboard`              | SELECT                      |
| `notification_rules`                    | SettingsPage (notifications)     | `useNotifications`          | CRUD                        |
| `audit_logs`                            | AdminPage (future)               | `useAuditLogs`              | SELECT                      |

---

**Document Version**: 1.0  
**Created**: 2026-03-13  
**Status**: Ready for Implementation
