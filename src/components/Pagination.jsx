export default function Pagination({ page, total, onPageChange }) {
  const totalPages = Math.min(Math.ceil(total / 10), 100)
  if (totalPages <= 1) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '8px 20px', color: 'var(--muted)',
          fontSize: '13px', fontFamily: 'JetBrains Mono, monospace',
          opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        ← Prev
      </button>

      <span style={{
        background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)',
        borderRadius: '8px', padding: '8px 20px', color: 'var(--accent)',
        fontSize: '13px', fontFamily: 'JetBrains Mono, monospace',
      }}>
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '8px', padding: '8px 20px', color: 'var(--muted)',
          fontSize: '13px', fontFamily: 'JetBrains Mono, monospace',
          opacity: page >= totalPages ? 0.4 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        Next →
      </button>
    </div>
  )
}