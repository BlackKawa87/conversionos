import { useState, ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar }  from './Topbar'

interface AppShellProps {
  children: ReactNode
  orgName?: string
}

export function AppShell({ children, orgName }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Topbar onMenuToggle={() => setSidebarOpen(o => !o)} orgName={orgName} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        style={{
          paddingTop: 'var(--topbar-height)',
          minHeight: '100dvh',
          overflowX: 'hidden',
        }}
      >
        <div
          className="shell-content"
          style={{
            marginLeft: 'var(--sidebar-width)',
            padding: '2rem',
            minHeight: 'calc(100dvh - var(--topbar-height))',
          }}
        >
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 1023px) {
          .shell-content { margin-left: 0 !important; padding: 1.25rem !important; }
        }
        @media (max-width: 640px) {
          .shell-content { padding: 1rem !important; }
        }
      `}</style>
    </>
  )
}
