type Props = {
  timeUntilReset: string
  onThemeToggle: () => void
  isDark: boolean
}

export function Header({ timeUntilReset, onThemeToggle, isDark }: Props) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 0 8px',
        borderBottom: '1px solid var(--color-border)',
        marginBottom: '24px',
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Claude Pacer
        </h1>
        <p
          style={{
            margin: '2px 0 0',
            fontFamily: 'var(--font-body)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)',
          }}
        >
          Renova em{' '}
          <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{timeUntilReset}</span>
        </p>
      </div>
      <button
        onClick={onThemeToggle}
        title={isDark ? 'Modo claro' : 'Modo escuro'}
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-card)',
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: '1rem',
          lineHeight: 1,
          color: 'var(--color-text-secondary)',
        }}
      >
        {isDark ? '☀' : '◑'}
      </button>
    </header>
  )
}
