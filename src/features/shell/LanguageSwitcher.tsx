import { useTranslation } from 'react-i18next'
import type { SupportedLanguage } from '@/types'

const LANGS: { code: SupportedLanguage; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
]

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const current = (i18n.resolvedLanguage ?? 'en') as SupportedLanguage

  const handleChange = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang)
  }

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <select
        value={current}
        onChange={e => handleChange(e.target.value as SupportedLanguage)}
        aria-label="Language"
        style={{
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-sm)',
          padding: '0.25rem 1.75rem 0.25rem 0.625rem',
          cursor: 'pointer',
          appearance: 'none',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.5rem center',
          outline: 'none',
        }}
      >
        {LANGS.map(l => (
          <option key={l.code} value={l.code} style={{ background: 'var(--color-surface-elevated)' }}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  )
}
