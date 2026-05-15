import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'claude-pacer-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--color-surface-raised)',
      borderTop: '1px solid var(--color-border)',
      boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
      padding: '16px 20px 24px',
      zIndex: 50,
      animation: 'fadeSlideUp 250ms ease-out both',
    }}>
      {/* Linha 1: ícone + texto + fechar */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        marginBottom: '14px',
      }}>
        <span style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1.2 }}>📲</span>
        <p style={{
          flex: 1,
          margin: 0,
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          lineHeight: 1.4,
        }}>
          Instalar o Claude Pacer
          <span style={{
            display: 'block',
            fontWeight: 400,
            fontSize: '0.775rem',
            color: 'var(--color-text-muted)',
            marginTop: '2px',
          }}>
            Abre como app, sem barra do browser
          </span>
        </p>
        <button
          onClick={handleDismiss}
          aria-label="Dispensar"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: '1.1rem',
            lineHeight: 1,
            padding: '4px',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Linha 2: botões */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleDismiss}
          style={{
            flex: 1,
            padding: '11px',
            borderRadius: 'var(--radius-card)',
            border: '1.5px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Agora não
        </button>
        <button
          onClick={handleInstall}
          style={{
            flex: 2,
            padding: '11px',
            borderRadius: 'var(--radius-card)',
            border: 'none',
            background: 'var(--color-accent)',
            color: '#fff',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Instalar
        </button>
      </div>
    </div>
  )
}
