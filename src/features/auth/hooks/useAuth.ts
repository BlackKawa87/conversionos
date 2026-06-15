import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/providers/supabase'
import { DEV_BYPASS_ACTIVE, DEV_BYPASS_VALID, DEV_CONFIG } from '../devBypass'

export function useAuth() {
  // Hooks are always called unconditionally (React rules)
  const [user,    setUser]    = useState<User | null | undefined>(undefined)
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [loading, setLoading] = useState(!DEV_BYPASS_ACTIVE)

  useEffect(() => {
    // REMOVE OR DISABLE BEFORE GO LIVE
    if (DEV_BYPASS_ACTIVE) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
      setUser(s?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // REMOVE OR DISABLE BEFORE GO LIVE — bypass frontend auth guards only
  if (DEV_BYPASS_ACTIVE && DEV_BYPASS_VALID) {
    return {
      user:            { id: DEV_CONFIG.userId, email: DEV_CONFIG.userEmail } as unknown as User,
      session:         null,
      loading:         false,
      isAuthenticated: true,
      isDevBypass:     true,
    }
  }

  // Bypass enabled but missing required env vars — block access
  if (DEV_BYPASS_ACTIVE && !DEV_BYPASS_VALID) {
    return { user: null, session: null, loading: false, isAuthenticated: false, isDevBypass: false }
  }

  return { user, session, loading, isAuthenticated: !!user, isDevBypass: false }
}
