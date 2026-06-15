import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, Brain, ListChecks, FlaskConical,
  FolderKanban, Bell, Settings, X, ChevronDown,
} from 'lucide-react'

type NavGroup = {
  groupKey: string
  items: { key: string; to: string; icon: React.ReactNode; end?: boolean }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: 'intelligence',
    items: [
      { key: 'overview',    to: '/',            icon: <LayoutDashboard size={16} aria-hidden />, end: true },
      { key: 'diagnoses',   to: '/diagnoses',   icon: <Brain           size={16} aria-hidden /> },
      { key: 'actionPlan',  to: '/action-plan', icon: <ListChecks      size={16} aria-hidden /> },
      { key: 'experiments', to: '/experiments', icon: <FlaskConical    size={16} aria-hidden /> },
    ],
  },
  {
    groupKey: 'tracking',
    items: [
      { key: 'projects', to: '/projects', icon: <FolderKanban size={16} aria-hidden /> },
    ],
  },
  {
    groupKey: 'system',
    items: [
      { key: 'alerts',   to: '/alerts',   icon: <Bell     size={16} aria-hidden /> },
      { key: 'settings', to: '/settings', icon: <Settings size={16} aria-hidden /> },
    ],
  },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
  orgName?: string
}

export function Sidebar({ open, onClose, orgName }: SidebarProps) {
  const { t } = useTranslation('shell')

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: '0.5625rem',
    padding: '0.4375rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    fontSize: 'var(--text-sm)', fontWeight: isActive ? 500 : 400,
    color:      isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
    background: isActive ? 'var(--color-accent-light)' : 'transparent',
    transition: 'background var(--transition-fast), color var(--transition-fast)',
    textDecoration: 'none',
  })

  const groupLabelStyle: React.CSSProperties = {
    fontSize: 'var(--text-2xs)', fontWeight: 600,
    letterSpacing: '0.09em', textTransform: 'uppercase',
    color: 'var(--color-text-faint)', fontFamily: 'var(--font-mono)',
    padding: '0 0.75rem', marginBottom: '0.25rem',
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
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: 'var(--sidebar-width)',
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column',
          zIndex: 100,
          transition: 'transform var(--transition-base)',
        }}
      >
        {/* ── Workspace header ── */}
        <div style={{
          height: 'var(--topbar-height)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 0.875rem', borderBottom: '1px solid var(--color-border)',
          flexShrink: 0, gap: '0.5rem',
        }}>
          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <div style={{
              fontWeight: 800,
              fontSize: '0.9375rem',
              color: 'var(--color-brand)',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}>
              ConversionOS
            </div>
            {orgName && (
              <div style={{
                fontSize: 'var(--text-2xs)',
                color: 'var(--color-text-faint)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                marginTop: '0.0625rem',
                fontWeight: 400,
              }}>
                {orgName}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
            {orgName && <ChevronDown size={12} color="var(--color-text-faint)" aria-hidden />}
            <button
              onClick={onClose}
              aria-label={t('nav.close', 'Close menu')}
              className="sidebar-close-btn"
              style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', display: 'none', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── Nav groups ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {NAV_GROUPS.map((group, gi) => (
            <div key={group.groupKey}>
              <p style={{ ...groupLabelStyle, marginTop: gi === 0 ? 0 : undefined }}>
                {t(`nav.groups.${group.groupKey}`, group.groupKey)}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.0625rem' }}>
                {group.items.map(item => (
                  <li key={item.key}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      onClick={onClose}
                      style={({ isActive }) => navLinkStyle(isActive)}
                      onMouseEnter={e => {
                        const el = e.currentTarget
                        if (el.getAttribute('aria-current') !== 'page')
                          el.style.background = 'var(--color-bg-hover)'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget
                        if (el.getAttribute('aria-current') !== 'page')
                          el.style.background = 'transparent'
                      }}
                    >
                      {item.icon}
                      {t(`nav.${item.key}`, item.key)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Footer hint ── */}
        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <p style={{
            fontSize: 'var(--text-2xs)',
            color: 'var(--color-text-faint)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.04em',
          }}>
            v0.1 · ECC Alpha
          </p>
        </div>
      </nav>

      <style>{`
        @media (max-width: 1023px) {
          nav[aria-label="${t('nav.label', 'Main navigation')}"] {
            transform: ${open ? 'translateX(0)' : 'translateX(-100%)'};
            z-index: 200;
          }
          .sidebar-overlay   { display: block !important; }
          .sidebar-close-btn { display: flex !important; }
        }
      `}</style>
    </>
  )
}
