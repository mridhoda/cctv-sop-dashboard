# Alur Presentasi: Monitoring Dashboard (Viewer Role)

> **Tujuan:** Jelaskan fitur monitoring yang sudah jalan ke bos (business background)
> **Fokus:** Dashboard Viewer — cuma lihat, tidak kontrol
> **Durasi:** Secukupnya

---

## 1. HOOK: Masalah (30 detik)

> "Kemarin monitoring CCTV manual, perlu manpower atau supervisor yang terus menerus lihat menjadikan implementasi sop tidak berjalan efektif dan efisien"

---

## 2. DASHBOARD VIEWER — Fitur yang Udah Jalan (4 menit)

### 2.1 Live Stream Panel

| Fitur                   | Demo ke Bos                                 |
| ----------------------- | ------------------------------------------- |
| **Status Indicator**    | Titik hijau = online, merah = offline       |
| **Live Badge**          | "LIVE" merah berkedip pas streaming jalan   |
| **Timestamp**           | Waktu real-time di pojok kiri bawah         |
| **Rotate**              | Putar gambar (landscape → portrait)         |
| **Snapshot**            | Klik → screenshot 1 frame buat bukti        |
| **Resolution Selector** | Pilih kualitas: 480p / 720p / 1080p / 1440p |
| **Auto-play Toggle**    | Stream otomatis mulai saat engine running   |

**Kata-kata:**

> "Ini tampilan utama. supervisor tinggal buka browser, langsung lihat CCTV live monitoring. Tidak perlu install aplikasi dan seterusnya"

---

### 2.2 Real-time Activity Feed (Sidebar Kanan)

```
🔴 Pelanggaran SOP                  10:05:23
🟢 Deteksi Berjalan                 10:01:15
🟢 Valid SOP compliance             09:52:10
```

| Fitur       | Penjelasan                                |
| ----------- | ----------------------------------------- |
| Event baru  | Muncul langsung (tanpa refresh halaman)   |
| Auto-scroll | Selalu ke atas, event terbaru paling atas |
| Animasi     | 3 event terbaru ada animasi slide         |
| Counter     | "{n} events" di pojok kanan atas          |

**Kata-kata:**

> "Kalau AI detect ada pelanggaran, muncul langsung di sini. Tidak perlu nunggu laporan manual."

---

### 2.3 Detection Stats (Sidebar Kanan)

| Stat              | Nilai | Arti                                    |
| ----------------- | ----- | --------------------------------------- |
| **Detections**    | 320   | Total orang terdeteksi hari ini         |
| **Violations**    | 24    | Pelanggaran SOP                         |
| **Valid SOP**     | 296   | Yang patuh SOP                          |
| **Compliance**    | 92%   | Persentase kepatuhan (ada progress bar) |
| **Active Tracks** | 5     | Orang yang sedang dilacak AI            |
| **FPS**           | 30    | Frame per detik (kelancaran stream)     |

**Kata-kata:**

> "Bos bisa lihat ringkasan: berapa pelanggaran, berapa yang patuh, persentase kepatuhan berapa."

---

### 2.4 Camera Info Card

```
📷 Ruang Produksi
   Pabrik Eskala

   🟢 Online | 1080p | 30 FPS
```

**Kata-kata:**

> "Ini info kameranya: lokasi, resolusi, status online atau tidak."

---

### 2.5 Quick Stats (Bawah Stream)

| Card              | Isi                         |
| ----------------- | --------------------------- |
| **Stream Status** | live / offline / connecting |
| **Violations**    | Angka pelanggaran           |
| **Compliance**    | Persentase kepatuhan        |

---

## 3. ROLE VIEWER vs ADMIN (1 menit)

| Fitur                     | Viewer (Sekarang) | Admin (Next) |
| ------------------------- | ----------------- | ------------ |
| Lihat live stream         | ✅                | ✅           |
| Lihat activity feed       | ✅                | ✅           |
| Lihat stats               | ✅                | ✅           |
| Kontrol engine start/stop | ❌                | ⏳           |
| Verifikasi pelanggaran    | ❌                | ⏳           |
| Export laporan lengkap    | ❌                | ⏳           |
| Kelola kamera             | ❌                | ⏳           |

**Kata-kata:**

> "Sekarang ini akun role viewer yang digunakan, kedepannya akun admin akan ditambahkan untuk menjadi master dari sistem ini"

---

## 4. TEKNIS SINGKAT: Cara Kerja (1 menit)

```
┌─────────┐    ┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│  CCTV   │───→│  AI Engine      │───→│   Backend    │───→│  Dashboard      │
│         │    │                 │    │   Server     │    │  Viewer         │
└─────────┘    └─────────────────┘    └──────────────┘    └─────────────────┘
                    (Deteksi orang)       (Simpan data)      (Real-time update)
                                                  ↑
                                           [Socket.IO]
                                           (Update langsung
                                            ke browser)
```

**Fallback:** Kalau Socket putus, auto-polling setiap 5 detik.

**Kata-kata:**

> "Di belakang ini: CCTV masuk ke AI Engine di pc server, detect orang, kirim ke server, muncul di dashboard real-time."

---

## 5. API yang Dipakai (30 detik)

| Endpoint                    | Fungsi (Bahasa Bos)         |
| --------------------------- | --------------------------- |
| `GET /api/stream/video`     | Ambil video stream CCTV     |
| `GET /api/stream/snapshot`  | Ambil 1 gambar screenshot   |
| `GET /api/status`           | Cek status engine & kamera  |
| `GET /api/stats`            | Ambil statistik deteksi     |
| `GET /api/events`           | Ambil riwayat activity      |
| `POST /api/engine/{action}` | Kontrol engine (admin only) |

**Kata-kata:**

> "Ini API-nya. Frontend ambil data dari backend, backend ambil dari AI Engine."

---

## 6. NEXT STEP / RENCANA KEDEPAN (30 detik)

| Fitur                | Keterangan                                                                                                       | Priority  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | --------- |
| **Photo Evidence**   | Klik event → lihat foto bukti pelanggaran untuk saat ini sudah ada di lokal belum terkoneksi ke website aplikasi | 🔴 High   |
| **Export CSV**       | Download laporan harian/mingguan                                                                                 | 🔴 High   |
| **Notifikasi**       | WhatsApp/Email pas ada pelanggaran                                                                               | 🟡 Medium |
| **Multi-camera**     | Pilih kamera dari beberapa lokasi                                                                                | 🟡 Medium |
| **History Playback** | Replay rekaman masa lalu                                                                                         | 🟢 Low    |
| **Role Admin**       | Kontrol engine & verifikasi                                                                                      | 🔴 High   |

**Kata-kata:**

> "Ini rencana ke depan: photo evidence, export laporan, notifikasi. Yang paling penting photo evidence dulu."

---

_File ini fokus ke fitur Monitoring.jsx yang sudah jalan. Full fitur (Reports, Analytics, dll) dijelaskan di rencana kedepan._
