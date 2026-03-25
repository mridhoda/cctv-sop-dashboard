# ERD — Current Supabase Public Schema (cctv-sop-db)

> **Source**: Supabase project `cctv-sop-db` (project_id: `evgvnmnllpgxcsmxfjrn`)
>
> **Snapshot**: 2026-03-18 (public schema only)
>
> **Notes**:
>
> - `auth.users` is in the `auth` schema (external), referenced by `profiles.id`.
> - Events are partitioned by month; current partitions found: `events_y2026m03`, `events_y2026m04`, `events_y2026m05`.
> - ERD below mirrors **current live constraints** (only FKs that exist are shown).

---

## Mermaid ERD (Logical)

```mermaid
erDiagram
  auth_users {
    uuid id PK
  }

  tenants {
    uuid id PK
    varchar(100) name
    varchar(50) slug
    varchar(20) plan_tier
    timestamptz plan_expires_at
    jsonb modules_enabled
    jsonb limits
    varchar(50) timezone
    varchar(10) language
    boolean is_active
    boolean is_suspended
    text suspended_reason
    timestamptz created_at
    timestamptz updated_at
  }

  profiles {
    uuid id PK FK
    uuid tenant_id FK
    varchar(50) username
    varchar(100) name
    varchar(100) email
    varchar(20) phone
    text avatar_url
    varchar(20) role
    varchar(50) role_label
    boolean is_active
    timestamptz last_login
    timestamptz created_at
    timestamptz updated_at
  }

  cameras {
    uuid id PK
    uuid tenant_id FK
    varchar(100) name
    varchar(100) location
    text source_url
    varchar(20) stream_protocol
    varchar(20) status
    varchar(20) detection_state
    boolean is_enabled
    jsonb settings
    timestamptz created_at
    timestamptz updated_at
  }

  cameras_extended {
    uuid camera_id PK FK
    uuid tenant_id FK
    varchar(20) camera_code
    text description
    integer rotation
    jsonb resolution
    integer fps_limit
    uuid assigned_to FK
    jsonb detection_settings
    timestamptz last_seen
    timestamptz created_at
    timestamptz updated_at
  }

  camera_groups {
    uuid id PK
    uuid tenant_id FK
    varchar(100) name
    text description
    varchar(7) color
    timestamptz created_at
  }

  camera_group_members {
    uuid camera_id PK FK
    uuid group_id PK FK
    timestamptz added_at
  }

  camera_heartbeats {
    bigint id PK
    uuid tenant_id FK
    uuid camera_id FK
    varchar(20) status
    real fps
    real cpu_usage
    real memory_usage
    integer active_tracks
    text error_message
    jsonb metadata
    timestamptz created_at
  }

  camera_schedules {
    uuid id PK
    uuid tenant_id FK
    uuid camera_id FK
    integer day_of_week
    time start_time
    time end_time
    boolean is_active
    timestamptz created_at
  }

  config_categories {
    uuid id PK
    varchar(50) name
    varchar(100) display_name
    text description
    varchar(50) icon
    integer sort_order
    timestamptz created_at
  }

  config_settings {
    uuid id PK
    uuid tenant_id FK
    uuid category_id FK
    varchar(100) key
    text value
    varchar(20) data_type
    varchar(100) display_name
    text description
    text default_value
    jsonb validation_rules
    boolean is_sensitive
    boolean is_readonly
    integer sort_order
    timestamptz updated_at
    uuid updated_by FK
  }

  identities {
    uuid id PK
    uuid tenant_id FK
    varchar(20) employee_id
    varchar(100) nama
    varchar(50) jabatan
    varchar(50) department
    varchar(100) email
    varchar(20) phone
    date join_date
    text photo_url
    varchar(20) status
    boolean is_encoded
    integer total_photos
    tsvector search_vector
    timestamptz created_at
    timestamptz updated_at
  }

  face_photos {
    uuid id PK
    uuid tenant_id FK
    uuid identity_id FK
    varchar(255) storage_path
    varchar(20) photo_type
    boolean is_primary
    real quality_score
    integer file_size
    jsonb metadata
    timestamptz uploaded_at
  }

  face_encodings {
    uuid id PK
    uuid tenant_id FK
    uuid identity_id FK
    uuid face_photo_id FK
    varchar(20) encoding_type
    vector(512) encoding_vector
    real quality_score
    boolean is_primary
    varchar(20) model_version
    jsonb landmarks
    timestamptz created_at
  }

  face_match_logs {
    bigint id PK
    uuid tenant_id FK
    uuid event_id
    uuid identity_id FK
    real confidence
    real distance
    varchar(20) match_status
    jsonb candidates
    timestamptz created_at
  }

  event_tags {
    uuid id PK
    uuid tenant_id FK
    varchar(50) name
    varchar(7) color
    timestamptz created_at
  }

  event_tag_assignments {
    uuid event_id PK
    uuid tag_id PK FK
    uuid assigned_by FK
    timestamptz assigned_at
  }

  event_comments {
    uuid id PK
    uuid tenant_id FK
    uuid event_id
    uuid user_id FK
    text comment
    timestamptz created_at
    timestamptz updated_at
  }

  events_y2026m03 {
    uuid id PK
    uuid tenant_id FK
    uuid camera_id FK
    timestamptz timestamp PK
    varchar(100) location
    varchar(20) status
    varchar(100) violation_type
    jsonb missing_sops
    real confidence_person
    real confidence_sop
    text ai_description
    varchar(255) photo_path
    varchar(255) video_clip_path
    varchar(30) detection_type
    uuid identity_id
    real confidence_face
    varchar(100) staff_name
    varchar(50) track_id
    boolean is_reviewed
    uuid reviewed_by FK
    timestamptz reviewed_at
    text review_notes
    tsvector search_vector
    timestamptz created_at
  }

  events_y2026m04 {
    uuid id PK
    uuid tenant_id FK
    uuid camera_id FK
    timestamptz timestamp PK
    varchar(100) location
    varchar(20) status
    varchar(100) violation_type
    jsonb missing_sops
    real confidence_person
    real confidence_sop
    text ai_description
    varchar(255) photo_path
    varchar(255) video_clip_path
    varchar(30) detection_type
    uuid identity_id
    real confidence_face
    varchar(100) staff_name
    varchar(50) track_id
    boolean is_reviewed
    uuid reviewed_by FK
    timestamptz reviewed_at
    text review_notes
    tsvector search_vector
    timestamptz created_at
  }

  events_y2026m05 {
    uuid id PK
    uuid tenant_id FK
    uuid camera_id FK
    timestamptz timestamp PK
    varchar(100) location
    varchar(20) status
    varchar(100) violation_type
    jsonb missing_sops
    real confidence_person
    real confidence_sop
    text ai_description
    varchar(255) photo_path
    varchar(255) video_clip_path
    varchar(30) detection_type
    uuid identity_id
    real confidence_face
    varchar(100) staff_name
    varchar(50) track_id
    boolean is_reviewed
    uuid reviewed_by FK
    timestamptz reviewed_at
    text review_notes
    tsvector search_vector
    timestamptz created_at
  }

  daily_summaries {
    date summary_date PK
    uuid tenant_id PK FK
    uuid camera_id PK FK
    integer total_detections
    integer total_violations
    integer total_valid
    integer unique_persons_detected
    real compliance_rate
    integer peak_hour
    jsonb breakdown_by_hour
    jsonb breakdown_by_violation_type
    timestamptz created_at
    timestamptz updated_at
  }

  invite_codes {
    uuid id PK
    uuid tenant_id FK
    varchar(20) code
    varchar(50) role
    varchar(100) role_label
    uuid created_by FK
    integer max_uses
    integer used_count
    timestamptz expires_at
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }

  notification_rules {
    uuid id PK
    uuid tenant_id FK
    varchar(100) name
    text description
    varchar(50) event_type
    varchar(20) channel
    jsonb conditions
    text recipient
    text template
    integer cooldown_minutes
    boolean is_active
    timestamptz created_at
    timestamptz updated_at
  }

  notification_logs {
    bigint id PK
    uuid tenant_id FK
    uuid event_id
    uuid rule_id FK
    varchar(20) channel
    text recipient
    varchar(20) status
    integer retry_count
    integer max_retries
    text error_message
    timestamptz sent_at
    jsonb metadata
    timestamptz created_at
  }

  audit_logs {
    bigint id PK
    uuid tenant_id FK
    uuid user_id FK
    varchar(50) action
    varchar(50) entity_type
    uuid entity_id
    text description
    jsonb old_values
    jsonb new_values
    inet ip_address
    text user_agent
    timestamptz created_at
  }

  auth_users ||--|| profiles : "auth.users.id = profiles.id"
  tenants ||--o{ profiles : tenant_id
  tenants ||--o{ cameras : tenant_id
  tenants ||--o{ camera_groups : tenant_id
  tenants ||--o{ camera_group_members : tenant_id
  tenants ||--o{ camera_heartbeats : tenant_id
  tenants ||--o{ camera_schedules : tenant_id
  tenants ||--o{ cameras_extended : tenant_id
  tenants ||--o{ config_settings : tenant_id
  tenants ||--o{ daily_summaries : tenant_id
  tenants ||--o{ event_tags : tenant_id
  tenants ||--o{ event_comments : tenant_id
  tenants ||--o{ events_y2026m03 : tenant_id
  tenants ||--o{ events_y2026m04 : tenant_id
  tenants ||--o{ events_y2026m05 : tenant_id
  tenants ||--o{ face_encodings : tenant_id
  tenants ||--o{ face_match_logs : tenant_id
  tenants ||--o{ face_photos : tenant_id
  tenants ||--o{ identities : tenant_id
  tenants ||--o{ invite_codes : tenant_id
  tenants ||--o{ notification_rules : tenant_id
  tenants ||--o{ notification_logs : tenant_id
  tenants ||--o{ audit_logs : tenant_id

  cameras ||--|| cameras_extended : camera_id
  cameras ||--o{ camera_group_members : camera_id
  camera_groups ||--o{ camera_group_members : group_id
  cameras ||--o{ camera_heartbeats : camera_id
  cameras ||--o{ camera_schedules : camera_id
  cameras ||--o{ daily_summaries : camera_id
  cameras ||--o{ events_y2026m03 : camera_id
  cameras ||--o{ events_y2026m04 : camera_id
  cameras ||--o{ events_y2026m05 : camera_id

  profiles ||--o{ audit_logs : user_id
  profiles ||--o{ cameras_extended : assigned_to
  profiles ||--o{ config_settings : updated_by
  profiles ||--o{ event_tag_assignments : assigned_by
  profiles ||--o{ event_comments : user_id
  profiles ||--o{ invite_codes : created_by
  profiles ||--o{ events_y2026m03 : reviewed_by
  profiles ||--o{ events_y2026m04 : reviewed_by
  profiles ||--o{ events_y2026m05 : reviewed_by

  config_categories ||--o{ config_settings : category_id

  identities ||--o{ face_photos : identity_id
  identities ||--o{ face_encodings : identity_id
  identities ||--o{ face_match_logs : identity_id

  face_photos ||--o{ face_encodings : face_photo_id

  event_tags ||--o{ event_tag_assignments : tag_id

  notification_rules ||--o{ notification_logs : rule_id
```

---

## Table Details (Exact Columns)

> Format: **column_name** (type) [PK] [FK] [nullable] [default]

### audit_logs

- **id** (bigint) [PK] [default: nextval('audit_logs_id_seq'::regclass)]
- **tenant_id** (uuid) [FK → tenants.id]
- **user_id** (uuid) [FK → profiles.id] [nullable]
- **action** (character varying(50))
- **entity_type** (character varying(50))
- **entity_id** (uuid) [nullable]
- **description** (text) [nullable]
- **old_values** (jsonb) [nullable]
- **new_values** (jsonb) [nullable]
- **ip_address** (inet) [nullable]
- **user_agent** (text) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### camera_group_members

- **camera_id** (uuid) [PK] [FK → cameras.id]
- **group_id** (uuid) [PK] [FK → camera_groups.id]
- **added_at** (timestamp with time zone) [nullable] [default: now()]

### camera_groups

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **name** (character varying(100))
- **description** (text) [nullable]
- **color** (character varying(7)) [nullable] [default: '#38bdf8']
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### camera_heartbeats

- **id** (bigint) [PK] [default: nextval('camera_heartbeats_id_seq'::regclass)]
- **tenant_id** (uuid) [FK → tenants.id]
- **camera_id** (uuid) [FK → cameras.id]
- **status** (character varying(20))
- **fps** (real) [nullable]
- **cpu_usage** (real) [nullable]
- **memory_usage** (real) [nullable]
- **active_tracks** (integer) [nullable] [default: 0]
- **error_message** (text) [nullable]
- **metadata** (jsonb) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### camera_schedules

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **camera_id** (uuid) [FK → cameras.id]
- **day_of_week** (integer)
- **start_time** (time without time zone)
- **end_time** (time without time zone)
- **is_active** (boolean) [nullable] [default: true]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### cameras

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **name** (character varying(100))
- **location** (character varying(100))
- **source_url** (text)
- **stream_protocol** (character varying(20)) [nullable] [default: 'rtsp']
- **status** (character varying(20)) [nullable] [default: 'offline']
- **detection_state** (character varying(20)) [nullable] [default: 'inactive']
- **is_enabled** (boolean) [nullable] [default: true]
- **settings** (jsonb) [nullable] [default: '{"conf_sop": 0.70, "conf_person": 0.65, "cooldown_minutes": 5}']
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

### cameras_extended

- **camera_id** (uuid) [PK] [FK → cameras.id]
- **tenant_id** (uuid) [FK → tenants.id]
- **camera_code** (character varying(20)) [nullable]
- **description** (text) [nullable]
- **rotation** (integer) [nullable] [default: 0]
- **resolution** (jsonb) [nullable] [default: '{"width": 1920, "height": 1080}']
- **fps_limit** (integer) [nullable] [default: 30]
- **assigned_to** (uuid) [FK → profiles.id] [nullable]
- **detection_settings** (jsonb) [nullable] [default: '{"roi": null, "conf_sop": 0.25, "conf_person": 0.5, "skip_frames": 0, "cooldown_minutes": 10}']
- **last_seen** (timestamp with time zone) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

### config_categories

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **name** (character varying(50))
- **display_name** (character varying(100))
- **description** (text) [nullable]
- **icon** (character varying(50)) [nullable]
- **sort_order** (integer) [nullable] [default: 0]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### config_settings

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **category_id** (uuid) [FK → config_categories.id]
- **key** (character varying(100))
- **value** (text)
- **data_type** (character varying(20)) [default: 'string']
- **display_name** (character varying(100))
- **description** (text) [nullable]
- **default_value** (text) [nullable]
- **validation_rules** (jsonb) [nullable]
- **is_sensitive** (boolean) [nullable] [default: false]
- **is_readonly** (boolean) [nullable] [default: false]
- **sort_order** (integer) [nullable] [default: 0]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_by** (uuid) [FK → profiles.id] [nullable]

### daily_summaries

- **summary_date** (date) [PK]
- **tenant_id** (uuid) [PK] [FK → tenants.id]
- **camera_id** (uuid) [PK] [FK → cameras.id]
- **total_detections** (integer) [nullable] [default: 0]
- **total_violations** (integer) [nullable] [default: 0]
- **total_valid** (integer) [nullable] [default: 0]
- **unique_persons_detected** (integer) [nullable] [default: 0]
- **compliance_rate** (real) [nullable]
- **peak_hour** (integer) [nullable]
- **breakdown_by_hour** (jsonb) [nullable] [default: '{}']
- **breakdown_by_violation_type** (jsonb) [nullable] [default: '{}']
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

### event_comments

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **event_id** (uuid)
- **user_id** (uuid) [FK → profiles.id]
- **comment** (text)
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

### event_tag_assignments

- **event_id** (uuid) [PK]
- **tag_id** (uuid) [PK] [FK → event_tags.id]
- **assigned_by** (uuid) [FK → profiles.id] [nullable]
- **assigned_at** (timestamp with time zone) [nullable] [default: now()]

### event_tags

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **name** (character varying(50))
- **color** (character varying(7)) [nullable] [default: '#64748b']
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### events_y2026m03

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **camera_id** (uuid) [FK → cameras.id]
- **timestamp** (timestamp with time zone) [PK] [default: now()]
- **location** (character varying(100))
- **status** (character varying(20))
- **violation_type** (character varying(100)) [nullable]
- **missing_sops** (jsonb) [nullable]
- **confidence_person** (real) [nullable]
- **confidence_sop** (real) [nullable]
- **ai_description** (text) [nullable]
- **photo_path** (character varying(255)) [nullable]
- **video_clip_path** (character varying(255)) [nullable]
- **detection_type** (character varying(30)) [nullable] [default: 'sop_check']
- **identity_id** (uuid) [nullable]
- **confidence_face** (real) [nullable]
- **staff_name** (character varying(100)) [nullable]
- **track_id** (character varying(50)) [nullable]
- **is_reviewed** (boolean) [nullable] [default: false]
- **reviewed_by** (uuid) [FK → profiles.id] [nullable]
- **reviewed_at** (timestamp with time zone) [nullable]
- **review_notes** (text) [nullable]
- **search_vector** (tsvector) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### events_y2026m04

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **camera_id** (uuid) [FK → cameras.id]
- **timestamp** (timestamp with time zone) [PK] [default: now()]
- **location** (character varying(100))
- **status** (character varying(20))
- **violation_type** (character varying(100)) [nullable]
- **missing_sops** (jsonb) [nullable]
- **confidence_person** (real) [nullable]
- **confidence_sop** (real) [nullable]
- **ai_description** (text) [nullable]
- **photo_path** (character varying(255)) [nullable]
- **video_clip_path** (character varying(255)) [nullable]
- **detection_type** (character varying(30)) [nullable] [default: 'sop_check']
- **identity_id** (uuid) [nullable]
- **confidence_face** (real) [nullable]
- **staff_name** (character varying(100)) [nullable]
- **track_id** (character varying(50)) [nullable]
- **is_reviewed** (boolean) [nullable] [default: false]
- **reviewed_by** (uuid) [FK → profiles.id] [nullable]
- **reviewed_at** (timestamp with time zone) [nullable]
- **review_notes** (text) [nullable]
- **search_vector** (tsvector) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### events_y2026m05

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **camera_id** (uuid) [FK → cameras.id]
- **timestamp** (timestamp with time zone) [PK] [default: now()]
- **location** (character varying(100))
- **status** (character varying(20))
- **violation_type** (character varying(100)) [nullable]
- **missing_sops** (jsonb) [nullable]
- **confidence_person** (real) [nullable]
- **confidence_sop** (real) [nullable]
- **ai_description** (text) [nullable]
- **photo_path** (character varying(255)) [nullable]
- **video_clip_path** (character varying(255)) [nullable]
- **detection_type** (character varying(30)) [nullable] [default: 'sop_check']
- **identity_id** (uuid) [nullable]
- **confidence_face** (real) [nullable]
- **staff_name** (character varying(100)) [nullable]
- **track_id** (character varying(50)) [nullable]
- **is_reviewed** (boolean) [nullable] [default: false]
- **reviewed_by** (uuid) [FK → profiles.id] [nullable]
- **reviewed_at** (timestamp with time zone) [nullable]
- **review_notes** (text) [nullable]
- **search_vector** (tsvector) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### face_encodings

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **identity_id** (uuid) [FK → identities.id]
- **face_photo_id** (uuid) [FK → face_photos.id] [nullable]
- **encoding_type** (character varying(20)) [nullable] [default: '512d']
- **encoding_vector** (vector(512)) [nullable]
- **quality_score** (real) [nullable]
- **is_primary** (boolean) [nullable] [default: false]
- **model_version** (character varying(20)) [nullable] [default: 'v1']
- **landmarks** (jsonb) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### face_match_logs

- **id** (bigint) [PK] [default: nextval('face_match_logs_id_seq'::regclass)]
- **tenant_id** (uuid) [FK → tenants.id]
- **event_id** (uuid)
- **identity_id** (uuid) [FK → identities.id] [nullable]
- **confidence** (real)
- **distance** (real)
- **match_status** (character varying(20)) [nullable] [default: 'pending']
- **candidates** (jsonb) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### face_photos

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **identity_id** (uuid) [FK → identities.id]
- **storage_path** (character varying(255))
- **photo_type** (character varying(20)) [nullable] [default: 'front']
- **is_primary** (boolean) [nullable] [default: false]
- **quality_score** (real) [nullable]
- **file_size** (integer) [nullable]
- **metadata** (jsonb) [nullable]
- **uploaded_at** (timestamp with time zone) [nullable] [default: now()]

### identities

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **employee_id** (character varying(20))
- **nama** (character varying(100))
- **jabatan** (character varying(50))
- **department** (character varying(50)) [nullable]
- **email** (character varying(100)) [nullable]
- **phone** (character varying(20)) [nullable]
- **join_date** (date) [nullable]
- **photo_url** (text) [nullable]
- **status** (character varying(20)) [nullable] [default: 'active']
- **is_encoded** (boolean) [nullable] [default: false]
- **total_photos** (integer) [nullable] [default: 0]
- **search_vector** (tsvector) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

### invite_codes

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **code** (character varying(20))
- **role** (character varying(50)) [default: 'viewer']
- **role_label** (character varying(100)) [nullable]
- **created_by** (uuid) [FK → profiles.id] [nullable]
- **max_uses** (integer) [nullable] [default: 1]
- **used_count** (integer) [nullable] [default: 0]
- **expires_at** (timestamp with time zone) [nullable]
- **is_active** (boolean) [nullable] [default: true]
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

### notification_logs

- **id** (bigint) [PK] [default: nextval('notification_logs_id_seq'::regclass)]
- **tenant_id** (uuid) [FK → tenants.id]
- **event_id** (uuid) [nullable]
- **rule_id** (uuid) [FK → notification_rules.id] [nullable]
- **channel** (character varying(20))
- **recipient** (text)
- **status** (character varying(20)) [default: 'pending']
- **retry_count** (integer) [nullable] [default: 0]
- **max_retries** (integer) [nullable] [default: 3]
- **error_message** (text) [nullable]
- **sent_at** (timestamp with time zone) [nullable]
- **metadata** (jsonb) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]

### notification_rules

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **tenant_id** (uuid) [FK → tenants.id]
- **name** (character varying(100))
- **description** (text) [nullable]
- **event_type** (character varying(50))
- **channel** (character varying(20))
- **conditions** (jsonb) [nullable] [default: '{}']
- **recipient** (text)
- **template** (text) [nullable]
- **cooldown_minutes** (integer) [nullable] [default: 5]
- **is_active** (boolean) [nullable] [default: true]
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

### profiles

- **id** (uuid) [PK] [FK → auth.users.id]
- **tenant_id** (uuid) [FK → tenants.id]
- **username** (character varying(50))
- **name** (character varying(100))
- **email** (character varying(100)) [nullable]
- **phone** (character varying(20)) [nullable]
- **avatar_url** (text) [nullable]
- **role** (character varying(20))
- **role_label** (character varying(50)) [nullable]
- **is_active** (boolean) [nullable] [default: true]
- **last_login** (timestamp with time zone) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

### tenants

- **id** (uuid) [PK] [default: uuid_generate_v4()]
- **name** (character varying(100))
- **slug** (character varying(50))
- **plan_tier** (character varying(20)) [default: 'defense']
- **plan_expires_at** (timestamp with time zone) [nullable]
- **modules_enabled** (jsonb) [nullable] [default: '{"analytics": false, "api_access": false, "heartbeats": false, "multi_camera": false, "camera_groups": false, "camera_schedules": false, "face_recognition": false, "notifications_advanced": false}']
- **limits** (jsonb) [nullable] [default: '{"max_users": 3, "max_cameras": 1, "max_identities": 0, "max_storage_gb": 5, "data_retention_days": 30}']
- **timezone** (character varying(50)) [nullable] [default: 'Asia/Jakarta']
- **language** (character varying(10)) [nullable] [default: 'id']
- **is_active** (boolean) [nullable] [default: true]
- **is_suspended** (boolean) [nullable] [default: false]
- **suspended_reason** (text) [nullable]
- **created_at** (timestamp with time zone) [nullable] [default: now()]
- **updated_at** (timestamp with time zone) [nullable] [default: now()]

---

## Integrity Notes

- `event_comments.event_id`, `event_tag_assignments.event_id`, `face_match_logs.event_id`, and `notification_logs.event_id` exist **without FK constraints** in the live schema.
- `profiles.id` references `auth.users.id` (external to public schema).
- `events_*` are monthly partitions; parent table is not visible in public schema in this snapshot.

---

## Verification Query (Reference)

```sql
-- Source: used to extract table/column/constraint metadata from public schema
-- Stored here for reproducibility
with tables as (
  select c.oid as table_oid, c.relname as table_name
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
)
select count(*) from tables;
```

---

## Change Summary

- Captured **current live public schema** from Supabase.
- Included **ERD diagram + full column dictionary** for faithful duplication.
- Documented **partitioned events tables** and **external auth.users link**.

## Impact Analysis

- Documentation-only change. No database changes applied.

## Rollback Plan

- Remove this file if not needed.

## Verification Steps

- Compare table/column list against Supabase `public` schema.
- Validate FKs in Supabase dashboard or `information_schema`.

## ELI5

- Ini adalah “peta lengkap” database kamu saat ini: semua tabel, kolom, dan hubungan antar tabel, biar bisa disalin persis.
