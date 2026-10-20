import { Search } from 'lucide-react'
import PDFUpload from './PDFUpload'

const YEAR_FILTERS = [
  { label: 'Any Year', value: null },
  { label: '2023–2025', value: '2023-2025' },
  { label: '2020–2022', value: '2020-2022' },
  { label: '2015–2019', value: '2015-2019' },
  { label: 'Before 2015', value: '1900-2014' },
]

export default function SearchBar({ query, setQuery, onSearch, yearFilter, setYearFilter }) {
  return (
    <div style={{ marginBottom: '24px' }}>

      {/* Search Input Row */}
      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '6px 6px 6px 16px',
        transition: 'border-color 0.3s',
        gap: '8px',
      }}>
        {/* Search icon */}
        <Search size={18} color="var(--muted)" style={{ flexShrink: 0 }} />

        {/* Text input */}
        <input
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text)', fontSize: '16px', padding: '10px 0',
            minWidth: 0,
          }}
          placeholder="Search by topic, title, author or paste a DOI..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSearch()}
        />

        {/* Paperclip PDF upload button */}
        <PDFUpload onSearch={onSearch} />

        {/* Search button */}
        <button
          onClick={() => onSearch()}
          disabled={!query.trim()}
          style={{
            background: 'linear-gradient(135deg, var(--accent), #0095a8)',
            border: 'none', borderRadius: '10px', padding: '12px 28px',
            color: '#000', fontWeight: '700', fontSize: '14px',
            flexShrink: 0, opacity: query.trim() ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}
        >
          Search →
        </button>
      </div>

      {/* Year Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
        {YEAR_FILTERS.map(f => (
          <button
            key={f.label}
            onClick={() => setYearFilter(f.value)}
            style={{
              background: yearFilter === f.value ? 'rgba(0,229,255,0.1)' : 'var(--surface2)',
              border: `1px solid ${yearFilter === f.value ? 'rgba(0,229,255,0.3)' : 'var(--border)'}`,
              borderRadius: '8px', padding: '6px 14px',
              color: yearFilter === f.value ? 'var(--accent)' : 'var(--muted)',
              fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}