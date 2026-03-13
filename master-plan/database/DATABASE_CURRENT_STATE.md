# 📋 Database Schema Reference — Current State

> **Living document**: Kondisi AKTUAL database Supabase yang sudah di-deploy  
> **Supabase Project**: `cctv-sop-db` (`evgvnmnllpgxcsmxfjrn`) | **Postgres 17.6.1**  
> **Last synced**: 2026-03-13 | **Migrations applied**: 14/14 ✅

---

## 🎯 Tujuan Dokumen

Dokumen ini menggambarkan **keadaan database SAAT INI** — bukan rencana, tapi apa yang **sudah ada** di Supabase. Digunakan sebagai **rujukan utama** oleh frontend dan backend saat integrasi.

---

## 📊 Overview

**25 tabel** di `public` schema, dikelompokkan per module:

| Module | Tables | Role |
|:---|:---:|:---|
| Multi-Tenant Core | 2 | `tenants`, `profiles` |
| Camera System | 6 | `cameras`, `cameras_extended`, `camera_heartbeats`, `camera_groups`, `camera_group_members`, `camera_schedules` |
| Events & Detection | 2 | `events` (partitioned), `daily_summaries` |
| Face Recognition | 3 | `identities`, `face_photos`, `face_encodings` |
| Face Match Logs | 1 | `face_match_logs` |
| Notifications | 2 | `notification_rules`, `notification_logs` |
| Audit & Workflow | 4 | `audit_logs`, `event_tags`, `event_tag_assignments`, `event_comments` |
| Configuration | 2 | `config_categories`, `config_settings` |

**Extensions**: `uuid-ossp`, `vector` (pgvector)

---

## 🏗️ Table Schemas

### 1. `tenants` — Multi-Tenant Root

> Setiap data di database terikat ke tenant via `tenant_id`.

| Column | Type | Default | Notes |
|:---|:---|:---|:---|
| `id` | `uuid` PK | `uuid_generate_v4()` | |
| `name` | `varchar` | | Nama organisasi |
| `slug` | `varchar` UNIQUE | | URL-safe identifier |
| `plan_tier` | `varchar` | `'defense'` | `defense` / `guardian` / `protector` |
| `plan_expires_at` | `timestamptz` | NULL | Masa berlaku plan |
| `modules_enabled` | `jsonb` | `{multi_camera: false, ...}` | Module flags per tier |
| `limits` | `jsonb` | `{max_cameras: 1, max_users: 3, ...}` | Resource limits |
| `timezone` | `varchar` | `'Asia/Jakarta'` | |
| `language` | `varchar` | `'id'` | |
| `is_active` | `boolean` | `true` | |
| `is_suspended` | `boolean` | `false` | |
| `suspended_reason` | `text` | NULL | |
| `created_at` | `timestamptz` | `now()` | |
| `updated_at` | `timestamptz` | `now()` | |

**Seed data**: 1 row (default tenant)

---

### 2. `profiles` — User Profiles

> Linked ke `auth.users` via `id`. Auto-created by `handle_new_user()` trigger.

| Column | Type | Default | Notes |
|:---|:---|:---|:---|
| `id` | `uuid` PK | | FK → `auth.users.id` |
| `tenant_id` | `uuid` | | FK → `tenants.id` |
| `username` | `varchar` | | |
| `name` | `varchar` | | Display name |
| `email` | `varchar` | NULL | |
| `phone` | `varchar` | NULL | |
| `avatar_url` | `text` | NULL | |
| `role` | `varchar` | | `superadmin` / `admin` / `operator` / `viewer` |
| `role_label` | `varchar` | NULL | Human-readable role |
| `is_active` | `boolean` | `true` | |
| `last_login` | `timestamptz` | NULL | |
| `created_at` | `timestamptz` | `now()` | |
| `updated_at` | `timestamptz` | `now()` | |

---

### 3. `cameras` — Camera Registry

| Column | Type | Default | Notes |
|:---|:---|:---|:---|
| `id` | `uuid` PK | `uuid_generate_v4()` | |
| `tenant_id` | `uuid` | | FK → `tenants.id` |
| `name` | `varchar` | | e.g. "CCTV Produksi A" |
| `location` | `varchar` | | e.g. "Lantai 1 Area Produksi" |
| `source_url` | `text` | | RTSP/HTTP URL |
| `stream_protocol` | `varchar` | `'rtsp'` | `rtsp` / `http` / `file` / `webrtc` |
| `status` | `varchar` | `'offline'` | `online` / `offline` / `error` / `maintenance` |
| `detection_state` | `varchar` | `'inactive'` | `active` / `inactive` / `paused` |
| `is_enabled` | `boolean` | `true` | |
| `settings` | `jsonb` | `{conf_sop: 0.70, conf_person: 0.65, cooldown_minutes: 5}` | Per-camera AI settings |
| `created_at` | `timestamptz` | `now()` | |
| `updated_at` | `timestamptz` | `now()` | Auto-trigger |

---

### 4. `cameras_extended` — Advanced Camera Config (Guardian+)

| Column | Type | Default | Notes |
|:---|:---|:---|:---|
| `camera_id` | `uuid` PK | | FK → `cameras.id` |
| `tenant_id` | `uuid` | | FK → `tenants.id` |
| `camera_code` | `varchar` UNIQUE | NULL | e.g. "CAM-001" |
| `description` | `text` | NULL | |
| `rotation` | `integer` | `0` | `0` / `90` / `180` / `270` |
| `resolution` | `jsonb` | `{width: 1920, height: 1080}` | |
| `fps_limit` | `integer` | `30` | 1-60 |
| `assigned_to` | `uuid` | NULL | FK → `profiles.id` |
| `detection_settings` | `jsonb` | `{roi: null, conf_sop: 0.25, ...}` | Advanced settings |
| `last_seen` | `timestamptz` | NULL | |
| `created_at` | `timestamptz` | `now()` | |
| `updated_at` | `timestamptz` | `now()` | |

---

### 5. `camera_heartbeats` — Health Monitoring

| Column | Type | Default | Notes |
|:---|:---|:---|:---|
| `id` | `bigint` PK | auto-increment | |
| `tenant_id` | `uuid` | | FK → `tenants.id` |
| `camera_id` | `uuid` | | FK → `cameras.id` |
| `status` | `varchar` | | `online` / `offline` / `error` |
| `fps` | `float4` | NULL | Current FPS |
| `cpu_usage` | `float4` | NULL | % |
| `memory_usage` | `float4` | NULL | % |
| `active_tracks` | `integer` | `0` | |
| `error_message` | `text` | NULL | |
| `metadata` | `jsonb` | NULL | |
| `created_at` | `timestamptz` | `now()` | |

---

### 6. `camera_groups` + `camera_group_members` — Grouping

**camera_groups**:

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `name` | `varchar` | |
| `description` | `text` | NULL |
| `color` | `varchar` | Default `'#38bdf8'` |
| `created_at` | `timestamptz` | |

**camera_group_members** (junction):

| Column | Type | Notes |
|:---|:---|:---|
| `camera_id` | `uuid` PK | FK → `cameras.id` |
| `group_id` | `uuid` PK | FK → `camera_groups.id` |
| `added_at` | `timestamptz` | |

---

### 7. `camera_schedules` — Operating Hours

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `camera_id` | `uuid` | FK → `cameras.id` |
| `day_of_week` | `integer` | 0 (Sunday) - 6 (Saturday) |
| `start_time` | `time` | |
| `end_time` | `time` | |
| `is_active` | `boolean` | Default `true` |
| `created_at` | `timestamptz` | |

---

### 8. `events` — Detection Events (Partitioned by Month)

> ⚠️ **Partitioned table**. Partitions: `events_y2026m03`, `events_y2026m04`, `events_y2026m05`  
> PK: composite `(id, timestamp)`

| Column | Type | Default | Notes |
|:---|:---|:---|:---|
| `id` | `uuid` PK | `uuid_generate_v4()` | |
| `tenant_id` | `uuid` | | FK → `tenants.id` |
| `camera_id` | `uuid` | | FK → `cameras.id` |
| `timestamp` | `timestamptz` PK | `now()` | Partition key |
| `location` | `varchar` | | Camera location |
| `status` | `varchar` | | `valid` / `violation` / `pending` / `pending_review` |
| `violation_type` | `varchar` | NULL | e.g. "No Helmet" |
| `missing_sops` | `jsonb` | NULL | `["helm","masker"]` |
| `confidence_person` | `float4` | NULL | 0.0 - 1.0 |
| `confidence_sop` | `float4` | NULL | 0.0 - 1.0 |
| `ai_description` | `text` | NULL | AI generated description |
| `photo_path` | `varchar` | NULL | Storage path |
| `video_clip_path` | `varchar` | NULL | |
| `detection_type` | `varchar` | `'sop_check'` | `sop_check` / `face_recognition` / `both` |
| `identity_id` | `uuid` | NULL | FK → `identities.id` (if face matched) |
| `confidence_face` | `float4` | NULL | |
| `staff_name` | `varchar` | NULL | Matched staff name |
| `track_id` | `varchar` | NULL | Person tracking ID |
| `is_reviewed` | `boolean` | `false` | |
| `reviewed_by` | `uuid` | NULL | FK → `profiles.id` |
| `reviewed_at` | `timestamptz` | NULL | |
| `review_notes` | `text` | NULL | |
| `search_vector` | `tsvector` | GENERATED | Full-text search (Indonesian) |
| `created_at` | `timestamptz` | `now()` | |

---

### 9. `daily_summaries` — Aggregated Stats

| Column | Type | Notes |
|:---|:---|:---|
| `summary_date` | `date` PK | |
| `tenant_id` | `uuid` PK | FK → `tenants.id` |
| `camera_id` | `uuid` PK | FK → `cameras.id` |
| `total_detections` | `integer` | Default `0` |
| `total_violations` | `integer` | Default `0` |
| `total_valid` | `integer` | Default `0` |
| `unique_persons_detected` | `integer` | Default `0` |
| `compliance_rate` | `float4` | |
| `peak_hour` | `integer` | 0-23 |
| `breakdown_by_hour` | `jsonb` | `{}` |
| `breakdown_by_violation_type` | `jsonb` | `{}` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

---

### 10. `identities` — Staff Identity Registry

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `employee_id` | `varchar` | e.g. "EMP-001" |
| `nama` | `varchar` | |
| `jabatan` | `varchar` | |
| `department` | `varchar` | NULL |
| `email` | `varchar` | NULL |
| `phone` | `varchar` | NULL |
| `join_date` | `date` | NULL |
| `photo_url` | `text` | NULL |
| `status` | `varchar` | `active` / `inactive` / `suspended` |
| `is_encoded` | `boolean` | `false` — true if face encoded |
| `total_photos` | `integer` | `0` |
| `search_vector` | `tsvector` | GENERATED (Indonesian) |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

---

### 11. `face_photos` — Face Photo Storage

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `identity_id` | `uuid` | FK → `identities.id` |
| `storage_path` | `varchar` | Supabase Storage path |
| `photo_type` | `varchar` | `front` / `left` / `right` / `up` / `down` |
| `is_primary` | `boolean` | Default `false` |
| `quality_score` | `float4` | NULL |
| `file_size` | `integer` | NULL (bytes) |
| `metadata` | `jsonb` | NULL |
| `uploaded_at` | `timestamptz` | |

---

### 12. `face_encodings` — Vector Embeddings (pgvector)

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `identity_id` | `uuid` | FK → `identities.id` |
| `face_photo_id` | `uuid` | NULL, FK → `face_photos.id` |
| `encoding_type` | `varchar` | Default `'512d'` |
| `encoding_vector` | `vector` | **pgvector type** — 512-dimensional |
| `quality_score` | `float4` | NULL |
| `is_primary` | `boolean` | Default `false` |
| `model_version` | `varchar` | Default `'v1'` |
| `landmarks` | `jsonb` | NULL |
| `created_at` | `timestamptz` | |

---

### 13. `face_match_logs` — Match Results

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `bigint` PK | auto-increment |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `event_id` | `uuid` | |
| `identity_id` | `uuid` | NULL, FK → `identities.id` |
| `confidence` | `float4` | |
| `distance` | `float4` | Cosine distance |
| `match_status` | `varchar` | `matched` / `rejected` / `uncertain` / `pending` |
| `candidates` | `jsonb` | NULL — top N candidates |
| `created_at` | `timestamptz` | |

---

### 14. `notification_rules` + `notification_logs`

**notification_rules**:

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `name` | `varchar` | |
| `description` | `text` | NULL |
| `event_type` | `varchar` | `violation` / `camera_offline` / `camera_error` / `face_unknown` / `system_alert` |
| `channel` | `varchar` | `telegram` / `email` / `webhook` / `push` |
| `conditions` | `jsonb` | `{}` |
| `recipient` | `text` | Chat ID / email / URL |
| `template` | `text` | NULL |
| `cooldown_minutes` | `integer` | Default `5` |
| `is_active` | `boolean` | Default `true` |
| `created_at` | `timestamptz` | |
| `updated_at` | `timestamptz` | |

**notification_logs**:

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `bigint` PK | auto-increment |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `event_id` | `uuid` | NULL |
| `rule_id` | `uuid` | NULL, FK → `notification_rules.id` |
| `channel` | `varchar` | |
| `recipient` | `text` | |
| `status` | `varchar` | `pending` / `sent` / `failed` / `retrying` |
| `retry_count` | `integer` | Default `0` |
| `max_retries` | `integer` | Default `3` |
| `error_message` | `text` | NULL |
| `sent_at` | `timestamptz` | NULL |
| `metadata` | `jsonb` | NULL |
| `created_at` | `timestamptz` | |

---

### 15. `audit_logs` — Activity Tracking

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `bigint` PK | auto-increment |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `user_id` | `uuid` | NULL, FK → `profiles.id` |
| `action` | `varchar` | `create` / `update` / `delete` / `login` / `logout` / `export` / `config_change` / `role_change` |
| `entity_type` | `varchar` | e.g. "camera", "event" |
| `entity_id` | `uuid` | NULL |
| `description` | `text` | NULL |
| `old_values` | `jsonb` | NULL |
| `new_values` | `jsonb` | NULL |
| `ip_address` | `inet` | NULL |
| `user_agent` | `text` | NULL |
| `created_at` | `timestamptz` | |

---

### 16. `event_tags` + `event_tag_assignments` + `event_comments`

**event_tags**: `id`, `tenant_id`, `name`, `color` (default `#64748b`), `created_at`

**event_tag_assignments** (junction): `event_id` PK + `tag_id` PK, `assigned_by`, `assigned_at`

**event_comments**: `id`, `tenant_id`, `event_id`, `user_id`, `comment`, `created_at`, `updated_at`

---

### 17. `config_categories` + `config_settings`

**config_categories** (6 rows seeded):

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `uuid` PK | |
| `name` | `varchar` UNIQUE | `detection`, `camera`, `notification`, `server`, `face_recognition`, etc. |
| `display_name` | `varchar` | |
| `description` | `text` | NULL |
| `icon` | `varchar` | NULL |
| `sort_order` | `integer` | Default `0` |

**config_settings** (10 rows seeded):

| Column | Type | Notes |
|:---|:---|:---|
| `id` | `uuid` PK | |
| `tenant_id` | `uuid` | FK → `tenants.id` |
| `category_id` | `uuid` | FK → `config_categories.id` |
| `key` | `varchar` | e.g. `"conf_person"` |
| `value` | `text` | Stored as string |
| `data_type` | `varchar` | `string` / `number` / `boolean` / `json` / `secret` |
| `display_name` | `varchar` | UI label |
| `description` | `text` | NULL |
| `default_value` | `text` | NULL |
| `validation_rules` | `jsonb` | NULL |
| `is_sensitive` | `boolean` | Default `false` |
| `is_readonly` | `boolean` | Default `false` |
| `sort_order` | `integer` | Default `0` |
| `updated_at` | `timestamptz` | |
| `updated_by` | `uuid` | NULL, FK → `profiles.id` |

---

## ⚙️ Custom Functions (14)

| Function | Returns | Purpose |
|:---|:---|:---|
| `get_current_tenant_id()` | `uuid` | Get tenant ID of current auth user |
| `current_user_role()` | `varchar` | Get role of current auth user |
| `current_tenant_has_module(module)` | `boolean` | Check if tenant has module enabled |
| `is_admin()` | `boolean` | Check if current user is admin/superadmin |
| `is_module_enabled(module)` | `boolean` | Check module enabled for current tenant |
| `get_tenant_limit(limit_key)` | `jsonb` | Get specific tenant limit value |
| `check_camera_limit()` | `trigger` | Enforce max_cameras per tenant plan |
| `check_multi_camera_module()` | `trigger` | Guard multi-camera module access |
| `check_face_recognition_module()` | `trigger` | Guard face recognition module access |
| `handle_new_user()` | `trigger` | Auto-create profile on `auth.users` INSERT |
| `update_updated_at()` | `trigger` | Auto-update `updated_at` column |
| `update_modules_on_plan_change()` | `trigger` | Auto-adjust modules when plan_tier changes |
| `validate_face_fields()` | `trigger` | Validate face fields on events |
| `search_faces(query_vector, limit)` | `SETOF record` | pgvector similarity search |

---

## 🛡️ RLS Policies

All tables have RLS enabled. Key pattern:

```sql
-- Tenant isolation: users can only see their own tenant's data
CREATE POLICY "tenant_isolation" ON table_name
  USING (tenant_id = get_current_tenant_id());
```

| Table | # Policies | Pattern |
|:---|:---:|:---|
| `tenants` | 2 | SELECT own, UPDATE own |
| `profiles` | 1 | Tenant isolation |
| `cameras` | 1 | Tenant isolation |
| `events` | 2 | Tenant isolation |
| `identities` | 1 | Tenant isolation |
| `config_settings` | 1 | Tenant isolation |
| All other public tables | 1 each | Tenant isolation |
| `config_categories` | ⚠️ 0 | Missing — needs fix |

---

## 🔗 Entity Relationship Diagram (Simplified)

```
auth.users ──1:1──➜ profiles ──N:1──➜ tenants
                                        │
         ┌──────────────────────────────┤
         │              │               │
      cameras    config_settings   identities
         │              │               │
    cameras_extended    │          face_photos
    camera_heartbeats   │          face_encodings
    camera_schedules    │          face_match_logs
    camera_groups       │
         │              │
      events ◄──────────┘
    (partitioned)
         │
    event_tags
    event_comments
    notification_rules ──➜ notification_logs
    audit_logs
    daily_summaries
```

---

## 🌱 Seed Data (Already Deployed)

| Table | Rows | Content |
|:---|:---:|:---|
| `tenants` | 1 | Foodinesia (defense plan) |
| `config_categories` | 6 | detection, camera, notification, server, face_recognition, general |
| `config_settings` | 10 | Default config values |

---

**Document Version**: 1.0  
**Created**: 2026-03-13  
**Source**: Live Supabase audit (not from design docs)  
**Status**: ✅ Synced with production database
