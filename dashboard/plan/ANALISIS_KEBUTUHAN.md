# 📊 Analisis Kebutuhan Dashboard — V2_Project
> Dibuat: 2026-03-03 | Tujuan: Mengidentifikasi gap antara dashboard cctv-sop dan kebutuhan V2_Project

---

## 1. Gambaran Umum

Dashboard `cctv-sop` ditujukan sebagai antarmuka web untuk **V2_Project** — sistem deteksi kepatuhan SOP berbasis CCTV yang menggunakan YOLOv8 dan face recognition. Backend V2_Project berjalan di `http://localhost:5001` (Flask + SocketIO) dan menyediakan berbagai endpoint REST API serta WebSocket event.

---

## 2. Status Fitur yang Sudah Ada di Dashboard

| Fitur | Status | Catatan |
|-------|--------|---------|
| Landing Page / Marketing Page | ✅ Lengkap | ~1085 baris, sangat detail |
| Login / Autentikasi UI | ✅ Ada | Sederhana, tidak terhubung backend |
| Dashboard Metrics (cards) | ✅ Ada | Data masih hardcoded/mock |
| Incident/Event Table | ✅ Ada | Data masih hardcoded/mock |
| CCTV Status Grid | ✅ Ada | Data statis, 4 kamera mock |
| Live Monitoring view | ✅ Ada (UI saja) | Hanya placeholder, bukan stream nyata |
| Pie Chart Compliance | ✅ Ada | Angka hardcoded |
| Responsive Design | ✅ Ada | Mobile-friendly |
| Animasi & UI Polish | ✅ Sangat baik | TailwindCSS, animasi smooth |

---

## 3. Gap Kritis: Fitur yang BELUM Ada

### 3.1 ❌ Tidak Ada Koneksi ke Backend API
- Dashboard menggunakan **100% mock/hardcoded data**
- Tidak ada `axios`, `fetch`, atau library HTTP client di `package.json`
- V2_Project membutuhkan koneksi ke `http://localhost:5001`

**Endpoints yang perlu dihubungkan:**
- `GET /api/status` — status engine & kamera
- `GET /api/stats` — statistik deteksi
- `GET /api/events` — daftar kejadian/insiden
- `GET /api/config` — konfigurasi sistem
- `PUT /api/config` — update konfigurasi

---

### 3.2 ❌ Tidak Ada Live Stream Video (MJPEG)
- V2_Project punya endpoint stream:
  - `GET /api/stream/video` — MJPEG live stream
  - `GET /api/stream/snapshot` — snapshot frame terkini
- Dashboard hanya menampilkan **placeholder kotak abu-abu** dengan bounding box statis
- Ini adalah fitur **paling krusial** yang belum diimplementasi

---

### 3.3 ❌ Tidak Ada WebSocket / Real-time Connection
- V2_Project server memancarkan event Socket.IO:
  - `frame_update` — update frame deteksi terbaru
  - `detection_event` — kejadian deteksi baru (pelanggaran/valid)
  - `stats_update` — pembaruan statistik
  - `engine_status` — perubahan status engine
- Dashboard tidak memiliki `socket.io-client` → **0% integrasi real-time**

---

### 3.4 ❌ Tidak Ada Engine Control Panel
- V2_Project punya endpoint kontrol engine:
  - `POST /api/engine/start` — mulai deteksi
  - `POST /api/engine/stop` — hentikan deteksi
  - `POST /api/engine/restart` — restart engine
- Dashboard tidak punya tombol/panel untuk mengendalikan engine deteksi

---

### 3.5 ❌ Identity Management Tidak Ada
- V2_Project memiliki sistem manajemen identitas staff:
  - `GET /api/identities` — daftar semua identitas terdaftar
  - `POST /api/identities` — tambah identitas baru (dengan upload foto)
  - `DELETE /api/identities/{id}` — hapus identitas
  - `POST /api/identities/{id}/encode` — proses face encoding
- Di dashboard **tidak ada halaman maupun komponen** untuk ini sama sekali

---

### 3.6 ❌ Halaman Reports Tidak Ada
- V2_Project punya sistem laporan:
  - `GET /api/reports` — daftar foto bukti pelanggaran & valid
  - `GET /api/reports/{filename}` — akses foto bukti
  - `GET /api/reports/export/csv` — export laporan ke CSV
- Dashboard tidak punya halaman reports dengan akses foto bukti nyata

---

### 3.7 ❌ Halaman Settings / Konfigurasi Tidak Ada
- V2_Project punya konfigurasi dinamis via `GET/PUT /api/config`:
  - `camera_source` — sumber kamera (index/URL RTSP)
  - `cooldown_minutes` — jeda antar deteksi
  - `detection_duration` — durasi deteksi
  - `conf_person` — confidence threshold untuk deteksi orang
  - `conf_sop` — confidence threshold untuk deteksi SOP
  - `face_distance_threshold` — threshold pengenalan wajah
  - Server settings: `fps`, `quality`
- Dashboard tidak memiliki halaman settings sama sekali

---

### 3.8 ❌ "Riwayat Insiden" Masih Mock
- Sidebar punya menu "Riwayat Insiden" tapi isinya data statis
- Tidak terhubung ke `GET /api/events?limit=50&status=violation|valid`
- Tidak ada filter berdasarkan status, tanggal, atau kamera

---

### 3.9 ❌ Path Output Build Tidak Sesuai
- V2_Project `server.py` melayani static files dari `dashboard/dist/`
- Dashboard ini berada di `cctv-sop/dashboard/`
- `vite.config.js` perlu dikonfigurasi agar output mengarah ke path yang benar (relatif ke V2_Project)

---

## 4. Fitur yang Ada Tapi Perlu Disesuaikan

| Fitur | Kondisi Saat Ini | Yang Perlu Dilakukan |
|-------|-----------------|---------------------|
| Metric Cards | Data statis | Hubungkan ke `GET /api/stats` |
| CCTV Status Grid | 4 kamera statis | Hubungkan ke `GET /api/status` |
| Pie Chart Compliance | Angka hardcoded | Hubungkan ke `GET /api/stats` |
| Incident Table | Data mock | Hubungkan ke `GET /api/events` |
| Login | UI ada, tidak ada auth | Tambahkan autentikasi (jika diperlukan di backend) |
| Landing Page | Sangat lengkap | Evaluasi apakah perlu untuk dashboard internal |

---

## 5. Skor Kesiapan Dashboard

```
Landing Page / Marketing     ████████████ 100% ✅ (mungkin tidak perlu untuk internal)
UI/UX & Design               █████████░░░  75% ✅ Bagus, bisa jadi fondasi
Dashboard Layout             ████████░░░░  65% 🟡 Perlu data real
Live Stream Video            ░░░░░░░░░░░░   0% ❌ Belum ada
WebSocket Real-time          ░░░░░░░░░░░░   0% ❌ Belum ada
Engine Control               ░░░░░░░░░░░░   0% ❌ Belum ada
Identity Management          ░░░░░░░░░░░░   0% ❌ Belum ada
Reports & Bukti Foto         ░░░░░░░░░░░░   0% ❌ Belum ada
Settings / Configuration     ░░░░░░░░░░░░   0% ❌ Belum ada
API Integration              ░░░░░░░░░░░░   0% ❌ Belum ada

TOTAL KESIAPAN: ~30–35%
```

---

## 6. Prioritas Pekerjaan

### 🔴 Prioritas Urgent
1. Install dependency: `axios` + `socket.io-client`
2. Buat `services/api.js` — konfigurasi base URL dan semua pemanggilan API
3. Sambungkan Metric Cards & Pie Chart ke `GET /api/stats`
4. Sambungkan Incident Table ke `GET /api/events`
5. Implementasi Live MJPEG stream player di halaman monitoring

### 🟠 Prioritas Tinggi
6. Implementasi WebSocket listener (socket.io-client) untuk real-time update
7. Buat halaman **Identity Management** — CRUD + upload foto
8. Buat halaman **Reports** — galeri foto bukti + filter + CSV export
9. Buat Engine Control panel — tombol Start/Stop/Restart + status indicator real-time

### 🟡 Prioritas Normal
10. Buat halaman **Settings** — form untuk edit `config.json` via API
11. Sesuaikan `vite.config.js` output build ke path V2_Project
12. Sambungkan CCTV Status Grid ke `GET /api/status`

### 🟢 Nice to Have
13. Autentikasi login yang sesungguhnya (jika backend mendukung)
14. Dark/Light mode toggle
15. Notifikasi toast saat ada detection event baru
16. Filter & search di halaman Riwayat Insiden

---

## 7. Struktur Halaman yang Direkomendasikan

```
/                    → Landing Page (opsional, bisa skip untuk internal)
/login               → Halaman Login
/dashboard           → Dashboard Utama (metrics, charts, status)
/monitoring          → Live Stream + Real-time Detections
/identities          → Manajemen Identitas Staff
/reports             → Laporan & Foto Bukti
/history             → Riwayat Insiden (filter by status/date/camera)
/settings            → Konfigurasi Sistem
```

---

## 8. Struktur File yang Direkomendasikan

```
cctv-sop/dashboard/src/
├── components/
│   ├── ui/                  # Komponen UI dasar (Button, Card, Badge, Modal)
│   ├── charts/              # Komponen chart (PieChart, LineChart, BarChart)
│   ├── stream/              # Video stream player (MJPEG)
│   └── layout/              # Sidebar, Navbar, Layout wrapper
├── pages/
│   ├── Dashboard.jsx        # Halaman utama (metrics, overview)
│   ├── Monitoring.jsx       # Live stream + deteksi real-time
│   ├── Identities.jsx       # Manajemen identitas staff
│   ├── Reports.jsx          # Laporan & foto bukti
│   ├── History.jsx          # Riwayat insiden
│   └── Settings.jsx         # Konfigurasi sistem
├── services/
│   ├── api.js               # Semua pemanggilan REST API
│   └── socket.js            # WebSocket / Socket.IO connection
├── hooks/
│   ├── useStats.js          # Hook untuk data statistik
│   ├── useEvents.js         # Hook untuk data events
│   └── useSocket.js         # Hook untuk WebSocket
├── context/
│   └── AppContext.jsx       # Global state (engine status, dll)
├── App.jsx
├── main.jsx
└── index.css
```

---

## 9. Dependency yang Perlu Ditambahkan

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "socket.io-client": "^4.7.0",
    "react-router-dom": "^6.x",
    "recharts": "^2.x",
    "react-hot-toast": "^2.x",
    "date-fns": "^3.x"
  }
}
```

---

*Analisis ini dibuat berdasarkan pemeriksaan kode `cctv-sop/dashboard/src/` dan `V2_Project/` pada tanggal 2026-03-03.*
