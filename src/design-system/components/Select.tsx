import { forwardRef, SelectHTMLAttributes, useId, ReactNode } from 'react'

export interface SelectOption { value: string; label: string }

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
  options?: SelectOption[]
  children?: ReactNode
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, children, style, id, ...rest }, ref) => {
    const autoId = useId()
    const selectId = id ?? autoId
    const descId   = `${selectId}-desc`

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {label && (
          <label htmlFor={selectId} style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
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
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            paddingRight: '2rem',
            ...style,
          }}
          {...rest}
        >
          {options ? options.map(o => <option key={o.value} value={o.value}>{o.label}</option>) : children}
        </select>
        {(helperText || error) && (
          <span id={descId} style={{ fontSize: 'var(--text-xs)', color: error ? 'var(--color-danger)' : 'var(--color-text-faint)' }}>
            {error ?? helperText}
          </span>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'
