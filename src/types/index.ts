export type SupportedLanguage = 'en' | 'pt' | 'es'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  preferred_language: SupportedLanguage
  created_at: string
  updated_at: string
}

export type OrgPlan = 'free' | 'pro' | 'agency' | 'enterprise'

export interface Organization {
  id: string
  name: string
  slug: string
  plan: OrgPlan
  billing_email: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export type MemberRole = 'owner' | 'admin' | 'analyst' | 'viewer'

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: MemberRole
  invited_by: string | null
  joined_at: string
  user_profiles?: Pick<UserProfile, 'id' | 'email' | 'full_name' | 'avatar_url'> | null
}

export type ProjectStatus = 'setup' | 'active' | 'paused' | 'archived'

export interface Project {
  id: string
  organization_id: string
  name: string
  description: string | null
  domain: string | null
  tracker_key: string
  status: ProjectStatus
  created_by: string
  created_at: string
  updated_at: string
}

export type InvitationRole = 'admin' | 'analyst' | 'viewer'

export interface Invitation {
  id: string
  organization_id: string
  email: string
  role: InvitationRole
  token: string
  invitee_language: SupportedLanguage
  created_by: string
  expires_at: string
  used_at: string | null
  revoked_at: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  organization_id: string
  actor_id: string
  action: string
  resource_type: string
  resource_id: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type LoggerEvent =
  | 'auth.login'
  | 'auth.logout'
  | 'auth.signup'
  | 'org.created'
  | 'org.updated'
  | 'org.member_invited'
  | 'org.member_removed'
  | 'org.member_role_changed'
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'project.status_changed'
  | 'invitation.sent'
  | 'invitation.accepted'
  | 'invitation.revoked'

export const LANGUAGE_TO_PROMPT: Record<SupportedLanguage, string> = {
  en: 'Respond in English.',
  pt: 'Responda em Português do Brasil.',
  es: 'Responde en Español.',
}
