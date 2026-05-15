import type { DayTarget } from '../../types'

type Props = {
  dayTargets: DayTarget[]
}

export function WeekTimeline({ dayTargets }: Props) {
  return (
    <div
      className="animate-fade-slide"
      style={{
        animationDelay: '160ms',
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '20px 24px',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.7rem',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          margin: '0 0 16px 0',
        }}
      >
        Teto por dia do ciclo
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {dayTargets.map((day, i) => (
          <DayColumn key={i} day={day} />
        ))}
      </div>
    </div>
  )
}

function DayColumn({ day }: { day: DayTarget }) {
  const barHeight = Math.max(4, (day.safeCeiling / 100) * 64)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 4px',
        borderRadius: 'var(--radius-card)',
        border: day.isToday ? '1.5px solid var(--color-accent)' : '1.5px solid transparent',
        background: day.isToday ? 'rgba(217, 119, 87, 0.06)' : 'transparent',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
          fontWeight: day.isToday ? 600 : 400,
          color: day.isToday ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          letterSpacing: '0.03em',
        }}
      >
        {day.label}
        {day.isResetDay && <span style={{ marginLeft: '2px', opacity: 0.7 }}>↺</span>}
      </span>

      {/* Bar */}
      <div
        style={{
          width: '100%',
          height: '64px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '60%',
            height: `${barHeight}px`,
            background: day.isToday ? 'var(--color-accent)' : 'var(--color-gauge-track)',
            borderRadius: '2px',
            transition: 'height 400ms ease-out',
          }}
        />
      </div>

      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: day.isToday ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
        }}
      >
        {day.safeCeiling}%
      </span>
    </div>
  )
}
