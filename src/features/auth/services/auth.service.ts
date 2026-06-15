import { supabase } from '@/providers/supabase'
import { logger } from '@/lib/logger'

export const authService = {
  async sendMagicLink(email: string, redirectTo?: string) {
    logger.info('auth: sending magic link', { email })
    return supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
      },
    })
  },

  async logout() {
    logger.info('auth: signing out')
    return supabase.auth.signOut()
  },

  async getUser() {
    const { data } = await supabase.auth.getUser()
    return data.user
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
}
