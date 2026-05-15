import { useState } from 'react'
import { useAppState } from './hooks/useAppState'
import { useCycleCalc } from './hooks/useCycleCalc'
import { Dashboard } from './components/organisms/Dashboard'
import { RegisterModal } from './components/molecules/RegisterModal'

export default function App() {
  const { state, addReading } = useAppState()
  const calc = useCycleCalc(state.cycle)
  const [modalOpen, setModalOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.getAttribute('data-theme') === 'dark'
  })

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
        onRegister={() => setModalOpen(true)}
        onThemeToggle={toggleTheme}
        isDark={isDark}
      />
      {modalOpen && (
        <RegisterModal onSubmit={addReading} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
