import { useState } from 'react'
import { createGist, saveCreds } from '../../hooks/useGistState'
import type { Credentials } from '../../hooks/useGistState'

type Props = {
  onSetupComplete: (creds: Credentials) => void
}

export function SetupScreen({ onSetupComplete }: Props) {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSetup = async () => {
    const t = token.trim()
    if (!t) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const gistId = await createGist(t)
      const creds: Credentials = { token: t, gistId }
      saveCreds(creds)
      onSetupComplete(creds)
    } catch (e) {
      setStatus('error')
      setErrorMsg(e instanceof Error ? e.message : 'Erro desconhecido')
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-modal)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Logo / Title */}
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Claude Pacer
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            Para sincronizar entre dispositivos, o app usa um Gist privado no
            GitHub como armazenamento. Crie um token uma vez e pronto.
          </p>
        </div>

        {/* Instructions */}
        <ol
          style={{
            margin: 0,
            padding: '0 0 0 18px',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.8,
          }}
        >
          <li>
            Acesse{' '}
            <a
              href="https://github.com/settings/tokens/new?scopes=gist&description=Claude+Pacer"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-accent)' }}
            >
              github.com/settings/tokens
            </a>
          </li>
          <li>Gere um token com escopo <strong>gist</strong></li>
          <li>Cole abaixo — o app cria o Gist automaticamente</li>
        </ol>

        {/* Token input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.03em',
            }}
          >
            GitHub Personal Access Token
          </label>
          <input
            type="password"
            value={token}
            onChange={e => setToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetup()}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            autoFocus
            style={{
              padding: '10px 12px',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-card)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'border-color 150ms',
            }}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
          />
        </div>

        {errorMsg && (
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-body)',
              fontSize: '0.8rem',
              color: 'var(--color-critical)',
            }}
          >
            {errorMsg} — verifique se o token tem escopo <strong>gist</strong>
          </p>
        )}

        <button
          onClick={handleSetup}
          disabled={status === 'loading' || !token.trim()}
          style={{
            padding: '11px',
            borderRadius: 'var(--radius-card)',
            border: 'none',
            background: status === 'loading' ? 'var(--color-text-muted)' : 'var(--color-accent)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            transition: 'background 150ms',
          }}
        >
          {status === 'loading' ? 'Criando Gist…' : 'Configurar →'}
        </button>

        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body)',
            fontSize: '0.72rem',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          O token fica apenas no seu browser (localStorage). O Gist criado é privado.
        </p>
      </div>
    </div>
  )
}
