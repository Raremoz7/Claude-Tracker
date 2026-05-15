import { useState, useCallback, useEffect } from 'react'
import type { AppState } from '../types'

const GIST_FILENAME = 'claude-pacer-data.json'
const CACHE_KEY = 'claude-pacer-state'

const TOKEN  = import.meta.env.VITE_GITHUB_TOKEN
const GIST_ID = import.meta.env.VITE_GIST_ID

export const SEED_STATE: AppState = {
  limits: [
    { id: 'all_models', label: 'Todos os modelos', readings: [] },
    { id: 'sonnet_only', label: 'Somente Sonnet', readings: [] },
  ],
  cycle: { resetDayOfWeek: 3, resetHour: 17, resetMinute: 59 },
}

// ── Gist API ────────────────────────────────────────────────────────────────

async function fetchGist(): Promise<AppState> {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
  const data = await res.json() as { files: Record<string, { content: string }> }
  const content = data.files[GIST_FILENAME]?.content
  if (!content) throw new Error('Arquivo não encontrado')
  return JSON.parse(content) as AppState
}

async function patchGist(state: AppState): Promise<void> {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { [GIST_FILENAME]: { content: JSON.stringify(state) } },
    }),
  })
  if (!res.ok) throw new Error(`GitHub ${res.status}`)
}

// ── Cache ───────────────────────────────────────────────────────────────────

function loadCache(): AppState {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as AppState) : SEED_STATE
  } catch { return SEED_STATE }
}

function saveCache(state: AppState): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(state))
}

// ── Hook ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'loading' | 'ready' | 'error' | 'saving'

export function useGistState() {
  const [state, setState] = useState<AppState>(loadCache)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')

  useEffect(() => {
    setSyncStatus('loading')
    fetchGist()
      .then(remote => { setState(remote); saveCache(remote); setSyncStatus('ready') })
      .catch(() => setSyncStatus('error'))
  }, [])

  const addReading = useCallback((allModelsPercent: number) => {
    const timestamp = Date.now()
    setState(prev => {
      const next: AppState = {
        ...prev,
        limits: prev.limits.map(limit => ({
          ...limit,
          readings: [
            ...limit.readings,
            { timestamp, percent: limit.id === 'all_models' ? allModelsPercent : 0 },
          ],
        })),
      }
      saveCache(next)
      setSyncStatus('saving')
      patchGist(next)
        .then(() => setSyncStatus('ready'))
        .catch(() => setSyncStatus('error'))
      return next
    })
  }, [])

  return { state, addReading, syncStatus }
}
