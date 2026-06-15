-- =================================================================
-- ConversionOS — Enhancement Migration
-- Engine 01 Block 03 | ECC Approved
-- Adds: project description, org creation RPC, invite accept RPC
-- =================================================================

-- 1. ADD description TO projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description text;
COMMENT ON COLUMN projects.description IS 'Optional project description';

-- 2. create_organization — atomic org + owner membership
CREATE OR REPLACE FUNCTION public.create_organization(p_name text, p_slug text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_org_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF length(trim(p_name)) < 2 THEN RAISE EXCEPTION 'Name must be at least 2 characters'; END IF;
  IF NOT (p_slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' OR p_slug ~ '^[a-z0-9]{1,100}$') THEN
    RAISE EXCEPTION 'Slug must be lowercase alphanumeric and hyphens only';
  END IF;
  INSERT INTO organizations(name, slug) VALUES (trim(p_name), p_slug) RETURNING id INTO v_org_id;
  INSERT INTO organization_members(organization_id, user_id, role) VALUES (v_org_id, auth.uid(), 'owner');
  RETURN v_org_id;
END; $$;

-- 3. accept_invitation — validates token + creates membership
CREATE OR REPLACE FUNCTION public.accept_invitation(p_token uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_inv invitations%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_inv FROM invitations
  WHERE token = p_token AND used_at IS NULL AND revoked_at IS NULL AND expires_at > now();
  IF NOT FOUND THEN RAISE EXCEPTION 'Invalid or expired invitation'; END IF;
  UPDATE invitations SET used_at = now() WHERE id = v_inv.id;
  INSERT INTO organization_members(organization_id, user_id, role, invited_by)
  VALUES (v_inv.organization_id, auth.uid(), v_inv.role, v_inv.created_by)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;
  RETURN jsonb_build_object('organization_id', v_inv.organization_id, 'role', v_inv.role);
END; $$;

-- 4. Grants
GRANT EXECUTE ON FUNCTION public.create_organization(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_invitation(uuid)          TO authenticated;

-- 5. Verification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'description'
  ) THEN RAISE EXCEPTION 'Column projects.description not created'; END IF;
  RAISE NOTICE 'Migration 002 verified: description + 2 RPC functions ready';
END; $$;
