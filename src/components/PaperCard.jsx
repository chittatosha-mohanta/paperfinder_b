import { useState } from 'react'
import { Bookmark, BookmarkCheck, Quote } from 'lucide-react'
import AccessLinks from './AccessLinks'
import CitationModal from './CitationModal'
import { buildLinks } from '../utils/buildLinks'
import useBookmarks from '../hooks/useBookmarks'

export default function PaperCard({ paper, index }) {
  const [showCitation, setShowCitation] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const { toggleBookmark, isBookmarked } = useBookmarks()
  const bookmarked = isBookmarked(paper.id)
  const links = buildLinks(paper)

  return (
    <>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '14px', padding: '24px',
        transition: 'border-color 0.3s, transform 0.2s',
        animation: `fadeUp 0.4s ease ${index * 0.05}s both`,
        position: 'relative', overflow: 'hidden',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(0,229,255,0.2)'
          e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {/* Top line glow on hover */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          opacity: 0,
        }} />

        {/* Meta row */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px', alignItems: 'center' }}>
          {paper.year && (
            <span style={{
              background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)',
              color: 'var(--gold)', borderRadius: '6px', padding: '3px 10px',
              fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
            }}>{paper.year}</span>
          )}
          {paper.isOpenAccess && (
            <span style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              color: 'var(--accent3)', borderRadius: '6px', padding: '3px 10px',
              fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
            }}>✓ Open Access</span>
          )}
          {paper.citations > 0 && (
            <span style={{
              background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
              color: '#a78bfa', borderRadius: '6px', padding: '3px 10px',
              fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
            }}>⬆ {paper.citations.toLocaleString()} citations</span>
          )}
          {paper.venue && (
            <span style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              color: 'var(--muted)', borderRadius: '6px', padding: '3px 10px',
              fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
              maxWidth: '200px', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{paper.venue}</span>
          )}

          {/* Action buttons — right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button onClick={() => setShowCitation(true)} style={{
              background: 'var(--surface2)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '6px 10px', color: 'var(--muted)',
              display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,229,255,0.3)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
            >
              <Quote size={13} /> Cite
            </button>

            <button onClick={() => toggleBookmark(paper)} style={{
              background: bookmarked ? 'rgba(0,229,255,0.1)' : 'var(--surface2)',
              border: `1px solid ${bookmarked ? 'rgba(0,229,255,0.3)' : 'var(--border)'}`,
              borderRadius: '8px', padding: '6px 10px',
              color: bookmarked ? 'var(--accent)' : 'var(--muted)',
              display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px',
              transition: 'all 0.2s',
            }}>
              {bookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
              {bookmarked ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Title */}
        <div style={{
          fontSize: '17px', fontWeight: '700', lineHeight: '1.4',
          color: 'var(--text)', marginBottom: '8px',
        }}>
          {paper.title}
        </div>

        {/* Authors */}
        {paper.authors?.length > 0 && (
          <div style={{
            fontSize: '13px', color: 'var(--muted)', marginBottom: '12px',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {paper.authors.join(', ')}{paper.moreAuthors ? ' et al.' : ''}
          </div>
        )}

        {/* Abstract */}
        {paper.abstract && (
          <div style={{ marginBottom: '4px' }}>
            <p style={{
              fontSize: '13px', color: '#9ca3af', lineHeight: '1.7',
              display: expanded ? 'block' : '-webkit-box',
              WebkitLineClamp: expanded ? 'unset' : 3,
              WebkitBoxOrient: 'vertical',
              overflow: expanded ? 'visible' : 'hidden',
            }}>
              {paper.abstract}
            </p>
            <button onClick={() => setExpanded(!expanded)} style={{
              background: 'none', border: 'none', color: 'var(--accent)',
              fontSize: '12px', padding: '4px 0', marginTop: '4px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {expanded ? '↑ Show less' : '↓ Show more'}
            </button>
          </div>
        )}

        {/* Free access links */}
        <AccessLinks links={links} />
      </div>

      {/* Citation Modal */}
      {showCitation && (
        <CitationModal paper={paper} onClose={() => setShowCitation(false)} />
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}