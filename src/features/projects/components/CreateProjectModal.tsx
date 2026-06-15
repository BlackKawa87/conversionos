import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Modal, Button, Input } from '@/design-system'
import { useToast } from '@/design-system'
import { useCreateProject } from '../hooks/useProjects'

interface Props { open: boolean; onOpenChange: (v: boolean) => void; orgId: string }

export function CreateProjectModal({ open, onOpenChange, orgId }: Props) {
  const { t }         = useTranslation('common')
  const { showToast } = useToast()
  const navigate      = useNavigate()
  const create        = useCreateProject(orgId)
  const [name,   setName]   = useState('')
  const [desc,   setDesc]   = useState('')
  const [domain, setDomain] = useState('')

  const reset = () => { setName(''); setDesc(''); setDomain('') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      const project = await create.mutateAsync({
        name:        name.trim(),
        description: desc.trim()   || undefined,
        domain:      domain.trim() || undefined,
      })
      showToast(t('project.created', 'Project created!'), 'success')
      reset()
      onOpenChange(false)
      navigate(`/projects/${project.id}/setup`)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error', 'error')
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={v => { if (!v) reset(); onOpenChange(v) }}
      title={t('project.createTitle', 'New project')}
      description={t('project.createDesc', 'Projects represent funnels or products you want to optimize.')}
      footer={
        <>
          <Button variant="ghost" onClick={() => { reset(); onOpenChange(false) }}>{t('common.cancel', 'Cancel')}</Button>
          <Button type="submit" form="create-project-form" loading={create.isPending} disabled={!name.trim()}>
            {t('project.create', 'Create project')}
          </Button>
        </>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Input label={t('project.name', 'Project name')} value={name} onChange={e => setName(e.target.value)} placeholder="My Funnel" required autoFocus />
        <Input label={t('project.description', 'Description')} value={desc} onChange={e => setDesc(e.target.value)} placeholder={t('project.descPlaceholder', 'What is this project optimizing?')} />
        <Input label={t('project.domain', 'Domain (optional)')} value={domain} onChange={e => setDomain(e.target.value)} placeholder="example.com" />
      </form>
    </Modal>
  )
}
