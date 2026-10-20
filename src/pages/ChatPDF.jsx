import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Upload, Send, FileText, Trash2, Copy, Check, RefreshCw } from "lucide-react"
import Sidebar from "../components/Sidebar"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://web-production-4afc.up.railway.app'

const SUGGESTED_QUESTIONS = [
    "📄 Summarize this paper",
    "🔬 What is the methodology?",
    "💡 What are the key findings?",
    "📚 What references are cited?",
]

export default function ChatPDF() {
    const navigate = useNavigate()
    const [pdfFile, setPdfFile] = useState(null)
    const [pdfText, setPdfText] = useState("")
    const [pdfInfo, setPdfInfo] = useState(null)   // { pages, title, size }
    const [extracting, setExtracting] = useState(false)
    const [messages, setMessages] = useState([])
    const [question, setQuestion] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [copied, setCopied] = useState(null)   // index of copied message
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    async function handleUpload(file) {
        if (!file || !file.name.endsWith('.pdf')) {
            setError("Please upload a PDF file")
            return
        }
        setPdfFile(file)
        setExtracting(true)
        setError("")
        setMessages([])
        setPdfInfo(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch(`${BACKEND_URL}/extract-pdf-full`, { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || "Extraction failed")

            setPdfText(data.text)
            setPdfInfo({
                pages: data.pages,
                name: file.name.replace('.pdf', ''),
                size: (file.size / 1024).toFixed(1) + ' KB',
                words: data.text.split(' ').length.toLocaleString(),
            })
            setMessages([{
                role: "assistant",
                text: `I've finished reading this document. It has ${data.pages} pages. You can ask me anything about its content — use the suggestions below or type your own question!`
            }])
        } catch (err) {
            setError(err.message)
            setPdfFile(null)
        }
        setExtracting(false)
    }

    async function handleSend(q) {
        const userMsg = (q || question).trim()
        if (!userMsg || !pdfText || loading) return
        setQuestion("")
        setMessages(prev => [...prev, { role: "user", text: userMsg }])
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('question', userMsg)
            formData.append('pdf_text', pdfText)
            const res = await fetch(`${BACKEND_URL}/chat-pdf`, { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok || !data.success) throw new Error(data.error || "Failed to get answer")
            setMessages(prev => [...prev, { role: "assistant", text: data.answer }])
        } catch (err) {
            setMessages(prev => [...prev, { role: "assistant", text: `⚠️ ${err.message}` }])
        }
        setLoading(false)
    }

    function handleCopy(text, index) {
        navigator.clipboard.writeText(text)
        setCopied(index)
        setTimeout(() => setCopied(null), 2000)
    }

    function handleClearChat() {
        // Clear only messages, keep PDF loaded
        setMessages([{
            role: "assistant",
            text: `Chat cleared! I still have the document loaded. Ask me anything about it.`
        }])
        setQuestion("")
    }

    function handleReset() {
        setPdfFile(null)
        setPdfText("")
        setPdfInfo(null)
        setMessages([])
        setError("")
        setQuestion("")
    }

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0a0a0f" }}>
            <Sidebar onNewSearch={(q) => { if (q) navigate(`/?q=${q}`) }} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

                {/* Background grid */}
                <div style={{
                    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
                    backgroundImage: `linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)`,
                    backgroundSize: "60px 60px",
                }} />

                {/* Header */}
                <div style={{
                    padding: "16px 32px",
                    borderBottom: "1px solid #1a1a2a",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    position: "relative", zIndex: 1,
                    background: "rgba(10,10,15,0.8)", backdropFilter: "blur(10px)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            background: "rgba(0,229,255,0.1)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <FileText size={18} color="#0ef" />
                        </div>
                        <div>
                            <h2 style={{ color: "#fff", fontSize: "16px", fontWeight: "700", margin: 0 }}>
                                Chat with PDF
                            </h2>
                            <p style={{ color: "#555", fontSize: "12px", margin: 0, fontFamily: "JetBrains Mono, monospace" }}>
                                {pdfFile ? pdfFile.name : "Upload a PDF to start chatting"}
                            </p>
                        </div>
                    </div>

                    {pdfFile && (
                        <div style={{ display: "flex", gap: "8px" }}>
                            {/* Clear chat only */}
                            <button onClick={handleClearChat} style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                background: "rgba(0,229,255,0.06)", border: "1px solid rgba(0,229,255,0.15)",
                                borderRadius: "8px", padding: "7px 14px",
                                color: "#0ef", fontSize: "13px", cursor: "pointer",
                            }}>
                                <RefreshCw size={13} /> New Chat
                            </button>
                            {/* Full reset */}
                            <button onClick={handleReset} style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)",
                                borderRadius: "8px", padding: "7px 14px",
                                color: "#ff6b6b", fontSize: "13px", cursor: "pointer",
                            }}>
                                <Trash2 size={13} /> New PDF
                            </button>
                        </div>
                    )}
                </div>

                {/* Main area */}
                {!pdfFile ? (
                    <div style={{
                        flex: 1, display: "flex", alignItems: "center",
                        justifyContent: "center", position: "relative", zIndex: 1,
                    }}>
                        <div
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => { e.preventDefault(); handleUpload(e.dataTransfer.files[0]) }}
                            style={{
                                border: "2px dashed #2a2a3a", borderRadius: "20px",
                                padding: "60px 80px", textAlign: "center",
                                transition: "all 0.2s", maxWidth: "480px", width: "100%",
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(0,229,255,0.4)"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a3a"}
                        >
                            <input type="file" accept=".pdf" id="pdf-upload"
                                style={{ display: "none" }}
                                onChange={e => handleUpload(e.target.files[0])}
                            />
                            <label htmlFor="pdf-upload" style={{ cursor: "pointer" }}>
                                <div style={{
                                    width: "64px", height: "64px", borderRadius: "16px",
                                    background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    margin: "0 auto 20px",
                                }}>
                                    <Upload size={28} color="#0ef" />
                                </div>
                                <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                                    Upload your PDF
                                </h3>
                                <p style={{ color: "#888", fontSize: "14px", marginBottom: "20px", lineHeight: "1.6" }}>
                                    Drag & drop or click to upload.<br />
                                    Then ask any question about it.
                                </p>
                                <div style={{
                                    display: "inline-block",
                                    background: "linear-gradient(135deg, #0ef2, #7c3aed22)",
                                    border: "1px solid rgba(0,229,255,0.3)",
                                    borderRadius: "8px", padding: "10px 24px",
                                    color: "#0ef", fontSize: "14px", fontWeight: "600",
                                }}>
                                    Choose PDF
                                </div>
                            </label>
                            {error && <p style={{ color: "#ff6b6b", fontSize: "13px", marginTop: "16px" }}>⚠️ {error}</p>}
                        </div>
                    </div>

                ) : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", zIndex: 1 }}>

                        {/* PDF Info Card */}
                        {pdfInfo && (
                            <div style={{
                                margin: "16px 32px 0",
                                background: "rgba(0,229,255,0.04)",
                                border: "1px solid rgba(0,229,255,0.12)",
                                borderRadius: "12px", padding: "14px 20px",
                                display: "flex", alignItems: "center", gap: "16px",
                                flexWrap: "wrap",
                            }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "8px",
                                    background: "rgba(0,229,255,0.1)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <FileText size={16} color="#0ef" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{
                                        color: "#fff", fontSize: "14px", fontWeight: "600",
                                        margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                                    }}>
                                        {pdfInfo.name}
                                    </p>
                                    <p style={{ color: "#666", fontSize: "11px", margin: "2px 0 0", fontFamily: "JetBrains Mono, monospace" }}>
                                        {pdfInfo.pages} pages · {pdfInfo.size} · ~{pdfInfo.words} words extracted
                                    </p>
                                </div>
                                <div style={{
                                    background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.15)",
                                    borderRadius: "6px", padding: "4px 10px",
                                    color: "#0ef", fontSize: "11px", fontFamily: "JetBrains Mono, monospace",
                                    flexShrink: 0,
                                }}>
                                    ✓ Ready
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div style={{
                            flex: 1, overflowY: "auto", padding: "20px 32px",
                            display: "flex", flexDirection: "column", gap: "16px",
                        }}>
                            {extracting ? (
                                <div style={{ textAlign: "center", padding: "40px" }}>
                                    <div style={{
                                        width: "32px", height: "32px", margin: "0 auto 12px",
                                        border: "3px solid #2a2a3a", borderTopColor: "#0ef",
                                        borderRadius: "50%", animation: "spin 0.8s linear infinite",
                                    }} />
                                    <p style={{ color: "#888", fontSize: "14px" }}>Reading your PDF...</p>
                                </div>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} style={{
                                        display: "flex",
                                        justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                                    }}>
                                        <div style={{ maxWidth: "75%", position: "relative" }}>
                                            <div style={{
                                                background: msg.role === "user"
                                                    ? "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.15))"
                                                    : "#111118",
                                                border: msg.role === "user"
                                                    ? "1px solid rgba(0,229,255,0.2)"
                                                    : "1px solid #2a2a3a",
                                                borderRadius: msg.role === "user"
                                                    ? "18px 18px 4px 18px"
                                                    : "18px 18px 18px 4px",
                                                padding: "14px 18px",
                                                paddingBottom: msg.role === "assistant" ? "32px" : "14px",
                                                color: "#ddd", fontSize: "14px",
                                                lineHeight: "1.7", whiteSpace: "pre-wrap",
                                            }}>
                                                {msg.text}
                                            </div>

                                            {/* Copy button for assistant messages */}
                                            {msg.role === "assistant" && (
                                                <button
                                                    onClick={() => handleCopy(msg.text, i)}
                                                    style={{
                                                        position: "absolute", bottom: "8px", right: "10px",
                                                        background: "none", border: "none", cursor: "pointer",
                                                        display: "flex", alignItems: "center", gap: "4px",
                                                        color: copied === i ? "#0ef" : "#555",
                                                        fontSize: "11px", padding: "3px 6px",
                                                        borderRadius: "4px",
                                                        transition: "color 0.2s",
                                                    }}
                                                >
                                                    {copied === i
                                                        ? <><Check size={11} /> Copied</>
                                                        : <><Copy size={11} /> Copy</>
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}

                            {loading && (
                                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                                    <div style={{
                                        background: "#111118", border: "1px solid #2a2a3a",
                                        borderRadius: "18px 18px 18px 4px",
                                        padding: "14px 18px", display: "flex", gap: "6px", alignItems: "center",
                                    }}>
                                        {[0, 1, 2].map(i => (
                                            <div key={i} style={{
                                                width: "7px", height: "7px", borderRadius: "50%",
                                                background: "#0ef", opacity: 0.6,
                                                animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                                            }} />
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>

                        {/* Suggested questions — only show if no user message yet */}
                        {messages.length <= 1 && !loading && (
                            <div style={{
                                padding: "0 32px 12px",
                                display: "flex", gap: "8px", flexWrap: "wrap",
                            }}>
                                {SUGGESTED_QUESTIONS.map((q, i) => (
                                    <button key={i} onClick={() => handleSend(q)} style={{
                                        background: "rgba(124,58,237,0.08)",
                                        border: "1px solid rgba(124,58,237,0.2)",
                                        borderRadius: "20px", padding: "7px 14px",
                                        color: "#a78bfa", fontSize: "13px",
                                        cursor: "pointer", transition: "all 0.2s",
                                        whiteSpace: "nowrap",
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.15)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.4)" }}
                                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.08)"; e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)" }}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input bar */}
                        <div style={{
                            padding: "12px 32px 24px",
                            borderTop: "1px solid #1a1a2a",
                            background: "rgba(10,10,15,0.9)",
                            backdropFilter: "blur(10px)",
                        }}>
                            <div style={{
                                display: "flex", gap: "12px", alignItems: "flex-end",
                                background: "#111118", border: "1px solid #2a2a3a",
                                borderRadius: "14px", padding: "12px 16px",
                            }}>
                                <textarea
                                    value={question}
                                    onChange={e => setQuestion(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSend()
                                        }
                                    }}
                                    placeholder="Ask anything about the PDF... (Enter to send)"
                                    rows={1}
                                    style={{
                                        flex: 1, background: "none", border: "none",
                                        color: "#fff", fontSize: "14px", resize: "none",
                                        outline: "none", lineHeight: "1.6",
                                        fontFamily: "inherit", maxHeight: "120px",
                                    }}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!question.trim() || loading}
                                    style={{
                                        width: "36px", height: "36px", borderRadius: "10px",
                                        background: question.trim() && !loading
                                            ? "linear-gradient(135deg, #0ef, #7c3aed)"
                                            : "#2a2a3a",
                                        border: "none",
                                        cursor: question.trim() && !loading ? "pointer" : "not-allowed",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        flexShrink: 0, transition: "all 0.2s",
                                    }}
                                >
                                    <Send size={15} color={question.trim() && !loading ? "#000" : "#555"} />
                                </button>
                            </div>
                            <p style={{
                                color: "#444", fontSize: "11px", marginTop: "8px",
                                textAlign: "center", fontFamily: "JetBrains Mono, monospace"
                            }}>
                                Answers are based only on the uploaded PDF content
                            </p>
                        </div>
                    </div>
                )}

                <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}</style>
            </div>
        </div>
    )
}