/**
 * Admin Portal Design Tokens
 * Source: DESIGN.md (Admin Portal) & LoopAI CRM specification
 */

export const adminTokens = {
  colors: {
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    sidebar: {
      background: '#0F172A', // Slate 900
      text: '#CBD5E1', // Slate 300
      hover: '#1E293B', // Slate 800
      activeBackground: '#1E293B',
      activeText: '#FFFFFF',
      border: '#1E293B',
    },
    text: {
      primary: '#0F172A', // Slate 900
      secondary: '#64748B', // Slate 500
      muted: '#94A3B8', // Slate 400
      inverse: '#FFFFFF',
    },
    accent: {
      default: '#4F46E5', // Indigo 600
      hover: '#4338CA', // Indigo 700
      subtle: '#EEF2FF', // Indigo 50
      ring: '#C7D2FE', // Indigo 200
    },
    border: {
      default: '#E2E8F0', // Slate 200
      subtle: '#F1F5F9', // Slate 100
      strong: '#CBD5E1', // Slate 300
    },
    chart: {
      primary: '#4F46E5', // Indigo
      secondary: '#0EA5E9', // Sky
      success: '#10B981', // Emerald
      warning: '#F59E0B', // Amber
      danger: '#EF4444', // Red
    },
    status: {
      draft: {
        bg: '#F1F5F9',
        text: '#475569',
        border: '#CBD5E1',
      },
      quotation: {
        bg: '#F3E8FF',
        text: '#7C3AED',
        border: '#DDD6FE',
      },
      confirmed: {
        bg: '#DBEAFE',
        text: '#2563EB',
        border: '#BFDBFE',
      },
      active: {
        bg: '#D1FAE5',
        text: '#059669',
        border: '#A7F3D0',
      },
      paid: {
        bg: '#D1FAE5',
        text: '#059669',
        border: '#A7F3D0',
      },
      paused: {
        bg: '#FEF3C7',
        text: '#D97706',
        border: '#FDE68A',
      },
      overdue: {
        bg: '#FEE2E2',
        text: '#DC2626',
        border: '#FECACA',
      },
      closed: {
        bg: '#E2E8F0',
        text: '#64748B',
        border: '#CBD5E1',
      },
      cancelled: {
        bg: '#F1F5F9',
        text: '#94A3B8',
        border: '#E2E8F0',
      },
    },
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    pageTitle: '24px',
    sectionTitle: '16px',
    tableText: '14px',
    caption: '12px',
    numbers: 'tabular-nums font-mono',
  },
  layout: {
    sidebarWidth: '240px',
    sidebarCollapsedWidth: '68px',
    topBarHeight: '64px',
    contentMaxWidth: '1280px',
    tableRowHeight: '48px',
  },
} as const;

export type AdminStatus = keyof typeof adminTokens.colors.status;

