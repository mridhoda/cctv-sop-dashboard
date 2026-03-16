# Changelog — 15 Maret 2026

## 1. Fix: Engine-Server Bridge Connection

**File:** `engine/control_panel.py`

### Masalah
Engine (`sop_main.py`) berjalan dari Control Panel tapi TIDAK terhubung ke Flask server.
Dashboard web menampilkan "Waiting for engine..." dan TUI menunjukkan "STOPPED" padahal kamera aktif.

### Penyebab
`control_panel.py` membaca config dari `engine/config.json` (tidak ada), 
padahal config yang berisi key `"server"` ada di `configs/config.json`.
Tanpa key `"server"`, flag `--ws-mode` tidak dikirim ke engine.

### Perubahan
```diff
 BASE_DIR = os.path.dirname(os.path.abspath(__file__))
-DIR_VALID = os.path.join(BASE_DIR, "Laporan", "SOP_Valid")
-DIR_PELANGGARAN = os.path.join(BASE_DIR, "Laporan", "Pelanggaran")
-IDENTITY_VAULT_DIR = os.path.join(BASE_DIR, "identity_vault")
-CONFIG_FILE = os.path.join(BASE_DIR, "config.json")
+PROJECT_ROOT = os.path.dirname(BASE_DIR)  # V2_Project/
+DIR_VALID = os.path.join(PROJECT_ROOT, "Laporan", "SOP_Valid")
+DIR_PELANGGARAN = os.path.join(PROJECT_ROOT, "Laporan", "Pelanggaran")
+IDENTITY_VAULT_DIR = os.path.join(PROJECT_ROOT, "identity_vault")
+CONFIG_FILE = os.path.join(PROJECT_ROOT, "configs", "config.json")
```

### Dampak
- Control Panel sekarang akan mengirim `--ws-mode --ws-url=http://localhost:5001` saat start engine
- Engine terhubung ke server via WebSocket → TUI, Dashboard, dan API menerima data real-time

---

## 2. Feature: Adaptive Quality Streaming (Quality Tiers)

**File:** `server/api/stream.py`

### Deskripsi
Menambahkan sistem kualitas streaming bertingkat seperti YouTube.
Client bisa memilih kualitas via query parameter `?quality=`.

### Quality Tiers

| Tier | Resolusi | JPEG Quality | Max FPS |
|------|----------|-------------|---------|
| `144p` | 25% | 40% | 8 |
| `360p` | 50% | 60% | 12 |
| **`720p`** ★ | 75% | 80% | 15 |
| `1080p` | 100% | 90% | 15 |

### Endpoint Baru & Yang Diubah

| Endpoint | Perubahan |
|----------|-----------|
| `GET /api/stream/video?quality=144p` | ✏️ Ditambah param `?quality=` |
| `GET /api/stream/snapshot?quality=360p` | ✏️ Ditambah param `?quality=` |
| `GET /api/stream/qualities` | 🆕 Daftar tier yang tersedia (JSON) |

### Cara Kerja
1. Engine mengirim frame full-resolution ke bridge (tidak berubah)
2. Server decode JPEG → resize sesuai tier → re-encode dengan kualitas tier
3. Tier `1080p` di-skip decode/encode untuk performa (passthrough)
