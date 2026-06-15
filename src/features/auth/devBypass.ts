// REMOVE OR DISABLE BEFORE GO LIVE
// Controls: VITE_DISABLE_AUTH=true in .env.local

const BYPASS_ENABLED  = import.meta.env.VITE_DISABLE_AUTH === 'true'
const DEV_USER_ID     = import.meta.env.VITE_DEV_USER_ID   ?? ''
const DEV_ORG_ID      = import.meta.env.VITE_DEV_ORG_ID    ?? ''
const DEV_USER_EMAIL  = import.meta.env.VITE_DEV_USER_EMAIL ?? ''

if (BYPASS_ENABLED) {
  console.warn(
    '%c[ConversionOS] Auth is DISABLED for development. Do not use this configuration in production.',
    'color: #f59e0b; font-weight: bold; font-size: 12px;',
  )
}

export const DEV_BYPASS_ACTIVE = BYPASS_ENABLED

// Valid only if bypass is on AND both required IDs are present
export const DEV_BYPASS_VALID = BYPASS_ENABLED
  ? !!(DEV_USER_ID && DEV_ORG_ID)
  : true

export const DEV_BYPASS_ERROR: string | null =
  BYPASS_ENABLED && !DEV_BYPASS_VALID
    ? `ConversionOS Dev Bypass: VITE_DISABLE_AUTH=true but ${!DEV_USER_ID ? 'VITE_DEV_USER_ID' : 'VITE_DEV_ORG_ID'} is missing.`
    : null

export const DEV_CONFIG = {
  userId:    DEV_USER_ID,
  orgId:     DEV_ORG_ID,
  userEmail: DEV_USER_EMAIL || 'dev@conversionos.local',
} as const
