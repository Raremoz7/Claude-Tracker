import { useState, useCallback, useEffect } from 'react'
import type { AppState } from '../types'

const GIST_FILENAME = 'claude-pacer-data.json'
const CREDS_KEY = 'claude-pacer-creds'
const CACHE_KEY = 'claude-pacer-state'

export type Credentials = { token: string; gistId: string }

export const SEED_STATE: AppState = {
  limits: [
    { id: 'all_models', label: 'Todos os modelos', readings: [] },
    { id: 'sonnet_only', label: 'Somente Sonnet', readings: [] },
  ],
  cycle: { resetDayOfWeek: 3, resetHour: 17, resetMinute: 59 },
}

// ── Gist API helpers ────────────────────────────────────────────────────────

async function fetchGist(creds: Credentials): Promise<AppState> {
  const res = await fetch(`https://api.github.com/gists/${creds.gistId}`, {
    headers: { Authorization: `Bearer ${creds.token}` },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const data = await res.json() as { files: Record<string, { content: string }> }
  const content = data.files[GIST_FILENAME]?.content
  if (!content) throw new Error('Arquivo não encontrado no Gist')
  return JSON.parse(content) as AppState
}

async function patchGist(creds: Credentials, state: AppState): Promise<void> {
  const res = await fetch(`https://api.github.com/gists/${creds.gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${creds.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: { [GIST_FILENAME]: { content: JSON.stringify(state) } },
    }),
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
}

export async function createGist(token: string): Promise<string> {
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: 'Claude Pacer — usage tracking data',
      public: false,
      files: { [GIST_FILENAME]: { content: JSON.stringify(SEED_STATE) } },
    }),
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const data = await res.json() as { id: string }
  return data.id
}

// ── Local storage helpers ───────────────────────────────────────────────────

export function loadCreds(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDS_KEY)
    return raw ? (JSON.parse(raw) as Credentials) : null
  } catch { return null }
}

export function saveCreds(creds: Credentials): void {
  localStorage.setItem(CREDS_KEY, JSON.stringify(creds))
}

function loadCache(): AppState {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as AppState) : SEED_STATE
  } catch { return SEED_STATE }
}

function saveCache(state: AppState): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(state))
}

// ── Hook ───────────────────────────────────────────────────────────────────

export type SyncStatus = 'loading' | 'ready' | 'error' | 'saving'

export function useGistState(creds: Credentials) {
  const [state, setState] = useState<AppState>(loadCache)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('loading')

  // Fetch on mount
  useEffect(() => {
    setSyncStatus('loading')
    fetchGist(creds)
      .then(remote => {
        setState(remote)
        saveCache(remote)
        setSyncStatus('ready')
      })
      .catch(() => {
        // Fall back to cache silently
        setSyncStatus('error')
      })
  }, [creds.gistId]) // eslint-disable-line react-hooks/exhaustive-deps

  const addReading = useCallback(
    (allModelsPercent: number, _sonnetPercent: number) => {
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
                percent: limit.id === 'all_models' ? allModelsPercent : _sonnetPercent,
              },
            ],
          })),
        }
        saveCache(next)
        setSyncStatus('saving')
        patchGist(creds, next)
          .then(() => setSyncStatus('ready'))
          .catch(() => setSyncStatus('error'))
        return next
      })
    },
    [creds],
  )

  return { state, addReading, syncStatus }
}
