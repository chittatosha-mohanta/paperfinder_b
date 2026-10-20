import { useState, useEffect, useRef } from "react"

// ─── Section keyword detector ───────────────────────────────────────────────
const SECTION_KEYWORDS = [
  "abstract", "introduction", "related work", "literature review",
  "methodology", "method", "approach", "proposed",
  "results", "discussion", "experiment", "evaluation",
  "conclusion", "future work", "references", "acknowledgment",
  "keywords", "index terms",
]

function classifyLine(raw) {
  const s = raw.trim()
  if (!s) return { type: "empty", text: s }
  const lower = s.toLowerCase()
  const clean = lower
    .replace(/^[ivxlcdm]+\.\s*/i, "")
    .replace(/^\d+\.?\s*/, "")
    .trim()
    .replace(/[:.]+$/, "")
  const isHeading =
    s.length < 90 && SECTION_KEYWORDS.some((kw) => clean.startsWith(kw))
  if (isHeading) return { type: "heading", text: s }
  if (/^\[\d+\]/.test(s)) return { type: "reference", text: s }
  if (/\[diagram_here/i.test(s) || /\[figure/i.test(s)) return { type: "figure", text: s }
  if (lower.startsWith("keywords") || lower.startsWith("index terms")) return { type: "keywords", text: s }
  return { type: "body", text: s }
}

// ─── Paper Review Modal ─────────────────────────────────────────────────────
function PaperReviewModal({ isOpen, onClose, onDownload, content, fileName, paperFormat, title }) {
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && scrollRef.current) scrollRef.current.scrollTop = 0
  }, [isOpen])

  if (!isOpen) return null

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const lines = content.split("\n").map((line, i) => {
    const { type, text } = classifyLine(line)
    if (type === "empty") return <div key={i} style={{ height: "6px" }} />
    if (type === "heading") return (
      <h2 key={i} style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "12px", fontWeight: "700",
        textTransform: "uppercase", letterSpacing: "0.07em",
        color: "#111", margin: "24px 0 8px",
        paddingBottom: "5px", borderBottom: "1.5px solid #222",
      }}>{text}</h2>
    )
    if (type === "reference") return (
      <p key={i} style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "10.5px", lineHeight: "1.55",
        color: "#2a2a2a", margin: "2px 0 2px 20px",
        textIndent: "-20px",
      }}>{text}</p>
    )
    if (type === "figure") return (
      <div key={i} style={{
        display: "flex", alignItems: "center", gap: "10px",
        border: "1.5px dashed #bbb", borderRadius: "4px",
        padding: "14px 18px", margin: "16px 0",
        background: "#f9f9f9",
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "11px", color: "#555", fontStyle: "italic",
      }}>
        <span style={{ fontSize: "20px", opacity: 0.4 }}>⬜</span>
        <span>{text}</span>
      </div>
    )
    if (type === "keywords") return (
      <p key={i} style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "11px", fontStyle: "italic",
        color: "#333", margin: "4px 0 14px",
      }}>{text}</p>
    )
    return (
      <p key={i} style={{
        fontFamily: "'Times New Roman', Times, serif",
        fontSize: "11.5px", lineHeight: "1.8",
        color: "#1a1a1a", margin: "0 0 6px",
        textAlign: "justify", textIndent: "20px",
      }}>{text}</p>
    )
  })

  return (
    <>
      <style>{`
        @keyframes prm-fade { from{opacity:0} to{opacity:1} }
        @keyframes prm-up { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }
        .prm-overlay {
          position:fixed; inset:0; z-index:9999;
          background:rgba(6,8,16,0.88);
          backdrop-filter:blur(8px);
          display:flex; align-items:center; justify-content:center;
          animation:prm-fade 0.2s ease;
          padding: 16px;
        }
        .prm-shell {
          width:100%; max-width:860px; height:90vh;
          display:flex; flex-direction:column;
          background:#0d0d16;
          border:1px solid rgba(167,139,250,0.2);
          border-radius:18px; overflow:hidden;
          animation:prm-up 0.28s cubic-bezier(0.22,1,0.36,1);
          box-shadow:0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(167,139,250,0.08);
        }
        .prm-topbar {
          display:flex; align-items:center; gap:12px;
          padding:14px 20px;
          border-bottom:1px solid rgba(255,255,255,0.06);
          background:#0a0a14;
          flex-shrink:0;
        }
        .prm-scroll {
          flex:1; overflow-y:auto;
          scrollbar-width:thin;
          scrollbar-color:rgba(167,139,250,0.2) transparent;
        }
        .prm-scroll::-webkit-scrollbar { width:5px; }
        .prm-scroll::-webkit-scrollbar-thumb {
          background:rgba(167,139,250,0.2); border-radius:3px;
        }
        .prm-actionbar {
          display:flex; align-items:center; gap:10px;
          padding:12px 20px;
          border-top:1px solid rgba(255,255,255,0.06);
          background:#0a0a14;
          flex-shrink:0;
        }
        .prm-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:9px 18px; border-radius:9px;
          font-size:13px; font-weight:700;
          cursor:pointer; transition:all 0.15s;
          border:1px solid transparent;
          letter-spacing:0.02em;
        }
        .prm-btn:hover { transform:translateY(-1px); }
        .prm-dl {
          background:linear-gradient(135deg,#a78bfa,#0ef);
          color:#000; border-color:transparent;
          box-shadow:0 4px 18px rgba(167,139,250,0.35);
        }
        .prm-dl:hover { box-shadow:0 6px 24px rgba(167,139,250,0.5); }
        .prm-copy {
          background:rgba(255,255,255,0.05);
          color:rgba(255,255,255,0.6);
          border-color:rgba(255,255,255,0.1);
        }
        .prm-copy:hover { background:rgba(255,255,255,0.09); color:#fff; }
        .prm-close {
          width:32px; height:32px; border-radius:8px;
          border:1px solid rgba(255,255,255,0.1);
          background:rgba(255,255,255,0.04);
          color:rgba(255,255,255,0.4);
          cursor:pointer; display:flex;
          align-items:center; justify-content:center;
          font-size:15px; transition:all 0.15s;
          flex-shrink:0;
        }
        .prm-close:hover {
          background:rgba(255,80,80,0.12);
          color:#ff6b6b;
          border-color:rgba(255,80,80,0.25);
        }
      `}</style>

      <div className="prm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="prm-shell">

          {/* ── Top bar ── */}
          <div className="prm-topbar">
            {/* Format badge */}
            <span style={{
              fontSize: "10px", fontWeight: "700", letterSpacing: "0.12em",
              padding: "3px 9px", borderRadius: "5px",
              background: "rgba(167,139,250,0.12)",
              color: "#a78bfa",
              border: "1px solid rgba(167,139,250,0.25)",
              textTransform: "uppercase", flexShrink: 0,
              fontFamily: "JetBrains Mono, monospace",
            }}>{paperFormat}</span>

            {/* Title */}
            <span style={{
              flex: 1, fontSize: "13px", fontWeight: "500",
              color: "rgba(255,255,255,0.7)",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              fontFamily: "'Times New Roman', serif",
            }}>{title}</span>

            {/* Word count */}
            <span style={{
              fontSize: "11px", color: "rgba(255,255,255,0.25)",
              fontFamily: "JetBrains Mono, monospace", flexShrink: 0,
            }}>{wordCount.toLocaleString()} words</span>

            {/* Close */}
            <button className="prm-close" onClick={onClose} title="Close">✕</button>
          </div>

          {/* ── Paper page ── */}
          <div className="prm-scroll" ref={scrollRef}>
            <div style={{
              maxWidth: "680px", margin: "32px auto 48px",
              padding: "52px 60px",
              background: "#fff", borderRadius: "3px",
              boxShadow: "0 8px 60px rgba(0,0,0,0.5)",
              minHeight: "400px",
            }}>
              {/* Paper title */}
              <h1 style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: "20px", fontWeight: "700",
                textAlign: "center", color: "#000",
                margin: "0 0 4px", lineHeight: "1.3",
              }}>{title}</h1>
              <p style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: "10px", textAlign: "center",
                color: "#999", margin: "0 0 28px",
                fontStyle: "italic", letterSpacing: "0.08em",
              }}>[ {paperFormat} Format ]</p>
              <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "0 0 24px" }} />

              {/* Rendered content */}
              {lines}
            </div>
          </div>

          {/* ── Bottom action bar ── */}
          <div className="prm-actionbar">
            <button className="prm-btn prm-dl" onClick={onDownload}>
              ⬇️ Download .docx
            </button>
            <button
              className="prm-btn prm-copy"
              onClick={handleCopy}
              style={copied ? {
                background: "rgba(52,211,153,0.12)",
                color: "#34d399",
                borderColor: "rgba(52,211,153,0.25)",
              } : {}}
            >
              {copied ? "✓ Copied!" : "📋 Copy text"}
            </button>
            <div style={{ flex: 1 }} />
            <span style={{
              fontSize: "11px", color: "rgba(255,255,255,0.2)",
              fontFamily: "JetBrains Mono, monospace",
            }}>
              {fileName}
            </span>
            <button className="prm-btn" onClick={onClose} style={{
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              Close
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

// ─── Main PaperWizard ───────────────────────────────────────────────────────
export default function PaperWizard() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    title: "", abstract: "", references: [],
    format: "IEEE", diagrams: [],
  })
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)   // { downloadUrl, fileName, content }
  const [error, setError] = useState("")
  const [reviewOpen, setReviewOpen] = useState(false)

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://web-production-4afc.up.railway.app"
  const steps = ["Title", "Abstract", "References", "Format", "Diagrams", "Generate"]

  async function handleGenerate() {
    setGenerating(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("abstract", data.abstract)
      formData.append("format", data.format)
      data.references.forEach((file, i) => formData.append(`reference_${i}`, file))
      data.diagrams.forEach((file, i) => formData.append(`diagram_${i}`, file))

      const response = await fetch(`${BACKEND_URL}/generate-paper`, {
        method: "POST",
        body: formData,
      })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error || "Generation failed")

      const bytes = atob(json.docx_base64)
      const byteArray = new Uint8Array(bytes.length)
      for (let i = 0; i < bytes.length; i++) byteArray[i] = bytes.charCodeAt(i)
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })

      setResult({
        downloadUrl: URL.createObjectURL(blob),
        fileName: json.filename,
        content: json.content || "",
      })
    } catch (err) {
      setError(err.message)
    }
    setGenerating(false)
  }

  function handleDownload() {
    if (!result?.downloadUrl) return
    const a = document.createElement("a")
    a.href = result.downloadUrl
    a.download = result.fileName
    a.click()
  }

  function handleReset() {
    setResult(null)
    setStep(1)
    setData({ title: "", abstract: "", references: [], format: "IEEE", diagrams: [] })
  }

  return (
    <div>
      {/* Progress bar */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "40px" }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              height: "4px", borderRadius: "2px", marginBottom: "8px",
              background: i + 1 <= step ? "linear-gradient(90deg, #a78bfa, #0ef)" : "#2a2a3a",
              transition: "background 0.3s",
            }} />
            <span style={{
              fontSize: "11px",
              color: i + 1 === step ? "#a78bfa" : "#555",
              fontFamily: "JetBrains Mono, monospace",
            }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 1 — Title */}
      {step === 1 && (
        <StepCard title="What is your paper title?" step={1}>
          <input
            type="text"
            placeholder="e.g. Deep Learning for Medical Image Segmentation"
            value={data.title}
            onChange={e => setData({ ...data, title: e.target.value })}
            style={inputStyle}
          />
        </StepCard>
      )}

      {/* Step 2 — Abstract */}
      {step === 2 && (
        <StepCard title="Write your abstract" step={2}>
          <textarea
            placeholder="Describe your research, methodology, and key findings..."
            value={data.abstract}
            onChange={e => setData({ ...data, abstract: e.target.value })}
            rows={6}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
          />
        </StepCard>
      )}

      {/* Step 3 — References */}
      {step === 3 && (
        <StepCard title="Upload reference papers (max 5 PDFs)" step={3}>
          {data.references.length < 5 && (
            <div style={uploadZoneStyle}>
              <input
                type="file" accept=".pdf"
                onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  if (data.references.find(r => r.name === file.name)) return
                  setData({ ...data, references: [...data.references, file] })
                  e.target.value = ""
                }}
                style={{ display: "none" }} id="ref-upload"
              />
              <label htmlFor="ref-upload" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>📎</div>
                <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>Click to add a reference PDF</p>
                <p style={{ color: "#555", fontSize: "12px", margin: "6px 0 0" }}>{data.references.length}/5 added</p>
              </label>
            </div>
          )}
          {data.references.length > 0 && (
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.references.map((f, i) => (
                <div key={i} style={{
                  background: "#1a1a2a", borderRadius: "8px", padding: "12px 16px",
                  color: "#aaa", fontSize: "13px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#a78bfa", fontWeight: "700" }}>[{i + 1}]</span>
                    📄 {f.name}
                  </span>
                  <button onClick={() =>
                    setData({ ...data, references: data.references.filter((_, idx) => idx !== i) })
                  } style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: "16px", padding: "0 4px" }}>✕</button>
                </div>
              ))}
            </div>
          )}
          {data.references.length === 5 && (
            <p style={{ color: "#888", fontSize: "13px", marginTop: "12px", textAlign: "center" }}>Maximum 5 references reached</p>
          )}
        </StepCard>
      )}

      {/* Step 4 — Format */}
      {step === 4 && (
        <StepCard title="Choose your paper format" step={4}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {["IEEE", "APA", "MLA", "ACM", "Nature", "Springer"].map(fmt => (
              <button key={fmt} onClick={() => setData({ ...data, format: fmt })} style={{
                padding: "20px", borderRadius: "12px", cursor: "pointer",
                border: data.format === fmt ? "2px solid #a78bfa" : "1px solid #2a2a3a",
                background: data.format === fmt ? "rgba(124,58,237,0.15)" : "#111118",
                color: data.format === fmt ? "#a78bfa" : "#888",
                fontSize: "16px", fontWeight: "700", transition: "all 0.2s",
              }}>{fmt}</button>
            ))}
          </div>
        </StepCard>
      )}

      {/* Step 5 — Diagrams */}
      {step === 5 && (
        <StepCard title="Upload your diagrams (optional)" step={5}>
          {data.diagrams.length < 10 && (
            <div style={uploadZoneStyle}>
              <input
                type="file" accept="image/*"
                onChange={e => {
                  const file = e.target.files[0]
                  if (!file) return
                  if (data.diagrams.find(d => d.name === file.name)) return
                  setData({ ...data, diagrams: [...data.diagrams, file] })
                  e.target.value = ""
                }}
                style={{ display: "none" }} id="diagram-upload"
              />
              <label htmlFor="diagram-upload" style={{ cursor: "pointer" }}>
                <div style={{ fontSize: "32px", marginBottom: "12px" }}>🖼️</div>
                <p style={{ color: "#aaa", fontSize: "14px", margin: 0 }}>Click to add a diagram</p>
                <p style={{ color: "#555", fontSize: "12px", margin: "6px 0 0" }}>
                  Architecture, flowcharts, results — {data.diagrams.length} added
                </p>
              </label>
            </div>
          )}
          {data.diagrams.length > 0 && (
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.diagrams.map((f, i) => (
                <div key={i} style={{
                  background: "#1a1a2a", borderRadius: "8px", padding: "12px 16px",
                  color: "#aaa", fontSize: "13px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#0ef", fontWeight: "700" }}>Fig {i + 1}</span>
                    🖼 {f.name}
                  </span>
                  <button onClick={() =>
                    setData({ ...data, diagrams: data.diagrams.filter((_, idx) => idx !== i) })
                  } style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: "16px", padding: "0 4px" }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </StepCard>
      )}

      {/* Step 6 — Generate */}
      {step === 6 && (
        <StepCard title="Ready to generate your paper!" step={6}>
          <div style={{
            background: "#111118", border: "1px solid #2a2a3a",
            borderRadius: "12px", padding: "24px",
          }}>
            {/* Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
              <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                📌 Title: <span style={{ color: "#fff" }}>{data.title}</span>
              </p>
              <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                📝 Abstract: <span style={{ color: "#fff" }}>
                  {data.abstract ? data.abstract.slice(0, 80) + "..." : "Not provided"}
                </span>
              </p>
              <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                📄 Format: <span style={{ color: "#a78bfa" }}>{data.format}</span>
              </p>
              <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                📚 References: <span style={{ color: "#fff" }}>{data.references.length} file(s)</span>
              </p>
              <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
                🖼 Diagrams: <span style={{ color: "#fff" }}>{data.diagrams.length} file(s)</span>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.25)",
                borderRadius: "8px", padding: "12px 16px", marginBottom: "16px",
                color: "#ff6b6b", fontSize: "13px",
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* ── States ── */}

            {/* Generating spinner */}
            {generating && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{
                  width: "40px", height: "40px", margin: "0 auto 16px",
                  border: "3px solid #2a2a3a", borderTopColor: "#a78bfa",
                  borderRadius: "50%", animation: "spin 0.8s linear infinite",
                }} />
                <p style={{ color: "#a78bfa", fontSize: "14px", margin: "0 0 4px" }}>✨ AI is writing your paper...</p>
                <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>This takes 30–60 seconds</p>
              </div>
            )}

            {/* Ready — Review + Download */}
            {!generating && result && (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
                <p style={{ color: "#fff", fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>
                  Your paper is ready!
                </p>
                <p style={{ color: "#888", fontSize: "13px", margin: "0 0 24px" }}>
                  Review it before downloading — check formatting, sections, and citations.
                </p>

                {/* ── Two action buttons ── */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>

                  {/* Review button — primary CTA */}
                  <button
                    onClick={() => setReviewOpen(true)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      background: "linear-gradient(135deg, #a78bfa, #0ef)",
                      border: "none", borderRadius: "10px",
                      padding: "13px 28px", color: "#000",
                      fontSize: "14px", fontWeight: "700",
                      cursor: "pointer",
                      boxShadow: "0 4px 20px rgba(167,139,250,0.35)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    👁 Review Paper
                  </button>

                  {/* Download button — secondary */}
                  <button
                    onClick={handleDownload}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: "10px", padding: "13px 28px",
                      color: "#fff", fontSize: "14px", fontWeight: "600",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)" }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)" }}
                  >
                    ⬇️ Download .docx
                  </button>
                </div>

                <button onClick={handleReset} style={{
                  display: "block", margin: "20px auto 0",
                  background: "none", border: "none",
                  color: "#555", fontSize: "13px", cursor: "pointer",
                  transition: "color 0.15s",
                }}
                  onMouseEnter={e => e.currentTarget.style.color = "#888"}
                  onMouseLeave={e => e.currentTarget.style.color = "#555"}
                >
                  Write another paper →
                </button>
              </div>
            )}

            {/* Not yet generated */}
            {!generating && !result && (
              <button onClick={handleGenerate} style={{
                width: "100%", padding: "14px",
                background: "linear-gradient(135deg, #a78bfa, #0ef)",
                border: "none", borderRadius: "10px",
                color: "#000", fontSize: "15px", fontWeight: "700",
                cursor: "pointer",
              }}>
                ✨ Generate Paper
              </button>
            )}
          </div>
        </StepCard>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 1}
          style={{
            padding: "10px 24px", borderRadius: "8px",
            background: "none", border: "1px solid #2a2a3a",
            color: step === 1 ? "#444" : "#888",
            cursor: step === 1 ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >← Back</button>

        {step < 6 && (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={step === 1 && !data.title.trim()}
            style={{
              padding: "10px 28px", borderRadius: "8px",
              background: "linear-gradient(135deg, #a78bfa, #0ef)",
              border: "none", color: "#000",
              fontSize: "14px", fontWeight: "700",
              cursor: "pointer",
              opacity: step === 1 && !data.title.trim() ? 0.5 : 1,
            }}
          >Next →</button>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Review Modal ── */}
      <PaperReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onDownload={() => { handleDownload(); setReviewOpen(false) }}
        content={result?.content || ""}
        fileName={result?.fileName || ""}
        paperFormat={data.format}
        title={data.title}
      />
    </div>
  )
}

// ─── Shared sub-components ──────────────────────────────────────────────────
function StepCard({ title, step, children }) {
  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <span style={{
          fontFamily: "JetBrains Mono, monospace", fontSize: "11px",
          color: "#a78bfa", letterSpacing: "2px",
        }}>STEP {step} OF 6</span>
        <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: "700", margin: "8px 0 0" }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

const inputStyle = {
  width: "100%", padding: "14px 16px",
  background: "#111118", border: "1px solid #2a2a3a",
  borderRadius: "10px", color: "#fff", fontSize: "15px",
  boxSizing: "border-box", outline: "none",
  fontFamily: "inherit",
}

const uploadZoneStyle = {
  border: "2px dashed #2a2a3a", borderRadius: "12px",
  padding: "40px", textAlign: "center",
  transition: "border-color 0.2s",
}