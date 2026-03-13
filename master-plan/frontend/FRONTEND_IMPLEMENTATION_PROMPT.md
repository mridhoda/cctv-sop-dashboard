# 🎨 Frontend Implementation Master Prompt

> **Comprehensive one-shot prompt** untuk implementasi complete CCTV-SOP Frontend dengan integrasi real API

---

## 📋 CURRENT STATE ANALYSIS

### Existing Frontend Structure (cctv-sop-ui/src)

```
src/
├── App.jsx              ← Route management, auth state
├── main.jsx             ← Entry point
├── index.css            ← Tailwind + custom utilities
├── data.js              ← ⚠️ ALL MOCK DATA
├── pages/
│   ├── LoginPage.jsx    ✅ UI ready, mock auth
│   ├── DashboardPage.jsx ✅ UI ready, mock metrics
│   ├── MonitoringPage.jsx ✅ UI ready, single camera
│   ├── IncidentsPage.jsx ✅ UI ready, mock data
│   ├── IdentityPage.jsx ✅ UI ready, mock CRUD
│   ├── ReportsPage.jsx  ✅ UI ready, mock gallery
│   └── SettingsPage.jsx ✅ UI ready, mock save
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx  ✅ Navigation ready
│   │   └── Topbar.jsx   ✅ Header ready
│   └── ui/              ✅ Toast, modal components
└── utils/               ← Helper functions
```

### Current Data Flow (MOCK)

```javascript
// data.js - All hardcoded
export const metrics = [
  { title: "Total Deteksi", value: "1,248", delta: "+12% vs kemarin", ... },
  // ... all mock
];

export const incidents = [
  { time:"10:05:23", name:"Budi Santoso", type:"Helm Tidak Pakai", ... },
  // ... all mock
];

export const cameras = [
  { id:"cam1", name:"CCTV 01", area:"Produksi A", online:true, ... },
  // ... all mock
];
```

### Current Auth (MOCK)

```javascript
// LoginPage.jsx
const handleLogin = () => {
  // Hardcoded validation
  if (username === "admin" && password === "admin123") {
    setRole("superadmin");
    onLogin();
  }
};
```

---

## 🎯 TARGET STATE

### Real Data Flow (TARGET)

```javascript
// services/api.js - Real API calls
export const fetchMetrics = async () => {
  const { data } = await api.get("/dashboard/summary");
  return data;
};

// hooks/useMetrics.js - React Query
export const useMetrics = () => {
  return useQuery({
    queryKey: ["metrics"],
    queryFn: fetchMetrics,
    refetchInterval: 30000, // 30 seconds
  });
};

// DashboardPage.jsx
const { data: metrics, isLoading, error } = useMetrics();
```

### Real Auth (TARGET)

```javascript
// services/auth.js
export const login = async (credentials) => {
  const { data } = await api.post("/auth/login", credentials);
  localStorage.setItem("token", data.token);
  return data.user;
};

// App.jsx - JWT validation
const [user, setUser] = useState(null);
const isAuthenticated = !!localStorage.getItem("token");
```

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Infrastructure Setup (Week 1)

#### 1.1 Install Dependencies

```bash
npm install @tanstack/react-query@latest axios@latest
npm install @tanstack/react-query-devtools
npm install react-hook-form zod @hookform/resolvers
npm install date-fns
npm install socket.io-client
```

#### 1.2 Create Service Layer Structure

```
src/
├── services/
│   ├── api.js           ← Axios instance with interceptors
│   ├── auth.js          ← Login/logout/refresh
│   ├── cameras.js       ← Camera CRUD
│   ├── events.js        ← Events/incidents
│   ├── identities.js    ← Identity management
│   ├── dashboard.js     ← Dashboard metrics
│   ├── reports.js       ← Photo evidence
│   └── config.js        ← System settings
├── hooks/
│   ├── useAuth.js       ← Auth state management
│   ├── useCameras.js    ← Camera queries
│   ├── useEvents.js     ← Events queries
│   ├── useIdentities.js ← Identity queries
│   ├── useDashboard.js  ← Dashboard queries
│   └── useSocket.js     ← WebSocket connection
├── contexts/
│   ├── AuthContext.jsx  ← Global auth state
│   └── CameraContext.jsx ← Multi-camera state
└── lib/
    ├── queryClient.js   ← React Query config
    └── utils.js         ← Helper functions
```

#### 1.3 API Configuration

```javascript
// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

### Phase 2: Authentication Integration (Week 1-2)

#### 2.1 Auth Context

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { login as loginApi, getCurrentUser } from "../services/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check existing session
    const token = localStorage.getItem("token");
    if (token) {
      getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem("token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

#### 2.2 Update LoginPage

```javascript
// src/pages/LoginPage.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../components/ui/Toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await login(data);
      addToast({ type: "success", message: "Login berhasil!" });
    } catch (error) {
      addToast({
        type: "error",
        message: error.response?.data?.message || "Login gagal",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* existing UI */}</form>;
}
```

#### 2.3 Update App.jsx

```javascript
// src/App.jsx
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <LoginPage />;

  return <DashboardShell />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

---

### Phase 3: Dashboard Integration (Week 2)

#### 3.1 Dashboard Service

```javascript
// src/services/dashboard.js
import api from "./api";

export const fetchDashboardSummary = async () => {
  const { data } = await api.get("/dashboard/summary");
  return data;
};

export const fetchRecentIncidents = async (limit = 5) => {
  const { data } = await api.get(`/events?limit=${limit}`);
  return data;
};

export const fetchCameraStatus = async () => {
  const { data } = await api.get("/cameras/status");
  return data;
};
```

#### 3.2 Dashboard Hooks

```javascript
// src/hooks/useDashboard.js
import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardSummary,
  fetchRecentIncidents,
  fetchCameraStatus,
} from "../services/dashboard";

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    refetchInterval: 30000,
  });
};

export const useRecentIncidents = (limit = 5) => {
  return useQuery({
    queryKey: ["events", "recent", limit],
    queryFn: () => fetchRecentIncidents(limit),
    refetchInterval: 10000,
  });
};

export const useCameraStatus = () => {
  return useQuery({
    queryKey: ["cameras", "status"],
    queryFn: fetchCameraStatus,
    refetchInterval: 5000,
  });
};
```

#### 3.3 Update DashboardPage

```javascript
// src/pages/DashboardPage.jsx
import {
  useDashboardSummary,
  useRecentIncidents,
  useCameraStatus,
} from "../hooks/useDashboard";
import { LoadingSpinner } from "../components/ui/Loading";
import { ErrorMessage } from "../components/ui/Error";

export default function DashboardPage() {
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useDashboardSummary();

  const { data: incidents, isLoading: incidentsLoading } =
    useRecentIncidents(5);

  const { data: cameras, isLoading: camerasLoading } = useCameraStatus();

  if (metricsLoading || incidentsLoading || camerasLoading) {
    return <LoadingSpinner />;
  }

  if (metricsError) {
    return <ErrorMessage error={metricsError} />;
  }

  return (
    <div className="space-y-6">
      {/* Metrics Cards - use real data */}
      <MetricsGrid metrics={metrics} />

      {/* Recent Incidents */}
      <IncidentsTable incidents={incidents} />

      {/* Camera Status */}
      <CameraStatusGrid cameras={cameras} />
    </div>
  );
}
```

---

### Phase 4: Live Monitoring Integration (Week 2-3)

#### 4.1 WebSocket Hook

```javascript
// src/hooks/useSocket.js
import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    socketRef.current = io(
      import.meta.env.VITE_WS_URL || "http://localhost:5001",
      {
        auth: { token },
      },
    );

    socketRef.current.on("connect", () => setIsConnected(true));
    socketRef.current.on("disconnect", () => setIsConnected(false));

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const subscribe = useCallback((event, callback) => {
    socketRef.current?.on(event, callback);
    return () => socketRef.current?.off(event, callback);
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { socket: socketRef.current, isConnected, subscribe, emit };
};
```

#### 4.2 Camera Stream Hook

```javascript
// src/hooks/useCameraStream.js
import { useEffect, useState } from "react";
import { useSocket } from "./useSocket";

export const useCameraStream = (cameraId) => {
  const { subscribe, emit, isConnected } = useSocket();
  const [frame, setFrame] = useState(null);
  const [detections, setDetections] = useState([]);

  useEffect(() => {
    if (!cameraId || !isConnected) return;

    // Subscribe to camera room
    emit("subscribe_camera", { camera_id: cameraId });

    // Listen for frames
    const unsubscribeFrame = subscribe("frame", (data) => {
      if (data.camera_id === cameraId) {
        setFrame(data.frame);
      }
    });

    // Listen for detections
    const unsubscribeDetection = subscribe("detection_event", (data) => {
      if (data.camera_id === cameraId) {
        setDetections((prev) => [data, ...prev].slice(0, 10));
      }
    });

    return () => {
      unsubscribeFrame();
      unsubscribeDetection();
      emit("unsubscribe_camera", { camera_id: cameraId });
    };
  }, [cameraId, isConnected, subscribe, emit]);

  return { frame, detections, isConnected };
};
```

#### 4.3 Update MonitoringPage

```javascript
// src/pages/MonitoringPage.jsx
import { useState } from "react";
import { useCameras } from "../hooks/useCameras";
import { useCameraStream } from "../hooks/useCameraStream";

export default function MonitoringPage({ role }) {
  const { data: cameras } = useCameras();
  const [activeCameraId, setActiveCameraId] = useState(null);
  const { frame, detections } = useCameraStream(activeCameraId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Camera List */}
      <CameraList
        cameras={cameras}
        activeId={activeCameraId}
        onSelect={setActiveCameraId}
      />

      {/* Main Stream */}
      <div className="lg:col-span-2">
        <CameraFeed frame={frame} detections={detections} />
      </div>
    </div>
  );
}
```

---

### Phase 5: Multi-Camera Layout (Week 3-4)

#### 5.1 Camera Context

```javascript
// src/contexts/CameraContext.jsx
import { createContext, useContext, useState } from "react";

const CameraContext = createContext();

const LAYOUTS = {
  single: { grid: "grid-cols-1", max: 1 },
  quad: { grid: "grid-cols-2", max: 4 },
  nine: { grid: "grid-cols-3", max: 9 },
  mainPlusSidebar: {
    grid: "grid-cols-4",
    max: 5,
    template: "main main main side",
  },
};

export function CameraProvider({ children }) {
  const [layout, setLayout] = useState("single");
  const [activeCameras, setActiveCameras] = useState([]);

  const addCamera = (cameraId) => {
    if (activeCameras.length < LAYOUTS[layout].max) {
      setActiveCameras([...activeCameras, cameraId]);
    }
  };

  const removeCamera = (cameraId) => {
    setActiveCameras(activeCameras.filter((id) => id !== cameraId));
  };

  const changeLayout = (newLayout) => {
    setLayout(newLayout);
    // Trim active cameras if exceeds new layout max
    const max = LAYOUTS[newLayout].max;
    if (activeCameras.length > max) {
      setActiveCameras(activeCameras.slice(0, max));
    }
  };

  return (
    <CameraContext.Provider
      value={{
        layout,
        layoutConfig: LAYOUTS[layout],
        activeCameras,
        addCamera,
        removeCamera,
        changeLayout,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export const useCameraLayout = () => useContext(CameraContext);
```

#### 5.2 Multi-Camera Grid Component

```javascript
// src/components/camera/CameraGrid.jsx
import { useCameraLayout } from "../../contexts/CameraContext";
import { CameraFeed } from "./CameraFeed";

export function CameraGrid() {
  const { layoutConfig, activeCameras } = useCameraLayout();

  return (
    <div className={`grid ${layoutConfig.grid} gap-4`}>
      {activeCameras.map((cameraId) => (
        <CameraFeed key={cameraId} cameraId={cameraId} />
      ))}

      {/* Empty slots */}
      {Array.from({
        length: Math.max(0, layoutConfig.max - activeCameras.length),
      }).map((_, i) => (
        <EmptyCameraSlot key={`empty-${i}`} index={i} />
      ))}
    </div>
  );
}
```

#### 5.3 Layout Selector

```javascript
// src/components/camera/LayoutSelector.jsx
import { useCameraLayout } from "../../contexts/CameraContext";

const LAYOUT_OPTIONS = [
  { id: "single", label: "1x1", icon: "Square" },
  { id: "quad", label: "2x2", icon: "Grid2x2" },
  { id: "nine", label: "3x3", icon: "Grid3x3" },
  { id: "mainPlusSidebar", label: "1+4", icon: "LayoutTemplate" },
];

export function LayoutSelector() {
  const { layout, changeLayout } = useCameraLayout();

  return (
    <div className="flex items-center gap-2">
      {LAYOUT_OPTIONS.map((option) => (
        <button
          key={option.id}
          onClick={() => changeLayout(option.id)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium
            ${
              layout === option.id
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

---

### Phase 6: Camera Management Page (Week 4)

#### 6.1 Camera CRUD Hooks

```javascript
// src/hooks/useCameras.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCameras,
  createCamera,
  updateCamera,
  deleteCamera,
  startCamera,
  stopCamera,
} from "../services/cameras";

export const useCameras = () => {
  return useQuery({
    queryKey: ["cameras"],
    queryFn: fetchCameras,
  });
};

export const useCreateCamera = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCamera,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cameras"] });
    },
  });
};

export const useCameraControl = () => {
  const queryClient = useQueryClient();

  const start = useMutation({
    mutationFn: startCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });

  const stop = useMutation({
    mutationFn: stopCamera,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cameras"] }),
  });

  return { start, stop };
};
```

#### 6.2 Camera Management Page

```javascript
// src/pages/CameraManagementPage.jsx (NEW)
import { useCameras, useCreateCamera } from "../hooks/useCameras";
import { CameraTable } from "../components/camera/CameraTable";
import { CameraFormModal } from "../components/camera/CameraFormModal";

export default function CameraManagementPage() {
  const { data: cameras, isLoading } = useCameras();
  const createCamera = useCreateCamera();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Kamera</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + Tambah Kamera
        </button>
      </div>

      <CameraTable cameras={cameras} isLoading={isLoading} />

      <CameraFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createCamera.mutate}
      />
    </div>
  );
}
```

---

## 📋 API ENDPOINT SPECIFICATION

### Authentication

| Method | Endpoint       | Description                  |
| ------ | -------------- | ---------------------------- |
| POST   | `/auth/login`  | Login with username/password |
| POST   | `/auth/logout` | Invalidate token             |
| GET    | `/auth/me`     | Get current user info        |

### Dashboard

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| GET    | `/dashboard/summary`           | Metrics, stats, counts |
| GET    | `/dashboard/incidents?limit=5` | Recent incidents       |
| GET    | `/dashboard/cameras`           | Camera status list     |

### Cameras

| Method | Endpoint                | Description         |
| ------ | ----------------------- | ------------------- |
| GET    | `/cameras`              | List all cameras    |
| POST   | `/cameras`              | Create new camera   |
| GET    | `/cameras/:id`          | Get camera details  |
| PUT    | `/cameras/:id`          | Update camera       |
| DELETE | `/cameras/:id`          | Delete camera       |
| POST   | `/cameras/:id/start`    | Start camera stream |
| POST   | `/cameras/:id/stop`     | Stop camera stream  |
| GET    | `/cameras/:id/snapshot` | Get snapshot image  |

### Events

| Method | Endpoint             | Description             |
| ------ | -------------------- | ----------------------- |
| GET    | `/events`            | List events (paginated) |
| GET    | `/events/:id`        | Get event details       |
| GET    | `/events/export/csv` | Export to CSV           |

### Identities

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| GET    | `/identities`            | List identities       |
| POST   | `/identities`            | Create identity       |
| DELETE | `/identities/:id`        | Delete identity       |
| POST   | `/identities/:id/encode` | Trigger face encoding |
| POST   | `/identities/:id/photos` | Upload photo          |

### Config

| Method | Endpoint  | Description       |
| ------ | --------- | ----------------- |
| GET    | `/config` | Get system config |
| PUT    | `/config` | Update config     |

---

## 🔄 STATE MIGRATION CHECKLIST

### From Mock to Real (Per Page)

- [ ] **LoginPage**
  - Replace hardcoded auth with API call
  - Add form validation with react-hook-form
  - Add loading states
  - Add error handling

- [ ] **DashboardPage**
  - Replace metrics with useDashboardSummary hook
  - Replace incidents with useRecentIncidents hook
  - Replace camera status with useCameraStatus hook
  - Add loading skeletons
  - Add error boundaries

- [ ] **MonitoringPage**
  - Integrate WebSocket for real-time stream
  - Add camera selector
  - Add connection status indicator
  - Handle reconnect logic

- [ ] **IncidentsPage**
  - Replace mock incidents with API query
  - Add server-side pagination
  - Add filtering (status, date, camera)
  - Add sorting

- [ ] **IdentityPage**
  - Replace mock identities with API query
  - Add photo upload with progress
  - Add encode button with status
  - Add confirmation dialogs

- [ ] **ReportsPage**
  - Replace mock gallery with API query
  - Add image lazy loading
  - Add lightbox with actual images
  - Add export functionality

- [ ] **SettingsPage**
  - Load config from API on mount
  - Save config to API on submit
  - Add validation for each field
  - Add success/error feedback

---

## 🎯 SUCCESS CRITERIA

### Definition of Done

1. ✅ All pages use real API data (no mock data)
2. ✅ Authentication with JWT working
3. ✅ Real-time monitoring with WebSocket
4. ✅ Camera management page functional
5. ✅ Multi-camera layout working
6. ✅ Error handling on all API calls
7. ✅ Loading states on all async operations
8. ✅ Optimistic updates for better UX
9. ✅ Cache invalidation working correctly
10. ✅ Responsive design maintained

---

## 🚨 COMMON PITFALLS & SOLUTIONS

### Pitfall 1: WebSocket Reconnection Storm

**Solution**: Use exponential backoff, max retry limit

### Pitfall 2: Memory Leaks from Subscriptions

**Solution**: Always cleanup useEffect, unsubscribe on unmount

### Pitfall 3: Stale Data After Mutations

**Solution**: Use queryClient.invalidateQueries correctly

### Pitfall 4: Race Conditions in Camera Switching

**Solution**: Use request cancellation, loading states

### Pitfall 5: Large Image Loads Blocking UI

**Solution**: Use lazy loading, placeholders, progressive loading

---

## 📚 RESOURCES

- React Query Docs: https://tanstack.com/query/latest
- Socket.IO Client: https://socket.io/docs/v4/client-api/
- React Hook Form: https://react-hook-form.com/

---

**Implementation Start Date**: **_/_**/**_  
**Target Completion**: _**/**_/_**  
**Assigned Developer**: ****\_\_\_****

---

> 💡 **Execute this prompt step-by-step, page by page. Test each integration before moving to the next.**
