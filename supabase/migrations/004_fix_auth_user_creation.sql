-- =================================================================
-- ConversionOS — Fix Auth User Creation
-- Migration 004 | ECC Approved
-- =================================================================
-- Root cause: handle_new_user() trigger aborting the auth.users INSERT
-- when user_profiles INSERT fails for any reason (schema divergence,
-- permissions, constraint). The EXCEPTION handler below ensures user
-- creation always succeeds; profile creation failure is logged only.
-- =================================================================

-- ================================================================
-- 1. RECREATE handle_new_user WITH EXCEPTION SAFETY NET
-- ================================================================
-- Changes vs migration 001:
--   • EXCEPTION WHEN OTHERS → logs warning, RETURNS NEW (never blocks)
--   • Explicit public. prefix on table reference
--   • Defensive NULLIF/TRIM on nullable text fields
--   • COALESCE on email (NOT NULL column safety)
-- ================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    avatar_url,
    preferred_language
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'full_name',  '')), ''),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')), ''),
    COALESCE(
      CASE
        WHEN NEW.raw_user_meta_data ->> 'preferred_language' IN ('en', 'pt', 'es')
        THEN NEW.raw_user_meta_data ->> 'preferred_language'
      END,
      'en'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Profile creation failed — log but NEVER block user creation.
  -- A user without a profile is recoverable; a blocked signup is not.
  RAISE WARNING '[ConversionOS] handle_new_user: could not create profile for user % — %: %',
    NEW.id, SQLSTATE, SQLERRM;
  RETURN NEW;
END;
$$;

-- ================================================================
-- 2. REBUILD TRIGGER (drop + create → guarantees clean state)
-- ================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- 3. ENSURE INSERT POLICY EXISTS ON user_profiles
-- SECURITY DEFINER already bypasses RLS, but an explicit INSERT
-- policy prevents future confusion if function ownership changes.
-- ================================================================

DROP POLICY IF EXISTS "service can insert user profile" ON user_profiles;
CREATE POLICY "service can insert user profile"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- ================================================================
-- 4. VERIFICATION
-- ================================================================

DO $$
DECLARE
  v_trigger_exists  boolean;
  v_function_exists boolean;
  v_table_exists    boolean;
BEGIN
  -- 4a. Trigger on auth.users (pg_trigger is more reliable than
  --     information_schema for the auth schema)
  SELECT EXISTS (
    SELECT 1
    FROM   pg_trigger      t
    JOIN   pg_class        c ON t.tgrelid        = c.oid
    JOIN   pg_namespace    n ON c.relnamespace   = n.oid
    WHERE  n.nspname = 'auth'
      AND  c.relname = 'users'
      AND  t.tgname  = 'on_auth_user_created'
      AND  NOT t.tgisinternal
  ) INTO v_trigger_exists;

  IF NOT v_trigger_exists THEN
    RAISE EXCEPTION 'FAIL: trigger on_auth_user_created not found on auth.users';
  END IF;

  -- 4b. Function exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.routines
    WHERE  routine_schema = 'public'
      AND  routine_name   = 'handle_new_user'
  ) INTO v_function_exists;

  IF NOT v_function_exists THEN
    RAISE EXCEPTION 'FAIL: function public.handle_new_user() not found';
  END IF;

  -- 4c. user_profiles table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE  table_schema = 'public'
      AND  table_name   = 'user_profiles'
  ) INTO v_table_exists;

  IF NOT v_table_exists THEN
    RAISE EXCEPTION 'FAIL: table public.user_profiles not found — run migration 001 first';
  END IF;

  RAISE NOTICE '✓ Migration 004 verified: handle_new_user rebuilt with exception safety, trigger active';
END;
$$;

-- ================================================================
-- 5. DIAGNOSTIC QUERIES (run separately after applying migration)
-- ================================================================

-- A) Confirm trigger is active on auth.users:
-- SELECT tgname, tgenabled
-- FROM pg_trigger t
-- JOIN pg_class c ON t.tgrelid = c.oid
-- JOIN pg_namespace n ON c.relnamespace = n.oid
-- WHERE n.nspname = 'auth' AND c.relname = 'users';

-- B) Confirm function body contains EXCEPTION handler:
-- SELECT routine_definition
-- FROM information_schema.routines
-- WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- C) Detect orphaned auth users (created before this fix):
-- SELECT
--   u.id,
--   u.email,
--   u.created_at,
--   p.id IS NOT NULL   AS has_profile,
--   u.email_confirmed_at IS NOT NULL AS confirmed
-- FROM auth.users u
-- LEFT JOIN public.user_profiles p ON p.id = u.id
-- ORDER BY u.created_at DESC
-- LIMIT 20;

-- D) Manually repair an orphaned user (if any found above):
-- INSERT INTO public.user_profiles (id, email, preferred_language)
-- SELECT id, email, 'en'
-- FROM auth.users
-- WHERE id NOT IN (SELECT id FROM public.user_profiles)
-- ON CONFLICT (id) DO NOTHING;
