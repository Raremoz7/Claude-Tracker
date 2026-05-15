import type { AppState, Status } from '../../types'
import type { CycleCalcResult } from '../../hooks/useCycleCalc'
import { getStatus, getLatestCycleReading } from '../../lib/cycleCalc'
import { Header } from './Header'
import { LimitCard } from '../molecules/LimitCard'
import { WeekTimeline } from '../molecules/WeekTimeline'

type Props = {
  state: AppState
  calc: CycleCalcResult
  onSave: (percent: number) => void
  onThemeToggle: () => void
  isDark: boolean
}

function getAllModelsStatus(state: AppState, safeCeiling: number, cycleStart: Date): Status {
  const limit = state.limits.find(l => l.id === 'all_models')
  if (!limit) return 'empty'
  const reading = getLatestCycleReading(limit.readings, cycleStart)
  if (!reading) return 'empty'
  return getStatus(reading.percent, safeCeiling)
}

function AlertBanner({ status }: { status: Status }) {
  if (status !== 'critical') return null
  return (
    <div style={{
      marginBottom: '16px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-card)',
      border: '1px solid var(--color-critical)',
      background: 'rgba(217, 119, 87, 0.08)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.825rem',
      fontWeight: 500,
      color: 'var(--color-critical)',
    }}>
      Todos os modelos crítico — acesso total em risco
    </div>
  )
}

export function Dashboard({ state, calc, onSave, onThemeToggle, isDark }: Props) {
  const allModelsStatus = getAllModelsStatus(state, calc.safeCeiling, calc.cycleStart)
  const allModelsLimit = state.limits.find(l => l.id === 'all_models')

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '0 16px 48px' }}>
      <Header timeUntilReset={calc.timeUntilReset} onThemeToggle={onThemeToggle} isDark={isDark} />

      <AlertBanner status={allModelsStatus} />

      {allModelsLimit && (
        <div style={{ marginBottom: '16px' }}>
          <LimitCard
            limit={allModelsLimit}
            safeCeiling={calc.safeCeiling}
            cycleStart={calc.cycleStart}
            cycleEnd={calc.cycleEnd}
            now={calc.now}
            onSave={onSave}
            animationDelay={0}
          />
        </div>
      )}

      <WeekTimeline dayTargets={calc.dayTargets} />
    </div>
  )
}
