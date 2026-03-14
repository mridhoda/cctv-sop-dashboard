-- =====================================================
-- MIGRATION: Signup Multi-Scenario Flow
-- Issue: Memisahkan flow signup Owner vs Member dengan invite codes
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE: invite_codes
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invite_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    
    -- Code untuk di-share (format: TENANT-YYYY-XXXXXX)
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
CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_tenant ON public.invite_codes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invite_codes_created_by ON public.invite_codes(created_by);

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. RLS POLICIES for invite_codes
-- =====================================================

-- Policy: Users can view invite codes dari tenant mereka
CREATE POLICY "Users can view invite codes from their tenant"
    ON public.invite_codes
    FOR SELECT
    USING (
        tenant_id IN (
            SELECT tenant_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- Policy: Only admins can create invite codes
CREATE POLICY "Only admins can create invite codes"
    ON public.invite_codes
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND tenant_id = invite_codes.tenant_id
            AND role IN ('admin', 'superadmin', 'owner')
        )
    );

-- Policy: Only admins can update invite codes
CREATE POLICY "Only admins can update invite codes"
    ON public.invite_codes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND tenant_id = invite_codes.tenant_id
            AND role IN ('admin', 'superadmin', 'owner')
        )
    );

-- Policy: Only admins can delete invite codes
CREATE POLICY "Only admins can delete invite codes"
    ON public.invite_codes
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND tenant_id = invite_codes.tenant_id
            AND role IN ('admin', 'superadmin', 'owner')
        )
    );

-- =====================================================
-- 3. FUNCTION: Generate Invite Code
-- =====================================================
CREATE OR REPLACE FUNCTION public.generate_invite_code(
    p_tenant_id UUID,
    p_role VARCHAR(50) DEFAULT 'viewer',
    p_role_label VARCHAR(100) DEFAULT 'Viewer',
    p_max_uses INTEGER DEFAULT 1,
    p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code VARCHAR(20);
    v_prefix VARCHAR(10);
    v_random VARCHAR(10);
    v_year VARCHAR(4);
BEGIN
    -- Get tenant slug prefix (first 4 chars, uppercase)
    SELECT UPPER(LEFT(slug, 4)) INTO v_prefix 
    FROM public.tenants 
    WHERE id = p_tenant_id;
    
    IF v_prefix IS NULL THEN
        v_prefix := 'USER';
    END IF;
    
    v_year := TO_CHAR(NOW(), 'YYYY');
    
    -- Generate unique code
    LOOP
        v_random := UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));
        v_code := v_prefix || '-' || v_year || '-' || v_random;
        
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM public.invite_codes WHERE code = v_code
        );
    END LOOP;
    
    -- Insert the invite code
    INSERT INTO public.invite_codes (
        tenant_id, code, role, role_label, 
        created_by, max_uses, expires_at
    )
    VALUES (
        p_tenant_id, v_code, p_role, p_role_label,
        auth.uid(), p_max_uses, p_expires_at
    );
    
    RETURN v_code;
END;
$$;

-- =====================================================
-- 4. FUNCTION: Validate Invite Code
-- =====================================================
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code VARCHAR(20))
RETURNS TABLE (
    valid BOOLEAN,
    tenant_id UUID,
    tenant_name VARCHAR(255),
    role VARCHAR(50),
    role_label VARCHAR(100),
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invite RECORD;
BEGIN
    -- Cari invite code
    SELECT * INTO v_invite
    FROM public.invite_codes
    WHERE code = p_code;
    
    -- Check if exists
    IF v_invite IS NULL THEN
        RETURN QUERY SELECT 
            false::BOOLEAN, 
            NULL::UUID, 
            NULL::VARCHAR(255), 
            NULL::VARCHAR(50), 
            NULL::VARCHAR(100),
            'Kode undangan tidak ditemukan'::TEXT;
        RETURN;
    END IF;
    
    -- Check if active
    IF NOT v_invite.is_active THEN
        RETURN QUERY SELECT 
            false::BOOLEAN, 
            NULL::UUID, 
            NULL::VARCHAR(255), 
            NULL::VARCHAR(50), 
            NULL::VARCHAR(100),
            'Kode undangan sudah tidak aktif'::TEXT;
        RETURN;
    END IF;
    
    -- Check if expired
    IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < NOW() THEN
        RETURN QUERY SELECT 
            false::BOOLEAN, 
            NULL::UUID, 
            NULL::VARCHAR(255), 
            NULL::VARCHAR(50), 
            NULL::VARCHAR(100),
            'Kode undangan sudah expired'::TEXT;
        RETURN;
    END IF;
    
    -- Check max uses
    IF v_invite.max_uses IS NOT NULL AND v_invite.used_count >= v_invite.max_uses THEN
        RETURN QUERY SELECT 
            false::BOOLEAN, 
            NULL::UUID, 
            NULL::VARCHAR(255), 
            NULL::VARCHAR(50), 
            NULL::VARCHAR(100),
            'Kode undangan sudah mencapai batas penggunaan'::TEXT;
        RETURN;
    END IF;
    
    -- Valid - return tenant info
    RETURN QUERY SELECT 
        true::BOOLEAN,
        t.id,
        t.name::VARCHAR(255),
        v_invite.role,
        v_invite.role_label,
        NULL::TEXT
    FROM public.tenants t
    WHERE t.id = v_invite.tenant_id;
    
END;
$$;

-- =====================================================
-- 5. UPDATE TRIGGER: handle_new_user() untuk multi-scenario
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tenant_id UUID;
    v_role VARCHAR(50);
    v_role_label VARCHAR(100);
    v_company_name VARCHAR(255);
    v_invite_code VARCHAR(20);
    v_validation_result RECORD;
BEGIN
    -- Ambil data dari metadata
    v_company_name := NEW.raw_user_meta_data->>'company_name';
    v_invite_code := NEW.raw_user_meta_data->>'invite_code';
    
    -- =================================================
    -- SCENARIO 1: Owner membuat tenant baru
    -- =================================================
    IF v_company_name IS NOT NULL AND v_invite_code IS NULL THEN
        -- Buat tenant baru
        INSERT INTO public.tenants (
            name, 
            slug,
            plan_tier,
            limits
        )
        VALUES (
            v_company_name,
            LOWER(REGEXP_REPLACE(v_company_name, '[^a-zA-Z0-9]+', '-', 'g')),
            'defense',
            '{"max_cameras": 1, "max_users": 3}'::jsonb
        )
        RETURNING id INTO v_tenant_id;
        
        v_role := 'admin';
        v_role_label := 'Administrator';
        
    -- =================================================
    -- SCENARIO 2: Join via invite code
    -- =================================================
    ELSIF v_invite_code IS NOT NULL THEN
        -- Validate invite code
        SELECT * INTO v_validation_result
        FROM public.validate_invite_code(v_invite_code);
        
        IF NOT v_validation_result.valid THEN
            RAISE EXCEPTION 'Invalid invite code: %', v_validation_result.error_message;
        END IF;
        
        v_tenant_id := v_validation_result.tenant_id;
        v_role := v_validation_result.role;
        v_role_label := v_validation_result.role_label;
        
        -- Increment used_count dan update status jika perlu
        UPDATE public.invite_codes
        SET 
            used_count = used_count + 1,
            is_active = CASE 
                WHEN max_uses IS NOT NULL AND used_count + 1 >= max_uses 
                THEN false 
                ELSE is_active 
            END
        WHERE code = v_invite_code;
        
    ELSE
        RAISE EXCEPTION 'Either company_name or invite_code must be provided';
    END IF;
    
    -- =================================================
    -- Create profile untuk kedua scenario
    -- =================================================
    INSERT INTO public.profiles (
        id, 
        tenant_id, 
        username, 
        name, 
        email, 
        role, 
        role_label, 
        is_active
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
EXCEPTION
    WHEN OTHERS THEN
        -- Log error untuk debugging
        RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
        RAISE;
END;
$$;

-- =====================================================
-- 6. UPDATE TRIGGER: Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Create trigger untuk invite_codes
DROP TRIGGER IF EXISTS update_invite_codes_updated_at ON public.invite_codes;
CREATE TRIGGER update_invite_codes_updated_at
    BEFORE UPDATE ON public.invite_codes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================
-- Grant execute permissions untuk functions
GRANT EXECUTE ON FUNCTION public.generate_invite_code TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_invite_code TO anon;
GRANT EXECUTE ON FUNCTION public.validate_invite_code TO authenticated;

-- =====================================================
-- 8. VERIFICATION QUERIES (uncomment untuk test)
-- =====================================================
/*
-- Test 1: Check invite_codes table
SELECT * FROM public.invite_codes LIMIT 1;

-- Test 2: Check validate function
SELECT * FROM public.validate_invite_code('TEST-CODE-123');

-- Test 3: Check trigger function exists
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';
*/

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
SELECT 'Migration signup_multi_scenario completed successfully!' as status;
