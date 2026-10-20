import { Link } from 'react-router-dom'
import { ArrowLeft, BookmarkX } from 'lucide-react'
import PaperCard from '../components/PaperCard'
import useStore from '../store/useStore'

export default function Saved() {
  const { bookmarks, removeBookmark } = useStore()

  return (
    <div style={{
      maxWidth: '900px', margin: '0 auto',
      padding: '40px 20px 80px',
      position: 'relative', zIndex: 1,
    }}>

      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />

      {/* Back button */}
      <Link to="/" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        color: 'var(--muted)', fontSize: '13px', marginBottom: '40px',
        fontFamily: 'JetBrains Mono, monospace',
        transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <ArrowLeft size={14} /> Back to Search
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '36px', fontWeight: '800', letterSpacing: '-1.5px',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #fff, var(--accent))',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Saved Papers
        </h1>
        <p style={{
          color: 'var(--muted)', fontSize: '14px',
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {bookmarks.length} paper{bookmarks.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔖</div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            No saved papers yet
          </h2>
          <p style={{
            color: 'var(--muted)', fontSize: '14px',
            fontFamily: 'JetBrains Mono, monospace', marginBottom: '24px',
          }}>
            Click the Save button on any paper to bookmark it here.
          </p>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'linear-gradient(135deg, var(--accent), #0095a8)',
            borderRadius: '10px', padding: '12px 24px',
            color: '#000', fontWeight: '700', fontSize: '14px',
          }}>
            ← Start Searching
          </Link>
        </div>
      )}

      {/* Saved papers list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {bookmarks.map((paper, i) => (
          <PaperCard key={paper.id || i} paper={paper} index={i} />
        ))}
      </div>
    </div>
  )
}