-- ============================================
-- STORAGE BUCKET RLS POLICIES - SUPABASE UI VERSION
-- Copy-paste policy definitions ke Supabase Dashboard UI
-- ============================================

/*
CATATAN: Supabase UI sudah otomatis scope policy ke bucket tertentu.
Jadi di policy definition, kamu bisa pakai:
- true (paling simple)
- bucket_id = 'nama-bucket' (lebih eksplisit, juga benar)

Keduanya WORK. Yang penting operation (SELECT/INSERT/DELETE) dan rolesnya benar.
*/

-- ============================================
-- BUCKET: identity-photos
-- ============================================

-- Policy 1: SELECT (Public Read)
-- Operation: SELECT
-- Roles: anon, authenticated  
-- Policy definition:
true

-- Policy 2: INSERT (Authenticated with tenant isolation)
-- Operation: INSERT
-- Roles: authenticated
-- Policy definition:
(storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid())

-- Policy 3: DELETE (Admin only)
-- Operation: DELETE
-- Roles: authenticated
-- Policy definition:
EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
)

-- ============================================
-- BUCKET: event-evidence  
-- ============================================

-- Policy 1: SELECT
-- Operation: SELECT
-- Roles: anon, authenticated
-- Policy definition:
true

-- Policy 2: INSERT
-- Operation: INSERT
-- Roles: authenticated
-- Policy definition:
(storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid())

-- Policy 3: DELETE
-- Operation: DELETE
-- Roles: authenticated
-- Policy definition:
EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
)

-- ============================================
-- BUCKET: video-clips
-- ============================================

-- Policy 1: SELECT
-- Operation: SELECT
-- Roles: anon, authenticated
-- Policy definition:
true

-- Policy 2: INSERT
-- Operation: INSERT
-- Roles: authenticated
-- Policy definition:
(storage.foldername(name))[1] = (SELECT tenant_id::text FROM profiles WHERE id = auth.uid())

-- Policy 3: DELETE
-- Operation: DELETE
-- Roles: authenticated
-- Policy definition:
EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'superadmin')
)