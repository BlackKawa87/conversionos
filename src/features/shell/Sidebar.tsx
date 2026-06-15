import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, FolderKanban, Bell, Settings, X } from 'lucide-react'

interface NavItem { key: string; to: string; icon: React.ReactNode }

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', to: '/',        icon: <LayoutDashboard size={16} aria-hidden /> },
  { key: 'projects',  to: '/projects', icon: <FolderKanban    size={16} aria-hidden /> },
  { key: 'alerts',    to: '/alerts',   icon: <Bell            size={16} aria-hidden /> },
  { key: 'settings',  to: '/settings', icon: <Settings        size={16} aria-hidden /> },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useTranslation('shell')

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: 'var(--sidebar-width)',
    background: 'var(--color-surface)',
    borderRight: '1px solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    transition: 'transform var(--transition-base)',
  }

  return (
    <>
      {open && (
        <div
          aria-hidden
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'var(--color-bg-overlay)',
            zIndex: 99, display: 'none',
          }}
          className="sidebar-overlay"
        />
      )}

      <nav
        aria-label={t('nav.label', 'Main navigation')}
        style={sidebarStyle}
      >
        {/* Logo */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1rem',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--color-brand)' }}>
            ConversionOS
          </span>
          <button
            onClick={onClose}
            aria-label={t('nav.close', 'Close menu')}
            className="sidebar-close-btn"
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', display: 'none', padding: '0.25rem',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <ul style={{ flex: 1, padding: '0.75rem 0.5rem', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.125rem', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => (
            <li key={item.key}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', fontWeight: 500,
                  color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  background: isActive ? 'var(--color-accent-light)' : 'transparent',
                  transition: 'background var(--transition-fast), color var(--transition-fast)',
                  textDecoration: 'none',
                })}
                onMouseEnter={e => {
                  const a = e.currentTarget
                  if (!a.classList.contains('active')) a.style.background = 'var(--color-bg-hover)'
                }}
                onMouseLeave={e => {
                  const a = e.currentTarget
                  if (!a.classList.contains('active')) a.style.background = 'transparent'
                }}
              >
                {item.icon}
                {t(`nav.${item.key}`, item.key)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <style>{`
        @media (max-width: 1023px) {
          nav[aria-label="${t('nav.label', 'Main navigation')}"] {
            transform: ${open ? 'translateX(0)' : 'translateX(-100%)'};
            z-index: 200;
          }
          .sidebar-overlay { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
