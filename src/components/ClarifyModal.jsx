import { useState, useEffect } from 'react'
import { X, Search, Loader } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://web-production-4afc.up.railway.app'

// ── Keyword chip ──────────────────────────────────────────────
function KeywordChip({ label }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: 'rgba(0,229,255,0.08)',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: '100px', padding: '3px 10px',
            fontSize: '11px', fontFamily: 'JetBrains Mono, monospace',
            color: 'var(--accent)', letterSpacing: '0.5px',
        }}>
            {label}
        </span>
    )
}

// ── Option button ─────────────────────────────────────────────
function OptionButton({ label, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: selected ? 'rgba(0,229,255,0.12)' : 'var(--surface2)',
                border: `1px solid ${selected ? 'rgba(0,229,255,0.4)' : 'var(--border)'}`,
                borderRadius: '8px', padding: '8px 14px',
                color: selected ? 'var(--accent)' : 'var(--muted)',
                fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.15s', textAlign: 'left',
                fontWeight: selected ? '600' : '400',
            }}
            onMouseEnter={e => {
                if (!selected) {
                    e.currentTarget.style.borderColor = 'rgba(0,229,255,0.25)'
                    e.currentTarget.style.color = 'var(--text)'
                }
            }}
            onMouseLeave={e => {
                if (!selected) {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.color = 'var(--muted)'
                }
            }}
        >
            {selected ? '✓ ' : ''}{label}
        </button>
    )
}

// ── Main component ────────────────────────────────────────────
/**
 * ClarifyModal
 * Props:
 *   rawQuery   {string}   — what the user typed
 *   onConfirm  {fn}       — called with refined query string when user confirms
 *   onClose    {fn}       — called when modal is dismissed
 */
export default function ClarifyModal({ rawQuery, onConfirm, onClose }) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [keywords, setKeywords] = useState([])
    const [questions, setQuestions] = useState([])   // [{q, options:[]}]
    const [answers, setAnswers] = useState({})   // { qIndex: optionLabel }

    // ── Ask AI for keywords + questions ───────────────────────
    useEffect(() => {
        async function fetchClarification() {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`${BACKEND_URL}/clarify-search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: rawQuery }),
                })
                const data = await res.json()
                if (!res.ok || !data.success) throw new Error(data.error || 'Failed')
                setKeywords(data.keywords || [])
                setQuestions(data.questions || [])
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchClarification()
    }, [rawQuery])

    // ── Build refined query from original + answers ────────────
    function buildRefinedQuery() {
        const answerParts = Object.values(answers).filter(Boolean)
        if (answerParts.length === 0) return rawQuery
        return `${rawQuery} ${answerParts.join(' ')}`
    }

    const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length

    // ── Lock body scroll ───────────────────────────────────────
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = '' }
    }, [])

    return (
        <>
            <style>{`
        @keyframes cm-fade  { from{opacity:0} to{opacity:1} }
        @keyframes cm-slide { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        .cm-overlay {
          position:fixed; inset:0; z-index:9999;
          background:rgba(6,8,16,0.85);
          backdrop-filter:blur(8px);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
          animation:cm-fade 0.2s ease;
        }
        .cm-box {
          width:100%; max-width:580px;
          background:#0d0d18;
          border:1px solid rgba(0,229,255,0.15);
          border-radius:18px; overflow:hidden;
          animation:cm-slide 0.25s cubic-bezier(0.22,1,0.36,1);
          box-shadow:0 32px 80px rgba(0,0,0,0.6);
        }
        .cm-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:18px 20px 14px;
          border-bottom:1px solid rgba(255,255,255,0.06);
          background:#0a0a14;
        }
        .cm-body   { padding:22px 20px; }
        .cm-footer {
          padding:14px 20px;
          border-top:1px solid rgba(255,255,255,0.06);
          background:#0a0a14;
          display:flex; align-items:center; gap:10px;
        }
        .cm-close {
          width:30px; height:30px; border-radius:7px;
          border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.04);
          color:rgba(255,255,255,0.4);
          cursor:pointer; display:flex; align-items:center; justify-content:center;
          font-size:14px; transition:all 0.15s;
        }
        .cm-close:hover { background:rgba(255,80,80,0.12); color:#ff6b6b; border-color:rgba(255,80,80,0.25); }
        .cm-confirm {
          flex:1; padding:11px;
          background:linear-gradient(135deg, var(--accent,#00e5ff), #0095a8);
          border:none; border-radius:10px;
          color:#000; font-size:14px; font-weight:700;
          cursor:pointer; transition:all 0.15s;
          display:flex; align-items:center; justify-content:center; gap:8px;
          opacity:1;
        }
        .cm-confirm:disabled { opacity:0.4; cursor:not-allowed; }
        .cm-confirm:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 4px 20px rgba(0,229,255,0.3); }
        .cm-skip {
          padding:11px 20px;
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:10px;
          color:rgba(255,255,255,0.45);
          font-size:13px; cursor:pointer; transition:all 0.15s;
        }
        .cm-skip:hover { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); }
      `}</style>

            <div className="cm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
                <div className="cm-box">

                    {/* Header */}
                    <div className="cm-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                background: 'rgba(0,229,255,0.1)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Search size={15} color="var(--accent, #00e5ff)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                                    Refine Your Search
                                </div>
                                <div style={{
                                    fontSize: '11px', color: 'rgba(255,255,255,0.35)',
                                    fontFamily: 'JetBrains Mono, monospace',
                                }}>
                                    Answer a few questions for better results
                                </div>
                            </div>
                        </div>
                        <button className="cm-close" onClick={onClose}>✕</button>
                    </div>

                    {/* Body */}
                    <div className="cm-body">

                        {/* Query preview */}
                        <div style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '10px', padding: '10px 14px',
                            marginBottom: '18px',
                            fontSize: '13px', color: 'rgba(255,255,255,0.6)',
                            fontFamily: 'JetBrains Mono, monospace',
                        }}>
                            🔍 &nbsp;"{rawQuery}"
                        </div>

                        {loading && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '28px 0', justifyContent: 'center',
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '13px', fontFamily: 'JetBrains Mono, monospace',
                            }}>
                                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                Analysing your query...
                            </div>
                        )}

                        {error && (
                            <div style={{
                                background: 'rgba(255,107,107,0.08)',
                                border: '1px solid rgba(255,107,107,0.2)',
                                borderRadius: '10px', padding: '12px 16px',
                                color: '#fda4af', fontSize: '13px',
                                fontFamily: 'JetBrains Mono, monospace',
                            }}>
                                ⚠️ {error} — <button
                                    onClick={onClose}
                                    style={{ background: 'none', border: 'none', color: 'var(--accent,#00e5ff)', cursor: 'pointer', fontSize: '13px' }}
                                >Search anyway →</button>
                            </div>
                        )}

                        {!loading && !error && (
                            <>
                                {/* Extracted keywords */}
                                {keywords.length > 0 && (
                                    <div style={{ marginBottom: '22px' }}>
                                        <div style={{
                                            fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                                            color: 'rgba(255,255,255,0.35)',
                                            fontFamily: 'JetBrains Mono, monospace',
                                            marginBottom: '10px', textTransform: 'uppercase',
                                        }}>
                                            Keywords extracted
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {keywords.map((kw, i) => <KeywordChip key={i} label={kw} />)}
                                        </div>
                                    </div>
                                )}

                                {/* Clarifying questions */}
                                {questions.map((q, qi) => (
                                    <div key={qi} style={{ marginBottom: qi < questions.length - 1 ? '20px' : '4px' }}>
                                        <div style={{
                                            fontSize: '13px', fontWeight: '600',
                                            color: 'rgba(255,255,255,0.85)',
                                            marginBottom: '10px', lineHeight: '1.5',
                                        }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                width: '20px', height: '20px', borderRadius: '50%',
                                                background: 'rgba(0,229,255,0.15)',
                                                color: 'var(--accent,#00e5ff)',
                                                fontSize: '11px', fontWeight: '700',
                                                marginRight: '8px', flexShrink: 0,
                                                fontFamily: 'JetBrains Mono, monospace',
                                            }}>
                                                {qi + 1}
                                            </span>
                                            {q.question}
                                        </div>
                                        <div style={{
                                            display: 'flex', flexWrap: 'wrap', gap: '8px',
                                            paddingLeft: '28px',
                                        }}>
                                            {q.options.map((opt, oi) => (
                                                <OptionButton
                                                    key={oi}
                                                    label={opt}
                                                    selected={answers[qi] === opt}
                                                    onClick={() => setAnswers(prev => ({
                                                        ...prev,
                                                        [qi]: prev[qi] === opt ? undefined : opt,
                                                    }))}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!loading && !error && (
                        <div className="cm-footer">
                            <button className="cm-skip" onClick={() => onConfirm(rawQuery)}>
                                Skip →
                            </button>
                            <button
                                className="cm-confirm"
                                disabled={!allAnswered}
                                onClick={() => onConfirm(buildRefinedQuery())}
                            >
                                <Search size={15} />
                                Search with answers
                            </button>
                        </div>
                    )}

                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    )
}