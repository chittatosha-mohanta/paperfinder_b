import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { db } from "../firebase"
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from "firebase/firestore"
import { Search, Bookmark, Plus, LogOut, Clock, FileText, MessageSquare, Key } from "lucide-react"
import APIModal from "./APIModal"
import "./Sidebar.css"

export default function Sidebar({ onNewSearch, collapsed: externalCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const setIsCollapsed = onToggleCollapse || setInternalCollapsed
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

  const profileMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
    }
    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showProfileMenu])

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

  const displayName = user?.displayName || "Chittatosha Mohanta"

  if (isCollapsed) return (
    <div className="sidebar sidebar--collapsed">
      <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>☰</button>
    </div>
  )

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span>🔬 PaperFinder</span>
          <button className="sidebar-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>✕</button>
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

      <div className="sidebar-bottom" ref={profileMenuRef}>
        {showProfileMenu && (
          <div className="sidebar-profile-menu">
            <div className="sidebar-menu-header">
              <span className="sidebar-menu-user">{displayName}</span>
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
          title="Account & API Settings"
        >
          <span className="sidebar-name">{displayName}</span>
        </div>
      </div>

      <APIModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />
    </div>
  )
}