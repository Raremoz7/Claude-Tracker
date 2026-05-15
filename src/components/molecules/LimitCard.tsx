import { useState, useRef, useEffect } from 'react'
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
  onSave: (percent: number) => void
  animationDelay?: number
}

const STATUS_COLORS: Record<Status, string> = {
  ok: 'var(--color-ok)',
  warning: 'var(--color-warning)',
  critical: 'var(--color-critical)',
  empty: 'var(--color-text-muted)',
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

export function LimitCard({ limit, safeCeiling, cycleStart, cycleEnd, now, onSave, animationDelay = 0 }: Props) {
  const latestReading = getLatestCycleReading(limit.readings, cycleStart)
  const currentPercent = latestReading?.percent ?? 0
  const status: Status = latestReading ? getStatus(currentPercent, safeCeiling) : 'empty'
  const projection = getProjection(limit.readings, cycleStart, cycleEnd, now)
  const isStale = latestReading
    ? (now.getTime() - latestReading.timestamp) > 4 * 3_600_000
    : false

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.select()
  }, [isEditing])

  const startEdit = () => {
    setEditValue(latestReading ? String(currentPercent) : '')
    setIsEditing(true)
  }

  const commit = () => {
    const val = Math.min(100, Math.max(0, Number(editValue) || 0))
    onSave(val)
    setIsEditing(false)
  }

  const cancel = () => setIsEditing(false)

  const color = STATUS_COLORS[status]
  const GAUGE_SIZE = 160

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
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {limit.label}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {isStale && <StatusBadge status={status} staleness />}
          {latestReading && <StatusBadge status={status} />}
        </div>
      </div>

      {/* Gauge + inline edit overlay */}
      <div
        style={{ position: 'relative', width: GAUGE_SIZE, height: GAUGE_SIZE, cursor: 'text' }}
        onClick={() => { if (!isEditing) startEdit() }}
        title="Clique para registrar uso"
      >
        <GaugeArc percent={currentPercent} status={status} size={GAUGE_SIZE} />

        {/* Center content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
        }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }} onClick={e => e.stopPropagation()}>
              <input
                ref={inputRef}
                type="number"
                min={0}
                max={100}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commit() }
                  if (e.key === 'Escape') cancel()
                }}
                onBlur={commit}
                style={{
                  width: '72px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color,
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${color}`,
                  outline: 'none',
                  textAlign: 'center',
                  padding: '0 2px',
                  lineHeight: 1,
                  MozAppearance: 'textfield',
                }}
              />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color }}>%</span>
            </div>
          ) : (
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.25rem',
              fontWeight: 700,
              color,
              lineHeight: 1,
              transition: 'color 300ms ease-out',
            }}>
              {status === 'empty' ? '—' : `${Math.round(currentPercent)}%`}
            </span>
          )}
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.65rem',
            color: isEditing ? color : 'var(--color-text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {isEditing ? 'Enter para salvar' : status === 'empty' ? 'clique para digitar' : 'usado'}
          </span>
        </div>
      </div>

      {/* Teto de hoje */}
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          Teto de hoje
        </span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {Math.round(safeCeiling)}%
        </span>
      </div>

      {/* Projection */}
      {latestReading && projection.available && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          color: projection.exhaustsBeforeReset ? 'var(--color-critical)' : 'var(--color-ok)',
          margin: 0,
          textAlign: 'center',
          fontWeight: 500,
        }}>
          {formatProjection(projection)}
        </p>
      )}

      {/* Staleness nudge */}
      {latestReading && isStale && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Última leitura {formatStaleness(latestReading.timestamp, now)} — clique para atualizar
        </p>
      )}
    </div>
  )
}
