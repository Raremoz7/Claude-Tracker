import { useState } from 'react'
import { loadCreds } from './hooks/useGistState'
import { useGistState } from './hooks/useGistState'
import { useCycleCalc } from './hooks/useCycleCalc'
import { Dashboard } from './components/organisms/Dashboard'
import { SetupScreen } from './components/organisms/SetupScreen'
import type { Credentials } from './hooks/useGistState'

// ── Sync indicator ──────────────────────────────────────────────────────────
function SyncDot({ status }: { status: 'loading' | 'ready' | 'error' | 'saving' }) {
  const config = {
    loading: { color: 'var(--color-text-muted)', label: 'Carregando…' },
    saving:  { color: 'var(--color-warning)',    label: 'Salvando…' },
    ready:   { color: 'var(--color-ok)',         label: 'Sincronizado' },
    error:   { color: 'var(--color-critical)',   label: 'Erro de sync — usando cache' },
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
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: cfg.color,
        flexShrink: 0,
      }} />
      {cfg.label}
    </div>
  )
}

// ── Main connected component ────────────────────────────────────────────────
function ConnectedApp({ creds }: { creds: Credentials }) {
  const { state, addReading, syncStatus } = useGistState(creds)
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
        onSave={percent => addReading(percent, 0)}
        onThemeToggle={toggleTheme}
        isDark={isDark}
      />
      <SyncDot status={syncStatus} />
    </>
  )
}

// ── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(loadCreds)

  if (!creds) {
    return <SetupScreen onSetupComplete={setCreds} />
  }

  return <ConnectedApp creds={creds} />
}
