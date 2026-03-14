# 🎯 CCTV-SOP Master Plan

> **Centralized planning documentation** untuk pengembangan CCTV-SOP Detection System (Foodinesia)

---

## 📁 Struktur Folder

```
cctv-sop/master-plan/
├── README.md                          ← 📍 Dokumen ini
├── PROJECT_TRACKING.md                ← Progress tracking & status
├── TODO.md                            ← Daftar tugas yang harus dikerjakan
│
├── database/                          ← 🗄️ Database Planning
│   ├── 00_erd_database_MASTER_SUMMARY.md
│   ├── 00_erd_database_v2.md
│   ├── 00_erd_database_supabase.md
│   ├── 00_erd_database_supabase_saas.md
│   ├── 01_erd_v2_compatibility_analysis.md
│   └── DATABASE_CURRENT_STATE.md          ← 📍 NEW: Live DB schema reference
│
├── backend/                           ← ⚙️ Backend Architecture
│   ├── MULTI_CAMERA_ARCHITECTURE.md
│   ├── MULTI_CAMERA_MODULAR_ARCHITECTURE.md
│   └── BACKEND_SUPABASE_INTEGRATION.md    ← 📍 NEW: Step-by-step backend ↔ Supabase
│
├── frontend/                          ← 🎨 Frontend Planning
│   ├── FRONTEND_IMPLEMENTATION_PROMPT.md  ← Comprehensive implementation guide
│   ├── FRONTEND_SUPABASE_INTEGRATION.md   ← 📍 NEW: Step-by-step frontend ↔ Supabase
│   └── 03_FACE_RECOGNITION_RULES.md      ← Face recognition feature rules
│
└── cross-functional/                  ← 🔗 Integration & Analysis
    ├── 02_feature_coverage_analysis.md
    └── ENVIRONMENT_SETUP.md               ← 📍 NEW: Env vars & credentials guide
```

---

## 🎯 Tujuan Master Plan

Master Plan ini dibuat untuk:

1. **Single Source of Truth** - Semua dokumentasi teknis terpusat
2. **Tracking Progress** - Pantau penerapan fitur secara real-time
3. **Cross-Team Alignment** - Backend, Frontend, DevOps sinkron
4. **Future Planning** - Roadmap pengembangan jangka panjang

---

## 🚀 3-Tier Development Plan

### 🛡️ Tier 1: Defense Plan (MVP)

**Target**: Single camera, basic detection, local deployment

**Status**: 🟡 In Progress

| Komponen                  | Status                     | Priority |
| ------------------------- | -------------------------- | -------- |
| Database Schema (Defense) | ✅ Complete                | P0       |
| V2 Compatibility Analysis | ✅ Complete                | P0       |
| Backend Single Camera     | ⚠️ Exists (needs refactor) | P0       |
| Frontend Basic UI         | ✅ Complete (Supabase)     | P0       |
| Auth & Login              | ✅ Complete (Supabase)     | P0       |

### 🛡️ Tier 2: Guardian Plan (Multi-Camera)

**Target**: 4-8 cameras, analytics dashboard, server deployment

**Status**: 🔵 Planned

| Komponen                   | Status         | Priority |
| -------------------------- | -------------- | -------- |
| Database Schema (Guardian) | ✅ Complete    | P1       |
| Multi-Camera Architecture  | ✅ Documented  | P1       |
| Camera Management UI       | ❌ Not started | P1       |
| Multi-Camera Layout        | ❌ Not started | P1       |
| Real-time Analytics        | ❌ Not started | P2       |

### 🛡️ Tier 3: Protector Plan (Enterprise SaaS)

**Target**: 8+ cameras, face recognition, multi-tenant SaaS

**Status**: ⚪ Future

| Komponen                    | Status         | Priority |
| --------------------------- | -------------- | -------- |
| Database Schema (Protector) | ✅ Complete    | P2       |
| SaaS Multi-Tenant           | ❌ Not started | P2       |
| Face Recognition Cloud      | ❌ Not started | P2       |
| Subscription/Billing        | ❌ Not started | P3       |

---

## 📊 Quick Stats

```
Total Plans: 14 documents
├── Database: 6 docs (DDL, RLS, Migration guides + Live state reference)
├── Backend: 3 docs (Architecture + Supabase integration)
├── Frontend: 3 docs (Implementation + Supabase integration + Feature rules)
└── Cross-functional: 2 docs (Gap analysis + Environment setup)

Coverage:
├── Database Design: 100% ✅ (deployed to Supabase)
├── Backend Architecture: 85% ✅
├── Frontend Implementation: 100% ✅ (API integrated)
├── Integration Steps: 100% ✅ (Supabase direct)
└── Feature Specifications: 50% ⚠️
```

---

## 🎬 How to Use This Master Plan

### Untuk Developer

1. **Database Developer** → Lihat folder `database/`
   - Mulai dari `00_erd_database_MASTER_SUMMARY.md`
   - Setup Supabase dengan `00_erd_database_supabase_saas.md`

2. **Backend Developer** → Lihat folder `backend/`
   - Baca `MULTI_CAMERA_ARCHITECTURE.md` untuk overview
   - Lihat `MULTI_CAMERA_MODULAR_ARCHITECTURE.md` untuk struktur

3. **Frontend Developer** → Lihat folder `frontend/`
   - Baca `FRONTEND_IMPLEMENTATION_PROMPT.md` untuk implementasi lengkap
   - Lihat `cross-functional/02_feature_coverage_analysis.md` untuk gap analysis
   - Identifikasi UI components yang perlu dibuat

### Untuk Project Manager

1. Buka `PROJECT_TRACKING.md` untuk status keseluruhan
2. Buka `TODO.md` untuk daftar tugas prioritas
3. Update progress secara berkala

---

## 📝 Dokumen Prioritas

### 🔴 P0 - Must Read (Semua Team)

1. `database/00_erd_database_MASTER_SUMMARY.md`
   - Overview lengkap semua tier
   - Feature-to-table mapping
   - Quick reference

2. `cross-functional/02_feature_coverage_analysis.md`
   - Apa yang sudah ada vs belum
   - Gap analysis frontend
   - Recommendation

### 🟡 P1 - Must Read (Technical Lead)

3. `database/00_erd_database_supabase_saas.md`
   - Complete DDL SQL
   - RLS policies
   - Indexes & optimization

4. `backend/MULTI_CAMERA_ARCHITECTURE.md`
   - Multi-camera design
   - API specifications
   - Performance considerations

### 🟢 P2 - Reference (Specialist)

5. `database/01_erd_v2_compatibility_analysis.md`
   - Migration dari V2_Project
   - Breaking changes
   - Rollback strategy

6. `backend/MULTI_CAMERA_MODULAR_ARCHITECTURE.md`
   - Plugin architecture
   - Directory structure

---

## 🔗 Related Resources

| Resource      | Lokasi                                          | Deskripsi               |
| ------------- | ----------------------------------------------- | ----------------------- |
| Feature Specs | `cctv-sop/dashboard/plan/features/`             | 7 feature specs (Typst) |
| Frontend Code | `cctv-sop/dashboard/src/`                       | React + Vite codebase   |
| Backend Code  | `cctv-deteksi/gui_version_testing_with_server/` | V2_Project Python       |

---

## 🔄 Update Cycle

| Frekuensi   | Aktivitas                               |
| ----------- | --------------------------------------- |
| **Daily**   | Update `PROJECT_TRACKING.md` progress   |
| **Weekly**  | Review `TODO.md`, adjust priorities     |
| **Sprint**  | Tambah dokumen baru ke folder terkait   |
| **Release** | Archive completed plans, update summary |

---

## 👥 Team Contacts

| Role              | Responsibility         | Dokumen Utama                                             |
| ----------------- | ---------------------- | --------------------------------------------------------- |
| Tech Lead         | Architecture decisions | `backend/*`, `database/00_erd_database_MASTER_SUMMARY.md` |
| Database Engineer | Schema & migrations    | `database/*`                                              |
| Backend Dev       | API & camera engine    | `backend/*`, `cross-functional/*`                         |
| Frontend Dev      | UI/UX implementation   | `cross-functional/*` (buat UI specs)                      |
| QA Engineer       | Testing strategy       | `TODO.md`, `PROJECT_TRACKING.md`                          |
| Product Owner     | Feature prioritization | `TODO.md`                                                 |

---

## ✅ Definition of Done

Master Plan ini "complete" ketika:

- [ ] Semua 7 feature specs ada frontend UI design-nya
- [ ] API contracts terdokumentasi (OpenAPI/Swagger)
- [ ] Database migration scripts tested
- [ ] `PROJECT_TRACKING.md` menunjukkan 100% Defense Plan
- [ ] `TODO.md` kosong (semua P0 tasks done)

---

**Last Updated**: 2026-03-13  
**Version**: 1.0  
**Status**: 🟡 Active Development

---

> 💡 **Tip**: Bookmark `PROJECT_TRACKING.md` untuk melihat progress harian!
