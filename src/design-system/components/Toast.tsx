import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

interface ToastItem { id: string; type: ToastType; message: string; duration: number }

interface ToastCtxValue { showToast: (message: string, type?: ToastType, duration?: number) => void }

const ToastCtx = createContext<ToastCtxValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be inside <ToastProvider>')
  return ctx
}

const ICON_MAP = { success: CheckCircle2, warning: AlertTriangle, error: XCircle, info: Info }
const COLOR_MAP: Record<ToastType, string> = {
  success: 'var(--color-success)', warning: 'var(--color-warning)',
  error: 'var(--color-danger)',   info: 'var(--color-info)',
}

function ToastBubble({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), item.duration)
    return () => clearTimeout(t)
  }, [item.id, item.duration, onRemove])

  const Icon = ICON_MAP[item.type]
  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-bg-border)',
        borderLeft: `3px solid ${COLOR_MAP[item.type]}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        minWidth: 280, maxWidth: 400,
        animation: 'slideInRight 0.25s ease',
      }}
    >
      <Icon size={16} color={COLOR_MAP[item.type]} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />
      <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', lineHeight: 1.5 }}>
        {item.message}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        aria-label="Dismiss notification"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-faint)', padding: '0.125rem', flexShrink: 0 }}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => setToasts(p => p.filter(t => t.id !== id)), [])

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    const id = crypto.randomUUID()
    setToasts(p => [...p, { id, type, message, duration }])
  }, [])

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div
          aria-label="Notifications"
          style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            zIndex: 400, pointerEvents: 'none',
          }}
        >
          {toasts.map(t => (
            <div key={t.id} style={{ pointerEvents: 'auto' }}>
              <ToastBubble item={t} onRemove={remove} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  )
}
