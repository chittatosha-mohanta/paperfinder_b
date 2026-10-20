import { useState, useRef } from 'react'
import { Paperclip, FileText, X, Loader } from 'lucide-react'
import { extractTextFromPDF } from '../utils/extractPdf'

export default function PDFUpload({ onSearch }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [error, setError] = useState(null)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file || file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.')
      setIsOpen(false)
      return
    }
    setError(null)
    setFileName(file.name)
    setIsOpen(false)
    setIsProcessing(true)
    try {
      const text = await extractTextFromPDF(file)
      if (!text || text.length < 20) throw new Error('Could not extract text. Try a different PDF.')
      onSearch(text)
    } catch (err) {
      setError(err.message)
      setFileName(null)
    } finally {
      setIsProcessing(false)
    }
  }

  function handleClear() {
    setFileName(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>

      {/* Paperclip button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Upload PDF"
        style={{
          background: isOpen ? 'rgba(0,229,255,0.1)' : 'none',
          border: `1px solid ${isOpen ? 'rgba(0,229,255,0.3)' : 'transparent'}`,
          borderRadius: '8px',
          padding: '8px',
          color: isProcessing ? 'var(--accent)' : fileName ? 'var(--accent3)' : 'var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
          cursor: 'pointer',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(0,229,255,0.08)' }}
        onMouseLeave={e => {
          if (!isOpen) {
            e.currentTarget.style.color = fileName ? 'var(--accent3)' : 'var(--muted)'
            e.currentTarget.style.background = 'none'
          }
        }}
      >
        {isProcessing
          ? <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />
          : fileName
            ? <FileText size={20} />
            : <Paperclip size={20} />
        }
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Click outside to close */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            bottom: '44px',
            left: '0',
            background: '#1a1d25',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            padding: '8px',
            minWidth: '220px',
            zIndex: 100,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {/* Upload PDF option */}
            <button
              onClick={() => { inputRef.current.click(); setIsOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                background: 'none', border: 'none', borderRadius: '10px',
                padding: '12px 14px', color: 'var(--text)', fontSize: '14px',
                cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileText size={16} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>Upload a PDF</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', fontFamily: 'JetBrains Mono, monospace' }}>
                  Find similar papers
                </div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={e => handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

      {/* Status row */}
      {fileName && !isProcessing && (
        <div style={{
          position: 'absolute', top: '44px', left: 0,
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: '8px', padding: '5px 10px',
          fontSize: '11px', color: 'var(--accent3)',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap', zIndex: 10,
        }}>
          <FileText size={11} />
          {fileName.length > 25 ? fileName.slice(0, 25) + '...' : fileName}
          <button onClick={handleClear} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            padding: '0', cursor: 'pointer', display: 'flex',
          }}>
            <X size={11} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          position: 'absolute', top: '44px', left: 0,
          background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
          borderRadius: '8px', padding: '5px 10px',
          fontSize: '11px', color: '#fda4af',
          fontFamily: 'JetBrains Mono, monospace',
          whiteSpace: 'nowrap', zIndex: 10,
        }}>
          ⚠️ {error}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}