/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SENTRY_DSN?: string

  // REMOVE OR DISABLE BEFORE GO LIVE
  readonly VITE_DISABLE_AUTH?: string
  readonly VITE_DEV_USER_ID?: string
  readonly VITE_DEV_ORG_ID?: string
  readonly VITE_DEV_USER_EMAIL?: string

  // REMOVE OR DISABLE BEFORE GO LIVE
  readonly VITE_ENABLE_PASSWORD_LOGIN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
