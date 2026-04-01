# Update Implementasi Stabilitas Timeout & Data History/Reports

Tanggal update: 30 Mar 2026

---

## Ringkasan Singkat

Perbaikan terbaru difokuskan untuk menangani masalah berikut:

- data riwayat insiden dan laporan terlihat hilang setelah beberapa saat
- loading sangat lama atau seperti infinity loading
- timeout saat query event volume besar
- realtime subscribe/unsubscribe terlalu sering
- dashboard, history, dan reports mudah jatuh ke state kosong saat request gagal

Kesimpulan penting:

- masalah utama **bukan data benar-benar terhapus**
- masalah utama ada pada **jalur baca data yang terlalu berat**, lalu timeout, lalu UI menampilkan state kosong atau tidak stabil

---

## Yang Sudah Diterapkan

## 1. Frontend fallback dan degraded mode

Sudah diterapkan fallback supaya data yang sudah pernah berhasil dimuat tidak langsung hilang saat request berikutnya timeout.

Implementasi utama:

- cache fallback untuk history, reports, dan dashboard
- banner degraded mode agar user tahu data yang tampil adalah cache terakhir
- timeout tidak lagi otomatis mengosongkan data yang sudah ada

Manfaat:

- user tetap melihat data terakhir yang valid
- halaman tidak langsung tampak kosong hanya karena request lambat

## 2. Frontend telemetry untuk data access

Sudah ditambahkan telemetry ringan di frontend untuk mencatat:

- fetch start
- fetch success
- fetch degraded
- fetch error
- cache hit

Manfaat:

- jauh lebih mudah melacak apakah masalah berasal dari backend feed, Supabase langsung, timeout, atau fallback cache

## 3. Query frontend dibuat lebih ringan

Perubahan yang sudah diterapkan:

- select kolom diperkecil sesuai kebutuhan history vs reports
- pagination memakai lookahead `limit + 1`
- feed tidak selalu bergantung pada count berat
- dashboard count harian dipindah ke estimated count

Manfaat:

- query lebih ringan
- risiko timeout berkurang
- transfer data dari database ke UI lebih kecil

## 4. Backend events feed baru

Sudah ditambahkan endpoint backend baru untuk mulai memindahkan beban baca dari browser ke server:

- `GET /api/events/feed`
- `GET /api/events/stats`

Karakteristik endpoint baru:

- auth-protected
- tenant-aware
- pagination server-side
- observability logging per request
- error model lebih konsisten

Manfaat:

- browser tidak harus selalu scan langsung ke Supabase untuk data besar
- backend sekarang punya titik kontrol untuk optimasi berikutnya

## 5. Frontend sudah coba backend dulu, baru fallback

History dan reports sekarang mencoba ambil data lewat backend feed terlebih dahulu.

Jika backend belum tersedia atau gagal, frontend akan fallback ke jalur Supabase langsung.

Manfaat:

- transisi ke arsitektur backend-read-path bisa dilakukan bertahap
- sistem tetap aman selama migrasi

## 6. Logout membersihkan cache client

Saat logout atau sign-out event terjadi, cache client sekarang ikut dibersihkan.

Cache yang dibersihkan:

- profile cache
- session cache untuk events
- cache storage browser bila tersedia

Manfaat:

- mengurangi risiko user lama melihat data cache lama setelah keluar

---

## File Perubahan Utama

### Frontend

- `cctv-sop/dashboard/src/utils/dataAccessTelemetry.js`
- `cctv-sop/dashboard/src/hooks/useEventsRealtime.js`
- `cctv-sop/dashboard/src/hooks/useDashboardRealtime.js`
- `cctv-sop/dashboard/src/services/events.js`
- `cctv-sop/dashboard/src/pages/History.jsx`
- `cctv-sop/dashboard/src/pages/Reports.jsx`
- `cctv-sop/dashboard/src/App.jsx`
- `cctv-sop/dashboard/src/contexts/AuthContext.jsx`

### Backend

- `V2_Project/server/api/events.py`

---

## Yang Belum Diterapkan

Bagian yang masih menjadi pekerjaan berikutnya:

## 1. Optimasi database level lanjut

Belum diterapkan penuh:

- index strategy khusus query event besar
- evaluasi query explain/analyze
- pengurangan beban count berat di level SQL

## 2. Read model / projection table khusus laporan dan riwayat

Belum diterapkan:

- tabel baca khusus history/reports
- materialized view atau projection async
- refresh strategy dan indikator freshness

## 3. Hardening backend observability lebih dalam

Belum diterapkan:

- metrics terstruktur untuk latency dan timeout
- alerting
- runbook operasional

---

## Dampak Setelah Perubahan Ini

Perubahan ini belum menyelesaikan seluruh bottleneck database besar, tetapi sudah memberikan fondasi penting:

1. UI tidak mudah tampak kehilangan data hanya karena timeout sementara
2. Jalur baca mulai dipindahkan ke backend
3. Sistem lebih mudah diobservasi saat error
4. Frontend lebih aman saat request lambat atau gagal

---

## Next Recommended Step

Langkah berikutnya yang paling berdampak adalah:

1. tambahkan index database untuk pola query `tenant_id + timestamp + status + photo_path`
2. buat read model khusus history/reports
3. pindahkan dashboard summary ke jalur agregasi backend/read model
4. tambahkan metrik operasional dan alert timeout
