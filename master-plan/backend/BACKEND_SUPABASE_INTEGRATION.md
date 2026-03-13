# ⚙️ Backend ↔ Supabase Integration Steps

> **Step-by-step guide** untuk mengintegrasikan V2_Project (Python backend) dengan Supabase  
> **Supabase Project**: `cctv-sop-db` (`evgvnmnllpgxcsmxfjrn`)

---

## 📋 Prerequisites

- [ ] Python ≥ 3.10
- [ ] V2_Project (sop_main.py) running
- [ ] Supabase project active
- [ ] Supabase `service_role` key (untuk backend server-side operations)

---

## Phase 1: Dependencies & Configuration

### 1.1 Install Python Supabase Client

```bash
pip install supabase python-dotenv
```

### 1.2 Environment Variables

```env
# .env (V2_Project root)
SUPABASE_URL=https://evgvnmnllpgxcsmxfjrn.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
SUPABASE_ANON_KEY=<anon_key>

# Existing V2 config
CAMERA_SOURCE=rtsp://user:pass@ip:554/stream1
SERVER_HOST=0.0.0.0
SERVER_PORT=5001
```

### 1.3 Create Supabase Client Wrapper

```python
# core/supabase_client.py
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None

def get_supabase() -> Client:
    """Get singleton Supabase client with service_role key (server-side)."""
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")
        if not url or not key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY required")
        _client = create_client(url, key)
    return _client
```

> ⚠️ **Backend selalu pakai `service_role` key** karena butuh bypass RLS untuk server-side operations.

---

## Phase 2: Event Storage Integration

### 2.1 Event Publisher (Dual-Write)

```python
# core/event_publisher.py
import uuid
from datetime import datetime, timezone
from core.supabase_client import get_supabase

class EventPublisher:
    def __init__(self, camera_id: str, tenant_id: str):
        self.camera_id = camera_id
        self.tenant_id = tenant_id
        self.supabase = get_supabase()

    def publish_event(self, event_data: dict) -> dict | None:
        """Publish detection event to Supabase."""
        record = {
            "id": str(uuid.uuid4()),
            "tenant_id": self.tenant_id,
            "camera_id": self.camera_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "location": event_data.get("location", ""),
            "status": event_data.get("status", "violation"),
            "violation_type": event_data.get("violation_type"),
            "missing_sops": event_data.get("missing_sops"),
            "confidence_person": event_data.get("confidence_person"),
            "confidence_sop": event_data.get("confidence_sop"),
            "ai_description": event_data.get("ai_description"),
            "photo_path": event_data.get("photo_path"),
            "staff_name": event_data.get("staff_name"),
            "track_id": str(event_data.get("track_id", "")),
            "detection_type": event_data.get("detection_type", "sop_check"),
        }

        try:
            result = self.supabase.table("events").insert(record).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            print(f"[ERROR] Failed to publish event: {e}")
            return None
```

### 2.2 Integration with sop_main.py

```python
# Di sop_main.py, setelah detection berhasil:

from core.event_publisher import EventPublisher

publisher = EventPublisher(
    camera_id=config["camera_id"],
    tenant_id=config["tenant_id"]
)

# Setelah detection:
def on_detection(detection_result):
    # 1. Save foto ke local (existing)
    photo_path = save_photo_local(detection_result)

    # 2. Upload foto ke Supabase Storage
    storage_path = upload_to_supabase(photo_path)

    # 3. Publish event ke Supabase DB
    publisher.publish_event({
        "status": detection_result["status"],
        "violation_type": detection_result.get("violation_type"),
        "missing_sops": detection_result.get("missing_sops"),
        "confidence_person": detection_result["conf_person"],
        "confidence_sop": detection_result["conf_sop"],
        "photo_path": storage_path,
        "location": config["camera_location"],
        "staff_name": detection_result.get("person_name"),
        "track_id": detection_result.get("track_id"),
    })

    # 4. Send notification (existing telegram logic)
    send_telegram_notification(detection_result)
```

---

## Phase 3: Photo Storage (Supabase Storage)

### 3.1 Photo Uploader

```python
# core/photo_uploader.py
import os
from datetime import datetime
from core.supabase_client import get_supabase

class PhotoUploader:
    def __init__(self, bucket: str = "event-evidence"):
        self.supabase = get_supabase()
        self.bucket = bucket

    def upload(self, local_path: str, camera_id: str) -> str | None:
        """Upload photo to Supabase Storage, return storage path."""
        if not os.path.exists(local_path):
            return None

        filename = os.path.basename(local_path)
        date_prefix = datetime.now().strftime("%Y/%m/%d")
        storage_path = f"{camera_id}/{date_prefix}/{filename}"

        try:
            with open(local_path, "rb") as f:
                self.supabase.storage.from_(self.bucket).upload(
                    storage_path, f,
                    file_options={"content-type": "image/jpeg"}
                )
            return storage_path
        except Exception as e:
            print(f"[ERROR] Upload failed: {e}")
            return None
```

---

## Phase 4: Camera Heartbeat Reporting

### 4.1 Heartbeat Sender

```python
# core/heartbeat.py
import time
import threading
import psutil
from core.supabase_client import get_supabase

class HeartbeatReporter:
    def __init__(self, camera_id: str, tenant_id: str, interval: int = 30):
        self.camera_id = camera_id
        self.tenant_id = tenant_id
        self.interval = interval
        self.supabase = get_supabase()
        self._running = False
        self._thread = None
        self._fps = 0.0

    def set_fps(self, fps: float):
        self._fps = fps

    def start(self):
        self._running = True
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self):
        self._running = False

    def _loop(self):
        while self._running:
            self._send_heartbeat()
            time.sleep(self.interval)

    def _send_heartbeat(self):
        try:
            self.supabase.table("camera_heartbeats").insert({
                "tenant_id": self.tenant_id,
                "camera_id": self.camera_id,
                "status": "online",
                "fps": round(self._fps, 1),
                "cpu_usage": psutil.cpu_percent(),
                "memory_usage": psutil.virtual_memory().percent,
            }).execute()
        except Exception as e:
            print(f"[WARN] Heartbeat failed: {e}")
```

---

## Phase 5: Config Sync (Supabase ↔ V2 config.json)

### 5.1 Config Loader

```python
# core/config_sync.py
from core.supabase_client import get_supabase

class ConfigSync:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.supabase = get_supabase()

    def load_from_supabase(self) -> dict:
        """Load config settings from Supabase, return as dict."""
        result = self.supabase.table("config_settings") \
            .select("key, value, data_type") \
            .eq("tenant_id", self.tenant_id) \
            .execute()

        config = {}
        for row in result.data:
            key = row["key"]
            value = row["value"]
            dtype = row["data_type"]

            if dtype == "number":
                config[key] = float(value) if '.' in value else int(value)
            elif dtype == "boolean":
                config[key] = value.lower() in ('true', '1', 'yes')
            elif dtype == "json":
                import json
                config[key] = json.loads(value)
            else:
                config[key] = value

        return config

    def push_to_supabase(self, key: str, value, data_type: str = "string"):
        """Update a config value in Supabase."""
        self.supabase.table("config_settings") \
            .update({"value": str(value)}) \
            .eq("tenant_id", self.tenant_id) \
            .eq("key", key) \
            .execute()
```

---

## Phase 6: API Server Updates (Flask)

### 6.1 Auth Middleware

```python
# server/middleware/auth.py
from functools import wraps
from flask import request, jsonify
from core.supabase_client import get_supabase

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing token"}), 401

        token = auth_header.split(" ")[1]
        try:
            supabase = get_supabase()
            user = supabase.auth.get_user(token)
            request.user = user.user
        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)
    return decorated
```

### 6.2 Camera API Endpoints

```python
# server/api/cameras.py
from flask import Blueprint, request, jsonify
from core.supabase_client import get_supabase
from server.middleware.auth import require_auth

cameras_bp = Blueprint("cameras", __name__)

@cameras_bp.route("/api/cameras", methods=["GET"])
@require_auth
def list_cameras():
    supabase = get_supabase()
    result = supabase.table("cameras") \
        .select("*, cameras_extended(*)") \
        .execute()
    return jsonify(result.data)

@cameras_bp.route("/api/cameras", methods=["POST"])
@require_auth
def create_camera():
    body = request.json
    supabase = get_supabase()
    result = supabase.table("cameras").insert(body).execute()
    return jsonify(result.data[0]), 201

@cameras_bp.route("/api/cameras/<camera_id>", methods=["PUT"])
@require_auth
def update_camera(camera_id):
    body = request.json
    supabase = get_supabase()
    result = supabase.table("cameras") \
        .update(body).eq("id", camera_id).execute()
    return jsonify(result.data[0])

@cameras_bp.route("/api/cameras/<camera_id>", methods=["DELETE"])
@require_auth
def delete_camera(camera_id):
    supabase = get_supabase()
    supabase.table("cameras").delete().eq("id", camera_id).execute()
    return "", 204
```

---

## 📁 Updated Backend Structure

```
V2_Project/
├── core/                          # NEW: Supabase integration
│   ├── supabase_client.py         ← Singleton client
│   ├── event_publisher.py         ← Dual-write events
│   ├── photo_uploader.py          ← Storage upload
│   ├── heartbeat.py               ← Camera health reporting
│   └── config_sync.py             ← Config sync
├── server/
│   ├── middleware/
│   │   └── auth.py                ← JWT validation
│   ├── api/
│   │   ├── cameras.py             ← Camera CRUD
│   │   ├── events.py              ← Events API
│   │   └── config.py              ← Config API
│   └── websocket/
│       └── handlers.py            ← Socket.IO handlers
├── sop_main.py                    ← MODIFIED: + event_publisher
├── engine_ws_client.py            ← MODIFIED: + camera_id rooms
├── config.json                    ← EXISTING: local config
└── .env                           ← NEW: Supabase credentials
```

---

## ✅ Integration Checklist

### Phase 1: Setup

- [ ] Install `supabase` + `python-dotenv`
- [ ] Create `.env` with Supabase credentials
- [ ] Create `core/supabase_client.py`
- [ ] Test connection: `get_supabase().table("tenants").select("*").execute()`

### Phase 2: Events

- [ ] Create `core/event_publisher.py`
- [ ] Integrate with `sop_main.py` detection loop
- [ ] Verify events appear in Supabase dashboard

### Phase 3: Storage

- [ ] Create Storage buckets in Supabase (event-evidence, identity-photos)
- [ ] Create `core/photo_uploader.py`
- [ ] Test photo upload + signed URL retrieval

### Phase 4: Heartbeats

- [ ] Create `core/heartbeat.py`
- [ ] Start heartbeat thread in camera process
- [ ] Verify heartbeats in `camera_heartbeats` table

### Phase 5: Config

- [ ] Create `core/config_sync.py`
- [ ] Load initial config from Supabase on startup
- [ ] Support hot-reload when config changes in DB

### Phase 6: API

- [ ] Create auth middleware
- [ ] Create Camera REST API endpoints
- [ ] Create Events REST API endpoints
- [ ] Test all endpoints with Postman/curl

---

**Document Version**: 1.0  
**Created**: 2026-03-13  
**Status**: Ready for Implementation
