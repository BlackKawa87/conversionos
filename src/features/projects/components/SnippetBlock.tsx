import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface Props {
  code: string
}

export function SnippetBlock({ code }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      position: 'relative',
      background: '#0d0d0d',
      border: '1px solid var(--color-bg-border)',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
    }}>
      <button
        onClick={handleCopy}
        aria-label="Copy snippet"
        style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          background: copied ? 'var(--color-success-dim)' : 'var(--color-bg-elevated)',
          border: '1px solid var(--color-bg-border)',
          borderRadius: 'var(--radius-sm)',
          color: copied ? 'var(--color-success)' : 'var(--color-text-muted)',
          cursor: 'pointer', padding: '0.25rem 0.5rem',
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          fontSize: 'var(--text-xs)', transition: 'all 0.15s',
        }}
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre style={{
        margin: 0, padding: '1rem',
        fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
        color: '#a8d8a8', lineHeight: 1.6,
        overflowX: 'auto', whiteSpace: 'pre',
      }}>
        {code}
      </pre>
    </div>
  )
}
