# 📹 Arsitektur Multi-Camera untuk CCTV-SOP System

## Executive Summary

Dokumen ini menjelaskan analisis dan rekomendasi arsitektur untuk mengimplementasikan fitur **multi-camera** pada sistem CCTV-SOP Detection Foodinesia.

---

## 📊 Current State Analysis

### Backend (V2_Project)

| Aspek                   | Status Saat Ini                                     |
| ----------------------- | --------------------------------------------------- |
| **Camera Support**      | Single camera only (`camera_source` di config.json) |
| **Engine Architecture** | Monolithic - 1 process per camera                   |
| **Komunikasi**          | WebSocket via `engine_ws_client.py`                 |
| **Performance**         | ~23-24 FPS per kamera                               |
| **Process Model**       | 1 instance `sop_main.py` = 1 camera                 |

### Frontend (cctv-sop-ui)

| Aspek                | Status Saat Ini          |
| -------------------- | ------------------------ |
| **Camera View**      | Single stream only       |
| **Camera List**      | Hardcoded array          |
| **Management UI**    | Tidak ada                |
| **State Management** | Tidak ada kamera context |

---

## 🏗️ Architecture Options

### Option A: Multi-Process (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Camera Manager                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Camera 1   │  │  Camera 2   │  │  Camera N   │             │
│  │  Process    │  │  Process    │  │  Process    │             │
│  │ (sop_main)  │  │ (sop_main)  │  │ (sop_main)  │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼────────────────────┘
          │                │                │
          └────────────────┼────────────────┘
                           ▼
              ┌─────────────────────────┐
              │     Master Server       │
              │   (API Aggregation)     │
              │  Flask + Socket.IO      │
              └─────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
   │  Dashboard  │ │  Dashboard  │ │  Dashboard  │
   │  (Viewer)   │ │  (Viewer)   │ │  (Admin)    │
   └─────────────┘ └─────────────┘ └─────────────┘
```

**Keuntungan:**

- ✅ Isolasi fault - 1 kamera crash tidak mempengaruhi lainnya
- ✅ Skalabilitas horizontal - bisa ke multiple server
- ✅ Resource management lebih baik (1 GPU per process)
- ✅ Maintenance lebih mudah - restart per kamera

**Kekurangan:**

- ❌ Overhead memori lebih tinggi (multiple Python processes)
- ❌ Kompleksitas orchestration lebih tinggi

### Option B: Single Process Multi-Thread

```
┌─────────────────────────────────────┐
│        Single Process Engine        │
│  ┌─────────────────────────────┐   │
│  │      Camera Manager         │   │
│  │  ┌─────┐ ┌─────┐ ┌─────┐   │   │
│  │  │Cam 1│ │Cam 2│ │Cam N│   │   │
│  │  │Thread│ │Thread│ │Thread│   │   │
│  │  └─────┘ └─────┘ └─────┘   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Keuntungan:**

- ✅ Lebih ringan (1 process)
- ✅ Shared memory lebih mudah

**Kekurangan:**

- ❌ Single point of failure
- ❌ Python GIL limitations untuk CPU-bound tasks
- ❌ Harder to scale

### Rekomendasi: **Option A - Multi-Process**

---

## 📋 Implementation Requirements

### A. Backend Requirements

#### 1. Config Schema Update

```json
{
  "cameras": [
    {
      "id": "cam_001",
      "name": "Produksi A",
      "source": "rtsp://user:pass@10.44.77.5:554/stream1",
      "rotation": "0",
      "enabled": true,
      "location": "Lantai 1 - Area Produksi",
      "detection_settings": {
        "conf_person": 0.5,
        "conf_sop": 0.25,
        "cooldown_minutes": 10
      }
    }
  ],
  "server": {
    "host": "0.0.0.0",
    "port": 5001,
    "max_cameras": 4
  }
}
```

#### 2. CameraManager Component

Responsibilities:

- Spawn/stop/monitor camera processes
- Health check per camera
- Auto-restart on failure
- Resource monitoring

#### 3. API Endpoints (New)

| Method | Endpoint                     | Description        |
| ------ | ---------------------------- | ------------------ |
| GET    | `/api/cameras`               | List all cameras   |
| POST   | `/api/cameras`               | Add new camera     |
| GET    | `/api/cameras/{id}`          | Get camera details |
| PUT    | `/api/cameras/{id}`          | Update camera      |
| DELETE | `/api/cameras/{id}`          | Remove camera      |
| POST   | `/api/cameras/{id}/start`    | Start camera       |
| POST   | `/api/cameras/{id}/stop`     | Stop camera        |
| POST   | `/api/cameras/{id}/restart`  | Restart camera     |
| GET    | `/api/cameras/{id}/stream`   | MJPEG stream       |
| GET    | `/api/cameras/{id}/snapshot` | Get snapshot       |

#### 4. WebSocket Updates

```javascript
// Client subscribe to specific camera
socket.emit("subscribe_camera", { camera_id: "cam_001" });

// Engine push with camera_id
socket.emit("engine_frame", {
  camera_id: "cam_001",
  frame: frame_bytes,
  detections: [],
  timestamp: time.time(),
});

// Server broadcast to room
io.to("camera_cam_001").emit("frame", data);
```

#### 5. Storage Structure Update

```
Laporan/
├── camera_001_produksi_a/
│   ├── SOP_Valid/
│   └── Pelanggaran/
├── camera_002_gudang/
│   ├── SOP_Valid/
│   └── Pelanggaran/
└── camera_003_packing/
    ├── SOP_Valid/
    └── Pelanggaran/
```

### B. Frontend Requirements

#### 1. State Management

```jsx
// CameraContext
const CameraContext = createContext({
  cameras: [], // List of all cameras
  activeCameras: [], // Currently viewing
  cameraStates: {}, // { [cameraId]: 'running'|'stopped'|'error' }

  // Actions
  addCamera: () => {},
  removeCamera: () => {},
  startCamera: () => {},
  stopCamera: () => {},
  subscribeToCamera: () => {},
  unsubscribeFromCamera: () => {},
});
```

#### 2. Components Needed

| Component        | Description                           |
| ---------------- | ------------------------------------- |
| `CameraGrid`     | Layout container (1x1, 2x2, 3x3, 1+5) |
| `CameraFeed`     | Individual camera stream with overlay |
| `CameraCard`     | Status card for dashboard             |
| `CameraForm`     | Add/edit camera form                  |
| `CameraTable`    | List view for management              |
| `LayoutSelector` | Switch between view layouts           |

#### 3. Layout Options

```jsx
const layouts = {
  single: {
    grid: "grid-cols-1",
    max: 1,
    aspect: "aspect-video",
  },
  quad: {
    grid: "grid-cols-2 grid-rows-2",
    max: 4,
    aspect: "aspect-video",
  },
  nine: {
    grid: "grid-cols-3 grid-rows-3",
    max: 9,
    aspect: "aspect-video",
  },
  mainPlusSidebar: {
    grid: "grid-cols-4",
    template: "main main main side",
    max: 5,
  },
};
```

#### 4. Pages Update

| Page         | Changes                              |
| ------------ | ------------------------------------ |
| `Dashboard`  | Show summary cards for all cameras   |
| `Monitoring` | Multi-view grid with layout selector |
| `Cameras`    | NEW - Camera management page         |
| `Incidents`  | Filter by camera, show camera column |

---

## ⚠️ Critical Considerations

### 1. Performance Impact

**Current Performance:**

- ~42ms per frame = ~24 FPS (1 kamera)
- GPU utilization: ~40-60% (TensorRT)

**Multi-Camera Impact:**

| Cameras | GPU Needed        | Memory | FPS Expected   |
| ------- | ----------------- | ------ | -------------- |
| 1       | 1x RTX 3060       | 4GB    | 24 FPS         |
| 2       | 1x RTX 3060       | 6GB    | 24 FPS each    |
| 4       | 1x RTX 3080       | 10GB   | 15-20 FPS each |
| 8+      | 2x GPU or T4/A100 | 16GB+  | 10-15 FPS each |

**Optimizations:**

- Lower resolution for processing (480p)
- Process every Nth frame (skip 2 frames)
- ROI (Region of Interest) detection
- Hardware encoding/decoding (NVDEC)

### 2. Network Bandwidth

| Resolution | Bandwidth per Camera | 4 Cameras  | 8 Cameras  |
| ---------- | -------------------- | ---------- | ---------- |
| 480p       | 2-4 Mbps             | 8-16 Mbps  | 16-32 Mbps |
| 720p       | 4-6 Mbps             | 16-24 Mbps | 32-48 Mbps |
| 1080p      | 6-10 Mbps            | 24-40 Mbps | 48-80 Mbps |

### 3. Storage Requirements

**Daily Estimation (4 cameras):**

- Valid SOP photos: ~50-100/hari = 5-10 MB/hari
- Pelanggaran photos: ~50-100/hari = 5-10 MB/hari
- Video clips (optional): ~100 MB/hari per camera

**Total: ~500 MB - 1 GB per hari untuk 4 kamera**

**Recommendation:** Auto-archive after 30 hari, permanent storage untuk pelanggaran saja.

### 4. WebSocket Scaling

**Concurrent Connections:**

- 1 client viewing 4 cameras = 1 connection (rooms)
- 10 clients = 10 connections
- 100 clients = 100 connections

**Recommendation:** Use Redis adapter untuk Socket.IO horizontal scaling.

---

## 🚀 Implementation Roadmap

### Phase 1: Backend Core (Week 1)

- [ ] Update config.json schema
- [ ] Create CameraManager class
- [ ] Update sop_main.py untuk CLI args
- [ ] Basic API endpoints (CRUD)

### Phase 2: Backend Integration (Week 1-2)

- [ ] WebSocket room-based streaming
- [ ] Process lifecycle management
- [ ] Health check & auto-restart
- [ ] Event storage dengan camera_id

### Phase 3: Frontend Core (Week 2)

- [ ] CameraContext state management
- [ ] CameraGrid component
- [ ] CameraFeed dengan WebSocket rooms
- [ ] Layout selector

### Phase 4: Frontend Management (Week 3)

- [ ] Camera management page
- [ ] Camera CRUD forms
- [ ] Dashboard multi-camera view
- [ ] Incident filtering by camera

### Phase 5: Testing & Optimization (Week 3-4)

- [ ] Load test 4 kamera simultan
- [ ] Performance tuning
- [ ] Error handling & recovery
- [ ] Documentation

---

## 🛠️ Technology Stack

### Backend

| Component          | Technology                    |
| ------------------ | ----------------------------- |
| Process Management | Python subprocess + psutil    |
| IPC                | WebSocket (Socket.IO)         |
| API                | Flask REST                    |
| Config             | JSON dengan validation        |
| Monitoring         | psutil untuk resource metrics |

### Frontend

| Component        | Technology                 |
| ---------------- | -------------------------- |
| State Management | React Context atau Zustand |
| WebSocket        | socket.io-client           |
| Layout           | CSS Grid + Tailwind        |
| Forms            | React Hook Form            |
| Validation       | Zod                        |

---

## 📐 Database Schema (Events)

```sql
-- Events table dengan camera reference
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  camera_id VARCHAR(50) NOT NULL,
  event_type VARCHAR(20) NOT NULL, -- 'valid' | 'pelanggaran'
  person_name VARCHAR(100),
  track_id INTEGER,
  confidence FLOAT,
  photo_path VARCHAR(255),
  missing_sops JSONB, -- ['helm', 'masker', 'baju']
  created_at TIMESTAMP DEFAULT NOW(),

  FOREIGN KEY (camera_id) REFERENCES cameras(id)
);

-- Cameras table
CREATE TABLE cameras (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  source VARCHAR(255) NOT NULL,
  location VARCHAR(100),
  rotation INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'stopped',
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔒 Security Considerations

1. **RTSP Credentials**: Simpan dalam environment variables atau encrypted config
2. **Camera Access Control**: Role-based access (admin vs viewer)
3. **Rate Limiting**: Limit snapshot/stream requests per camera
4. **Input Validation**: Validasi RTSP URL dan camera config

---

## 📚 References

- Current backend: `V2_Project/`
- Current frontend: `cctv-sop-ui/`
- Config: `V2_Project/config.json`
- Main engine: `V2_Project/sop_main.py`
- WebSocket client: `V2_Project/engine_ws_client.py`

---

**Document Version**: 1.0  
**Created**: 2026-03-12  
**Status**: Draft - Ready for Review
