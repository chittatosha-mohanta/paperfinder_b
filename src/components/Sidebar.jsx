import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { db } from "../firebase"
import { collection, query, orderBy, limit, onSnapshot, doc, deleteDoc } from "firebase/firestore"
import { Search, Bookmark, Plus, LogOut, Clock, FileText, MessageSquare, Key, User } from "lucide-react"
import APIModal from "./APIModal"
import ProfileModal from "./ProfileModal"
import "./Sidebar.css"

const AVATAR_GRADIENTS = {
  cyan: "linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)",
  purple: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  emerald: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
  amber: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
}

export default function Sidebar({ onNewSearch, collapsed: externalCollapsed, onToggleCollapse }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const setIsCollapsed = onToggleCollapse || setInternalCollapsed
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileData, setProfileData] = useState(null)

  // Listen to search history
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

  // Listen to profile details in Firestore
  useEffect(() => {
    if (!user) return
    const userDocRef = doc(db, "users", user.uid)
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        setProfileData(snap.data())
      }
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

  const displayName = profileData?.displayName || user?.displayName || "Chittatosha Mohanta"
  const initials = displayName
    .split(" ")
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CM"

  const avatarGradient = AVATAR_GRADIENTS[profileData?.avatarColor] || AVATAR_GRADIENTS.cyan

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
              <div className="sidebar-menu-header-row">
                <div className="sidebar-avatar sm" style={{ background: avatarGradient }}>
                  {initials}
                </div>
                <div className="sidebar-menu-titles">
                  <span className="sidebar-menu-user">{displayName}</span>
                  <span className="sidebar-menu-email">{user?.email}</span>
                </div>
              </div>
            </div>
            <div className="sidebar-menu-divider" />
            <button
              className="sidebar-menu-item"
              onClick={() => {
                setShowProfileMenu(false)
                setShowProfileModal(true)
              }}
            >
              <User size={15} className="menu-item-icon" />
              <span>My Profile</span>
              <span className="sidebar-menu-badge profile">Account</span>
            </button>
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
          title="Account, Profile & API Settings"
        >
          <div className="sidebar-avatar" style={{ background: avatarGradient }}>
            {initials}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-name">{displayName}</span>
          </div>
        </div>
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
      <APIModal isOpen={showApiModal} onClose={() => setShowApiModal(false)} />
    </div>
  )
}