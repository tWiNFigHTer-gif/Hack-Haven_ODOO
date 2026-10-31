export const tokens = {
  colors: {
    primary: '#7d4427',
    primaryContainer: '#9a5b3c',
    accentHover: '#7F4A30',
    primaryFixed: '#ffdbcc',
    primaryFixedDim: '#ffb694',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#ffe8df',

    backgroundCanvas: '#FAF7F2',
    surfaceCard: '#FFFFFF',
    surface: '#fff8f5',
    surfaceLow: '#faf2ee',
    surfaceContainer: '#f4ece8',
    surfaceHigh: '#eee7e3',
    surfaceHighest: '#e9e1dd',
    surfaceVariant: '#e9e1dd',

    onSurface: '#1e1b19',
    onSurfaceVariant: '#53443d',
    secondary: '#645d58',
    secondaryContainer: '#eae1da',
    borderSubtle: '#E7E0D6',

    status: {
      active: { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
      paid: { bg: '#D1FAE5', text: '#059669', border: '#A7F3D0' },
      outstanding: { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' },
      paused: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
      overdue: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
      failed: { bg: '#FEE2E2', text: '#DC2626', border: '#FECACA' },
      confirmed: { bg: '#DBEAFE', text: '#2563EB', border: '#BFDBFE' },
      quotation: { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' },
      draft: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
      closed: { bg: '#E2E8F0', text: '#64748B', border: '#CBD5E1' },
    },
    error: '#ba1a1a',
    errorContainer: '#ffdad6',
  },
  radius: {
    card: '14px',
    button: '10px',
    input: '6px',
    badge: '6px',
  },
  maxWidth: '1120px',
} as const;

export type StatusType = keyof typeof tokens.colors.status;

