import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ReactNode } from 'react'

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
}

export function Modal({ open, onOpenChange, title, description, children, footer }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)', zIndex: 200, animation: 'fadeIn 0.15s ease',
        }} />
        <Dialog.Content
          aria-describedby={description ? 'modal-desc' : undefined}
          style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-bg-border)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.5rem',
            width: 'min(90vw, 480px)',
            maxHeight: '85dvh',
            overflowY: 'auto',
            zIndex: 300,
            animation: 'slideUp 0.2s ease',
            outline: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem' }}>
            <div>
              <Dialog.Title style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-heading)' }}>
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description id="modal-desc" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.25rem', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {children && <div style={{ marginBottom: footer ? '1.25rem' : 0 }}>{children}</div>}

          {footer && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--color-bg-border)' }}>
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
