# 🚀 Prompt: Setup Full-Feature Database di Supabase

> **Instruksi**: Copy-paste prompt di bawah ini ke AI assistant lain, **bersama dengan file `00_erd_database_full_feature.md`** sebagai attachment/context.

---

## PROMPT (Copy mulai dari sini)

---

Kamu adalah Database Engineer yang ahli di **Supabase** dan **PostgreSQL 15+**.

Aku akan memberikanmu file ERD lengkap (`00_erd_database_full_feature.md`) yang berisi desain database untuk sistem **CCTV-SOP Detection Dashboard** — sebuah SaaS platform untuk monitoring kepatuhan SOP di pabrik menggunakan AI (YOLO object detection + face recognition).

### 📋 Konteks Proyek

- **Nama Proyek**: VisionGuard AI — CCTV-SOP Detection
- **Platform Database**: Supabase (PostgreSQL 15+ dengan RLS, Realtime, Storage)
- **Extensions yang diperlukan**: `uuid-ossp`, `pgvector`
- **Arsitektur**: Multi-tenant SaaS dengan 3 tier plan (Defense → Guardian → Protector)
- **Total Tabel**: 22 tabel + 1 view + 7 functions + 13 triggers

### 🎯 Yang Harus Kamu Lakukan

1. **Review ERD** yang aku berikan — pahami struktur tabel, relationships, dan module grouping
2. **Jalankan semua DDL** secara berurutan di Supabase SQL Editor:
   - Part 1: Core Module (extensions, tenants, profiles, cameras, events, config)
   - Part 2: Multi-Camera Module (cameras_extended, groups, heartbeats, schedules, summaries)
   - Part 3: Face Recognition Module (identities, face_photos, face_encodings, face_match_logs)
   - Part 4: Notification Module (notification_rules, notification_logs)
   - Part 5: Audit & Workflow Module (audit_logs, event_tags, event_comments)
   - Part 6: Functions, Triggers, RLS Policies
   - Supabase Realtime & Storage setup
   - Seed data
3. **Validasi** bahwa semua tabel, views, functions, triggers, dan RLS policies berhasil dibuat
4. **Buat Storage Buckets** via Supabase Dashboard:
   - `identity-photos` (untuk foto wajah staff)
   - `event-evidence` (untuk screenshot pelanggaran SOP)
   - `video-clips` (untuk video pendek pelanggaran)
5. **Test** dengan insert sample data dan query untuk memastikan:
   - RLS tenant isolation berfungsi
   - Module gating triggers berfungsi (coba insert ke `identities` dengan tenant yang face_recognition = false)
   - Camera limit trigger berfungsi
   - Plan change trigger otomatis update modules_enabled dan limits
   - Face similarity search (`search_faces` function) berfungsi

### ⚠️ Penting

- **Urutan eksekusi**: Jalankan DDL sesuai urutan Part 1 → Part 6 karena ada foreign key dependencies
- **Partitioned table**: Tabel `events` menggunakan PARTITION BY RANGE. Pastikan buat partition untuk bulan yang sedang berjalan
- **pgvector**: Pastikan extension `vector` sudah di-enable sebelum membuat tabel `face_encodings`
- **RLS**: Setelah enable RLS, pastikan ada minimal 1 policy per tabel, jika tidak maka tabel akan inaccessible
- **Supabase Auth**: Tabel `profiles` reference ke `auth.users` — ini tabel bawaan Supabase, jangan buat manual
- **Trigger `handle_new_user()`**: Trigger ini auto-create profile saat user signup via Supabase Auth

### 📊 Modul & Tier Mapping

```
Defense (Basic):  Core only — 1 kamera, basic events, config, audit logs, basic notifications
Guardian (Mid):   + Multi-Camera (4 cam), Camera Groups, Heartbeats, Schedules, Analytics, Advanced Notif, API
Protector (Full): + Face Recognition (50 cam), pgvector, Identity Management, Face Match Logs
```

### 🔒 Security Checklist

- [ ] RLS enabled di semua 20+ tabel
- [ ] Tenant isolation via `get_current_tenant_id()` function
- [ ] Role-based policies (viewer = read-only, admin = manage, superadmin = full)
- [ ] Sensitive config hidden from non-admin (`is_sensitive` flag)
- [ ] Module gating triggers prevent unauthorized data insertion
- [ ] Camera limit triggers prevent exceeding plan quota
- [ ] Storage policies restrict upload to admin only

### 📎 File Terlampir

Baca file `00_erd_database_full_feature.md` yang aku lampirkan — itu berisi **semua DDL SQL** yang harus dijalankan.

---

## END OF PROMPT

---

> **Tips penggunaan:**
>
> 1. Copy prompt di atas (dari "Kamu adalah Database Engineer..." sampai "...yang harus dijalankan.")
> 2. Attach file `00_erd_database_full_feature.md` sebagai context/attachment
> 3. Paste ke AI assistant (Claude, GPT, Gemini, dll)
> 4. AI akan membantu kamu execute step-by-step di Supabase
