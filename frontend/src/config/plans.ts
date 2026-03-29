export const FEATURES = [
  {
    emoji: '🌟',
    title: 'Upgraded Stories',
    subtitle: 'Priority placement, stealth viewing, expiration control',
  },
  {
    emoji: '🚀',
    title: 'Doubled Limits',
    subtitle: 'Up to 1 000 channels, 200 folders, 20 pinned chats',
  },
  {
    emoji: '📦',
    title: '4 GB Upload Size',
    subtitle: 'Send files up to 4 GB each and enjoy faster downloads',
  },
  {
    emoji: '🎙️',
    title: 'Voice-to-Text',
    subtitle: 'Transcribe voice and video messages automatically',
  },
  {
    emoji: '🎨',
    title: 'Unique Reactions',
    subtitle: 'Access exclusive animated emoji reactions',
  },
  {
    emoji: '🔒',
    title: 'Advanced Privacy',
    subtitle: 'Hide read times, restrict forwarding, and more',
  },
]

export const FALLBACK_PLANS = {
  annual: { pricePerMonth: '$3.99', totalPerYear: '$47.88', label: 'Annual', discount: '-40%' },
  monthly: { pricePerMonth: '$5.99', totalPerYear: null, label: 'Monthly', discount: null },
} as const
