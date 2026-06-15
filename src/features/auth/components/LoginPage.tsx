import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2 } from 'lucide-react'
import { Button, Input, Badge } from '@/design-system'
import { supabase } from '@/providers/supabase'
import { DEV_BYPASS_ACTIVE, DEV_BYPASS_VALID, DEV_BYPASS_ERROR } from '../devBypass'

// REMOVE OR DISABLE BEFORE GO LIVE — controls dev badge only
const PASSWORD_LOGIN_ENABLED = import.meta.env.VITE_ENABLE_PASSWORD_LOGIN === 'true'

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'E-mail ou senha incorretos.'
  if (message.includes('Email not confirmed'))
    return 'E-mail não confirmado. Acesse Supabase Dashboard → Authentication → Users e confirme o e-mail manualmente.'
  if (message.includes('User not found'))
    return 'Usuário não encontrado.'
  if (message.includes('Failed to fetch') || message.includes('NetworkError'))
    return 'Erro de conexão. Verifique sua internet e tente novamente.'
  return 'Erro ao autenticar. Tente novamente.'
}

// REMOVE OR DISABLE BEFORE GO LIVE
function BypassConfigError() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
      <div style={{ width: '100%', maxWidth: 480, padding: '2rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          DEV BYPASS — CONFIGURATION ERROR
        </p>
        <p style={{ color: 'var(--color-text-primary)', fontSize: '0.9375rem', marginBottom: '1rem' }}>
          {DEV_BYPASS_ERROR}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
          Set <code style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>VITE_DEV_USER_ID</code> and{' '}
          <code style={{ fontFamily: 'var(--font-mono)', color: '#ef4444' }}>VITE_DEV_ORG_ID</code> in{' '}
          <code style={{ fontFamily: 'var(--font-mono)' }}>.env.local</code> and restart the dev server.
        </p>
      </div>
    </div>
  )
}

function SampleDiagnosis() {
  const { t } = useTranslation()
  return (
    <div className="login-story-extras" style={{ position: 'relative', marginTop: '2rem' }}>
      <div style={{
        position: 'absolute', top: -10, right: 0, zIndex: 1,
        background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.35)',
        borderRadius: 4, padding: '2px 8px',
        fontSize: '0.6rem', fontWeight: 700, color: '#fbbf24',
        letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
      }}>
        {t('auth.sampleBadge')}
      </div>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderLeft: '3px solid #ef4444',
        borderRadius: 8, padding: '1rem', pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', fontWeight: 700, color: '#ef4444', letterSpacing: '0.06em' }}>
            CRITICAL — Checkout Step
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'rgba(255,255,255,0.3)' }}>7d</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>72%</span>
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.8125rem' }}>drop-off</span>
        </div>
        <div style={{ fontSize: '0.8125rem', color: '#fca5a5', fontVariantNumeric: 'tabular-nums', marginBottom: '0.75rem' }}>
          ~$3,400 / week revenue at risk
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.625rem' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Action
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
            Reduce form fields. Fix CTA visibility on mobile checkout.
          </div>
        </div>
      </div>
    </div>
  )
}

function StoryPanel() {
  const { t } = useTranslation()
  const benefits = [t('auth.benefit1'), t('auth.benefit2'), t('auth.benefit3')]
  return (
    <div className="login-story" style={{
      background: '#1E2A4A',
      padding: '3.5rem 3rem',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      minHeight: '100dvh',
    }}>
      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', fontSize: '0.6875rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
          Conversion Intelligence Platform
        </p>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: '#fff', letterSpacing: '-0.01em' }}>
          ConversionOS
        </span>
      </div>
      <h2 style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)', fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
        {t('auth.headline')}
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.65, marginBottom: '2.25rem', maxWidth: 420 }}>
        {t('auth.subheadline')}
      </p>
      <div className="login-story-extras" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {benefits.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CheckCircle2 size={15} style={{ color: '#60A5FA', flexShrink: 0 }} aria-hidden />
            <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.9375rem' }}>{b}</span>
          </div>
        ))}
      </div>
      <SampleDiagnosis />
    </div>
  )
}

function AuthErrorBox({ message }: { message: string }) {
  return (
    <div role="alert" style={{
      padding: '0.625rem 0.875rem',
      background: 'var(--color-danger-dim)',
      border: '1px solid var(--color-danger)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-danger-text)',
      lineHeight: 1.55,
    }}>
      {message}
    </div>
  )
}

function OrDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
      <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
    </div>
  )
}

export default function LoginPage() {
  const { t } = useTranslation()

  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [sent,      setSent]      = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // 'password' is the default mode — always shown
  const [mode, setMode] = useState<'password' | 'magic'>('password')

  // REMOVE OR DISABLE BEFORE GO LIVE
  if (DEV_BYPASS_ACTIVE && !DEV_BYPASS_VALID) return <BypassConfigError />
  if (DEV_BYPASS_ACTIVE && DEV_BYPASS_VALID)  return <Navigate to="/" replace />

  const clearError = () => setAuthError(null)

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(mapAuthError(error.message))
      setLoading(false)
    }
    // Success: onAuthStateChange in useAuth → isAuthenticated → AuthGuard clears
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearError()
    await supabase.auth.signInWithOtp({ email })
    setSent(true)
    setLoading(false)
  }

  return (
    <>
      <div className="login-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100dvh' }}>

        {/* ── LEFT: Product Story ── */}
        <StoryPanel />

        {/* ── RIGHT: Login Form ── */}
        <div className="login-form-panel" style={{
          background: 'var(--color-bg-page, #F7F8FB)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '2.5rem 2rem',
        }}>
          <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '2rem',
              boxShadow: 'var(--shadow-md)',
            }}>

              {/* Header */}
              <div style={{ marginBottom: '1.75rem' }}>
                {/* REMOVE OR DISABLE BEFORE GO LIVE — dev badge only */}
                {PASSWORD_LOGIN_ENABLED && (
                  <div style={{ marginBottom: '0.875rem' }}>
                    <Badge variant="warning">DEV — Password Login Active</Badge>
                  </div>
                )}
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '0.3rem', letterSpacing: '-0.01em' }}>
                  {t('auth.welcome')}
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                  {t('auth.signInContinue')}
                </p>
              </div>

              {/* ── Password form (default) ── */}
              {mode === 'password' && (
                <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input
                    label={t('auth.email')}
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); clearError() }}
                  />
                  <Input
                    label={t('auth.password')}
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError() }}
                  />

                  {authError && <AuthErrorBox message={authError} />}

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    style={{ width: '100%', marginTop: '0.125rem' }}
                  >
                    {t('auth.enterWithPassword')}
                  </Button>

                  <OrDivider label="ou" />

                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    style={{ width: '100%' }}
                    onClick={() => { setMode('magic'); clearError() }}
                  >
                    {t('auth.switchToMagicLink')}
                  </Button>
                </form>
              )}

              {/* ── Magic link form ── */}
              {mode === 'magic' && (
                sent ? (
                  <p style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--color-accent)', fontSize: 'var(--text-base)', lineHeight: 1.5 }}>
                    {t('auth.magicLinkSent')}
                  </p>
                ) : (
                  <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Input
                      label={t('auth.email')}
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); clearError() }}
                    />

                    {authError && <AuthErrorBox message={authError} />}

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={loading}
                      style={{ width: '100%', marginTop: '0.125rem' }}
                    >
                      {t('auth.magicLink')}
                    </Button>

                    <OrDivider label="ou" />

                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      style={{ width: '100%' }}
                      onClick={() => { setMode('password'); clearError() }}
                    >
                      {t('auth.switchToPassword')}
                    </Button>
                  </form>
                )
              )}

            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 860px) {
          .login-grid         { grid-template-columns: 1fr !important; }
          .login-story        { min-height: auto !important; padding: 2rem 1.5rem !important; justify-content: flex-start !important; }
          .login-story-extras { display: none !important; }
          .login-form-panel   { padding: 1.75rem 1rem !important; }
        }
      `}</style>
    </>
  )
}
