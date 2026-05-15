import { useState } from 'react'
import { useGistState } from './hooks/useGistState'
import { useCycleCalc } from './hooks/useCycleCalc'
import { Dashboard } from './components/organisms/Dashboard'
import type { SyncStatus } from './hooks/useGistState'

function SyncDot({ status }: { status: SyncStatus }) {
  const config = {
    loading: { color: 'var(--color-text-muted)', label: 'Carregando…' },
    saving:  { color: 'var(--color-warning)',    label: 'Salvando…'   },
    ready:   { color: 'var(--color-ok)',         label: 'Sincronizado' },
    error:   { color: 'var(--color-critical)',   label: 'Sem conexão — usando cache' },
  }
  const cfg = config[status]
  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '5px 10px',
      background: 'var(--color-surface-raised)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-body)',
      fontSize: '0.7rem',
      color: cfg.color,
    }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: cfg.color, flexShrink: 0,
      }} />
      {cfg.label}
    </div>
  )
}

export default function App() {
  const { state, addReading, syncStatus } = useGistState()
  const calc = useCycleCalc(state.cycle)
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.getAttribute('data-theme') === 'dark'
  )

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
  }

  return (
    <>
      <Dashboard
        state={state}
        calc={calc}
        onSave={addReading}
        onThemeToggle={toggleTheme}
        isDark={isDark}
      />
      <SyncDot status={syncStatus} />
    </>
  )
}
