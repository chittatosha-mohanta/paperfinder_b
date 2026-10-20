const EXAMPLES = [
  'transformer attention neural network',
  'CRISPR gene editing',
  'deep learning image segmentation',
  'quantum error correction',
  'federated learning privacy',
  'mRNA vaccine immunology',
]

export default function EmptyState({ onSearch }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔬</div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
        Search any research topic
      </h2>
      <p style={{
        color: 'var(--muted)', fontSize: '14px', marginBottom: '32px',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        Try one of these examples to get started
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {EXAMPLES.map(ex => (
          <button key={ex} onClick={() => onSearch(ex)} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
            color: 'var(--muted)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}