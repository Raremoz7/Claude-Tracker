import type { Status } from '../../types'

type Props = {
  status: Status
  staleness?: boolean
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  ok: { label: 'No ritmo', color: 'var(--color-ok)', bg: 'rgba(74, 124, 89, 0.12)' },
  warning: { label: 'Atenção', color: 'var(--color-warning)', bg: 'rgba(176, 125, 46, 0.12)' },
  critical: { label: 'Crítico', color: 'var(--color-critical)', bg: 'rgba(217, 119, 87, 0.12)' },
  empty: { label: 'Sem dados', color: 'var(--color-text-muted)', bg: 'var(--color-surface)' },
}

export function StatusBadge({ status, staleness }: Props) {
  if (staleness) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 10px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.7rem',
          fontWeight: 500,
          fontFamily: 'var(--font-body)',
          color: 'var(--color-warning)',
          backgroundColor: 'rgba(176, 125, 46, 0.12)',
          letterSpacing: '0.02em',
        }}
      >
        Desatualizado
      </span>
    )
  }

  const cfg = STATUS_CONFIG[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 'var(--radius-pill)',
        fontSize: '0.7rem',
        fontWeight: 500,
        fontFamily: 'var(--font-body)',
        color: cfg.color,
        backgroundColor: cfg.bg,
        letterSpacing: '0.02em',
      }}
    >
      {cfg.label}
    </span>
  )
}
