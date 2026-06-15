-- =================================================================
-- ConversionOS — Project Engine Migration
-- Engine 02 | ECC Approved
-- =================================================================

-- ================================================================
-- 1. EXTEND projects TABLE
-- ================================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS funnel_type   text
    CHECK (funnel_type IN ('quiz','vsl','leadgen','webinar','ecommerce','low_ticket','paywall','custom')),
  ADD COLUMN IF NOT EXISTS platform      text
    CHECK (platform IN ('shopify','wordpress','webflow','framer','gohighlevel','clickfunnels','react','nextjs','lovable','custom')),
  ADD COLUMN IF NOT EXISTS support_mode  text
    CHECK (support_mode IN ('diagnosis_only','assisted_optimization','automated_actions_supported')),
  ADD COLUMN IF NOT EXISTS base_url      text,
  ADD COLUMN IF NOT EXISTS is_active     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS setup_completed boolean NOT NULL DEFAULT false;

-- public_tracking_id: safe public identifier for snippet
ALTER TABLE projects ADD COLUMN IF NOT EXISTS public_tracking_id text UNIQUE;
UPDATE projects SET public_tracking_id = encode(gen_random_bytes(12), 'base64url') WHERE public_tracking_id IS NULL;
ALTER TABLE projects ALTER COLUMN public_tracking_id SET DEFAULT encode(gen_random_bytes(12), 'base64url');
ALTER TABLE projects ALTER COLUMN public_tracking_id SET NOT NULL;

-- ================================================================
-- 2. project_steps TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS project_steps (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_name    text        NOT NULL,
  step_type    text        NOT NULL
    CHECK (step_type IN ('landing','quiz_step','processing','results','paywall','checkout','upsell','thank_you','lead_capture','custom')),
  step_index   integer     NOT NULL DEFAULT 0,
  url_pattern  text,
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  project_steps            IS 'Ordered steps of a funnel project';
COMMENT ON COLUMN project_steps.step_index IS 'Zero-based display order';

-- ================================================================
-- 3. INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_project_steps_project
  ON project_steps(project_id, step_index);

CREATE INDEX IF NOT EXISTS idx_project_steps_project_active
  ON project_steps(project_id) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_projects_public_tracking_id
  ON projects(public_tracking_id);

-- ================================================================
-- 4. HELPER FUNCTIONS for project_steps RLS
-- ================================================================

CREATE OR REPLACE FUNCTION public.is_project_member(p_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = p_project_id
      AND p.organization_id = ANY(public.user_org_ids())
  );
$$;

CREATE OR REPLACE FUNCTION public.is_project_contributor(p_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    JOIN organization_members m ON m.organization_id = p.organization_id
    WHERE p.id = p_project_id
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'analyst')
  );
$$;

-- ================================================================
-- 5. RLS on project_steps
-- ================================================================

ALTER TABLE project_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "members can read project steps"  ON project_steps;
CREATE POLICY "members can read project steps"
  ON project_steps FOR SELECT
  USING (public.is_project_member(project_id));

DROP POLICY IF EXISTS "contributors can create project steps" ON project_steps;
CREATE POLICY "contributors can create project steps"
  ON project_steps FOR INSERT
  WITH CHECK (public.is_project_contributor(project_id));

DROP POLICY IF EXISTS "contributors can update project steps" ON project_steps;
CREATE POLICY "contributors can update project steps"
  ON project_steps FOR UPDATE
  USING (public.is_project_contributor(project_id));

DROP POLICY IF EXISTS "contributors can delete project steps" ON project_steps;
CREATE POLICY "contributors can delete project steps"
  ON project_steps FOR DELETE
  USING (public.is_project_contributor(project_id));

-- ================================================================
-- 6. GRANTS
-- ================================================================

GRANT EXECUTE ON FUNCTION public.is_project_member(uuid)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_project_contributor(uuid)  TO authenticated;

-- ================================================================
-- 7. VERIFICATION
-- ================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'project_steps'
  ) THEN RAISE EXCEPTION 'Table project_steps not created'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'projects'
      AND column_name = 'public_tracking_id'
  ) THEN RAISE EXCEPTION 'Column projects.public_tracking_id not created'; END IF;

  RAISE NOTICE 'Migration 003 verified: project_steps + 6 new project columns ready';
END; $$;
