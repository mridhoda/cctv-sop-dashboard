# 📊 CCTV-SOP Project Tracking

> **Real-time progress tracker** untuk pengembangan CCTV-SOP Detection System

---

## 🎯 Overall Progress

```
████████████████████████████████████████  Defense Plan (Tier 1): 100% ✅
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Guardian Plan (Tier 2): 20%
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Protector Plan (Tier 3): 5%
```

---

## 📅 Sprint Status

### Current Sprint: Defense Plan - Phase 1

**Periode**: Week 1-2 (Database Setup & V2 Migration)  
**Goal**: Database schema implemented, V2 compatibility layer ready

| Task                              | Owner     | Status      | Due Date | Notes                                                                         |
| --------------------------------- | --------- | ----------- | -------- | ----------------------------------------------------------------------------- |
| Setup Supabase project            | DevOps    | ✅ Complete | Mar 15   | Credentials received                                                          |
| Run DDL scripts                   | Database  | ✅ Complete | Mar 16   | 25 tables deployed                                                            |
| Configure Storage buckets         | Backend   | ✅ Complete | Mar 17   | Migrated to Local + CF Tunnel                                                 |
| Enable pgvector extension         | Database  | ✅ Complete | Mar 17   | Ready for use                                                                 |
| Test RLS policies                 | Database  | ✅ Complete | Mar 24   | Multi-tenant isolation tested                                                 |
| Migrate to new Supabase project   | Database  | ✅ Complete | Mar 24   | New project `ejbkbjrpbfxtvzwkmogi`                                            |
| RLS + Auth Triggers Setup         | Database  | ✅ Complete | Mar 24   | handle_new_user, 23 tables, RPCs                                              |
| identity-photos Storage Bucket    | Backend   | ✅ Complete | Mar 24   | Face photos only (event = local)                                              |
| Dual-write implementation         | Backend   | ✅ Complete | Mar 17   | Local files + Supabase DB links                                               |
| **Frontend → Supabase direct**    | Frontend  | ✅ Complete | Mar 24   | .env updated to new project ✅                                                |
| **V2_Project Structured Folder**  | Backend   | ✅ Complete | Mar 14   | engine/, server/, configs/, docs/                                             |
| **Backend Developer Docs**        | Backend   | ✅ Complete | Mar 14   | docs/PROJECT_STRUCTURE.md                                                     |
| **Supabase RLS Optimization**     | Database  | ✅ Complete | Mar 27   | Refactored helper functions, dedup policies, 27 indexes                       |
| **Auth Stale Session Fix**        | Frontend  | ✅ Complete | Mar 27   | Force signOut on expired refresh token                                        |
| **WebSocket Transport Fix**       | Frontend  | ✅ Complete | Mar 27   | polling-first transport for Cloudflare                                        |
| **Streaming Architecture Plan**   | Tech Lead | ✅ Complete | Mar 27   | `STREAMING_ARCHITECTURE.md` — WebRTC + Go2RTC plan                            |
| **WS Keepalive Ping**             | Backend   | ✅ Complete | Mar 27   | `_broadcast_keepalive` thread + pong handler — prevent CF idle timeout        |
| **Supabase-First Migration (DB)** | Database  | ✅ Complete | Mar 29   | `total_valid`, `total_pelanggaran`, `compliance_rate` + REPLICA IDENTITY FULL |
| **Supabase-First Migration (BE)** | Backend   | ✅ Complete | Mar 29   | `supabase/publisher.py` — dual-write stats + engine status                    |
| **Supabase-First Migration (FE)** | Frontend  | ✅ Complete | Mar 29   | `useMonitoringRealtime.js` — 3 Realtime channels, WS hanya emit               |

---

## 🛡️ Defense Plan (Tier 1) - Single Camera

### 1. Database Layer

| Component                            | Status      | Progress | Notes                                   |
| ------------------------------------ | ----------- | -------- | --------------------------------------- |
| Core tables (users, cameras, events) | ✅ Complete | 100%     | DDL deployed to new Supabase project    |
| RLS policies (multi-tenant)          | ✅ Complete | 100%     | 23 tables fully covered                 |
| Auth Triggers (handle_new_user)      | ✅ Complete | 100%     | Auto tenant create + config seed        |
| Helper Functions (get_user_role etc) | ✅ Complete | 100%     | Used by all RLS policies                |
| RPCs (validate_invite_code)          | ✅ Complete | 100%     | Frontend-callable invite validation     |
| Indexes                              | ✅ Complete | 100%     | Performance optimized                   |
| Storage integration                  | ✅ Complete | 100%     | Local storage + CF Tunnel + face bucket |
| pgvector setup                       | ✅ Complete | 100%     | Ready for face similarity search        |
| Supabase Realtime                    | ✅ Complete | 100%     | events, cameras, camera_heartbeats      |
| Seed data (config_categories)        | ✅ Complete | 100%     | 6 categories seeded                     |

**Overall Database**: 100% ✅

### 2. Backend Layer

| Component                   | Status      | Progress | Notes                                                       |
| --------------------------- | ----------- | -------- | ----------------------------------------------------------- |
| V2_Project compatibility    | ✅ Complete | 100%     | Monolith refactored                                         |
| Supabase client integration | ✅ Complete | 100%     | Client + sync modules                                       |
| Auth middleware             | ✅ Complete | 100%     | JWT validation added                                        |
| API endpoints (REST)        | ✅ Complete | 100%     | Extracted to Blueprints                                     |
| WebSocket (Socket.IO)       | ✅ Complete | 100%     | Handlers modularized                                        |
| Event storage to DB         | ✅ Complete | 100%     | Publisher implemented                                       |
| **Structured Folder**       | ✅ Complete | 100%     | engine/, server/, configs/, docs/                           |
| **Developer Docs**          | ✅ Complete | 100%     | docs/PROJECT_STRUCTURE.md                                   |
| **WS Keepalive Ping**       | ✅ Complete | 100%     | `_broadcast_keepalive` 30s thread — prevent CF idle timeout |
| **Supabase Dual-Write**     | ✅ Complete | 100%     | `supabase/publisher.py` — stats + detection_state ke DB     |

**Overall Backend**: 100% ✅

### 3. Frontend Layer

- **Supabase Realtime** (events, cameras, camera_heartbeats)

| Component                     | Status      | Progress | Notes                                                               |
| ----------------------------- | ----------- | -------- | ------------------------------------------------------------------- |
| Login page UI                 | ✅ Complete | 100%     | Supabase Auth, email-based login                                    |
| Dashboard UI                  | ✅ Complete | 100%     | React Query + Supabase direct                                       |
| Live Monitoring UI            | ✅ Complete | 90%      | Socket.IO stream + Supabase camera list                             |
| Incident History UI           | ✅ Complete | 100%     | Supabase pagination + client CSV export                             |
| Identity Management UI        | ✅ Complete | 100%     | Supabase CRUD + Storage upload                                      |
| Reports/Evidence UI           | ✅ Complete | 100%     | Supabase events + photo filter                                      |
| Settings UI                   | ✅ Complete | 100%     | Supabase config grouped by category                                 |
| **API Integration**           | ✅ Complete | 100%     | **Supabase direct** (no backend needed)                             |
| **Camera Management UI**      | ✅ Complete | 100%     | CRUD, multi-layout grid                                             |
| **Frontend Architecture**     | ✅ Complete | 100%     | Supabase → Service → Hook → Component                               |
| **Auth (Supabase Auth)**      | ✅ Complete | 100%     | **Profile cache implemented** (instant load)                        |
| **Supabase Realtime**         | ✅ Complete | 100%     | Events + camera heartbeats subscriptions                            |
| **Reports & Evidence UI**     | ✅ Complete | 100%     | Photo path & undefined bug fixed ✅                                 |
| **SignUp page**               | ✅ Complete | 100%     | Supabase signUp + email verification                                |
| **Forgot Password page**      | ✅ Complete | 100%     | Supabase resetPasswordForEmail                                      |
| **Stale Session Fix**         | ✅ Complete | 100%     | Force signOut + clear cache on expired token                        |
| **WebSocket Transport**       | ✅ Complete | 100%     | Polling-first transport for Cloudflare proxy                        |
| **Supabase-First Monitoring** | ✅ Complete | 100%     | `useMonitoringRealtime` — engine_status, stats, events via Realtime |
| **WS hanya untuk emit**       | ✅ Complete | 100%     | Socket.IO dipertahankan hanya untuk engine_command                  |

**Overall Frontend**: 100% ✅

> 📄 **Implementation Guide**: See [`frontend/FRONTEND_IMPLEMENTATION_PROMPT.md`](frontend/FRONTEND_IMPLEMENTATION_PROMPT.md) for comprehensive one-shot prompt

### Defense Plan Summary

```
Database:  ██████████████████████  100% ✅ New Supabase project fully configured!
Backend:   ██████████████████████  100% ✅ Complete + Documented!
Frontend:  ██████████████████████  100% ✅ .env updated, ready for sign-up!

Overall:   ██████████████████████  100% ✅ Defense Plan Complete!
```

---

## 🛡️ Guardian Plan (Tier 2) - Multi-Camera

### 1. Database Layer

| Component               | Status      | Progress | Notes            |
| ----------------------- | ----------- | -------- | ---------------- |
| cameras_extended table  | ✅ Complete | 100%     | DDL ready        |
| camera_heartbeats table | ✅ Complete | 100%     | DDL ready        |
| event_analytics table   | ✅ Complete | 100%     | DDL ready        |
| Materialized views      | ✅ Complete | 100%     | compliance_daily |

**Overall Database**: 100% ✅

### 2. Backend Layer

| Component                  | Status         | Progress | Notes                 |
| -------------------------- | -------------- | -------- | --------------------- |
| Camera Manager component   | ❌ Not Started | 0%       | Process orchestration |
| Multi-process architecture | ⚠️ Documented  | 20%      | Architecture ready    |
| Camera lifecycle API       | ❌ Not Started | 0%       | Start/stop/restart    |
| Health monitoring          | ❌ Not Started | 0%       | Heartbeat check       |
| Auto-restart mechanism     | ❌ Not Started | 0%       | Failure recovery      |

**Overall Backend**: 5% ⚠️

### 3. Frontend Layer

| Component                 | Status         | Progress | Notes                       |
| ------------------------- | -------------- | -------- | --------------------------- |
| Camera Management page    | ✅ Complete    | 100%     | CRUD via Supabase direct    |
| Multi-camera grid layouts | ❌ Not Started | 0%       | 1x1, 2x2, 3x3, 1+5          |
| Camera selector component | ✅ Complete    | 100%     | In Monitoring page          |
| Layout selector           | ❌ Not Started | 0%       | Grid layout switcher        |
| Camera status indicators  | ✅ Complete    | 100%     | Online/offline via Supabase |
| Multi-WebSocket rooms     | ❌ Not Started | 0%       | Subscribe per camera        |

**Overall Frontend**: 50% ⚠️

### Guardian Plan Summary

```
Database:  ██████████████████████  100%  ✅ Ready
Backend:   ██░░░░░░░░░░░░░░░░░░░░  5%    ❌ Not Started
Frontend:  ██████████░░░░░░░░░░░░  50%   ⚠️ Partial

Overall:   ██████░░░░░░░░░░░░░░░░  30%   🔵 Planned
```

---

## 🛡️ Protector Plan (Tier 3) - Enterprise SaaS

### 1. Database Layer

| Component                | Status      | Progress | Notes            |
| ------------------------ | ----------- | -------- | ---------------- |
| face_photos table        | ✅ Complete | 100%     | DDL ready        |
| face_encodings table     | ✅ Complete | 100%     | pgvector 128-dim |
| face_match_logs table    | ✅ Complete | 100%     | DDL ready        |
| subscriptions table      | ✅ Complete | 100%     | SaaS billing     |
| notification_rules table | ✅ Complete | 100%     | DDL ready        |
| audit_logs table         | ✅ Complete | 100%     | Compliance       |

**Overall Database**: 100% ✅

### 2. Backend Layer

| Component                | Status         | Progress | Notes                |
| ------------------------ | -------------- | -------- | -------------------- |
| Face recognition engine  | ❌ Not Started | 0%       | Cloud/Edge inference |
| Subscription management  | ❌ Not Started | 0%       | Stripe integration   |
| Multi-tenant isolation   | ⚠️ Partial     | 30%      | RLS exists           |
| Notification service     | ❌ Not Started | 0%       | Multi-channel        |
| Audit logging middleware | ❌ Not Started | 0%       | Auto-log all actions |

**Overall Backend**: 5% ⚠️

### 3. Frontend Layer

| Component          | Status         | Progress | Notes             |
| ------------------ | -------------- | -------- | ----------------- |
| Tenant switcher    | ❌ Not Started | 0%       | Multi-org support |
| Subscription page  | ❌ Not Started | 0%       | Plan management   |
| User invitation    | ❌ Not Started | 0%       | Email invites     |
| Advanced analytics | ❌ Not Started | 0%       | Charts & reports  |
| Audit log viewer   | ❌ Not Started | 0%       | Admin only        |

**Overall Frontend**: 0% ❌

### Protector Plan Summary

```
Database:  ██████████████████████  100%  ✅ Ready
Backend:   ██░░░░░░░░░░░░░░░░░░░░  5%    ❌ Not Started
Frontend:  ░░░░░░░░░░░░░░░░░░░░░░  0%    ❌ Not Started

Overall:   █░░░░░░░░░░░░░░░░░░░░░  5%    ⚪ Future
```

---

## 📈 Milestones

### Q1 2026 (Jan-Mar)

| Milestone                               | Target Date | Status      | Completion |
| --------------------------------------- | ----------- | ----------- | ---------- |
| Defense Plan - Database Complete        | Mar 15      | ✅ Complete | 100%       |
| Defense Plan - Backend Migration        | Mar 30      | ✅ Complete | 100%       |
| Defense Plan - Frontend API Integration | Apr 15      | ✅ Complete | 100% ✅    |
| Defense Plan - End-to-End Testing       | Apr 30      | ⚪ Future   | 0%         |

### Q2 2026 (Apr-Jun)

| Milestone                            | Target Date | Status    | Completion |
| ------------------------------------ | ----------- | --------- | ---------- |
| Guardian Plan - Multi-Camera Backend | May 15      | ⚪ Future | 0%         |
| Guardian Plan - Camera Management UI | May 30      | ⚪ Future | 0%         |
| Guardian Plan - Multi-View Layout    | Jun 15      | ⚪ Future | 0%         |
| Guardian Plan - Beta Release         | Jun 30      | ⚪ Future | 0%         |

### Q3-Q4 2026

| Milestone                               | Target Date | Status    | Completion |
| --------------------------------------- | ----------- | --------- | ---------- |
| Protector Plan - Face Recognition Cloud | Q3 2026     | ⚪ Future | 0%         |
| Protector Plan - SaaS Multi-Tenant      | Q3 2026     | ⚪ Future | 0%         |
| Protector Plan - Public Launch          | Q4 2026     | ⚪ Future | 0%         |

---

## 🚨 Blockers & Risks

### Active Blockers

| Issue                              | Impact                     | Owner        | Mitigation                       | ETA |
| ---------------------------------- | -------------------------- | ------------ | -------------------------------- | --- |
| ~~Supabase credentials not ready~~ | ~~Database setup delayed~~ | DevOps       | ✅ Resolved                      | ✅  |
| ~~V2_Project file structure~~      | ~~Migration complexity~~   | Tech Lead    | ✅ Resolved Mar 14               | ✅  |
| ~~No API spec for frontend~~       | ~~Integration blocked~~    | Backend Lead | ✅ Frontend uses Supabase direct | ✅  |

### Risk Register

| Risk                                    | Probability | Impact | Mitigation                           |
| --------------------------------------- | ----------- | ------ | ------------------------------------ |
| V2 migration takes longer than expected | Medium      | High   | Phased migration approach            |
| Multi-camera performance issues         | Medium      | High   | Load testing early, GPU optimization |
| Face recognition accuracy poor          | Low         | High   | Fallback to manual verification      |
| SaaS compliance requirements            | Medium      | Medium | Engage legal early for GDPR/PDPA     |

---

## 📊 Team Velocity

### Current Sprint (Week 1-2)

```
Planned: 9 tasks
Completed: 8 tasks
In Progress: 0 tasks
Blocked: 0 tasks

Velocity: 8 tasks/sprint ✅
```

### Historical Velocity

| Sprint              | Planned | Completed | Velocity   |
| ------------------- | ------- | --------- | ---------- |
| Sprint 0 (Planning) | -       | -         | -          |
| Sprint 1 (Current)  | 9       | 8         | 8 ✅ Great |

---

## ✅ Recent Completed Tasks

| 2026-03-29 | **Supabase-First: Realtime Partition Fix** | Frontend | `useMonitoringRealtime.js` — Resolved issue where Realtime CDC only fires from partition tables (`events_y2026m03`) not the parent. |
| 2026-03-29 | **Supabase-First: Heartbeat Conflict Fix** | Backend | `heartbeat.py` — Disabled legacy redundant inserts to prevent stats flickering (0 values) on dashboard. |
| 2026-03-29 | **Supabase-First: Frontend Realtime** | Frontend | `useMonitoringRealtime.js` — 3 Supabase Realtime channels replacing `useSocketEvent` for stats, engine, and events. |
| 2026-03-29 | **Supabase-First: Backend Publisher** | Backend | `supabase/publisher.py` — Dual-write stats/status to DB. |
| 2026-03-29 | **WS Keepalive Ping** | Backend | `app.py` — Added 30s ping/pong mechanism to keep Cloudflare connection alive. |
| 2026-03-27 | **Supabase RLS & Index Optimization** | Database | Refactored `get_user_role`, `get_user_tenant_id`, dedup policies, 27 new indexes — eliminated `queue_timeout` connection pool exhaustion |
| 2026-03-27 | **Auth Stale Session Fix** | Frontend | `AuthContext.jsx` — force `signOut()` + clear cache when refresh token expired/invalid — eliminates silent broken session |
| 2026-03-27 | **WebSocket Transport Fix** | Frontend | `socket.js` — changed transport order to `["polling", "websocket"]` — fixes Cloudflare proxy timeout on initial WS connection |
| 2026-03-27 | **Streaming Architecture Plan** | Tech Lead | Created `STREAMING_ARCHITECTURE.md` — Go2RTC + WebRTC + Cloudflare TURN roadmap for production-grade streaming |
| 2026-03-25 | **Profile Cache & Auth Resilience** | Frontend | `localStorage` profile cache, instant loading |
| 2026-03-25 | **Reports Page UI Fixes** | Frontend | `photoUrls` bug, `has_photo` filter, timeout |
| 2026-03-24 | **New Supabase Project Setup (RLS+Auth)** | Database | 23 tables RLS, triggers, RPCs, identity-photos bucket |
| 2026-03-24 | **Frontend .env Updated** | Frontend | .env now points to new project `ejbkbjrpbfxtvzwkmogi` |
| 2026-03-17 | **Photo Storage Migration (Local)** | Backend Lead | Supabase bucket → Local + CF Tunnel |
| 2026-03-14 | **Backend Modulizer & Supabase API** | Backend Lead | 898-line monolith → 9 Blueprints + 7 core mods |
| 2026-03-14 | **Profile Page & Invite Generator** | Frontend Dev | New profile page, admin invite code generation |
| 2026-03-14 | **Header UI Sizing Optimization** | Frontend Dev | Smaller header, badges, icons |
| 2026-03-14 | **Signup Flow Enhancement** | Frontend Dev | Step 2 invite code integration |
| 2026-03-14 | **Auth UI Redesign & Session Fix** | Frontend Dev | Split-screen UI, timeout handling |
| 2026-03-13 | **Frontend Supabase Integration** | Frontend Dev | All 7 services + auth done ✅ |
| 2026-03-13 | Supabase Auth (login/signup/reset) | Frontend Dev | Email-based auth |
| 2026-03-13 | Supabase Realtime hooks | Frontend Dev | Events + camera heartbeats |
| 2026-03-13 | Remove mock data from all pages | Frontend Dev | Monitoring, useCameras |
| 2026-03-13 | Socket.IO env variable fix | Frontend Dev | VITE_WS_URL used |
| 2026-03-13 | Database deployed to Supabase | Database Engineer | 25 tables, RLS, triggers |
| 2026-03-12 | Database ERD complete | Database Engineer | All 3 tiers documented |
| 2026-03-12 | V2 compatibility analysis | Tech Lead | Migration plan ready |
| 2026-03-12 | Feature coverage analysis | Product Owner | Gaps identified |
| 2026-03-12 | Master plan structure created | Tech Lead | Folders organized |
| 2026-03-12 | Frontend implementation guide created | Tech Lead | One-shot prompt ready |

---

## 📝 Action Items

### This Week (Mar 12-15)

- [x] ~~Get Supabase project credentials (DevOps)~~ ✅
- [x] ~~Run initial DDL scripts (Database)~~ ✅
- [x] ~~Configure Storage buckets for Events (Backend)~~ ✅
- [ ] Create OpenAPI spec for Defense Plan APIs (Backend) — _may skip: frontend uses Supabase direct_

### Next Week (Mar 16-22)

- [ ] Test RLS policies with sample data (Database)
- [x] ~~Implement Supabase client in V2_Project (Backend)~~ ✅
- [x] ~~Setup React Query in frontend (Frontend)~~ ✅
- [x] ~~Create API service layer (Frontend)~~ ✅ (Supabase direct)

---

**Last Updated**: 2026-03-29 00:30 WITA  
**Next Review**: 2026-03-31 (Weekly Sync)  
**Reported by**: Frontend Developer / Tech Lead

---

> 🔔 **Update this file daily** to keep the team aligned!
