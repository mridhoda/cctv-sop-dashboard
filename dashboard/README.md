# VisionGuard AI Dashboard

> Dashboard Monitoring Kepatuhan SOP Berbasis AI untuk Industri Manufaktur

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.10-22B5BF)](https://recharts.org/)
[![Lucide](https://img.shields.io/badge/Lucide-React-F56565?logo=lucide)](https://lucide.dev/)

---

## 📋 Deskripsi Proyek

**VisionGuard AI** adalah dashboard monitoring real-time yang menjadi antarmuka web untuk **V2_Project** — sistem deteksi kepatuhan SOP berbasis CCTV menggunakan YOLOv8 dan Face Recognition. Dashboard ini terintegrasi dengan backend Flask + SocketIO yang berjalan di `http://localhost:5001`.

Sistem secara otomatis mendeteksi pelanggaran SOP meliputi:

- ✅ Penggunaan helm pelindung (hardhat)
- ✅ Penggunaan sepatu safety
- ✅ Kelengkapan seragam kerja
- ✅ Penggunaan ID Card / tanda pengenal
- ✅ Penggunaan masker yang benar
- ✅ Identifikasi wajah staff terdaftar

---

## ✨ Fitur Utama

### 🔐 Autentikasi
- Login page dengan form authentication
- Session management berbasis state

### 📊 Dashboard Operasional
| Komponen | Deskripsi |
|----------|-----------|
| **Metric Cards** | Total deteksi 24 jam, jumlah insiden, tingkat kepatuhan |
| **Tabel Insiden** | Daftar pelanggaran terbaru dengan modal detail |
| **Pie Chart** | Visualisasi persentase kepatuhan vs pelanggaran |
| **Status CCTV** | Grid monitoring online/offline semua kamera |

### 📹 Live Monitoring
| Komponen | Deskripsi |
|----------|-----------|
| **Live Stream** | MJPEG video stream dari `GET /api/stream/video` |
| **Engine Control** | Tombol Start / Stop / Restart AI detection engine |
| **Status Engine** | Badge real-time status (Running / Stopped / Error) |
| **Log Real-time** | Feed kejadian deteksi terbaru (WebSocket ready) |
| **Status Kamera** | Grid status online/offline per kamera |

### 📜 Riwayat Insiden
| Komponen | Deskripsi |
|----------|-----------|
| **Tabel Insiden** | 50+ riwayat dengan kolom waktu, lokasi, staff, jenis, status |
| **Filter Status** | Filter All / Pelanggaran / Valid |
| **Search** | Pencarian berdasarkan nama, lokasi, atau jenis |
| **Pagination** | Navigasi halaman prev/next |
| **Modal Detail** | Foto bukti, analisis AI, waktu & lokasi kejadian |
| **Export CSV** | Download laporan (siap integrasi API) |

### 👤 Identitas Staff
| Komponen | Deskripsi |
|----------|-----------|
| **Grid Kartu** | Tampilan kartu per staff dengan foto, nama, jabatan, ID |
| **Tambah Identitas** | Form modal: nama, jabatan, ID karyawan, upload foto |
| **Encode Face** | Trigger face encoding per identitas |
| **Hapus Identitas** | Konfirmasi penghapusan dengan dialog inline |
| **Search** | Filter identitas berdasarkan nama |

### 📁 Laporan & Bukti Foto
| Komponen | Deskripsi |
|----------|-----------|
| **Galeri Foto** | Grid foto bukti pelanggaran dan SOP valid |
| **Filter Tab** | ALL / Pelanggaran / SOP Valid |
| **Lightbox Modal** | Preview foto besar + detail lengkap + confidence score |
| **Export CSV** | Download laporan semua insiden |
| **Stats Bar** | Total laporan, pelanggaran, valid, periode |

### ⚙️ Pengaturan Sistem
| Komponen | Deskripsi |
|----------|-----------|
| **Kamera & Video** | Sumber kamera (RTSP/index), durasi deteksi, cooldown |
| **AI Threshold** | Slider conf_person, conf_sop, face_distance_threshold |
| **Server & Stream** | FPS output, kualitas JPEG |
| **Notifikasi** | Toggle Telegram, bot token, chat ID |
| **Simpan/Reset** | Save ke API dengan toast konfirmasi, reset ke default |

### 🎛️ Navigasi Sidebar
Sidebar 3 grup menu:
- **Menu Utama**: Dashboard, Live Monitoring, Riwayat Insiden
- **Manajemen**: Identitas Staff, Laporan & Bukti
- **Sistem**: Pengaturan

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js >= 16.x
- npm atau yarn
- Backend V2_Project berjalan di `http://localhost:5001` (opsional untuk mock data)

### Install & Run

```bash
# Clone repository
git clone https://github.com/mridhoda/cctv-sop-dashboard.git
cd cctv-sop-dashboard/dashboard

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### Build untuk Production

```bash
npm run build
```

Output di folder `dist/` — copy ke `V2_Project/server/dashboard/dist/` agar dapat di-serve oleh Flask backend.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3.3 |
| **Charts** | Recharts 2.10 |
| **Icons** | Lucide React |
| **Bundler** | Rollup (via Vite) |

### Dependency yang Perlu Ditambahkan (Integrasi API)
```bash
npm install axios socket.io-client react-router-dom react-hot-toast
```

---

## 📁 Struktur Proyek

```
dashboard/
├── plan/
│   └── ANALISIS_KEBUTUHAN.md   # Gap analysis dashboard vs V2_Project
├── public/                      # Static assets
├── src/
│   ├── App.jsx                  # Root component + routing + sidebar
│   ├── LandingPage.jsx          # Landing/marketing page
│   ├── main.jsx                 # Entry point
│   ├── index.css                # Tailwind base styles
│   └── pages/
│       ├── Monitoring.jsx       # Live stream + engine control
│       ├── History.jsx          # Riwayat insiden + filter + pagination
│       ├── Identities.jsx       # Manajemen identitas staff
│       ├── Reports.jsx          # Laporan & galeri foto bukti
│       └── Settings.jsx         # Konfigurasi sistem
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

## 🔌 Integrasi Backend (V2_Project)

Dashboard ini dirancang untuk terhubung ke backend V2_Project (`http://localhost:5001`). Berikut daftar endpoint yang perlu diintegrasikan:

### REST API Endpoints
| Method | Endpoint | Halaman | Status |
|--------|----------|---------|--------|
| GET | `/api/status` | Dashboard, Monitoring | 🔴 Belum |
| GET | `/api/stats` | Dashboard | 🔴 Belum |
| GET | `/api/events` | Dashboard, History | 🔴 Belum |
| GET | `/api/stream/video` | Monitoring | 🔴 Belum |
| GET | `/api/stream/snapshot` | Monitoring | 🔴 Belum |
| POST | `/api/engine/start` | Monitoring | 🔴 Belum |
| POST | `/api/engine/stop` | Monitoring | 🔴 Belum |
| POST | `/api/engine/restart` | Monitoring | 🔴 Belum |
| GET | `/api/identities` | Identities | 🔴 Belum |
| POST | `/api/identities` | Identities | 🔴 Belum |
| DELETE | `/api/identities/{id}` | Identities | 🔴 Belum |
| POST | `/api/identities/{id}/encode` | Identities | 🔴 Belum |
| GET | `/api/reports` | Reports | 🔴 Belum |
| GET | `/api/reports/export/csv` | Reports | 🔴 Belum |
| GET | `/api/config` | Settings | 🔴 Belum |
| PUT | `/api/config` | Settings | 🔴 Belum |

### WebSocket Events (Socket.IO)
| Event | Deskripsi | Status |
|-------|-----------|--------|
| `frame_update` | Update frame deteksi terbaru | 🔴 Belum |
| `detection_event` | Kejadian deteksi baru | 🔴 Belum |
| `stats_update` | Pembaruan statistik | 🔴 Belum |
| `engine_status` | Perubahan status engine | 🔴 Belum |

---

## ⚠️ Catatan Penting

### Mock Data
Saat ini semua halaman menggunakan mock data statis:
- `MOCK_INCIDENTS` — Data pelanggaran sample di `App.jsx`
- `MOCK_CCTV` — Status kamera sample
- Data per halaman (History, Identities, Reports) — hardcoded di masing-masing file

Lihat `plan/ANALISIS_KEBUTUHAN.md` untuk analisis lengkap kebutuhan integrasi.

---

## 📝 Changelog

### v2.0.0 - Dashboard Full Pages
- ✅ Tambah halaman **Live Monitoring** (stream + engine control)
- ✅ Tambah halaman **Riwayat Insiden** (filter, search, pagination)
- ✅ Tambah halaman **Identitas Staff** (CRUD + upload foto + encode face)
- ✅ Tambah halaman **Laporan & Bukti Foto** (galeri + lightbox + export)
- ✅ Tambah halaman **Pengaturan Sistem** (form config + slider threshold)
- ✅ Update sidebar navigasi: 7 menu dalam 3 grup
- ✅ Tambah `plan/ANALISIS_KEBUTUHAN.md`
- ✅ Konversi dari submodule ke folder biasa

### v1.0.0 - Initial Release
- ✅ Landing page
- ✅ Login page
- ✅ Dashboard dengan metric cards, pie chart, tabel insiden
- ✅ Status CCTV monitoring
- ✅ Responsive design

---

## 📄 License

MIT License - feel free to use and modify.

---

## 👤 Author

**Muhammad Ridho Darmawan** — IT Core Developer Foodinesia  
*Built with ❤️ for industrial safety*

---

> **VisionGuard AI** — *Meningkatkan keselamatan kerja melalui teknologi AI*
