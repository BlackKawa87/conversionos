import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingState } from '@/design-system'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase handles the token exchange automatically from the URL hash.
    // After onAuthStateChange fires in useAuth, we just redirect.
    const redirect = sessionStorage.getItem('auth_redirect') ?? '/'
    sessionStorage.removeItem('auth_redirect')
    // Small delay so onAuthStateChange can process the session
    const t = setTimeout(() => navigate(redirect, { replace: true }), 500)
    return () => clearTimeout(t)
  }, [navigate])

  return <LoadingState label="Signing you in…" size="lg" />
}
