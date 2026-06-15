export const colors = {
  bgPage:      '#0a0a0a',
  bgCard:      '#111111',
  bgElevated:  '#1a1a1a',
  bgBorder:    '#2a2a2a',
  bgHover:     '#1e1e1e',
  accent:      '#00d084',
  accentDim:   'rgba(0, 208, 132, 0.10)',
  success:     '#22c55e',
  warning:     '#f59e0b',
  danger:      '#ef4444',
  info:        '#3b82f6',
  textPrimary: '#e8e8e8',
  textMuted:   '#888888',
  textFaint:   '#555555',
} as const

export const radius = {
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
} as const

export const z = {
  sticky:  100,
  overlay: 200,
  modal:   300,
  toast:   400,
} as const

export const transition = {
  fast: '100ms ease',
  base: '200ms ease',
  slow: '300ms ease',
} as const
