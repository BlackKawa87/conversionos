import { forwardRef, InputHTMLAttributes, useId } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, style, id, ...rest }, ref) => {
    const autoId = useId()
    const inputId = id ?? autoId
    const descId  = `${inputId}-desc`

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {label && (
          <label htmlFor={inputId} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-describedby={(helperText || error) ? descId : undefined}
          aria-invalid={!!error}
          style={{
            padding: '0.5rem 0.875rem',
            background: 'var(--color-bg-elevated)',
            border: `1px solid ${error ? 'var(--color-danger)' : 'var(--color-bg-border)'}`,
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-base)',
            outline: 'none',
            width: '100%',
            transition: 'border-color var(--transition-fast)',
            ...style,
          }}
          {...rest}
        />
        {(helperText || error) && (
          <span id={descId} style={{ fontSize: 'var(--text-xs)', color: error ? 'var(--color-danger)' : 'var(--color-text-faint)' }}>
            {error ?? helperText}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
