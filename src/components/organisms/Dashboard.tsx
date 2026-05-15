import type { AppState, Status } from '../../types'
import type { CycleCalcResult } from '../../hooks/useCycleCalc'
import { getStatus, getLatestCycleReading } from '../../lib/cycleCalc'
import { Header } from './Header'
import { LimitCard } from '../molecules/LimitCard'
import { WeekTimeline } from '../molecules/WeekTimeline'

type Props = {
  state: AppState
  calc: CycleCalcResult
  onRegister: () => void
  onThemeToggle: () => void
  isDark: boolean
}

function getLimitStatus(state: AppState, id: 'all_models' | 'sonnet_only', safeCeiling: number, cycleStart: Date): Status {
  const limit = state.limits.find(l => l.id === id)
  if (!limit) return 'empty'
  const reading = getLatestCycleReading(limit.readings, cycleStart)
  if (!reading) return 'empty'
  return getStatus(reading.percent, safeCeiling)
}

function AlertBanner({ allModelsStatus, sonnetStatus }: { allModelsStatus: Status; sonnetStatus: Status }) {
  if (allModelsStatus === 'critical') {
    return (
      <div
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-critical)',
          background: 'rgba(217, 119, 87, 0.08)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.825rem',
          fontWeight: 500,
          color: 'var(--color-critical)',
        }}
      >
        Todos os modelos crítico — acesso total em risco
      </div>
    )
  }
  if (sonnetStatus === 'critical') {
    return (
      <div
        style={{
          marginBottom: '16px',
          padding: '12px 16px',
          borderRadius: 'var(--radius-card)',
          border: '1px solid var(--color-warning)',
          background: 'rgba(176, 125, 46, 0.08)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.825rem',
          fontWeight: 500,
          color: 'var(--color-warning)',
        }}
      >
        Sonnet crítico — Opus/Haiku ainda disponíveis
      </div>
    )
  }
  return null
}

export function Dashboard({ state, calc, onRegister, onThemeToggle, isDark }: Props) {
  const allModelsStatus = getLimitStatus(state, 'all_models', calc.safeCeiling, calc.cycleStart)
  const sonnetStatus = getLimitStatus(state, 'sonnet_only', calc.safeCeiling, calc.cycleStart)

  return (
    <div
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 16px 48px',
      }}
    >
      <Header timeUntilReset={calc.timeUntilReset} onThemeToggle={onThemeToggle} isDark={isDark} />

      <AlertBanner allModelsStatus={allModelsStatus} sonnetStatus={sonnetStatus} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        {state.limits.map((limit, i) => (
          <LimitCard
            key={limit.id}
            limit={limit}
            safeCeiling={calc.safeCeiling}
            cycleStart={calc.cycleStart}
            cycleEnd={calc.cycleEnd}
            now={calc.now}
            animationDelay={i * 80}
          />
        ))}
      </div>

      <WeekTimeline dayTargets={calc.dayTargets} />

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={onRegister}
          style={{
            padding: '12px 32px',
            borderRadius: 'var(--radius-card)',
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'background 150ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-accent-dim)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-accent)')}
        >
          Registrar uso agora
        </button>
      </div>
    </div>
  )
}
