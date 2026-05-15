import { useState } from 'react'
import { useAppState } from './hooks/useAppState'
import { useCycleCalc } from './hooks/useCycleCalc'
import { Dashboard } from './components/organisms/Dashboard'

export default function App() {
  const { state, addReading } = useAppState()
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
    <Dashboard
      state={state}
      calc={calc}
      onSave={percent => addReading(percent, 0)}
      onThemeToggle={toggleTheme}
      isDark={isDark}
    />
  )
}
