type Props = {
  label: string
  value: string
  onChange: (val: string) => void
}

export function PercentInput({ label, value, onChange }: Props) {
  return (
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
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="0"
          style={{
            width: '100%',
            padding: '10px 36px 10px 12px',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            background: 'var(--color-surface-raised)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 700,
            outline: 'none',
            transition: 'border-color 150ms',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
        />
        <span
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            color: 'var(--color-text-muted)',
            pointerEvents: 'none',
          }}
        >
          %
        </span>
      </div>
    </div>
  )
}
