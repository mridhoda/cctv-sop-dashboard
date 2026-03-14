# 📝 Spesifikasi Signup Flow Multi-Scenario

> **Status**: Design Phase  
> **Tujuan**: Memisahkan flow signup untuk Owner (buat tenant) vs Member (join via invite)

---

## 🎯 User Stories

### Scenario 1: Owner/Admin (Pembeli CCTV)

Sebagai pemilik perusahaan, saya ingin:

- Signup dengan data diri (nama, email, password)
- **Di window terpisah**: Input nama perusahaan saya
- Sistem otomatis buat tenant baru untuk perusahaan saya
- Jadi admin/owner dari tenant tersebut

### Scenario 2: Supervisor/Viewer (Karyawan)

Sebagai karyawan, saya ingin:

- Signup dengan data diri
- Pilih opsi "Saya punya invite code"
- Input invite code dari owner
- Otomatis join ke tenant perusahaan tersebut
- Dapat role sesuai yang ditentukan owner

---

## 🔄 Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     HALAMAN SIGNUP                          │
│                  Step 1: Data Pribadi                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Nama Lengkap│    │    Email    │    │    Password     │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                                                             │
│  [✓] Saya punya invite code (checkbox)                      │
│                                                             │
│              [ Lanjutkan → ]                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   Pilih Tipe Akun?      │
              └─────────────────────────┘
               /                      \
              /                        \
    ┌────────▼─────────┐      ┌────────▼─────────┐
    │ Tanpa Invite     │      │ Dengan Invite    │
    │ (Owner Flow)     │      │ (Member Flow)    │
    └────────┬─────────┘      └────────┬─────────┘
             │                         │
             ▼                         ▼
┌──────────────────────┐    ┌──────────────────────┐
│ Step 2A:             │    │ Step 2B:             │
│ Input Data           │    │ Input Invite Code    │
│ Perusahaan           │    │                      │
├──────────────────────┤    ├──────────────────────┤
│ ┌──────────────────┐ │    │ ┌──────────────────┐ │
│ │ Nama Perusahaan  │ │    │ │   Invite Code    │ │
│ │                  │ │    │ │   [______]       │ │
│ │ [______________] │ │    │ └──────────────────┘ │
│ └──────────────────┘ │    │                      │
│                      │    │ [ Validate Code ]    │
│ [ Buat Akun ]        │    │                      │
│                      │    │ Info: Acme Corp      │
└──────────────────────┘    │ Role: Supervisor     │
                            │                      │
                            │ [ Gabung Perusahaan ]│
                            └──────────────────────┘
```

---

## 🗄️ Database Changes

### 1. Tabel `invite_codes` (NEW)

```sql
CREATE TABLE public.invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

    -- Code untuk di-share
    code VARCHAR(20) UNIQUE NOT NULL,

    -- Role yang akan diberikan ke user yang join
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    role_label VARCHAR(100),

    -- Metadata
    created_by UUID REFERENCES public.profiles(id),
    max_uses INTEGER DEFAULT 1,           -- NULL = unlimited
    used_count INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,                -- NULL = never expires

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa
CREATE INDEX idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_tenant ON public.invite_codes(tenant_id);

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
```

### 2. Update Trigger `handle_new_user()`

```sql
-- Trigger yang menangani kedua scenario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_tenant_id UUID;
    v_role VARCHAR(50);
    v_role_label VARCHAR(100);
    v_company_name VARCHAR(255);
    v_invite_code VARCHAR(20);
BEGIN
    -- Ambil data dari metadata
    v_company_name := NEW.raw_user_meta_data->>'company_name';
    v_invite_code := NEW.raw_user_meta_data->>'invite_code';

    -- SCENARIO 1: Owner membuat tenant baru
    IF v_company_name IS NOT NULL AND v_invite_code IS NULL THEN
        -- Buat tenant baru
        INSERT INTO public.tenants (name, slug)
        VALUES (
            v_company_name,
            LOWER(REGEXP_REPLACE(v_company_name, '[^a-zA-Z0-9]', '-', 'g'))
        )
        RETURNING id INTO v_tenant_id;

        v_role := 'admin';
        v_role_label := 'Administrator';

    -- SCENARIO 2: Join via invite code
    ELSIF v_invite_code IS NOT NULL THEN
        -- Validate dan consume invite code
        SELECT ic.tenant_id, ic.role, ic.role_label
        INTO v_tenant_id, v_role, v_role_label
        FROM public.invite_codes ic
        WHERE ic.code = v_invite_code
          AND ic.is_active = true
          AND (ic.expires_at IS NULL OR ic.expires_at > NOW())
          AND (ic.max_uses IS NULL OR ic.used_count < ic.max_uses)
        FOR UPDATE;

        IF v_tenant_id IS NULL THEN
            RAISE EXCEPTION 'Invalid or expired invite code';
        END IF;

        -- Increment used_count
        UPDATE public.invite_codes
        SET used_count = used_count + 1,
            is_active = CASE
                WHEN max_uses IS NOT NULL AND used_count + 1 >= max_uses
                THEN false
                ELSE is_active
            END
        WHERE code = v_invite_code;

    ELSE
        RAISE EXCEPTION 'Either company_name or invite_code must be provided';
    END IF;

    -- Create profile
    INSERT INTO public.profiles (
        id, tenant_id, username, name, email,
        role, role_label, is_active
    )
    VALUES (
        NEW.id,
        v_tenant_id,
        NEW.raw_user_meta_data->>'username',
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(v_role, 'viewer'),
        COALESCE(v_role_label, 'Viewer'),
        true
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔌 Backend API Specs

### 1. Validate Invite Code

```http
POST /api/v1/invite/validate
Content-Type: application/json

{
  "code": "ACME-2024-XYZ"
}
```

**Response Success (200):**

```json
{
  "valid": true,
  "tenant": {
    "id": "uuid",
    "name": "Acme Corporation"
  },
  "role": "supervisor",
  "role_label": "Supervisor"
}
```

**Response Error (400):**

```json
{
  "valid": false,
  "error": "Invalid or expired invite code"
}
```

### 2. Create Invite Code (Admin only)

```http
POST /api/v1/invite/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "viewer",
  "role_label": "Viewer",
  "max_uses": 5,
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response (201):**

```json
{
  "code": "ACME-2024-ABC123",
  "expires_at": "2024-12-31T23:59:59Z",
  "max_uses": 5
}
```

---

## 🎨 Frontend UI/UX Specs

### Halaman Signup - Step 1 (Data Pribadi)

```
┌──────────────────────────────────────────────────────────┐
│  🔙 Kembali                                              │
│                                                          │
│  [Logo] VisionGuard AI                                   │
│       CCTV-SOP Dashboard                                 │
│                                                          │
│  ═══════════════════════════════════════════════════════ │
│  Langkah 1 dari 2                                        │
│  ═══════════════════════════════════════════════════════ │
│                                                          │
│  Nama Lengkap *                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 👤  IT Core Foodinesia                              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Email *                                                 │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ ✉️  foodinesiaserver@gmail.com                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Password *                                              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🔒  ••••••••••••  [👁️]                             │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Ulangi Password *                                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🔒  ••••••••••••  [👁️]                             │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ☐  Saya punya invite code                          │ │
│  │      (Karyawan dengan kode undangan dari perusahaan)│ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Lanjutkan  →                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Sudah punya akun? Masuk di sini                         │
└──────────────────────────────────────────────────────────┘
```

### Halaman Signup - Step 2A (Owner: Input Perusahaan)

```
┌──────────────────────────────────────────────────────────┐
│  🔙 Kembali ke Langkah 1                                 │
│                                                          │
│  [Logo] VisionGuard AI                                   │
│                                                          │
│  ═══════════════════════════════════════════════════════ │
│  Langkah 2 dari 2 - Data Perusahaan                      │
│  ═══════════════════════════════════════════════════════ │
│                                                          │
│  🏢 Buat Perusahaan Baru                                 │
│                                                          │
│  Selamat datang, IT Core!                                │
│  Silakan masukkan nama perusahaan Anda untuk memulai.    │
│                                                          │
│  Nama Perusahaan *                                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🏢  PT Foodinesia Indonesia                         │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  💡 Tip: Nama ini akan menjadi identitas utama untuk     │
│     semua data CCTV dan kejadian di dashboard Anda.      │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Buat Akun & Perusahaan  →              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  [🔄] Atau, jika Anda karyawan dan punya invite code,    │
│       klik di sini                                       │
└──────────────────────────────────────────────────────────┘
```

### Halaman Signup - Step 2B (Member: Input Invite Code)

```
┌──────────────────────────────────────────────────────────┐
│  🔙 Kembali ke Langkah 1                                 │
│                                                          │
│  [Logo] VisionGuard AI                                   │
│                                                          │
│  ═══════════════════════════════════════════════════════ │
│  Langkah 2 dari 2 - Gabung Perusahaan                    │
│  ═══════════════════════════════════════════════════════ │
│                                                          │
│  🔑 Masukkan Kode Undangan                               │
│                                                          │
│  Selamat datang, IT Core!                                │
│  Masukkan kode undangan yang diberikan oleh admin        │
│  perusahaan Anda.                                        │
│                                                          │
│  Kode Undangan *                                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🔑  FOOD-2024-XYZ123                                │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  [  🔍  Verifikasi Kode  ]                               │
│                                                          │
│  ────────────────────────────────────────────────────────│
│  Hasil Verifikasi:                                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ✅ Kode Valid                                       │ │
│  │                                                      │ │
│  │  Perusahaan: PT Foodinesia Indonesia               │ │
│  │  Role: Supervisor                                  │ │
│  │                                                      │ │
│  │  [✓] Anda akan bergabung sebagai Supervisor        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Gabung ke Perusahaan  →                │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure (Frontend)

```
dashboard/src/
├── pages/
│   └── SignUpPage/
│       ├── index.jsx              # Entry point dengan routing
│       ├── Step1PersonalData.jsx  # Form nama, email, password
│       ├── Step2CompanyData.jsx   # Owner flow: input perusahaan
│       └── Step2InviteCode.jsx    # Member flow: input invite code
├── components/
│   └── signup/
│       ├── AccountTypeSelector.jsx
│       ├── InviteCodeInput.jsx
│       ├── CompanyNameInput.jsx
│       └── SignupProgress.jsx
└── services/
    └── invite.js                  # API calls untuk invite codes
```

---

## 🚀 Implementation Priority

| Phase | Task                                             | Owner    | Effort |
| ----- | ------------------------------------------------ | -------- | ------ |
| 1     | Database schema (invite_codes + updated trigger) | Database | Medium |
| 2     | Backend API (validate invite, create invite)     | Backend  | Medium |
| 3     | Frontend Step 1 (personal data)                  | Frontend | Low    |
| 4     | Frontend Step 2A (company data - owner)          | Frontend | Low    |
| 5     | Frontend Step 2B (invite code - member)          | Frontend | Medium |
| 6     | Settings page: Manage invite codes               | Frontend | Medium |

---

## 🧪 Test Scenarios

### Scenario 1: Owner Signup

1. User isi nama, email, password
2. Tidak centang "punya invite code"
3. Step 2: Muncul form input nama perusahaan
4. Input "PT Maju Jaya"
5. Submit → Tenant baru dibuat, user jadi admin
6. User redirect ke dashboard

### Scenario 2: Member Signup (Valid Code)

1. User isi nama, email, password
2. Centang "punya invite code"
3. Step 2: Muncul form invite code
4. Input "FOOD-2024-ABC"
5. Click verify → Muncul info perusahaan & role
6. Submit → User join tenant, role sesuai invite

### Scenario 3: Member Signup (Invalid Code)

1. User input invite code salah
2. Click verify → Error: "Kode tidak valid"
3. Tidak bisa lanjut

---

## 📝 Next Steps

1. **Apakah flow ini sudah sesuai ekspektasi?**
2. **Prioritas implementasi?** (Database dulu, atau semua sekaligus?)
3. **Butuh UI mockup lebih detail?**

Silakan konfirmasi, lalu saya akan:

- Switch ke mode implementasi yang sesuai
- Mulai coding dari komponen yang diprioritaskan
