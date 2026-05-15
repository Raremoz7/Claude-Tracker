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
      bottom: '52px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 32px)',
      maxWidth: '520px',
      background: 'var(--color-surface-raised)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-modal)',
      boxShadow: 'var(--shadow-modal)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 50,
      animation: 'fadeSlideUp 250ms ease-out both',
    }}>
      <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>📲</span>
      <span style={{
        flex: 1,
        fontFamily: 'var(--font-body)',
        fontSize: '0.825rem',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.4,
      }}>
        Instalar o Claude Pacer no dispositivo?
      </span>
      <button
        onClick={handleInstall}
        style={{
          padding: '6px 14px',
          borderRadius: 'var(--radius-card)',
          border: 'none',
          background: 'var(--color-accent)',
          color: '#fff',
          fontFamily: 'var(--font-body)',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Instalar
      </button>
      <button
        onClick={handleDismiss}
        title="Dispensar"
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
  )
}
