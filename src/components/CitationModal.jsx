import { useState } from 'react'
import { X, Copy, Check } from 'lucide-react'
import { formatAPA, formatBibTeX } from '../utils/formatCitation'

export default function CitationModal({ paper, onClose }) {
  const [tab, setTab] = useState('apa')
  const [copied, setCopied] = useState(false)

  const citation = tab === 'apa' ? formatAPA(paper) : formatBibTeX(paper)

  function handleCopy() {
    navigator.clipboard.writeText(citation)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '20px',
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '560px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Copy Citation</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['apa', 'bibtex'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: '8px', fontWeight: '600',
              fontSize: '13px', border: '1px solid',
              background: tab === t ? 'rgba(0,229,255,0.1)' : 'var(--surface2)',
              borderColor: tab === t ? 'rgba(0,229,255,0.3)' : 'var(--border)',
              color: tab === t ? 'var(--accent)' : 'var(--muted)',
            }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Citation text */}
        <pre style={{
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '16px', fontSize: '12px',
          fontFamily: 'JetBrains Mono, monospace', color: 'var(--text)',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          lineHeight: '1.7', marginBottom: '16px', maxHeight: '200px',
          overflowY: 'auto',
        }}>
          {citation}
        </pre>

        {/* Copy button */}
        <button onClick={handleCopy} style={{
          width: '100%', padding: '12px',
          background: copied ? 'rgba(16,185,129,0.1)' : 'linear-gradient(135deg, var(--accent), #0095a8)',
          border: copied ? '1px solid rgba(16,185,129,0.3)' : 'none',
          borderRadius: '10px', fontWeight: '700', fontSize: '14px',
          color: copied ? 'var(--accent3)' : '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.3s',
        }}>
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
        </button>
      </div>
    </div>
  )
}