import type { Limit, Status, ProjectionResult } from '../../types'
import { GaugeArc } from '../atoms/GaugeArc'
import { StatusBadge } from '../atoms/StatusBadge'
import { getStatus, getLatestCycleReading, getProjection } from '../../lib/cycleCalc'

type Props = {
  limit: Limit
  safeCeiling: number
  cycleStart: Date
  cycleEnd: Date
  now: Date
  animationDelay?: number
}

function formatProjection(proj: ProjectionResult): string {
  if (!proj.available) return ''
  if (proj.exhaustsBeforeReset) {
    const hoursLeft = Math.round((proj.exhaustsAt - Date.now()) / 3_600_000)
    return `Esgota em ~${hoursLeft}h ⚠`
  }
  return `Renova com ~${Math.round(proj.percentAtReset)}% sobrando`
}

function formatStaleness(readingTimestamp: number, now: Date): string {
  const diffH = (now.getTime() - readingTimestamp) / 3_600_000
  if (diffH < 1) return `há ${Math.round(diffH * 60)}min`
  return `há ${Math.round(diffH)}h`
}

export function LimitCard({ limit, safeCeiling, cycleStart, cycleEnd, now, animationDelay = 0 }: Props) {
  const latestReading = getLatestCycleReading(limit.readings, cycleStart)
  const currentPercent = latestReading?.percent ?? 0
  const status: Status = latestReading ? getStatus(currentPercent, safeCeiling) : 'empty'
  const projection = getProjection(limit.readings, cycleStart, cycleEnd, now)
  const isStale = latestReading
    ? (now.getTime() - latestReading.timestamp) > 4 * 3_600_000
    : false

  return (
    <div
      className="animate-fade-slide"
      style={{
        animationDelay: `${animationDelay}ms`,
        background: 'var(--color-surface-raised)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-card)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {limit.label}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isStale && <StatusBadge status={status} staleness />}
          <StatusBadge status={status} />
        </div>
      </div>

      <GaugeArc percent={currentPercent} status={status} size={160} />

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-card)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          Teto de hoje
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {Math.round(safeCeiling)}%
        </span>
      </div>

      {!latestReading && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
          Registre seu uso para ver o status
        </p>
      )}

      {latestReading && projection.available && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: projection.exhaustsBeforeReset ? 'var(--color-critical)' : 'var(--color-ok)',
            margin: 0,
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {formatProjection(projection)}
        </p>
      )}

      {latestReading && isStale && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Última leitura {formatStaleness(latestReading.timestamp, now)} — atualizar?
        </p>
      )}

      {limit.id === 'sonnet_only' && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            color: 'var(--color-text-muted)',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.5,
            borderTop: '1px solid var(--color-border)',
            paddingTop: '10px',
            width: '100%',
          }}
        >
          Consome junto com "Todos os modelos". Quando "Todos os modelos" zera, Sonnet também para.
        </p>
      )}
    </div>
  )
}
