import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PaperCard from '../components/PaperCard'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import ClarifyModal from '../components/ClarifyModal'
import useSearch from '../hooks/useSearch'
import useStore from '../store/useStore'
import Sidebar from "../components/Sidebar"

export default function Home() {
  const {
    query, setQuery,
    results, total,
    isLoading, error,
    page, yearFilter, setYearFilter,
    handleSearch, handlePageChange,
    hasSearched, submittedQuery,
  } = useSearch()

  const bookmarkCount = useStore(s => s.bookmarks.length)

  // ── Clarify modal state ────────────────────────────────────
  const [clarifyQuery, setClarifyQuery] = useState(null)  // null = hidden

  // Called when user clicks Search button
  function handleSearchClick(q = query) {
    const trimmed = (typeof q === 'string' ? q : query).trim()
    if (!trimmed) return
    // Show clarify modal instead of searching immediately
    setClarifyQuery(trimmed)
  }

  // Called when user confirms answers in the modal
  function handleClarifyConfirm(refinedQuery) {
    setClarifyQuery(null)
    handleSearch(refinedQuery)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0a0a0f' }}>

      {/* SIDEBAR */}
      <Sidebar onNewSearch={(q) => {
        if (q) { setQuery(q); handleSearch(q) }
        else { setQuery('') }
      }} />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>

        {/* Background grid */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }} />

        {/* Glow orbs */}
        <div style={{
          position: 'fixed', width: '500px', height: '500px', borderRadius: '50%',
          background: 'rgba(0,229,255,0.05)', filter: 'blur(120px)',
          top: '-200px', left: '-200px', pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'fixed', width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(124,58,237,0.06)', filter: 'blur(120px)',
          bottom: '-150px', right: '-100px', pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>

          {/* Top nav */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <Link to="/saved" style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '8px 16px',
              color: 'var(--muted)', fontSize: '13px', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
            >
              <Bookmark size={14} />
              Saved Papers
              {bookmarkCount > 0 && (
                <span style={{
                  background: 'var(--accent)', color: '#000',
                  borderRadius: '100px', padding: '1px 7px',
                  fontSize: '11px', fontWeight: '700',
                }}>{bookmarkCount}</span>
              )}
            </Link>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', padding: '20px 0 48px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)',
              borderRadius: '100px', padding: '6px 16px', marginBottom: '24px',
              fontFamily: 'JetBrains Mono, monospace', fontSize: '11px',
              color: 'var(--accent)', letterSpacing: '2px',
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--accent)', animation: 'pulse 2s infinite',
              }} />
              FREE RESEARCH ACCESS
            </div>

            <h1 style={{
              fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: '800',
              letterSpacing: '-2px', lineHeight: '1.05', marginBottom: '16px',
              background: 'linear-gradient(135deg, #fff 0%, var(--accent) 50%, var(--accent2) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Find Papers Free
            </h1>

            <p style={{
              color: 'var(--muted)', fontSize: '15px', maxWidth: '480px',
              margin: '0 auto 24px',
              fontFamily: 'JetBrains Mono, monospace', lineHeight: '1.7',
            }}>
              Search 250M+ research papers — find free legal access
              via arXiv, Unpaywall, CORE & more
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['OpenAlex', 'arXiv', 'Unpaywall', 'CORE.ac.uk', 'PubMed'].map(s => (
                <div key={s} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '6px', padding: '5px 12px',
                  fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
                  color: 'var(--muted)',
                }}>
                  <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent3)' }} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div style={{
            background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)',
            borderRadius: '10px', padding: '14px 18px', marginBottom: '28px',
            fontSize: '12px', fontFamily: 'JetBrains Mono, monospace',
            color: '#7dd3fc', lineHeight: '1.7',
          }}>
            💡 Finds <strong>legally free</strong> versions — author preprints,
            open-access journals, and institutional repositories. No paywalls bypassed.
          </div>

          {/* Search bar — uses handleSearchClick to trigger modal first */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={handleSearchClick}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
          />

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.25)',
              borderRadius: '10px', padding: '14px 18px', marginBottom: '24px',
              fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#fda4af',
            }}>
              ⚠️ {error.message} — Check your internet connection and try again.
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '8px',
              marginBottom: '24px', fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px', color: 'var(--muted)',
            }}>
              <div style={{
                width: '14px', height: '14px',
                border: '2px solid var(--border)',
                borderTopColor: 'var(--accent)', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', flexShrink: 0,
              }} />
              Searching OpenAlex — 250M+ research works...
            </div>
          )}

          {/* Results count */}
          {!isLoading && hasSearched && results.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 16px', background: 'var(--surface)',
              border: '1px solid var(--border)', borderRadius: '8px',
              marginBottom: '24px', fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px', color: 'var(--muted)',
            }}>
              ✓ ~{total.toLocaleString()} results for "{submittedQuery}" — page {page}
            </div>
          )}

          {/* Empty state */}
          {!hasSearched && !isLoading && <EmptyState onSearch={handleSearchClick} />}

          {/* No results */}
          {hasSearched && !isLoading && results.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No results found</h3>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Try different keywords or broader terms.</p>
            </div>
          )}

          {/* Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {results.map((paper, i) => (
              <PaperCard key={paper.id || i} paper={paper} index={i} />
            ))}
          </div>

          {/* Pagination */}
          {!isLoading && results.length > 0 && (
            <Pagination page={page} total={total} onPageChange={handlePageChange} />
          )}
        </div>

        <style>{`
          @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
          @keyframes spin  { to{transform:rotate(360deg);} }
        `}</style>
      </div>

      {/* Clarify modal — rendered outside scroll container */}
      {clarifyQuery && (
        <ClarifyModal
          rawQuery={clarifyQuery}
          onConfirm={handleClarifyConfirm}
          onClose={() => setClarifyQuery(null)}
        />
      )}
    </div>
  )
}