# 📊 Analisis Kompatibilitas: ERD vs V2_Project Backend

> **Tujuan**: Memastikan ERD SaaS Modular bisa diadopsi oleh V2_Project dengan minimal changes

---

## 🔍 Current State V2_Project

### Arsitektur Saat Ini

```
V2_Project/
├── sop_main.py              # Engine deteksi (single camera)
├── engine_ws_client.py      # WebSocket ke server
├── control_panel.py         # GUI lokal
├── config.json              # Konfigurasi lokal
├── identity_vault/          # Folder foto wajah
├── Laporan/                 # Folder hasil deteksi
│   ├── SOP_Valid/
│   └── Pelanggaran/
└── server/                  # Flask server (opsional)
```

### Fitur Aktif (dari config.json)

| Fitur            | Status | Keterangan                        |
| ---------------- | ------ | --------------------------------- |
| Single Camera    | ✅     | `camera_source`: RTSP URL         |
| SOP Detection    | ✅     | baju, baju2, sepatu, helm, masker |
| Face Recognition | ❌     | `enable_face_recognition: 0`      |
| Telegram Alerts  | ✅     | `telegram_enabled: 1`             |
| People Counting  | ✅     | `enable_people_counting: 1`       |
| Movement Trail   | ❌     | `enable_movement_trail: 0`        |
| Multi-Camera     | ❌     | Belum ada di config               |

---

## 🔄 Mapping: V2_Project → ERD Database

### 1. Camera Setup

**V2_Project (Current)**

```json
// config.json
{
  "camera_source": "rtsp://foodinesiasop:tenggarong1@10.44.77.5:554/stream1",
  "camera_rotation": "0",
  "display_scale": 0.5
}
```

**ERD Mapping**

```sql
-- Untuk Defense Plan (single camera)
INSERT INTO cameras (id, tenant_id, name, location, source_url, rotation)
VALUES (
    'cam_001_produksi_a',
    'tenant_uuid',
    'Produksi A',
    'Lantai 1 - Area Produksi',
    'rtsp://foodinesiasop:tenggarong1@10.44.77.5:554/stream1',
    0
);
```

**Compatibility**: ✅ **100% Compatible**

- Field mapping langsung
- RTSP URL format sama
- Rotation sudah didukung

---

### 2. Detection Configuration

**V2_Project (Current)**

```json
{
  "conf_person": 0.5,
  "conf_sop": 0.25,
  "cooldown_minutes": 10.0,
  "detection_duration": 2.0,
  "enable_body_zoning": 1,
  "capture_valid_sop": 1
}
```

**ERD Mapping**

```sql
-- Defense Plan (basic settings)
INSERT INTO config (id, tenant_id, category, value) VALUES
('camera.detection_duration', 'tenant_uuid', 'camera', '2.0'),
('camera.cooldown_minutes', 'tenant_uuid', 'camera', '10.0'),
('detection.conf_person', 'tenant_uuid', 'detection', '0.5'),
('detection.conf_sop', 'tenant_uuid', 'detection', '0.25');

-- Guardian+ (advanced settings)
INSERT INTO cameras_extended (camera_id, tenant_id, detection_settings)
VALUES ('cam_001', 'tenant_uuid', '{
    "conf_person": 0.5,
    "conf_sop": 0.25,
    "cooldown_minutes": 10,
    "skip_frames": 0,
    "roi": null
}');
```

**Compatibility**: ✅ **Compatible dengan upgrade path**

- Defense: Basic config table
- Guardian+: Extended table dengan JSON settings

---

### 3. SOP Detection & Events

**V2_Project (Current)**

```python
# sop_main.py - Event creation
{
    "name": "Budi",
    "status": "pelanggaran",  # atau "valid"
    "track_id": "123",
    "timestamp": "2026-03-12T10:30:00",
    "photo_path": "Laporan/Pelanggaran/Budi_Pelanggaran_20260312_103000.jpg",
    "missing_sops": ["helm", "masker"]
}
```

**ERD Mapping**

```sql
-- Defense Plan (basic events)
INSERT INTO events (
    tenant_id, camera_id, timestamp, location,
    status, violation_type, missing_sops,
    confidence_person, confidence_sop,
    photo_path, track_id
) VALUES (
    'tenant_uuid',
    'cam_001_produksi_a',
    '2026-03-12T10:30:00',
    'Lantai 1 - Area Produksi',
    'violation',
    'Helm & Masker Tidak Dipakai',
    '["helm", "masker"]',
    0.89,
    0.76,
    'event-evidence/cam_001/2026-03-12/event_uuid.jpg',
    '123'
);
```

**Compatibility**: ✅ **Compatible dengan tambahan kolom**

- V2 perlu adaptasi: photo_path ke Supabase Storage (bukan lokal)
- Missing SOPs sudah didukung (JSONB)
- Track ID sudah ada

---

### 4. Identity Vault (Face Recognition)

**V2_Project (Current)**

```
identity_vault/
├── Budi.jpg
├── Ani.jpg
└anto.jpg
```

**ERD Mapping (Protector Plan only)**

```sql
-- Step 1: Create identity
INSERT INTO identities (tenant_id, employee_id, nama, jabatan)
VALUES ('tenant_uuid', 'EMP001', 'Budi', 'Operator');

-- Step 2: Upload photo to Supabase Storage
-- Bucket: identity-photos/{identity_id}/primary.jpg

-- Step 3: Register face photo
INSERT INTO face_photos (tenant_id, identity_id, storage_path, is_primary)
VALUES ('tenant_uuid', 'identity_uuid', 'identity-photos/identity_uuid/primary.jpg', true);

-- Step 4: Generate encoding (via API)
-- POST /api/identities/{id}/encode
-- AI Engine reads photo, generates vector, stores in face_encodings
```

**Compatibility**: ⚠️ **Requires Migration**

- V2 saat ini pakai folder lokal + face_recognition library
- ERD requires Supabase Storage + pgvector
- Butuh script migrasi: folder → database + storage

---

### 5. Telegram Configuration

**V2_Project (Current)**

```json
{
  "telegram_enabled": 1,
  "telegram_bot_token": "7990876346:AAEm4bpPB9fKiVtC5il4dFWEANc1didd6jk",
  "telegram_chat_id": "-5297951513"
}
```

**ERD Mapping**

```sql
INSERT INTO config (id, tenant_id, category, value, is_sensitive) VALUES
('notification.telegram_enabled', 'tenant_uuid', 'notification', 'true', false),
('notification.telegram_bot_token', 'tenant_uuid', 'notification', 'encrypted_token', true),
('notification.telegram_chat_id', 'tenant_uuid', 'notification', '-5297951513', false);
```

**Compatibility**: ✅ **100% Compatible**

- Token disimpan encrypted (lebih aman)
- Chat ID sama format

---

## 🚀 Migration Path: V2_Project → ERD

### Phase 1: Defense Plan (Minimal Changes)

**Changes Needed in V2_Project:**

1. **Add Supabase Client**

```python
# New file: db_client.py
from supabase import create_client

class SupabaseClient:
    def __init__(self, url, key):
        self.client = create_client(url, key)
        self.tenant_id = None

    def set_tenant(self, tenant_id):
        self.tenant_id = tenant_id
        # Set RLS context
        self.client.rpc('set_tenant_context', {'tenant_id': tenant_id})

    def save_event(self, event_data):
        return self.client.table('events').insert({
            **event_data,
            'tenant_id': self.tenant_id
        }).execute()
```

2. **Modify sop_main.py - Event Saving**

```python
# BEFORE (local file only)
def save_event_capture(self, frame, person_name, is_valid_sop, ...):
    cv2.imwrite(filepath, frame)
    _push_event(person_name, is_valid_sop, track_id, filepath)

# AFTER (local + database)
def save_event_capture(self, frame, person_name, is_valid_sop, ...):
    # 1. Save to local (backward compat)
    cv2.imwrite(filepath, frame)

    # 2. Save to Supabase (if configured)
    if db_client.is_configured():
        # Upload photo to storage
        photo_url = db_client.upload_event_photo(filepath)

        # Save event record
        db_client.save_event({
            'camera_id': self.camera_id,
            'timestamp': datetime.now().isoformat(),
            'location': self.config.get('location', 'Unknown'),
            'status': 'valid' if is_valid_sop else 'violation',
            'violation_type': missing_sops_text,
            'missing_sops': missing_sops_list,
            'photo_path': photo_url,
            'track_id': track_id,
            'confidence_person': conf_person,
            'confidence_sop': conf_sop
        })
```

3. **Add camera_id to config.json**

```json
{
    "camera_id": "cam_001_produksi_a",  -- NEW
    "camera_source": "rtsp://...",
    ...
}
```

**Effort**: Low (1-2 days)

---

### Phase 2: Guardian Plan (Multi-Camera)

**Changes Needed:**

1. **Config Schema Update**

```json
{
  "cameras": [
    {
      "id": "cam_001_produksi_a",
      "name": "Produksi A",
      "source": "rtsp://...",
      "rotation": "0",
      "enabled": true,
      "location": "Lantai 1"
    },
    {
      "id": "cam_002_gudang",
      "name": "Gudang",
      "source": "rtsp://...",
      "rotation": "0",
      "enabled": true,
      "location": "Gudang Utama"
    }
  ],
  "active_camera_index": 0
}
```

2. **sop_main.py CLI Arguments**

```python
# Run specific camera
python sop_main.py --camera-id=cam_001_produksi_a --camera-source=rtsp://...

# Or read from config
python sop_main.py --config-camera=cam_001_produksi_a
```

3. **WebSocket Room Support**

```python
# engine_ws_client.py - Subscribe to specific camera room
self._sio.emit("subscribe_camera", {"camera_id": self.camera_id})
```

**Effort**: Medium (3-5 days)

---

### Phase 3: Protector Plan (Face Recognition)

**Changes Needed:**

1. **Identity Management via API**

```python
# Instead of reading from identity_vault folder
# Fetch from Supabase

def load_identities(self):
    if not db_client.is_configured():
        # Fallback: local folder
        return self._load_local_identities()

    # Fetch from database
    identities = db_client.client.table('identities')\
        .select('*, face_encodings(encoding_vector)')\
        .eq('tenant_id', db_client.tenant_id)\
        .eq('status', 'active')\
        .execute()

    for identity in identities.data:
        for encoding in identity['face_encodings']:
            self.known_face_encodings.append(
                np.array(encoding['encoding_vector'])
            )
            self.known_face_names.append(identity['nama'])
```

2. **Face Match Logging**

```python
# After face recognition
matches = face_recognition.compare_faces(...)

# Log to database
db_client.client.table('face_match_logs').insert({
    'event_id': event_id,
    'identity_id': matched_identity_id,
    'confidence': confidence,
    'distance': face_distance,
    'match_status': 'matched' if matched else 'rejected'
}).execute()
```

**Effort**: High (1-2 weeks)

---

## ⚠️ Critical Compatibility Issues

### Issue 1: File Storage Migration

**Problem**: V2 pakai folder lokal (`Laporan/`, `identity_vault/`)
**Solution**: Dual-write strategy

```python
def save_photo(self, frame, category):
    # 1. Local (backward compat)
    local_path = f"Laporan/{category}/{filename}.jpg"
    cv2.imwrite(local_path, frame)

    # 2. Cloud (if enabled)
    if self.cloud_enabled:
        storage_path = f"event-evidence/{self.camera_id}/{date}/{filename}.jpg"
        supabase.storage.from_('event-evidence').upload(storage_path, frame_bytes)
        return storage_path

    return local_path
```

### Issue 2: Real-time Events

**Problem**: V2 pakai WebSocket ke local server, ERD pakai Supabase Realtime
**Solution**: Adapter pattern

```python
class EventPublisher:
    def __init__(self, mode='local'):
        self.mode = mode
        if mode == 'local':
            self.ws_client = EngineWSClient()
        elif mode == 'supabase':
            self.supabase = create_client(...)

    def publish_event(self, event):
        if self.mode == 'local':
            self.ws_client.push_event(event)
        elif self.mode == 'supabase':
            # Insert to DB triggers Realtime broadcast
            self.supabase.table('events').insert(event).execute()
```

### Issue 3: Face Recognition Encoding

**Problem**: V2 pakai `face_recognition` library (dlib), ERD expects pgvector
**Solution**: Encoding converter

```python
def encode_face_to_vector(self, image):
    # Use existing face_recognition library
    encoding = face_recognition.face_encodings(image)[0]

    # Returns 128-dim vector (compatible with pgvector)
    return encoding.tolist()
```

---

## 📋 Implementation Checklist

### Defense Plan (Basic)

- [ ] Add Supabase client dependency
- [ ] Create `db_client.py` wrapper
- [ ] Modify `sop_main.py` to save events to DB
- [ ] Add `camera_id` to config.json
- [ ] Test event storage in Supabase
- [ ] Migrate existing events (optional)

### Guardian Plan (Multi-Camera)

- [ ] Update config.json schema for multiple cameras
- [ ] Modify CLI to accept camera_id argument
- [ ] Update `engine_ws_client.py` for room-based streaming
- [ ] Implement camera heartbeat reporting
- [ ] Test multi-camera orchestration

### Protector Plan (Face Recognition)

- [ ] Migrate identity_vault to Supabase Storage
- [ ] Implement face encoding API
- [ ] Update `load_identities()` to fetch from DB
- [ ] Add face match logging
- [ ] Test face recognition with pgvector similarity search

---

## 🎯 Recommendation

**Start with Defense Plan** karena:

1. Minimal changes ke V2_Project
2. Bisa jalan parallel (local + cloud)
3. Tidak breaking existing functionality
4. Foundation untuk upgrade ke Guardian/Protector

**Migration Strategy**:

```
Week 1: Defense Plan (basic DB integration)
Week 2-3: Guardian Plan (multi-camera support)
Week 4-5: Protector Plan (face recognition cloud)
```

---

**Verdict**: ✅ **ERD Compatible dengan V2_Project** dengan migration path yang jelas dari single-camera local → multi-camera cloud SaaS.
