import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { db } from "../firebase"
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from "firebase/firestore"
import { Search, Bookmark, Plus, LogOut, Clock, FileText, MessageSquare, Key, ChevronUp } from "lucide-react"
import APIModal from "./APIModal"
import "./Sidebar.css"

export default function Sidebar({ onNewSearch }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [collapsed, setCollapsed] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "users", user.uid, "searchHistory"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
    const unsub = onSnapshot(q, (snap) => {
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [user])

  async function handleLogout() {
    await logout()
    navigate("/login")
  }

  async function handleDeleteHistory(e, id) {
    e.stopPropagation()
    try {
      await deleteDoc(doc(db, "users", user.uid, "searchHistory", id))
    } catch (err) {
      console.error("Failed to delete:", err)
    }
  }

  const initials = user?.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").toUpperCase()
    : user?.email?.[0].toUpperCase()

  if (collapsed) return (
    <div className="sidebar sidebar--collapsed">
      <button className="sidebar-toggle" onClick={() => setCollapsed(false)}>☰</button>
    </div>
  )

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span>🔬 PaperFinder</span>
          <button className="sidebar-toggle" onClick={() => setCollapsed(true)}>✕</button>
        </div>

        <button className="sidebar-new" onClick={() => onNewSearch('')}>
          <Plus size={16} /> New Search
        </button>

        <button className="sidebar-link" onClick={() => navigate("/")}>
          <Search size={15} /> Search
        </button>
        <button className="sidebar-link" onClick={() => navigate("/write-paper")}>
          <FileText size={15} /> Write a Paper
        </button>
        <button className="sidebar-link" onClick={() => navigate("/chat-pdf")}>
          <MessageSquare size={15} /> Chat with PDF
        </button>
        <button className="sidebar-link" onClick={() => navigate("/saved")}>
          <Bookmark size={15} /> Saved Papers
        </button>
      </div>

      <div className="sidebar-history">
        <p className="sidebar-section-label"><Clock size={13} /> Recents</p>
        {history.length === 0 && (
          <p className="sidebar-empty">No searches yet</p>
        )}
        {history.map(h => (
          <div key={h.id} className="sidebar-history-row">
            <button
              className="sidebar-history-item"
              onClick={() => onNewSearch(h.query)}
              title={h.query}
            >
              {h.query}
            </button>
            <button
              className="sidebar-history-delete"
              onClick={(e) => handleDeleteHistory(e, h.id)}
            >✕</button>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        {showProfileMenu && (
          <div className="sidebar-profile-menu">
            <div className="sidebar-menu-header">
              <span className="sidebar-menu-user">{user?.displayName || "User"}</span>
              <span className="sidebar-menu-email">{user?.email}</span>
            </div>
            <div className="sidebar-menu-divider" />
            <button
              className="sidebar-menu-item"
              onClick={() => {
                setShowProfileMenu(false)
                setShowApiModal(true)
              }}
            >
              <Key size={15} className="menu-item-icon" />
              <span>API Settings</span>
              <span className="sidebar-menu-badge">LLM</span>
            </button>
            <button
              className="sidebar-menu-item text-danger"
              onClick={() => {
                setShowProfileMenu(false)
                handleLogout()
              }}
            >
              <LogOut size={15} className="menu-item-icon" />
              <span>Log Out</span>
            </button>
          </div>
        )}

        <div
          className="sidebar-profile"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          title="Click to view API settings and profile options"
        >
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-name">{user?.displayName || user?.email}</span>
            <span className="sidebar-plan">Free plan • Click for API</span>
          </div>
          <ChevronUp
            size={14}
            className={`sidebar-profile-chevron ${showProfileMenu ? "open" : ""}`}
          />
        </div>
      </div>

      <APIModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />
    </div>
  )
}