import { useState, useCallback } from 'react'
import type { AppState } from '../types'

const STORAGE_KEY = 'claude-pacer-state'

const SEED_STATE: AppState = {
  limits: [
    { id: 'all_models', label: 'Todos os modelos', readings: [] },
    { id: 'sonnet_only', label: 'Somente Sonnet', readings: [] },
  ],
  cycle: { resetDayOfWeek: 3, resetHour: 17, resetMinute: 59 },
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED_STATE
    return JSON.parse(raw) as AppState
  } catch {
    return SEED_STATE
  }
}

function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState)

  const addReading = useCallback((allModelsPercent: number, sonnetOnlyPercent: number) => {
    const timestamp = Date.now()
    setState(prev => {
      const next: AppState = {
        ...prev,
        limits: prev.limits.map(limit => ({
          ...limit,
          readings: [
            ...limit.readings,
            {
              timestamp,
              percent: limit.id === 'all_models' ? allModelsPercent : sonnetOnlyPercent,
            },
          ],
        })),
      }
      saveState(next)
      return next
    })
  }, [])

  const clearReadings = useCallback(() => {
    setState(prev => {
      const next: AppState = {
        ...prev,
        limits: prev.limits.map(limit => ({ ...limit, readings: [] })),
      }
      saveState(next)
      return next
    })
  }, [])

  return { state, addReading, clearReadings }
}
