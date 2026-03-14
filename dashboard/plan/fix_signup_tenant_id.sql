-- =====================================================
-- FIX: Update trigger handle_new_user untuk mengisi tenant_id
-- Issue: Error 500 saat signup karena profiles.tenant_id NOT NULL
-- tapi trigger tidak mengisi kolom tersebut
-- =====================================================

-- 1. Update function handle_new_user agar mengisi tenant_id
--    dengan tenant pertama (default tenant) dari tabel tenants
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_tenant_id UUID;
BEGIN
    -- Ambil tenant_id pertama (default tenant)
    SELECT id INTO default_tenant_id FROM public.tenants ORDER BY created_at LIMIT 1;
    
    -- Jika tidak ada tenant, raise error
    IF default_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No default tenant found. Please create a tenant first.';
    END IF;

    INSERT INTO public.profiles (
        id, 
        tenant_id,  -- ← TAMBAH INI
        username, 
        name, 
        email, 
        role, 
        role_label
    )
    VALUES (
        NEW.id,
        default_tenant_id,  -- ← TAMBAH INI
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'name',
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
        COALESCE(NEW.raw_user_meta_data->>'role_label', 'Viewer')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Verifikasi trigger masih aktif
-- (Trigger on_auth_user_created akan otomatis menggunakan function yang baru)

-- 3. Test: Cek apakah tenant default ada
-- SELECT id, name, slug FROM public.tenants ORDER BY created_at LIMIT 1;
