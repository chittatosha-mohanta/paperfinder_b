import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Upload, Send, FileText, Trash2, Copy, Check, RefreshCw,
  Plus, X, PanelLeftClose, PanelLeftOpen, Minimize2, Maximize2
} from "lucide-react"
import Sidebar from "../components/Sidebar"
import { getAISettings, getEffectiveModel } from "../utils/aiSettings"
import "./ChatPDF.css"

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://web-production-4afc.up.railway.app"

const MAX_SESSIONS = 5

const SUGGESTED_QUESTIONS = [
  "Summarize this paper",
  "What is the methodology?",
  "Key findings and conclusions",
  "Datasets and benchmarks used",
]

function parseInlineMarkdown(text) {
  if (!text) return null
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  const parts = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={match.index} className="panel-text-bold">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(<code key={match.index} className="panel-text-code">{token.slice(1, -1)}</code>)
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={match.index} className="panel-text-italic">{token.slice(1, -1)}</em>)
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts.length > 0 ? parts : text
}

function FormattedMessage({ text }) {
  if (!text) return null
  const paragraphs = text.split(/\n\s*\n/)

  return (
    <div className="panel-formatted-content">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n").map(l => l.trim()).filter(Boolean)
        if (lines.length === 0) return null

        return (
          <div key={pIdx} className="panel-chat-block">
            {lines.map((line, lIdx) => {
              const headingMatch = line.match(/^#{1,4}\s+(.*)$/)
              if (headingMatch) {
                return (
                  <div key={lIdx} className="panel-chat-heading">
                    {parseInlineMarkdown(headingMatch[1])}
                  </div>
                )
              }

              const bulletMatch = line.match(/^[-*•]\s+(.*)$/)
              if (bulletMatch) {
                return (
                  <div key={lIdx} className="panel-chat-bullet-row">
                    <span className="panel-bullet-dot">•</span>
                    <span className="panel-bullet-text">{parseInlineMarkdown(bulletMatch[1])}</span>
                  </div>
                )
              }

              const numMatch = line.match(/^(\d+)\.\s+(.*)$/)
              if (numMatch) {
                return (
                  <div key={lIdx} className="panel-chat-bullet-row numbered">
                    <span className="panel-bullet-num">{numMatch[1]}.</span>
                    <span className="panel-bullet-text">{parseInlineMarkdown(numMatch[2])}</span>
                  </div>
                )
              }

              return (
                <p key={lIdx} className="panel-chat-line">
                  {parseInlineMarkdown(line)}
                </p>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function createInitialSession(id = `pdf-${Date.now()}`) {
  return {
    id,
    pdfFile: null,
    pdfText: "",
    pdfInfo: null, // { pages, name, size, words }
    extracting: false,
    messages: [],
    question: "",
    loading: false,
    error: "",
    copiedIndex: null,
    minimized: false,
  }
}

export default function ChatPDF() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessions, setSessions] = useState([createInitialSession("pdf-1")])
  const messagesEndRefs = useRef({})

  // Auto-scroll the specific session messages to bottom
  const scrollToBottom = (sessionId) => {
    messagesEndRefs.current[sessionId]?.scrollIntoView({ behavior: "smooth" })
  }

  // Add a new PDF panel (up to 5)
  function handleAddSession() {
    if (sessions.length >= MAX_SESSIONS) return
    const newId = `pdf-${Date.now()}`
    setSessions(prev => [...prev, createInitialSession(newId)])
  }

  // Remove a PDF panel
  function handleRemoveSession(id) {
    if (sessions.length <= 1) return
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  // Toggle minimize/expand for a panel
  function handleToggleMinimize(id) {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, minimized: !s.minimized } : s))
    )
  }

  // Upload & extract PDF for a specific panel
  async function handleUpload(sessionId, file) {
    if (!file || !file.name.endsWith(".pdf")) {
      updateSession(sessionId, { error: "Please upload a valid PDF file" })
      return
    }

    updateSession(sessionId, {
      pdfFile: file,
      extracting: true,
      error: "",
      messages: [],
      pdfInfo: null,
    })

    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch(`${BACKEND_URL}/extract-pdf-full`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Extraction failed")

      const words = data.text ? data.text.split(/\s+/).length.toLocaleString() : "0"
      const info = {
        pages: data.pages,
        name: file.name.replace(".pdf", ""),
        size: (file.size / 1024).toFixed(1) + " KB",
        words,
      }

      updateSession(sessionId, {
        pdfText: data.text,
        pdfInfo: info,
        extracting: false,
        messages: [
          {
            role: "assistant",
            text: `I've finished reading "${file.name}". It has ${data.pages} pages (~${words} words). Ask me anything about this paper!`,
          },
        ],
      })
      setTimeout(() => scrollToBottom(sessionId), 100)
    } catch (err) {
      updateSession(sessionId, {
        error: err.message,
        extracting: false,
        pdfFile: null,
      })
    }
  }

  // Send message for a specific session
  async function handleSend(sessionId, customText = null) {
    const session = sessions.find(s => s.id === sessionId)
    if (!session) return

    const userMsg = (customText || session.question).trim()
    if (!userMsg || !session.pdfText || session.loading) return

    const newMessages = [...session.messages, { role: "user", text: userMsg }]
    updateSession(sessionId, {
      question: "",
      messages: newMessages,
      loading: true,
    })
    setTimeout(() => scrollToBottom(sessionId), 50)

    try {
      const aiSettings = getAISettings()
      const activeModel = getEffectiveModel(aiSettings)

      const formData = new FormData()
      formData.append("question", userMsg)
      formData.append("pdf_text", session.pdfText)
      formData.append("apiKey", aiSettings.apiKey || "")
      formData.append("model", activeModel)
      formData.append("provider", aiSettings.provider)

      const res = await fetch(`${BACKEND_URL}/chat-pdf`, {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to get answer")

      updateSession(sessionId, {
        messages: [...newMessages, { role: "assistant", text: data.answer }],
        loading: false,
      })
      setTimeout(() => scrollToBottom(sessionId), 50)
    } catch (err) {
      updateSession(sessionId, {
        messages: [...newMessages, { role: "assistant", text: `⚠️ Error: ${err.message}` }],
        loading: false,
      })
    }
  }

  // Clear chat history for a session (keeps the loaded PDF)
  function handleClearChat(sessionId) {
    updateSession(sessionId, {
      messages: [
        {
          role: "assistant",
          text: "Chat cleared! I still have this document loaded. Ask me anything about it.",
        },
      ],
      question: "",
    })
  }

  // Reset a session to upload a new PDF
  function handleReset(sessionId) {
    updateSession(sessionId, {
      pdfFile: null,
      pdfText: "",
      pdfInfo: null,
      messages: [],
      error: "",
      question: "",
    })
  }

  // Copy message text
  function handleCopy(sessionId, text, index) {
    navigator.clipboard.writeText(text)
    updateSession(sessionId, { copiedIndex: index })
    setTimeout(() => {
      updateSession(sessionId, { copiedIndex: null })
    }, 2000)
  }

  // Helper to update session state
  function updateSession(id, partial) {
    setSessions(prev =>
      prev.map(s => (s.id === id ? { ...s, ...partial } : s))
    )
  }

  return (
    <div className="chat-pdf-page">
      {/* Collapsible Sidebar */}
      <Sidebar
        onNewSearch={q => {
          if (q) navigate(`/?q=${q}`)
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="chat-pdf-main">
        {/* Background Grid */}
        <div className="chat-pdf-bg-grid" />

        {/* Top Control Bar */}
        <div className="chat-pdf-header">
          <div className="chat-pdf-header-left">
            <div className="chat-pdf-icon-badge">
              <FileText size={18} />
            </div>
            <div className="chat-pdf-title-group">
              <h2>Multi-PDF Research Chat</h2>
              <p>Compare & chat with up to 5 papers simultaneously ({sessions.length}/5 Active)</p>
            </div>
          </div>

          <div className="chat-pdf-header-actions">
            {/* Add Another PDF Panel */}
            <button
              className="chat-pdf-btn-header chat-pdf-btn-add"
              onClick={handleAddSession}
              disabled={sessions.length >= MAX_SESSIONS}
              title={
                sessions.length >= MAX_SESSIONS
                  ? "Maximum 5 PDFs reached"
                  : "Split screen & add another PDF"
              }
            >
              <Plus size={15} />
              <span>Split & Add PDF ({sessions.length}/{MAX_SESSIONS})</span>
            </button>

            {/* Toggle Sidebar Button */}
            <button
              className="chat-pdf-btn-header"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Hide sidebar for more space"}
            >
              {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              <span>{sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}</span>
            </button>
          </div>
        </div>

        {/* Multi-Column Panels Container */}
        <div className="pdf-columns-container">
          {sessions.map((session, index) => {
            const isSingle = sessions.length === 1

            if (session.minimized) {
              return (
                <div
                  key={session.id}
                  className="pdf-column-panel minimized"
                  onClick={() => handleToggleMinimize(session.id)}
                  title="Click to expand this PDF panel"
                >
                  <div className="panel-minimized-strip">
                    <Maximize2 size={16} color="#00e5ff" />
                    <span className="panel-minimized-badge">
                      PDF {index + 1}: {session.pdfInfo?.name || "Ready"}
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={session.id}
                className={`pdf-column-panel ${isSingle ? "single-mode" : ""}`}
              >
                {/* Panel Header */}
                <div className="panel-header">
                  <div className="panel-header-info">
                    <span className="panel-badge-number">PDF {index + 1}</span>
                    <div className="panel-header-text">
                      <p className="panel-header-name">
                        {session.pdfInfo ? session.pdfInfo.name : "New Research Paper"}
                      </p>
                      {session.pdfInfo && (
                        <p className="panel-header-sub">
                          {session.pdfInfo.pages} pgs · {session.pdfInfo.size} · ~{session.pdfInfo.words} wds
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Panel Action Controls */}
                  <div className="panel-controls">
                    {session.pdfFile && (
                      <>
                        <button
                          className="panel-btn-icon"
                          onClick={() => handleClearChat(session.id)}
                          title="Clear conversation (keeps PDF loaded)"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          className="panel-btn-icon"
                          onClick={() => handleReset(session.id)}
                          title="Replace PDF"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}

                    {sessions.length > 1 && (
                      <button
                        className="panel-btn-icon"
                        onClick={() => handleToggleMinimize(session.id)}
                        title="Minimize panel"
                      >
                        <Minimize2 size={13} />
                      </button>
                    )}

                    {sessions.length > 1 && (
                      <button
                        className="panel-btn-icon danger"
                        onClick={() => handleRemoveSession(session.id)}
                        title="Close this PDF panel"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Panel Content Body */}
                <div className="panel-body">
                  {!session.pdfFile ? (
                    /* Upload Dropzone */
                    <div className="panel-upload-zone">
                      <div
                        className="panel-drop-card"
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => {
                          e.preventDefault()
                          handleUpload(session.id, e.dataTransfer.files[0])
                        }}
                      >
                        <input
                          type="file"
                          accept=".pdf"
                          id={`upload-${session.id}`}
                          style={{ display: "none" }}
                          onChange={e => handleUpload(session.id, e.target.files[0])}
                        />
                        <label htmlFor={`upload-${session.id}`} style={{ cursor: "pointer" }}>
                          <div className="panel-drop-icon">
                            <Upload size={24} />
                          </div>
                          <h3>Upload Research PDF</h3>
                          <p>
                            Drag & drop your paper here or click to browse
                          </p>
                          <span className="panel-btn-choose">Choose File</span>
                        </label>
                        {session.error && (
                          <p style={{ color: "#ff6b6b", fontSize: "12px", marginTop: "12px" }}>
                            ⚠️ {session.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Chat Interface */
                    <>
                      {/* Messages Thread */}
                      <div className="panel-messages-list">
                        {session.extracting ? (
                          <div style={{ textAlign: "center", padding: "40px" }}>
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                margin: "0 auto 10px",
                                border: "3px solid #242642",
                                borderTopColor: "#00e5ff",
                                borderRadius: "50%",
                                animation: "spin 0.8s linear infinite",
                              }}
                            />
                            <p style={{ color: "#8b949e", fontSize: "13px" }}>
                              Extracting text & analysis...
                            </p>
                          </div>
                        ) : (
                          session.messages.map((msg, mi) => (
                            <div
                              key={mi}
                              className={`panel-msg-bubble ${msg.role}`}
                            >
                              <FormattedMessage text={msg.text} />

                              {msg.role === "assistant" && (
                                <button
                                  className="panel-copy-btn"
                                  onClick={() => handleCopy(session.id, msg.text, mi)}
                                  title="Copy response"
                                >
                                  {session.copiedIndex === mi ? (
                                    <>
                                      <Check size={11} color="#00e5ff" />
                                      <span style={{ color: "#00e5ff" }}>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={11} />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          ))
                        )}

                        {session.loading && (
                          <div className="panel-loading-dots">
                            <span style={{ animationDelay: "0s" }} />
                            <span style={{ animationDelay: "0.15s" }} />
                            <span style={{ animationDelay: "0.3s" }} />
                          </div>
                        )}

                        <div ref={el => (messagesEndRefs.current[session.id] = el)} />
                      </div>

                      {/* Suggested Questions (only before first user question) */}
                      {session.messages.length <= 1 && !session.loading && (
                        <div className="panel-suggestions">
                          {SUGGESTED_QUESTIONS.map((q, qi) => (
                            <button
                              key={qi}
                              className="panel-suggestion-btn"
                              onClick={() => handleSend(session.id, q)}
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Bottom Input Box */}
                      <div className="panel-input-container">
                        <div className="panel-input-box">
                          <textarea
                            value={session.question}
                            onChange={e =>
                              updateSession(session.id, { question: e.target.value })
                            }
                            onKeyDown={e => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSend(session.id)
                              }
                            }}
                            placeholder="Ask anything about this paper... (Enter to send)"
                            rows={1}
                          />
                          <button
                            type="button"
                            className={`panel-btn-send ${
                              session.question.trim() && !session.loading ? "active" : ""
                            }`}
                            onClick={() => handleSend(session.id)}
                            disabled={!session.question.trim() || session.loading}
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}