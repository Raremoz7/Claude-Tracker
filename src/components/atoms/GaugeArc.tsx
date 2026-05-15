import type { Status } from '../../types'

type Props = {
  percent: number
  status: Status
  size?: number
}

const STATUS_COLORS: Record<Status, string> = {
  ok: 'var(--color-ok)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-critical)',
  empty: 'var(--color-gauge-track)',
}

export function GaugeArc({ percent, status, size = 160 }: Props) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2

  // Full circle circumference
  const circumference = 2 * Math.PI * radius
  // We use 75% of the circle (270 degrees) as the arc
  const arcLength = circumference * 0.75
  const fillLength = arcLength * (Math.min(100, Math.max(0, percent)) / 100)
  const gapLength = circumference - arcLength

  const color = STATUS_COLORS[status]

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(135deg)' }}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--color-gauge-track)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeLinecap="round"
        />
        {/* Fill */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${fillLength} ${circumference - fillLength}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 600ms ease-out, stroke 300ms ease-out' }}
        />
      </svg>
      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.25rem',
            fontWeight: 700,
            color: status === 'empty' ? 'var(--color-text-muted)' : color,
            lineHeight: 1,
            transition: 'color 300ms ease-out',
          }}
        >
          {status === 'empty' ? '—' : `${Math.round(percent)}%`}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.7rem',
            color: 'var(--color-text-muted)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginTop: '2px',
          }}
        >
          usado
        </span>
      </div>
    </div>
  )
}
