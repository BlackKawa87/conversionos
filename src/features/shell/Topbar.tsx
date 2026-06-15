import { useTranslation } from 'react-i18next'
import { Menu, LogOut, User, Sun, Moon } from 'lucide-react'
import { supabase } from '@/providers/supabase'
import { useTheme } from '@/hooks/useTheme'
import { LanguageSwitcher } from './LanguageSwitcher'
import { DEV_BYPASS_ACTIVE } from '@/features/auth/devBypass'

interface TopbarProps {
  onMenuToggle: () => void
  orgName?: string
}

// REMOVE OR DISABLE BEFORE GO LIVE
const devBadgeStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '0.1875rem 0.5rem',
  background: 'rgba(245, 158, 11, 0.12)',
  border: '1px solid rgba(245, 158, 11, 0.5)',
  borderRadius: 'var(--radius-full)',
  fontSize: '0.6875rem', fontWeight: 700,
  color: '#f59e0b',
  letterSpacing: '0.04em',
  fontFamily: 'var(--font-mono)',
  flexShrink: 0,
}

export function Topbar({ onMenuToggle, orgName }: TopbarProps) {
  const { t } = useTranslation('shell')
  const { isDark, toggle } = useTheme()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const iconBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', color: 'var(--color-text-secondary)',
    cursor: 'pointer', padding: '0.375rem', borderRadius: 'var(--radius-sm)',
    display: 'flex', alignItems: 'center', transition: 'color var(--transition-fast)',
  }

  return (
    <header
      aria-label="Topbar"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'var(--topbar-height)',
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 1rem', gap: '0.75rem',
        zIndex: 'var(--z-sticky)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        aria-label={t('nav.menu', 'Open menu')}
        className="topbar-menu-btn"
        style={{ ...iconBtnStyle, display: 'none' }}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar offset on desktop */}
      <div className="topbar-sidebar-spacer" style={{ width: 'var(--sidebar-width)', flexShrink: 0 }} />

      {/* Org name */}
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {orgName ?? 'ConversionOS'}
      </span>

      {/* Dev bypass badge — REMOVE OR DISABLE BEFORE GO LIVE */}
      {DEV_BYPASS_ACTIVE && (
        <span style={devBadgeStyle} role="status" aria-label="Development auth bypass active">
          Auth Disabled — Dev Only
        </span>
      )}

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <LanguageSwitcher />

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label={isDark ? t('topbar.lightMode', 'Switch to light mode') : t('topbar.darkMode', 'Switch to dark mode')}
          title={isDark ? t('topbar.lightMode', 'Light mode') : t('topbar.darkMode', 'Dark mode')}
          style={iconBtnStyle}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          aria-label={t('topbar.profile', 'Profile')}
          style={{ ...iconBtnStyle, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '0.375rem' }}
        >
          <User size={16} />
        </button>

        <button
          onClick={handleLogout}
          aria-label={t('topbar.logout', 'Sign out')}
          title={t('topbar.logout', 'Sign out')}
          style={{ ...iconBtnStyle, color: 'var(--color-text-faint)' }}
        >
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .topbar-menu-btn       { display: flex !important; }
          .topbar-sidebar-spacer { display: none !important; }
        }
      `}</style>
    </header>
  )
}
