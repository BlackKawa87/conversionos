import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/providers/supabase'
import { ToastProvider } from '@/design-system'
import { AppShell } from '@/features/shell/AppShell'
import LoginPage from '@/features/auth/components/LoginPage'
import '@/i18n/config'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })

function AuthGuard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

function DashboardPage() {
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', marginBottom: '0.5rem' }}>
        Dashboard
      </h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        ConversionOS — Design System Foundation ready.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <AppShell>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                    </Routes>
                  </AppShell>
                </AuthGuard>
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
