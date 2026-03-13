# 🔧 Environment Setup Guide

> **How to configure environment** untuk Frontend, Backend, dan Supabase development  
> **Supabase Project**: `cctv-sop-db` (`evgvnmnllpgxcsmxfjrn`)

---

## 1. Supabase Credentials

### Cara Mendapat Credentials

1. Buka [Supabase Dashboard](https://supabase.com/dashboard/project/evgvnmnllpgxcsmxfjrn)
2. Pergi ke **Settings → API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY` (frontend)
   - **service_role key** → `SUPABASE_SERVICE_KEY` (backend only, NEVER di frontend)

### Perbedaan Key

| Key                | Used By            | RLS Applied? | Scope                          |
| :----------------- | :----------------- | :----------: | :----------------------------- |
| `anon` key         | Frontend (browser) |    ✅ Yes    | Read/write sesuai RLS policies |
| `service_role` key | Backend (server)   |    ❌ No     | Full access, bypass RLS        |

> 🔴 **JANGAN pernah expose `service_role` key di frontend atau commit ke git!**

---

## 2. Frontend (.env)

Lokasi: `cctv-sop/dashboard/.env`

```env
# Supabase
VITE_SUPABASE_URL=https://evgvnmnllpgxcsmxfjrn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your_anon_key_here

# WebSocket (jika pakai V2 backend langsung)
VITE_WS_URL=http://localhost:5001

# App
VITE_APP_NAME=VisionGuard AI
```

> Prefix `VITE_` wajib untuk Vite agar terexpose ke client-side code.

---

## 3. Backend (.env)

Lokasi: `V2_Project/.env`

```env
# Supabase
SUPABASE_URL=https://evgvnmnllpgxcsmxfjrn.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGci...your_service_role_key_here
SUPABASE_ANON_KEY=eyJhbGci...your_anon_key_here

# Server
SERVER_HOST=0.0.0.0
SERVER_PORT=5001

# Camera (Defense Plan - single camera)
CAMERA_SOURCE=rtsp://user:pass@10.44.77.5:554/stream1
CAMERA_ID=cam_001
CAMERA_LOCATION=Produksi A

# Tenant (matches the default seeded tenant)
TENANT_ID=<uuid_from_tenants_table>

# Notifications
TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
TELEGRAM_CHAT_ID=<your_chat_id>
```

---

## 4. Git Ignore

Pastikan `.gitignore` di kedua project:

```gitignore
# Environment
.env
.env.local
.env.production

# Dependencies
node_modules/
__pycache__/
*.pyc

# IDE
.vscode/
.idea/
```

---

## 5. Supabase Dashboard Checklist

### Storage Buckets

Buat di **Storage → New bucket**:

| Bucket            | Public | Type                       |
| :---------------- | :----: | :------------------------- |
| `event-evidence`  |   No   | SOP violation/valid photos |
| `identity-photos` |   No   | Face recognition photos    |

### Realtime

Enable di **Database → Replication**:

| Table               | INSERT | UPDATE | DELETE |
| :------------------ | :----: | :----: | :----: |
| `events`            |   ✅   |   ❌   |   ❌   |
| `camera_heartbeats` |   ✅   |   ❌   |   ❌   |
| `cameras`           |   ✅   |   ✅   |   ✅   |

### Auth Setup

1. **Email/Password** auth enabled (default)
2. Buat user pertama: **Settings → Authentication → Users → Create User**
3. User akan otomatis mendapat `profiles` row via `handle_new_user()` trigger

---

## 6. Quick Start Commands

### Frontend

```bash
cd cctv-sop/dashboard
cp .env.example .env        # Edit dengan credentials
npm install
npm run dev                  # → http://localhost:5173
```

### Backend

```bash
cd V2_Project
cp .env.example .env        # Edit dengan credentials
pip install -r requirements.txt
python sop_main.py          # Start camera + server
```

---

**Document Version**: 1.0  
**Created**: 2026-03-13  
**Status**: Ready
