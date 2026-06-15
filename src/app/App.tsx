import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider, LoadingState } from '@/design-system'
import { AppShell } from '@/features/shell/AppShell'
import { useAuth } from '@/features/auth/hooks/useAuth'
import LoginPage      from '@/features/auth/components/LoginPage'
import AuthCallback   from '@/features/auth/components/AuthCallback'
import OnboardingPage from '@/features/auth/components/OnboardingPage'
import AcceptInvitePage from '@/features/invitations/components/AcceptInvitePage'
import DashboardPage  from '@/pages/DashboardPage'
import '@/i18n/config'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const navigate  = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      sessionStorage.setItem('auth_redirect', location.pathname + location.search)
      navigate('/login', { replace: true })
    }
  }, [loading, isAuthenticated, location, navigate])

  if (loading)         return <LoadingState size="lg" />
  if (!isAuthenticated) return null
  return <>{children}</>
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"          element={<LoginPage />} />
            <Route path="/auth/callback"  element={<AuthCallback />} />

            {/* Semi-public: needs login to accept */}
            <Route path="/accept-invite"  element={<AuthGuard><AcceptInvitePage /></AuthGuard>} />

            {/* Protected — no shell */}
            <Route path="/onboarding"     element={<AuthGuard><OnboardingPage /></AuthGuard>} />

            {/* Protected — with AppShell */}
            <Route path="/*" element={
              <AuthGuard>
                <AppShell>
                  <Routes>
                    <Route path="/"        element={<DashboardPage />} />
                    <Route path="/projects" element={<DashboardPage />} />
                    <Route path="*"         element={<Navigate to="/" replace />} />
                  </Routes>
                </AppShell>
              </AuthGuard>
            } />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
