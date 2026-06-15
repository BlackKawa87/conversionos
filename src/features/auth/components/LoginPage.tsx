import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/providers/supabase'

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await supabase.auth.signInWithOtp({ email })
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '2rem',
        background: 'var(--bg-card)',
        border: '1px solid var(--bg-border)',
        borderRadius: 12,
      }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', marginBottom: '0.25rem' }}>
          {t('app.name')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          {t('app.tagline')}
        </p>

        {sent ? (
          <p style={{ color: 'var(--accent)', textAlign: 'center' }}>{t('auth.magicLinkSent')}</p>
        ) : (
          <form onSubmit={handleMagicLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                {t('auth.email')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--bg-border)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.625rem',
                background: 'var(--accent)',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t('auth.loading') : t('auth.magicLink')}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
