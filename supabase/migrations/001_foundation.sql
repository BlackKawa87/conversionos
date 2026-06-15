-- =================================================================
-- ConversionOS — Foundation Engine Migration
-- Engine 01 | ECC Approved
-- Order: tables → index → functions → RLS → triggers → verify
-- =================================================================

-- ================================================================
-- 1. TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id                  uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               text NOT NULL,
  full_name           text,
  avatar_url          text,
  preferred_language  text NOT NULL DEFAULT 'en'
                        CHECK (preferred_language IN ('en', 'pt', 'es')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organizations (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name           text NOT NULL,
  slug           text NOT NULL UNIQUE,
  plan           text NOT NULL DEFAULT 'free'
                   CHECK (plan IN ('free', 'pro', 'agency', 'enterprise')),
  billing_email  text,
  logo_url       text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_members (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role             text NOT NULL CHECK (role IN ('owner', 'admin', 'analyst', 'viewer')),
  invited_by       uuid REFERENCES auth.users(id),
  joined_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS projects (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             text NOT NULL,
  domain           text,
  tracker_key      text NOT NULL UNIQUE
                     DEFAULT encode(gen_random_bytes(24), 'base64url'),
  status           text NOT NULL DEFAULT 'setup'
                     CHECK (status IN ('setup', 'active', 'paused', 'archived')),
  created_by       uuid NOT NULL REFERENCES auth.users(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invitations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email             text NOT NULL,
  role              text NOT NULL CHECK (role IN ('admin', 'analyst', 'viewer')),
  token             uuid NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  invitee_language  text NOT NULL DEFAULT 'en'
                      CHECK (invitee_language IN ('en', 'pt', 'es')),
  created_by        uuid NOT NULL REFERENCES auth.users(id),
  expires_at        timestamptz NOT NULL DEFAULT now() + INTERVAL '7 days',
  used_at           timestamptz,
  revoked_at        timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id         uuid NOT NULL REFERENCES auth.users(id),
  action           text NOT NULL,
  resource_type    text NOT NULL,
  resource_id      uuid,
  ip_address       inet,
  user_agent       text,
  metadata         jsonb NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ================================================================
-- 2. INDEXES
-- Critical index first — every RLS function queries this.
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_org_members_user_org
  ON organization_members(user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_projects_org
  ON projects(organization_id);

CREATE INDEX IF NOT EXISTS idx_projects_status
  ON projects(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_invitations_token
  ON invitations(token)
  WHERE used_at IS NULL AND revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invitations_org
  ON invitations(organization_id);

CREATE INDEX IF NOT EXISTS idx_audit_org_created
  ON audit_logs(organization_id, created_at DESC);

-- ================================================================
-- 3. HELPER FUNCTIONS
-- Now that organization_members exists, these compile correctly.
-- SECURITY DEFINER so RLS policies can call them safely.
-- ================================================================

CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS uuid[]
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY(
    SELECT organization_id
    FROM organization_members
    WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_role_in_org(org_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM organization_members
  WHERE user_id = auth.uid() AND organization_id = org_id
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND role IN ('owner', 'admin')
  );
$$;

-- ================================================================
-- 4. ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects             ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

-- user_profiles
DROP POLICY IF EXISTS "users can read own profile" ON user_profiles;
CREATE POLICY "users can read own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

DROP POLICY IF EXISTS "users can update own profile" ON user_profiles;
CREATE POLICY "users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- organizations
DROP POLICY IF EXISTS "org members can read org" ON organizations;
CREATE POLICY "org members can read org"
  ON organizations FOR SELECT
  USING (id = ANY(public.user_org_ids()));

DROP POLICY IF EXISTS "org admins can update org" ON organizations;
CREATE POLICY "org admins can update org"
  ON organizations FOR UPDATE
  USING (public.is_org_admin(id))
  WITH CHECK (public.is_org_admin(id));

-- organization_members
DROP POLICY IF EXISTS "members can read org members" ON organization_members;
CREATE POLICY "members can read org members"
  ON organization_members FOR SELECT
  USING (organization_id = ANY(public.user_org_ids()));

DROP POLICY IF EXISTS "admins can insert members" ON organization_members;
CREATE POLICY "admins can insert members"
  ON organization_members FOR INSERT
  WITH CHECK (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "admins can update member roles" ON organization_members;
CREATE POLICY "admins can update member roles"
  ON organization_members FOR UPDATE
  USING (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "admins can remove members" ON organization_members;
CREATE POLICY "admins can remove members"
  ON organization_members FOR DELETE
  USING (public.is_org_admin(organization_id));

-- projects
DROP POLICY IF EXISTS "members can read projects" ON projects;
CREATE POLICY "members can read projects"
  ON projects FOR SELECT
  USING (organization_id = ANY(public.user_org_ids()));

DROP POLICY IF EXISTS "admins can create projects" ON projects;
CREATE POLICY "admins can create projects"
  ON projects FOR INSERT
  WITH CHECK (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "admins can update projects" ON projects;
CREATE POLICY "admins can update projects"
  ON projects FOR UPDATE
  USING (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "owners can delete projects" ON projects;
CREATE POLICY "owners can delete projects"
  ON projects FOR DELETE
  USING (public.user_role_in_org(organization_id) = 'owner');

-- invitations
DROP POLICY IF EXISTS "admins can read invitations" ON invitations;
CREATE POLICY "admins can read invitations"
  ON invitations FOR SELECT
  USING (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "admins can create invitations" ON invitations;
CREATE POLICY "admins can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "admins can update invitations" ON invitations;
CREATE POLICY "admins can update invitations"
  ON invitations FOR UPDATE
  USING (public.is_org_admin(organization_id));

-- audit_logs
DROP POLICY IF EXISTS "admins can read audit logs" ON audit_logs;
CREATE POLICY "admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (public.is_org_admin(organization_id));

DROP POLICY IF EXISTS "members can insert audit logs" ON audit_logs;
CREATE POLICY "members can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (organization_id = ANY(public.user_org_ids()));

-- ================================================================
-- 5. TRIGGERS
-- ================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create user_profile on signup.
-- SECURITY DEFINER: fires before the new user has a session,
-- so it needs elevated privileges to write to user_profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, avatar_url, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    COALESCE(
      CASE WHEN NEW.raw_user_meta_data ->> 'preferred_language'
           IN ('en', 'pt', 'es')
           THEN NEW.raw_user_meta_data ->> 'preferred_language'
           ELSE NULL END,
      'en'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 6. VERIFICATION
-- ================================================================

DO $$
DECLARE
  tbl text;
  idx_exists boolean;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'user_profiles','organizations','organization_members',
    'projects','invitations','audit_logs'
  ] LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = tbl
    ) THEN
      RAISE EXCEPTION 'Table % not created', tbl;
    END IF;
  END LOOP;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'organization_members'
      AND indexname = 'idx_org_members_user_org'
  ) INTO idx_exists;

  IF NOT idx_exists THEN
    RAISE EXCEPTION 'Critical index idx_org_members_user_org not created';
  END IF;

  RAISE NOTICE 'Foundation migration verified: all 6 tables + critical index present';
END;
$$;
