export default function AccessLinks({ links }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
      {links.map((link, i) => {
        let bg = 'var(--surface2)'
        let border = '1px solid var(--border)'
        let color = 'var(--text)'
        if (link.type === 'primary') { bg = 'linear-gradient(135deg, var(--accent), #0095a8)'; border = 'none'; color = '#000' }
        if (link.type === 'arxiv') { bg = 'rgba(124,58,237,0.1)'; border = '1px solid rgba(124,58,237,0.2)'; color = '#a78bfa' }
        if (link.type === 'green') { bg = 'rgba(16,185,129,0.08)'; border = '1px solid rgba(16,185,129,0.2)'; color = 'var(--accent3)' }
        return (
          <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" style={{
            background: bg, border: border, color: color,
            borderRadius: '8px', padding: '8px 16px', fontSize: '12px',
            fontWeight: '600', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}>
            {link.label}
          </a>
        )
      })}
    </div>
  )
}