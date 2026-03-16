# 📁 V2_Project — Struktur Folder & Panduan Pengembangan

> Dokumen ini adalah **referensi resmi** struktur folder `V2_Project` (backend AI CCTV).
> Selalu update dokumen ini setiap ada penambahan modul atau perubahan struktur.

---

## Struktur Folder Lengkap

```
V2_Project/
│
├── 🤖 engine/                     # AI Detection Engine (berjalan standalone atau dipanggil server)
│   ├── sop_main.py                #   ← Main loop: baca kamera, deteksi, SOP check, event
│   ├── utils.py                   #   ← CameraReader, body zoning, helper math
│   ├── control_panel.py           #   ← GUI/TUI untuk start engine (entry point utama)
│   ├── custom_tracker.yaml        #   ← Konfigurasi ByteTrack (tuning tracking)
│   └── integrations/              #   ← Koneksi engine ke layanan eksternal
│       ├── ws_client.py           #       WebSocket client → server Flask
│       └── telegram_bot.py        #       Kirim alert gambar via Telegram
│
├── 🌐 server/                     # Web Server (Flask + SocketIO)
│   ├── main.py                    #   ← Entry point: python server/main.py
│   ├── app.py                     #   ← Flask App Factory (wiring semua blueprint)
│   ├── .env                       #   ← Kredensial (Supabase, CAMERA_ID, dll) — JANGAN di-commit
│   ├── .env.example               #   ← Template .env untuk onboarding developer baru
│   │
│   ├── api/                       #   HTTP REST Endpoints (Flask Blueprints)
│   │   ├── health.py              #       GET  /api/health
│   │   ├── engine.py              #       POST /api/engine/start|stop|restart
│   │   ├── stream.py              #       GET  /api/stream/video|snapshot
│   │   ├── events.py              #       GET  /api/events
│   │   ├── reports.py             #       GET  /api/reports
│   │   ├── identities.py          #       GET/POST/DELETE /api/identities
│   │   ├── config.py              #       GET/POST /api/config
│   │   └── cameras.py             #       GET/POST/PUT/DELETE /api/cameras (Supabase-backed)
│   │
│   ├── websocket/                 #   SocketIO Event Handlers
│   │   └── handlers.py            #       connect, disconnect, start_engine, stop_engine
│   │
│   ├── middleware/                 #   Request Processing
│   │   └── auth.py                #       @require_auth — validasi JWT Bearer token Supabase
│   │
│   ├── bridge/                    #   Komunikasi Server ↔ Engine (In-Process IPC)
│   │   └── engine_bridge.py       #       EngineBridge, SharedState, BridgeLogger
│   │
│   ├── supabase/                  #   Cloud Integration (Supabase)
│   │   ├── client.py              #       get_supabase() — singleton client
│   │   ├── event_repository.py    #       EventPublisher.publish_event()
│   │   ├── photo_storage.py       #       PhotoUploader.upload() + signed URL
│   │   ├── heartbeat.py           #       HeartbeatReporter (background thread)
│   │   └── config_sync.py         #       ConfigSync — sync config lokal ↔ Supabase
│   │
│   ├── tui/                       #   Terminal UI Dashboard
│   │   └── dashboard.py           #       V2ServerTUI (rich library, monitor server stats)
│   │
│   └── test/                      #   (opsional) server-side unit tests
│
├── ⚙️ configs/
│   └── config.json                # Konfigurasi utama engine (camera source, threshold, dll)
│
├── 📝 logs/                       # Output log files (tidak di-commit ke git)
│
├── 📄 docs/                       # Dokumentasi developer
│   ├── PROJECT_STRUCTURE.md       #   ← File ini
│   ├── RUN_GUIDE.md               #   Cara menjalankan engine + server
│   └── CATATAN_CLOUDFLARE_TUNNEL.md
│
├── 🧠 models/                     # File model ML (tidak di-commit, ukuran besar)
│   ├── model_custom_terbaru.engine #  TensorRT model SOP custom
│   └── yolov8n.pt                 #  Person detection (auto-download jika tidak ada)
│
├── 🪪 identity_vault/             # Foto wajah staff untuk Face Re-ID
│   └── NamaStaff.jpg              #  Format: NamaStaff.jpg / .png
│
├── 📊 Laporan/                    # Output capture events (lokal)
│   ├── SOP_Valid/                 #  Foto bukti SOP sesuai
│   └── Pelanggaran/               #  Foto bukti pelanggaran
│
└── requirements.txt               # Python dependencies
```

---

## Tanggung Jawab Tiap Folder

| Folder                 | Tanggung Jawab                                                   | Siapa yang touch?                      |
| ---------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| `engine/`              | Semua logika AI: baca frame, deteksi YOLO, face re-ID, SOP check | Backend / ML Engineer                  |
| `engine/integrations/` | Koneksi engine ke luar (WebSocket ke server, Telegram)           | Backend                                |
| `server/api/`          | REST API endpoint — satu file = satu resource                    | Backend                                |
| `server/websocket/`    | Real-time event via SocketIO                                     | Backend                                |
| `server/middleware/`   | Validasi request (auth, rate limit)                              | Backend                                |
| `server/bridge/`       | Jembatan IPC antara server dan engine                            | Backend                                |
| `server/supabase/`     | Semua operasi cloud (write event, upload foto, heartbeat)        | Backend                                |
| `server/tui/`          | Terminal dashboard untuk monitoring                              | Backend (internal tool)                |
| `configs/`             | Konfigurasi engine yang bisa diedit via UI                       | Backend + Frontend (via `/api/config`) |
| `logs/`                | Log file output — tidak di-commit                                | Ops                                    |
| `docs/`                | Dokumentasi developer                                            | Semua                                  |
| `models/`              | File model ML besar — tidak di-commit                            | ML Engineer                            |
| `identity_vault/`      | Foto wajah untuk Face Re-ID                                      | Backend / Operator                     |
| `Laporan/`             | Bukti foto event lokal                                           | Engine (auto-generate)                 |

---

## Cara Menambah Fitur Baru

### 1. 🔌 Tambah REST API Endpoint Baru

**Contoh**: Endpoint `/api/alerts` untuk manajemen alert.

```
server/api/alerts.py   ← buat file baru
```

```python
# server/api/alerts.py
from flask import Blueprint, jsonify

alerts_bp = Blueprint("alerts", __name__)

@alerts_bp.route("/api/alerts", methods=["GET"])
def list_alerts():
    return jsonify({"alerts": []})
```

Lalu register di `server/app.py`:

```python
from api.alerts import alerts_bp
app.register_blueprint(alerts_bp)
```

---

### 2. ☁️ Tambah Modul Supabase Baru

**Contoh**: Modul untuk analytics query.

```
server/supabase/analytics.py   ← buat file baru
```

```python
# server/supabase/analytics.py
from client import get_supabase

def get_daily_summary(date: str):
    supabase = get_supabase()
    return supabase.table("events").select("*").eq("date", date).execute()
```

Import di API yang butuh:

```python
# Tambah supabase/ ke path (sudah dilakukan di app.py via sys.path)
from analytics import get_daily_summary
```

---

### 3. 🤖 Tambah Integrasi Engine Baru

**Contoh**: Koneksi engine ke MQTT broker.

```
engine/integrations/mqtt_client.py   ← buat file baru
```

Import di `engine/sop_main.py`:

```python
from integrations.mqtt_client import MQTTClient
```

---

### 4. 🛡️ Tambah Middleware Baru

**Contoh**: Rate limiting.

```
server/middleware/rate_limit.py   ← buat file baru
```

Apply ke route:

```python
from middleware.rate_limit import rate_limit

@app.route("/api/heavy")
@rate_limit(max_calls=10, period=60)
def heavy_endpoint():
    ...
```

---

### 5. 🧪 Tambah Fitur Engine (AI)

Semua logika deteksi ada di `engine/sop_main.py`.
Helper dan utility ada di `engine/utils.py`.

- Fitur baru yang **reusable** → taruh di `engine/utils.py`
- Fitur yang **spesifik loop** → tambah langsung di `V2System.run()` di `sop_main.py`
- Konfigurasi yang **user-adjustable** → tambah key di `configs/config.json` dengan default value di `load_config()`

---

## Cara Menjalankan

```bash
# Jalankan engine standalone (tanpa server)
python engine/sop_main.py

# Jalankan engine dengan koneksi ke server (subprocess mode)
python engine/sop_main.py --server-mode

# Jalankan server web
python server/main.py

# Jalankan server + TUI dashboard
python server/main.py --tui

# Jalankan server + auto-start engine otomatis
python server/main.py --auto-start --tui
```

---

## Path Penting (untuk Developer)

| Konstanta        | Nilai                            | File                                  |
| ---------------- | -------------------------------- | ------------------------------------- |
| `BASE_DIR`       | `V2_Project/` (root)             | `engine/sop_main.py`, `server/app.py` |
| `ENGINE_DIR`     | `V2_Project/engine/`             | `engine/sop_main.py`                  |
| `PROJECT_ROOT`   | `V2_Project/`                    | `server/app.py`                       |
| `CONFIG_FILE`    | `V2_Project/configs/config.json` | `engine/sop_main.py`, `server/app.py` |
| `IDENTITY_VAULT` | `V2_Project/identity_vault/`     | `server/app.py`                       |
| `MODELS_DIR`     | `V2_Project/models/`             | `engine/sop_main.py`                  |

---

## Environment Variables (`.env`)

File `.env` ada di `server/.env`. Wajib diisi sebelum menjalankan server:

```env
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
SUPABASE_ANON_KEY=eyJ...

# Kamera (untuk Supabase Heartbeat & Event tagging)
CAMERA_ID=cam-uuid-dari-supabase
TENANT_ID=tenant-uuid-dari-supabase
```

> 📋 Lihat `server/.env.example` untuk template lengkap.

---

## Aturan Git

File/folder yang **tidak boleh di-commit** (sudah di `.gitignore`):

```
server/.env
configs/config.json   # (opsional, jika berisi data sensitif)
models/
logs/
Laporan/
identity_vault/
__pycache__/
*.pyc
```

---

_Last updated: 2026-03-14 — setelah structured folder reorganization_
