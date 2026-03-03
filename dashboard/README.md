# VisionGuard AI Dashboard

> Sistem Monitoring Kepatuhan SOP Berbasis AI untuk Industri Manufaktur

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.10-22B5BF)](https://recharts.org/)

---

## 📋 Deskripsi Proyek

**VisionGuard AI** adalah dashboard monitoring real-time yang menggunakan teknologi Computer Vision dan AI untuk mendeteksi pelanggaran SOP (Standard Operating Procedure) di area kerja industri. Sistem ini terintegrasi dengan CCTV untuk secara otomatis mengidentifikasi:

- ✅ Penggunaan helm pelindung
- ✅ Penggunaan sepatu safety
- ✅ Kelengkapan seragam kerja
- ✅ Penggunaan ID Card
- ✅ Penggunaan masker (jika diperlukan)

---

## ✨ Fitur Utama

### 🔐 Autentikasi
- Login page dengan form authentication
- Role-based access (Ops Manager)

### 📊 Dashboard Operasional
| Komponen | Deskripsi |
|----------|-----------|
| **Metric Cards** | Total deteksi, jumlah insiden, tingkat kepatuhan |
| **Tabel Insiden** | Daftar pelanggaran real-time dengan detail |
| **Pie Chart** | Visualisasi persentase kepatuhan |
| **Status CCTV** | Monitoring online/offline kamera |

### 🎛️ Navigasi
- Sidebar menu: Dashboard, Live Monitoring, Riwayat Insiden
- Header dengan search, notifikasi, dan profil user

### 📱 Responsive Design
- Desktop-first dengan dukungan mobile
- Tailwind CSS untuk styling konsisten

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js >= 16.x
- npm atau yarn

### Install & Run

```bash
# Clone repository
git clone <repo-url>
cd dashboard

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

Output akan ada di folder `dist/`

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | React 18 |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3.3 |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Bundler** | Rollup (via Vite) |

---

## 📁 Struktur Proyek

```
dashboard/
├── public/                 # Static assets
├── src/
│   ├── App.jsx            # Main component
│   ├── main.jsx           # Entry point
│   └── index.css          # Tailwind styles
├── .gitignore             # Git ignore rules
├── index.html             # HTML template
├── package.json           # Dependencies
├── postcss.config.js      # PostCSS config
├── tailwind.config.js     # Tailwind config
└── vite.config.js         # Vite config
```

---

## 📸 Screenshot

### Login Page
Form login dengan branding VisionGuard AI

### Dashboard
- **Metric Cards**: Ringkasan data deteksi 24 jam
- **Tabel Insiden**: List pelanggaran dengan filter dan sorting
- **Pie Chart**: Visualisasi 85% patuh vs 15% tidak patuh
- **CCTV Status**: 4 kamera monitoring (3 online, 1 offline)

### Detail Modal
Popup detail insiden dengan:
- Preview rekaman CCTV
- Waktu dan lokasi kejadian
- Analisis AI otomatis
- Tombol validasi/abaikan

---

## ⚠️ Catatan Penting

### Mock Data
Saat ini menggunakan mock data untuk:
- `MOCK_INCIDENTS` - Data pelanggaran sample
- `MOCK_CCTV` - Status kamera sample
- Authentication - Langsung set state tanpa backend

### Integrasi Backend (TODO)
Untuk production, perlu integrasi dengan:
- [ ] API endpoint autentikasi
- [ ] WebSocket/Fetch untuk data real-time
- [ ] Endpoint CCTV stream
- [ ] Database untuk menyimpan history

---

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/nama-fitur`)
3. Commit perubahan (`git commit -m 'feat: tambah fitur X'`)
4. Push ke branch (`git push origin feature/nama-fitur`)
5. Buat Pull Request

---

## 📝 Changelog

### v1.0.0 - Initial Release
- ✅ Login page
- ✅ Dashboard dengan metric cards
- ✅ Tabel insiden dengan modal detail
- ✅ Pie chart kepatuhan
- ✅ Status CCTV monitoring
- ✅ Responsive design

---

## 📄 License

MIT License - feel free to use and modify.

---

## 👤 Author

**Budi Santoso** - Ops Manager  
*Built with ❤️ for industrial safety*

---

> **VisionGuard AI** - *Meningkatkan keselamatan kerja melalui teknologi AI*
