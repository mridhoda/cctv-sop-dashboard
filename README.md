# VisionGuard AI — cctv-sop

> Repositori Dashboard Web untuk Sistem Monitoring Kepatuhan SOP Berbasis AI

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Tentang Repositori Ini

Repositori ini berisi **dashboard web** dari proyek **VisionGuard AI** — sistem deteksi kepatuhan SOP berbasis CCTV yang menggunakan YOLOv8 dan Face Recognition (V2_Project).

Dashboard ini dibangun dengan React + Vite + TailwindCSS dan dirancang untuk terhubung ke backend Flask + SocketIO yang berjalan di `http://localhost:5001`.

---

## 📁 Struktur Repositori

```
cctv-sop/
├── dashboard/               # Aplikasi web React (Vite)
│   ├── plan/
│   │   └── ANALISIS_KEBUTUHAN.md   # Gap analysis & roadmap integrasi
│   ├── src/
│   │   ├── App.jsx                  # Root component + routing + sidebar
│   │   ├── LandingPage.jsx          # Landing/marketing page
│   │   └── pages/
│   │       ├── Monitoring.jsx       # Live stream + engine control
│   │       ├── History.jsx          # Riwayat insiden
│   │       ├── Identities.jsx       # Manajemen identitas staff
│   │       ├── Reports.jsx          # Laporan & foto bukti
│   │       └── Settings.jsx         # Konfigurasi sistem
│   ├── package.json
│   └── README.md                    # Dokumentasi lengkap dashboard
└── README.md                        # File ini
```

---

## 🚀 Quick Start

```bash
cd dashboard
npm install
npm run dev
```

Akses di `http://localhost:5173`

> Untuk dokumentasi lengkap, lihat [`dashboard/README.md`](./dashboard/README.md)

---

## ✨ Halaman yang Tersedia

| Halaman | Deskripsi |
|---------|-----------|
| **Landing Page** | Marketing page VisionGuard AI |
| **Dashboard** | Metric cards, pie chart, tabel insiden, status CCTV |
| **Live Monitoring** | MJPEG stream, engine control (Start/Stop/Restart) |
| **Riwayat Insiden** | Tabel insiden dengan filter, search, dan pagination |
| **Identitas Staff** | CRUD identitas + upload foto + face encoding |
| **Laporan & Bukti** | Galeri foto bukti + lightbox + export CSV |
| **Pengaturan** | Form konfigurasi kamera, AI threshold, server, Telegram |

---

## 🔌 Backend Integration

Dashboard ini dirancang untuk terhubung ke **V2_Project** backend:

- **REST API**: `http://localhost:5001/api/...`
- **WebSocket**: Socket.IO events (`frame_update`, `detection_event`, `stats_update`, `engine_status`)

Lihat [`dashboard/plan/ANALISIS_KEBUTUHAN.md`](./dashboard/plan/ANALISIS_KEBUTUHAN.md) untuk analisis lengkap gap dan roadmap integrasi.

---

## 👤 Author

**Muhammad Ridho Darmawan** — IT Core Developer Foodinesia  
*Built with ❤️ for industrial safety*

---

> **VisionGuard AI** — *Meningkatkan keselamatan kerja melalui teknologi AI*
