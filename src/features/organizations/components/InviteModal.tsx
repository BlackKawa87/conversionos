import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Copy, Check } from 'lucide-react'
import { Modal, Button, Input, Select } from '@/design-system'
import { useToast } from '@/design-system'
import { useCreateInvitation } from '@/features/invitations/hooks/useInvitations'
import { invitationService } from '@/features/invitations/services/invitation.service'
import type { InvitationRole } from '@/types'

const ROLES: { value: InvitationRole; label: string }[] = [
  { value: 'admin',   label: 'Admin — manage members & projects' },
  { value: 'analyst', label: 'Analyst — view & edit projects' },
  { value: 'viewer',  label: 'Viewer — read only' },
]

interface Props { open: boolean; onOpenChange: (v: boolean) => void; orgId: string }

export function InviteModal({ open, onOpenChange, orgId }: Props) {
  const { t } = useTranslation('common')
  const { showToast } = useToast()
  const create = useCreateInvitation(orgId)
  const [email, setEmail] = useState('')
  const [role,  setRole]  = useState<InvitationRole>('analyst')
  const [link,  setLink]  = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const reset = () => { setEmail(''); setRole('analyst'); setLink(null); setCopied(false) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    try {
      const inv = await create.mutateAsync({ email: email.trim(), role })
      setLink(invitationService.getAcceptUrl(inv.token))
      showToast(t('invite.created'), 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', 'error')
    }
  }

  const handleCopy = async () => {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal
      open={open}
      onOpenChange={v => { if (!v) reset(); onOpenChange(v) }}
      title={t('invite.title', 'Invite team member')}
      description={t('invite.desc', 'They will receive a link to join your organization.')}
      footer={
        link
          ? <Button onClick={() => { reset(); onOpenChange(false) }} style={{ marginLeft: 'auto' }}>{t('common.done')}</Button>
          : <>
              <Button variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>{t('common.cancel')}</Button>
              <Button type="submit" form="invite-form" loading={create.isPending} disabled={!email.trim()}>
                {t('invite.send')}
              </Button>
            </>
      }
    >
      {link ? (
        <div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '0.75rem' }}>
            {t('invite.linkReady', 'Share this link with')}{'  '}<strong style={{ color: 'var(--color-text-primary)' }}>{email}</strong>:
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              readOnly value={link}
              style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'var(--color-bg-elevated)', border: 'var(--border-default)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis' }}
            />
            <Button variant="secondary" size="sm" onClick={handleCopy} leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
              {copied ? t('common.copied') : t('common.copy')}
            </Button>
          </div>
        </div>
      ) : (
        <form id="invite-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label={t('invite.email', 'Email address')} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@company.com" required autoFocus />
          <Select label={t('invite.role', 'Role')} value={role} onChange={e => setRole(e.target.value as InvitationRole)} options={ROLES} />
        </form>
      )}
    </Modal>
  )
}
