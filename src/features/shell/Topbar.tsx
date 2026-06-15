import { useTranslation } from 'react-i18next'
import { Menu, LogOut, User } from 'lucide-react'
import { supabase } from '@/providers/supabase'
import { LanguageSwitcher } from './LanguageSwitcher'

interface TopbarProps {
  onMenuToggle: () => void
  orgName?: string
}

export function Topbar({ onMenuToggle, orgName }: TopbarProps) {
  const { t } = useTranslation('shell')

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header
      aria-label="Topbar"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 'var(--topbar-height)',
        background: 'var(--color-bg-card)',
        borderBottom: '1px solid var(--color-bg-border)',
        display: 'flex', alignItems: 'center',
        padding: '0 1rem', gap: '0.75rem',
        zIndex: 100,
      }}
    >
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        aria-label={t('nav.menu', 'Open menu')}
        className="topbar-menu-btn"
        style={{
          background: 'none', border: 'none', color: 'var(--color-text-muted)',
          cursor: 'pointer', padding: '0.25rem', display: 'none',
          borderRadius: 'var(--radius-sm)',
        }}
      >
        <Menu size={20} />
      </button>

      {/* Sidebar offset on desktop */}
      <div className="topbar-sidebar-spacer" style={{ width: 'var(--sidebar-width)', flexShrink: 0 }} />

      {/* Org name */}
      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {orgName ?? 'ConversionOS'}
      </span>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <LanguageSwitcher />

        <button
          aria-label={t('topbar.profile', 'Profile')}
          style={{ background: 'none', border: '1px solid var(--color-bg-border)', borderRadius: 'var(--radius-full)', padding: '0.375rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}
        >
          <User size={16} />
        </button>

        <button
          onClick={handleLogout}
          aria-label={t('topbar.logout', 'Sign out')}
          title={t('topbar.logout', 'Sign out')}
          style={{ background: 'none', border: 'none', color: 'var(--color-text-faint)', cursor: 'pointer', padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
        >
          <LogOut size={16} />
        </button>
      </div>

      <style>{`
        @media (max-width: 1023px) {
          .topbar-menu-btn      { display: flex !important; }
          .topbar-sidebar-spacer { display: none !important; }
        }
      `}</style>
    </header>
  )
}
