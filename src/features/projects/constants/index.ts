import type { FunnelType, Platform, SupportMode, StepType } from '@/types'

export const FUNNEL_TYPES: Array<{ value: FunnelType; labelKey: string; icon: string }> = [
  { value: 'quiz',       labelKey: 'funnelType.quiz',       icon: '🧠' },
  { value: 'vsl',        labelKey: 'funnelType.vsl',        icon: '🎬' },
  { value: 'leadgen',    labelKey: 'funnelType.leadgen',    icon: '📋' },
  { value: 'webinar',    labelKey: 'funnelType.webinar',    icon: '🎤' },
  { value: 'ecommerce',  labelKey: 'funnelType.ecommerce',  icon: '🛒' },
  { value: 'low_ticket', labelKey: 'funnelType.low_ticket', icon: '💳' },
  { value: 'paywall',    labelKey: 'funnelType.paywall',    icon: '🔐' },
  { value: 'custom',     labelKey: 'funnelType.custom',     icon: '⚙️' },
]

export const PLATFORMS: Array<{ value: Platform; label: string }> = [
  { value: 'shopify',        label: 'Shopify' },
  { value: 'wordpress',      label: 'WordPress' },
  { value: 'webflow',        label: 'Webflow' },
  { value: 'framer',         label: 'Framer' },
  { value: 'gohighlevel',    label: 'GoHighLevel' },
  { value: 'clickfunnels',   label: 'ClickFunnels' },
  { value: 'react',          label: 'React' },
  { value: 'nextjs',         label: 'Next.js' },
  { value: 'lovable',        label: 'Lovable' },
  { value: 'custom',         label: 'Custom' },
]

export const SUPPORT_MODES: Array<{ value: SupportMode; labelKey: string; descKey: string }> = [
  {
    value:    'diagnosis_only',
    labelKey: 'supportMode.diagnosis_only',
    descKey:  'supportMode.diagnosis_only_desc',
  },
  {
    value:    'assisted_optimization',
    labelKey: 'supportMode.assisted_optimization',
    descKey:  'supportMode.assisted_optimization_desc',
  },
  {
    value:    'automated_actions_supported',
    labelKey: 'supportMode.automated_actions_supported',
    descKey:  'supportMode.automated_actions_supported_desc',
  },
]

export const STEP_TYPES: Array<{ value: StepType; labelKey: string }> = [
  { value: 'landing',      labelKey: 'stepType.landing' },
  { value: 'quiz_step',    labelKey: 'stepType.quiz_step' },
  { value: 'processing',   labelKey: 'stepType.processing' },
  { value: 'results',      labelKey: 'stepType.results' },
  { value: 'paywall',      labelKey: 'stepType.paywall' },
  { value: 'checkout',     labelKey: 'stepType.checkout' },
  { value: 'upsell',       labelKey: 'stepType.upsell' },
  { value: 'thank_you',    labelKey: 'stepType.thank_you' },
  { value: 'lead_capture', labelKey: 'stepType.lead_capture' },
  { value: 'custom',       labelKey: 'stepType.custom' },
]
