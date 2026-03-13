# 📊 CCTV-SOP Database Design: Master Summary

> **Complete ERD Documentation** untuk sistem CCTV-SOP Detection dengan arsitektur modular & SaaS-ready

---

## 📁 Dokumen yang Tersedia

```
cctv-sop/dashboard/plan/
├── 00_erd_database_MASTER_SUMMARY.md      ← 📍 You are here
├── 00_erd_database_v2.md                   ← Core tables (Defense Plan)
├── 00_erd_database_supabase.md             ← Supabase integration
├── 00_erd_database_supabase_saas.md        ← SaaS + Multi-tenant
├── 01_erd_v2_compatibility_analysis.md     ← V2_Project migration guide
└── 02_feature_coverage_analysis.md         ← Feature gaps analysis
```

---

## 🎯 Executive Summary

### 3-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           🛡️ DEFENSE PLAN                                   │
│                         (Single Camera - Basic)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tables: tenants, users, cameras, events, identities, config                │
│  Use Case: 1 kamera, 1 lokasi, basic SOP detection                          │
│  Setup: Local/Edge deployment                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                           🛡️ GUARDIAN PLAN                                  │
│                      (Multi-Camera - Advanced)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  + cameras_extended, camera_heartbeats, event_analytics                     │
│  + Multi-camera orchestration, grid layouts                                 │
│  Use Case: 2-8 kamera, multi-area, dashboard analytics                      │
│  Setup: Server deployment dengan GPU                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                          🛡️ PROTECTOR PLAN                                  │
│                    (Full AI - Enterprise SaaS)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  + face_photos, face_encodings (pgvector), face_match_logs                  │
│  + subscriptions, audit_logs, notification_rules                            │
│  + Real-time face recognition, multi-tenant SaaS                            │
│  Use Case: Enterprise, multiple customers, advanced AI                      │
│  Setup: Cloud SaaS (Supabase + Edge Functions)                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Entity Relationship Overview

### Core Entities

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   tenants    │◄──────┤    users     │       │   cameras    │
│  (SaaS)      │       │  (Auth)      │       │  (Devices)   │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                      │
       │    ┌─────────────────┘                      │
       │    │                                        │
       ▼    ▼                                        ▼
┌──────────────────────────────────────────────────────────────┐
│                          events                              │
│              (Detection Events - Core)                       │
├──────────────────────────────────────────────────────────────┤
│  • SOP violations (helm, masker, baju, sepatu)              │
│  • Valid SOP compliance                                     │
│  • Photo evidence                                           │
│  • Person identification (if face_recognition ON)           │
└──────────────────────────────────────────────────────────────┘
```

### Extended Entities (Guardian+)

```
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│camera_heartbeats │      │  event_analytics │      │  compliance_daily│
│  (Health Check)  │      │  (Aggregations)  │      │  (Trends)        │
└──────────────────┘      └──────────────────┘      └──────────────────┘
```

### AI Entities (Protector)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│  identities  │◄──────┤  face_photos │◄──────┤face_encodings│
│  (People)    │       │  (Images)    │       │ (pgvector)   │
└──────┬───────┘       └──────────────┘       └──────────────┘
       │
       │         ┌──────────────────┐
       └────────►│  face_match_logs │
                 │ (Recognition Log)│
                 └──────────────────┘
```

---

## 📋 Complete Table Reference

### Defense Plan Tables (Essential)

| Table                                           | Purpose                | Key Columns                                       |
| ----------------------------------------------- | ---------------------- | ------------------------------------------------- |
| [`tenants`](00_erd_database_supabase_saas.md:1) | Multi-tenant isolation | id, name, subscription_plan, status               |
| [`users`](00_erd_database_supabase_saas.md:1)   | Authentication & RBAC  | id, tenant_id, email, role, is_active             |
| [`cameras`](00_erd_database_v2.md:1)            | Camera registry        | id, tenant_id, name, source_url, location         |
| [`events`](00_erd_database_v2.md:1)             | Detection events       | id, camera_id, status, violation_type, photo_path |
| [`identities`](00_erd_database_v2.md:1)         | Known persons          | id, tenant_id, employee_id, nama, jabatan         |
| [`config`](00_erd_database_v2.md:1)             | System settings        | id, tenant_id, category, key, value               |

### Guardian Plan Tables (Advanced)

| Table                                                     | Purpose           | Key Columns                                    |
| --------------------------------------------------------- | ----------------- | ---------------------------------------------- |
| [`cameras_extended`](00_erd_database_supabase_saas.md:1)  | Per-camera config | camera_id, detection_settings (JSONB), roi     |
| [`camera_heartbeats`](00_erd_database_supabase_saas.md:1) | Health monitoring | camera_id, status, last_seen, fps              |
| [`event_analytics`](00_erd_database_supabase_saas.md:1)   | Time-series data  | tenant_id, camera_id, time_bucket, event_count |
| [`camera_schedules`](00_erd_database_supabase_saas.md:1)  | Operating hours   | camera_id, day_of_week, start_time, end_time   |

### Protector Plan Tables (Enterprise)

| Table                                                      | Purpose               | Key Columns                                 |
| ---------------------------------------------------------- | --------------------- | ------------------------------------------- |
| [`face_photos`](00_erd_database_supabase_saas.md:1)        | Identity photos       | identity_id, storage_path, is_primary       |
| [`face_encodings`](00_erd_database_supabase_saas.md:1)     | AI vectors (pgvector) | identity_id, encoding_vector (128-dim)      |
| [`face_match_logs`](00_erd_database_supabase_saas.md:1)    | Recognition history   | event_id, identity_id, confidence, distance |
| [`notification_rules`](00_erd_database_supabase_saas.md:1) | Alert conditions      | tenant_id, event_type, channel, conditions  |
| [`audit_logs`](00_erd_database_supabase_saas.md:1)         | Activity tracking     | user_id, action, table_name, record_id      |
| [`subscriptions`](00_erd_database_supabase_saas.md:1)      | Billing               | tenant_id, plan, max_cameras, expires_at    |

---

## 🔗 Feature-to-Table Mapping

### Feature 01: Authentication & Login

| Requirement       | Table                    | Implementation          |
| ----------------- | ------------------------ | ----------------------- |
| User storage      | `users`                  | UUID PK, tenant FK      |
| Password hashing  | `users.password_hash`    | bcrypt/argon2           |
| Role-based access | `users.role`             | superadmin/viewer/admin |
| JWT validation    | `users.last_login` + RLS | Supabase Auth           |

### Feature 02: Dashboard Home

| Requirement      | Table/View                    | Implementation       |
| ---------------- | ----------------------------- | -------------------- |
| Total detections | `event_analytics`             | COUNT per time range |
| Compliance rate  | `compliance_daily`            | Materialized view    |
| Recent incidents | `events` + ORDER BY timestamp | LIMIT 5              |
| Camera status    | `camera_heartbeats`           | Real-time status     |

### Feature 03: Live Monitoring

| Requirement      | Table                          | Implementation           |
| ---------------- | ------------------------------ | ------------------------ |
| Camera config    | `cameras` + `cameras_extended` | JSONB settings           |
| Stream status    | `camera_heartbeats`            | last_seen < 30s = online |
| Real-time events | `events` + Supabase Realtime   | INSERT trigger           |
| MJPEG snapshots  | `events.photo_path`            | Supabase Storage URL     |

### Feature 04: Incident History

| Requirement      | Table                | Implementation       |
| ---------------- | -------------------- | -------------------- |
| Event list       | `events`             | Paginated query      |
| Filter by status | `events.status`      | violation/valid      |
| Search by name   | `events.person_name` | ILIKE query          |
| Export CSV       | `events`             | Postgres COPY or API |

### Feature 05: Identity Management

| Requirement     | Table                            | Implementation   |
| --------------- | -------------------------------- | ---------------- |
| Identity CRUD   | `identities`                     | Basic CRUD       |
| Photo upload    | `face_photos` + Supabase Storage | storage_path     |
| Face encoding   | `face_encodings`                 | pgvector 128-dim |
| Encoding status | `identities.is_encoded`          | Boolean flag     |

### Feature 06: Photo Evidence

| Requirement    | Table                  | Implementation        |
| -------------- | ---------------------- | --------------------- |
| Photo storage  | Supabase Storage       | event-evidence bucket |
| Photo metadata | `events.photo_path`    | Reference to storage  |
| Gallery view   | `events` + Storage URL | Signed URLs           |
| Lightbox modal | Frontend only          | -                     |

### Feature 07: System Settings

| Requirement     | Table                                 | Implementation                       |
| --------------- | ------------------------------------- | ------------------------------------ |
| Camera config   | `cameras` + `cameras_extended`        | source_url, detection_settings       |
| AI thresholds   | `cameras_extended.detection_settings` | conf_person, conf_sop (JSONB)        |
| Telegram config | `config`                              | telegram_enabled, telegram_bot_token |
| Server settings | `config`                              | server_fps, server_quality           |

---

## 🆕 Additional Required Features (Database Ready)

### Feature 08: Camera Management ⭐ NEW

```sql
-- Tables sudah ada: cameras, cameras_extended, camera_heartbeats
-- UI yang dibutuhkan:
--   • Camera list table (nama, lokasi, status, actions)
--   • Add camera modal (form: name, source_url, location, rotation)
--   • Edit camera modal (update config per camera)
--   • Delete camera dengan confirmation
--   • Camera status indicator (online/offline/error)
```

### Feature 09: Multi-Camera Layout ⭐ NEW

```sql
-- Tables sudah ada: cameras
-- UI yang dibutuhkan:
--   • Layout selector (1x1, 2x2, 3x3, 1+5)
--   • Camera grid component
--   • Camera selector untuk setiap slot
--   • WebSocket room management (subscribe per camera)
```

### Feature 10: Real-time Analytics ⭐ NEW

```sql
-- Tables sudah ada: event_analytics, compliance_daily
-- UI yang dibutuhkan:
--   • Compliance trend chart (7/30/90 hari)
--   • Peak hours heatmap
--   • Per-camera statistics
--   • Export to PDF/Excel
```

---

## 🔄 Integration dengan V2_Project

### Migration Path

```
V2_Project (Current)
    │
    ├──► Defense Plan (Week 1)
    │     • Events → Supabase
    │     • Basic config sync
    │
    ├──► Guardian Plan (Week 2-3)
    │     • Multi-camera support
    │     • Camera orchestration
    │
    └──► Protector Plan (Week 4+)
          • Face recognition cloud
          • SaaS multi-tenant
```

### Compatibility Notes

| V2 Component          | Database Compatibility     | Action Required     |
| --------------------- | -------------------------- | ------------------- |
| `config.json`         | ✅ `config` table          | Migration script    |
| `Laporan/` folder     | ✅ Supabase Storage        | Dual-write strategy |
| `identity_vault/`     | ✅ `face_photos` + Storage | Batch upload        |
| `sop_main.py`         | ✅ `events` table          | Add Supabase client |
| `engine_ws_client.py` | ✅ Supabase Realtime       | Adapter pattern     |

---

## 🚀 Deployment Scenarios

### Scenario A: Edge Deployment (Foodinesia Factory)

```yaml
# Defense Plan - Single Camera
Database: Supabase (cloud) atau SQLite (local)
Cameras: 1 RTSP stream
AI: Local GPU (RTX 3060)
Storage: Local + Cloud backup
Users: 2-3 (superadmin + viewers)
```

### Scenario B: Server Deployment (Multi-Camera)

```yaml
# Guardian Plan - 4 Cameras
Database: Supabase Pro
Cameras: 4 RTSP streams
AI: Server GPU (RTX 3080/T4)
Storage: Supabase Storage
Users: 5-10
Features: Multi-view, analytics
```

### Scenario C: SaaS Deployment (Multi-Tenant)

```yaml
# Protector Plan - Enterprise
Database: Supabase with pgvector
Tenants: Multiple customers
Cameras: 8+ per tenant
AI: Cloud GPU / Edge devices
Storage: R2/S3 compatible
Features: Full AI, face rec, SaaS
```

---

## 📊 Database Schema Growth

### Row Count Estimates

| Table               | Defense (1 cam) | Guardian (4 cams) | Protector (8 cams + Face Rec) |
| ------------------- | --------------- | ----------------- | ----------------------------- |
| `events`            | ~1,000/day      | ~4,000/day        | ~8,000/day                    |
| `camera_heartbeats` | ~2,880/day      | ~11,520/day       | ~23,040/day                   |
| `face_match_logs`   | -               | -                 | ~8,000/day                    |
| **Monthly storage** | ~30K events     | ~120K events      | ~240K events + logs           |

### Retention Strategy

```sql
-- Events: Keep 90 days active, archive to cold storage
-- Heartbeats: Keep 7 days (for monitoring)
-- Face match logs: Keep 30 days
-- Audit logs: Keep 1 year (compliance)
```

---

## 🔐 Security Summary

### Row Level Security (RLS)

```sql
-- Semua tables memiliki RLS policies:

-- 1. Tenant Isolation
CREATE POLICY tenant_isolation ON events
  FOR ALL USING (tenant_id = current_setting('app.current_tenant')::UUID);

-- 2. Role-based Access
CREATE POLICY admin_full_access ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 3. Viewer Read-only
CREATE POLICY viewer_read_only ON events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'viewer'
    )
  );
```

### Encryption

| Data Type       | Encryption | Method                                |
| --------------- | ---------- | ------------------------------------- |
| Passwords       | ✅         | bcrypt/argon2 (server-side)           |
| API Tokens      | ✅         | AES-256 (Supabase Vault)              |
| Telegram tokens | ✅         | Config flag `is_sensitive=true`       |
| Photos          | ⚠️         | HTTPS in transit, at-rest by provider |

---

## 📈 Next Steps

### For Development Team

1. **Backend (V2_Project)**
   - [ ] Implement Supabase client
   - [ ] Create database migration scripts
   - [ ] Add dual-write (local + cloud)
   - [ ] Test RLS policies

2. **Frontend (cctv-sop-ui)**
   - [ ] Add React Query for data fetching
   - [ ] Create Camera Management page
   - [ ] Implement multi-camera grid layouts
   - [ ] Connect to real API (replace mock data)

3. **Database**
   - [ ] Setup Supabase project
   - [ ] Run DDL scripts
   - [ ] Configure Storage buckets
   - [ ] Enable pgvector extension
   - [ ] Setup RLS policies

### For Product Team

1. **Prioritize Feature Plans**
   - P0: Camera Management (08)
   - P0: Multi-Camera Layout (09)
   - P1: API Integration (10)
   - P1: Real-time Data (11)

2. **Define Pricing Tiers**
   - Defense: 1-2 cameras, basic features
   - Guardian: 4-8 cameras, analytics
   - Protector: 8+ cameras, face recognition, SaaS

---

## 📚 References

| Dokumen                                                                    | Deskripsi                      |
| -------------------------------------------------------------------------- | ------------------------------ |
| [00_erd_database_v2.md](00_erd_database_v2.md)                             | Core tables untuk Defense Plan |
| [00_erd_database_supabase.md](00_erd_database_supabase.md)                 | Supabase-specific setup        |
| [00_erd_database_supabase_saas.md](00_erd_database_supabase_saas.md)       | Full SaaS dengan multi-tenant  |
| [01_erd_v2_compatibility_analysis.md](01_erd_v2_compatibility_analysis.md) | Migration guide dari V2        |
| [02_feature_coverage_analysis.md](02_feature_coverage_analysis.md)         | Gap analysis features          |
| [MULTI_CAMERA_ARCHITECTURE.md](../../plans/MULTI_CAMERA_ARCHITECTURE.md)   | Arsitektur multi-camera        |

---

**Document Version**: 1.0  
**Created**: 2026-03-12  
**Status**: Complete - Ready for Implementation

---

> 💡 **TL;DR**: ERD sudah lengkap untuk 3 tier (Defense/Guardian/Protector). Frontend perlu tambah Camera Management dan Multi-Camera Layout. V2_Project bisa migrate bertahap.
