import { useState, useEffect, useCallback } from 'react'
import { PercentInput } from '../atoms/PercentInput'

type Props = {
  onSubmit: (allModels: number, sonnetOnly: number) => void
  onClose: () => void
}

export function RegisterModal({ onSubmit, onClose }: Props) {
  const [allModels, setAllModels] = useState('')
  const [sonnetOnly, setSonnetOnly] = useState('')

  const handleSubmit = () => {
    const a = Math.min(100, Math.max(0, Number(allModels) || 0))
    const s = Math.min(100, Math.max(0, Number(sonnetOnly) || 0))
    onSubmit(a, s)
    onClose()
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px',
      }}
    >
      <div
        className="animate-modal"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-modal)',
          padding: '28px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: 'var(--shadow-modal)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            Registrar uso
          </h2>
          <p style={{ margin: '4px 0 0', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Digite exatamente o que aparece na tela do Claude.
          </p>
        </div>

        <PercentInput label="Todos os modelos" value={allModels} onChange={setAllModels} />
        <PercentInput label="Somente Sonnet" value={sonnetOnly} onChange={setSonnetOnly} />

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-card)',
              border: '1.5px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: '9px 18px',
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
            Salvar leitura
          </button>
        </div>
      </div>
    </div>
  )
}
