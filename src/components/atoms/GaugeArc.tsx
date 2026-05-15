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
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75
  const fillLength = arcLength * (Math.min(100, Math.max(0, percent)) / 100)
  const gapLength = circumference - arcLength
  const color = STATUS_COLORS[status]

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(135deg)', display: 'block' }}>
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke="var(--color-gauge-track)"
        strokeWidth={strokeWidth}
        strokeDasharray={`${arcLength} ${gapLength}`}
        strokeLinecap="round"
      />
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${fillLength} ${circumference - fillLength}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 600ms ease-out, stroke 300ms ease-out' }}
      />
    </svg>
  )
}
