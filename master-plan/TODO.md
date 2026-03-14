# ✅ CCTV-SOP Master TODO List

> **Prioritized task list** untuk pengembangan CCTV-SOP Detection System

---

## 🎯 Legend

| Priority      | Icon | Description                                            |
| ------------- | ---- | ------------------------------------------------------ |
| P0 - Critical | 🔴   | **Must do** - Blocking other work, immediate attention |
| P1 - High     | 🟡   | **Should do** - Important features, schedule soon      |
| P2 - Medium   | 🟢   | **Nice to have** - Do if time permits                  |
| P3 - Low      | ⚪   | **Future** - Backlog for later                         |

| Status      | Icon | Description               |
| ----------- | ---- | ------------------------- |
| Not Started | ⬜   | Belum dikerjakan          |
| In Progress | 🔄   | Sedang dikerjakan         |
| In Review   | 👀   | Menunggu review           |
| Blocked     | 🚫   | Ter-block oleh issue lain |
| Done        | ✅   | Selesai                   |

---

## 🔴 P0 - Critical (Do First)

### Database

- [x] ✅ Setup Supabase project & credentials
  - **Owner**: DevOps
  - **Completed**: Mar 13
  - **Notes**: Project created, anon key obtained

- [x] ✅ Run Defense Plan DDL scripts
  - **Owner**: Database Engineer
  - **Completed**: Mar 13
  - **Notes**: 25 tables deployed to Supabase

- [ ] ⬜ Configure Supabase Storage buckets
  - **Owner**: Backend Developer
  - **Due**: Mar 17
  - **Buckets**: event-evidence, identity-photos, config-exports

- [x] ✅ Enable pgvector extension
  - **Owner**: Database Engineer
  - **Completed**: Mar 13
  - **Notes**: Extension enabled, ready for face encodings

- [ ] ⬜ Test RLS policies with sample data
  - **Owner**: Database Engineer
  - **Due**: Mar 18
  - **Test**: Tenant isolation, role-based access

### Backend

- [ ] ⬜ Audit V2_Project current structure
  - **Owner**: Tech Lead
  - **Due**: Mar 13
  - **Output**: Document current file structure
  - **Files**: `database/01_erd_v2_compatibility_analysis.md`

- [ ] ⬜ Create OpenAPI spec for Defense Plan APIs
  - **Owner**: Backend Developer
  - **Due**: Mar 18
  - **Endpoints**: Auth, Events, Cameras, Config

- [ ] ⬜ Implement Supabase client wrapper
  - **Owner**: Backend Developer
  - **Due**: Mar 20
  - **Features**: Connection pooling, retry logic, error handling

- [ ] ⬜ Create dual-write strategy (local + cloud)
  - **Owner**: Backend Developer
  - **Due**: Mar 22
  - **Description**: Write to local file AND Supabase simultaneously

### Frontend

- [x] ✅ Setup React Query (TanStack Query)
  - **Owner**: Frontend Developer
  - **Completed**: Mar 11
  - **Scope**: Cache, refetch, error boundaries

- [x] ✅ Create Supabase service layer (replaced Axios)
  - **Owner**: Frontend Developer
  - **Completed**: Mar 13
  - **Features**: Supabase client, 7 service files rewritten, Storage helpers

- [x] ✅ Implement Supabase Auth (login/signup/reset)
  - **Owner**: Frontend Developer
  - **Completed**: Mar 13
  - **Replaces**: Mock login (superadmin/admin123)
  - **Features**: signInWithPassword, signUp, resetPasswordForEmail

- [x] ✅ Replace mock data with Supabase - Dashboard
  - **Owner**: Frontend Developer
  - **Completed**: Mar 13
  - **Queries**: events count today, violations count, compliance rate

- [x] ✅ Replace mock data with Supabase - Monitoring
  - **Owner**: Frontend Developer
  - **Completed**: Mar 13
  - **Features**: Real camera list from Supabase, Socket.IO for stream

- [x] ✅ Replace mock data with Supabase - History
  - **Owner**: Frontend Developer
  - **Completed**: Mar 13
  - **Features**: Supabase paginated queries, client-side CSV export

- [x] ✅ Replace mock data with Supabase - Identities
  - **Owner**: Frontend Developer
  - **Completed**: Mar 13
  - **Features**: Supabase CRUD + Storage photo upload

- [x] ✅ Replace mock data with Supabase - Settings
  - **Owner**: Frontend Developer
  - **Completed**: Mar 13
  - **Features**: Supabase config grouped by category

---

## 🟡 P1 - High Priority (Defense Plan Complete)

### Database

- [ ] ⬜ Setup Guardian Plan tables
  - **Owner**: Database Engineer
  - **Due**: Apr 5
  - **Tables**: cameras_extended, camera_heartbeats, event_analytics

- [ ] ⬜ Create materialized view for compliance_daily
  - **Owner**: Database Engineer
  - **Due**: Apr 8
  - **Refresh**: Daily via cron/trigger

- [ ] ⬜ Setup time-series partitioning for events
  - **Owner**: Database Engineer
  - **Due**: Apr 10
  - **Strategy**: Partition by month for performance

### Backend

- [ ] ⬜ Refactor sop_main.py untuk modular architecture
  - **Owner**: Backend Developer
  - **Due**: Apr 12
  - **Guide**: `backend/MULTI_CAMERA_MODULAR_ARCHITECTURE.md`

- [ ] ⬜ Implement CameraManager component
  - **Owner**: Backend Developer
  - **Due**: Apr 15
  - **Features**: Spawn/stop/monitor camera processes

- [ ] ⬜ Create health monitoring daemon
  - **Owner**: Backend Developer
  - **Due**: Apr 18
  - **Features**: Heartbeat check, auto-restart on failure

- [ ] ⬜ Implement multi-camera WebSocket rooms
  - **Owner**: Backend Developer
  - **Due**: Apr 20
  - **Pattern**: Socket.IO rooms per camera

- [ ] ⬜ Add API endpoints for camera CRUD
  - **Owner**: Backend Developer
  - **Due**: Apr 22
  - **Endpoints**: GET/POST/PUT/DELETE `/api/cameras/*`

### Frontend

- [ ] ⬜ Create Camera Management page
  - **Owner**: Frontend Developer
  - **Due**: Apr 15
  - **Features**: List, add, edit, delete cameras
  - **Route**: `/cameras`

- [ ] ⬜ Create CameraCard component
  - **Owner**: Frontend Developer
  - **Due**: Apr 12
  - **Features**: Status indicator, snapshot, actions

- [ ] ⬜ Create CameraForm modal
  - **Owner**: Frontend Developer
  - **Due**: Apr 14
  - **Fields**: name, source_url, location, rotation, settings

- [ ] ⬜ Implement multi-camera grid layouts
  - **Owner**: Frontend Developer
  - **Due**: Apr 25
  - **Layouts**: 1x1, 2x2, 3x3, 1+5 (main + sidebar)

- [ ] ⬜ Create LayoutSelector component
  - **Owner**: Frontend Developer
  - **Due**: Apr 22
  - **Features**: Layout buttons, responsive

- [ ] ⬜ Implement camera grid with WebSocket
  - **Owner**: Frontend Developer
  - **Due**: Apr 28
  - **Features**: Subscribe/unsubscribe per camera room

### DevOps

- [ ] ⬜ Setup staging environment
  - **Owner**: DevOps
  - **Due**: Apr 10
  - **Stack**: Supabase staging project, staging server

- [ ] ⬜ Create deployment pipeline
  - **Owner**: DevOps
  - **Due**: Apr 20
  - **Tools**: GitHub Actions / GitLab CI

---

## 🟢 P2 - Medium Priority (Guardian Plan Features)

### Database

- [ ] ⬜ Setup Protector Plan tables
  - **Owner**: Database Engineer
  - **Due**: May 10
  - **Tables**: face_photos, face_encodings, face_match_logs

- [ ] ⬜ Create analytics materialized views
  - **Owner**: Database Engineer
  - **Due**: May 15
  - **Views**: hourly_stats, peak_hours, camera_efficiency

- [ ] ⬜ Setup audit log triggers
  - **Owner**: Database Engineer
  - **Due**: May 20
  - **Scope**: Log all INSERT/UPDATE/DELETE

### Backend

- [ ] ⬜ Implement face encoding endpoint
  - **Owner**: Backend Developer
  - **Due**: May 15
  - **API**: `POST /api/identities/:id/encode`

- [ ] ⬜ Integrate face recognition engine
  - **Owner**: Backend Developer
  - **Due**: May 25
  - **Engine**: Cloud GPU atau Edge device

- [ ] ⬜ Create notification service
  - **Owner**: Backend Developer
  - **Due**: May 30
  - **Channels**: Telegram, Email, Webhook

- [ ] ⬜ Implement data retention cleanup
  - **Owner**: Backend Developer
  - **Due**: Jun 5
  - **Policy**: Auto-delete after retention period

### Frontend

- [ ] ⬜ Create Analytics Dashboard page
  - **Owner**: Frontend Developer
  - **Due**: May 20
  - **Charts**: Compliance trends, peak hours, per-camera stats

- [ ] ⬜ Add data export functionality
  - **Owner**: Frontend Developer
  - **Due**: May 25
  - **Formats**: CSV, Excel, PDF

- [ ] ⬜ Implement advanced filtering
  - **Owner**: Frontend Developer
  - **Due**: May 30
  - **Filters**: Date range, camera, status, person

- [ ] ⬜ Add dark/light mode toggle
  - **Owner**: Frontend Developer
  - **Due**: Jun 5
  - **Scope**: Theme persistence

### Testing

- [ ] ⬜ Write integration tests for APIs
  - **Owner**: QA Engineer
  - **Due**: May 15
  - **Tools**: Jest, Supertest

- [ ] ⬜ Write E2E tests for critical flows
  - **Owner**: QA Engineer
  - **Due**: May 30
  - **Tools**: Cypress / Playwright
  - **Flows**: Login → Dashboard → Monitoring → History

---

## ⚪ P3 - Low Priority / Future (Protector Plan)

### SaaS Features

- [ ] ⬜ Implement tenant onboarding flow
  - **Owner**: Full Stack Developer
  - **Due**: Q3 2026

- [ ] ⬜ Create subscription management page
  - **Owner**: Frontend Developer
  - **Due**: Q3 2026
  - **Integration**: Stripe

- [ ] ⬜ Implement user invitation system
  - **Owner**: Backend Developer
  - **Due**: Q3 2026
  - **Features**: Email invites, role assignment

- [ ] ⬜ Create admin panel for SaaS management
  - **Owner**: Full Stack Developer
  - **Due**: Q3 2026
  - **Features**: Tenant management, billing overview

### Advanced Features

- [ ] ⬜ Mobile responsive design
  - **Owner**: Frontend Developer
  - **Due**: Q3 2026
  - **Scope**: Tablet & phone layouts

- [ ] ⬜ PWA (Progressive Web App)
  - **Owner**: Frontend Developer
  - **Due**: Q4 2026
  - **Features**: Offline mode, push notifications

- [ ] ⬜ Custom branding/white-label
  - **Owner**: Frontend Developer
  - **Due**: Q4 2026
  - **Features**: Logo, colors, custom domain

- [ ] ⬜ Advanced AI analytics
  - **Owner**: Data Scientist
  - **Due**: Q4 2026
  - **Features**: Predictive maintenance, anomaly detection

---

## 📊 Task Summary by Team

| Team         | P0            | P1     | P2     | P3    | Total  |
| ------------ | ------------- | ------ | ------ | ----- | ------ |
| **Database** | 1 (of 5)      | 3      | 3      | 0     | 11     |
| **Backend**  | 4             | 6      | 4      | 3     | 17     |
| **Frontend** | 0 (of 8) ✅   | 7      | 4      | 3     | 22     |
| **DevOps**   | 0 (of 1) ✅   | 2      | 0      | 0     | 3      |
| **QA**       | 0             | 0      | 2      | 0     | 2      |
| **TOTAL**    | **5/18 done** | **18** | **13** | **6** | **55** |
| **DevOps**   | 1             | 2      | 0      | 0     | 3      |
| **QA**       | 0             | 0      | 2      | 0     | 2      |
| **TOTAL**    | **18**        | **18** | **13** | **6** | **55** |

---

## 📅 Sprint Planning

### Sprint 1 (Mar 12-22): Foundation

**Goal**: Database ready, V2 analysis complete

| Team      | Tasks | Story Points |
| --------- | ----- | ------------ |
| Database  | 5     | 21           |
| Backend   | 2     | 13           |
| Frontend  | 1     | 5            |
| DevOps    | 1     | 8            |
| **Total** | **9** | **47**       |

### Sprint 2 (Mar 23-Apr 5): API Integration

**Goal**: Frontend connected to real APIs

| Team      | Tasks | Story Points |
| --------- | ----- | ------------ |
| Backend   | 2     | 13           |
| Frontend  | 7     | 34           |
| **Total** | **9** | **47**       |

### Sprint 3 (Apr 6-19): Multi-Camera Backend

**Goal**: Camera orchestration ready

| Team      | Tasks | Story Points |
| --------- | ----- | ------------ |
| Database  | 2     | 8            |
| Backend   | 3     | 21           |
| DevOps    | 1     | 5            |
| **Total** | **6** | **34**       |

### Sprint 4 (Apr 20-May 3): Multi-Camera Frontend

**Goal**: Camera management UI complete

| Team      | Tasks | Story Points |
| --------- | ----- | ------------ |
| Frontend  | 4     | 21           |
| Backend   | 1     | 8            |
| **Total** | **5** | **29**       |

---

## 🎯 This Week's Focus

### Database Engineer

1. ✅ ~~Setup Supabase project~~ Done
2. ✅ ~~Prepare DDL scripts for deployment~~ 25 tables deployed
3. 🔴 Test RLS policies locally

### Backend Developer

1. 🔴 Audit V2_Project codebase
2. 🟡 Create OpenAPI specification _(may skip: frontend uses Supabase direct)_
3. 🟡 Design CameraManager component

### Frontend Developer

1. ✅ ~~Setup React Query~~ Done
2. ✅ ~~Create API service layer~~ Done (Supabase direct)
3. ✅ ~~Supabase Auth integration~~ Done
4. ✅ ~~Replace all mock data~~ Done
5. 🟡 Design Camera Management page mockup

### DevOps

1. ✅ ~~Obtain Supabase credentials~~ Done
2. 🟡 Setup staging environment planning

---

## 📝 Task Template

Untuk menambah task baru, gunakan format:

```markdown
- [ ] ⬜ Task name
  - **Owner**: Name
  - **Due**: YYYY-MM-DD
  - **Depends on**: Task ID or "None"
  - **Notes**: Additional context
```

---

## 🔄 Update History

| Date       | Changes                                                | Updated By   |
| ---------- | ------------------------------------------------------ | ------------ |
| 2026-03-14 | Auth UI Redesign & Session verification fix            | Frontend Dev |
| 2026-03-13 | Frontend Supabase integration complete, all P0 FE done | Frontend Dev |
| 2026-03-12 | Initial creation                                       | Tech Lead    |
| 2026-03-12 | Added sprint planning                                  | Tech Lead    |

---

**Next Review**: 2026-03-15 (Weekly)  
**Update Frequency**: Daily progress check, weekly full review

---

> 💡 **Tip**: Drag tasks between priority sections as scope changes!
