import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { updateProfile } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../firebase"
import { useAuth } from "../hooks/useAuth"
import {
  User, Mail, Building, BookOpen, Quote, FileText,
  Check, X, Sparkles, Loader2, Save
} from "lucide-react"
import "./ProfileModal.css"

const AVATAR_COLORS = [
  { id: "cyan", label: "Cyan Neon", gradient: "linear-gradient(135deg, #00e5ff 0%, #3b82f6 100%)", glow: "rgba(0, 229, 255, 0.4)" },
  { id: "purple", label: "Purple Nebula", gradient: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)", glow: "rgba(168, 85, 247, 0.4)" },
  { id: "emerald", label: "Emerald Matrix", gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)", glow: "rgba(16, 185, 129, 0.4)" },
  { id: "amber", label: "Solar Flare", gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", glow: "rgba(245, 158, 11, 0.4)" },
]

const CITATION_FORMATS = ["IEEE", "APA", "MLA", "Chicago", "Harvard", "BibTeX"]

export default function ProfileModal({ isOpen, onClose }) {
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    displayName: "",
    role: "",
    institution: "",
    field: "",
    bio: "",
    citationFormat: "IEEE",
    avatarColor: "cyan",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // Load existing profile details from Firestore
  useEffect(() => {
    if (!isOpen || !user) return

    setErrorMessage("")
    setSaveSuccess(false)
    setLoading(true)

    async function fetchProfile() {
      try {
        const userDocRef = doc(db, "users", user.uid)
        const snap = await getDoc(userDocRef)

        if (snap.exists()) {
          const data = snap.data()
          setFormData({
            displayName: data.displayName || user.displayName || "Chittatosha Mohanta",
            role: data.role || "Researcher / Engineer",
            institution: data.institution || "",
            field: data.field || "Computer Science / AI",
            bio: data.bio || "",
            citationFormat: data.citationFormat || "IEEE",
            avatarColor: data.avatarColor || "cyan",
          })
        } else {
          setFormData({
            displayName: user.displayName || "Chittatosha Mohanta",
            role: "Researcher / Engineer",
            institution: "",
            field: "Computer Science / AI",
            bio: "",
            citationFormat: "IEEE",
            avatarColor: "cyan",
          })
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err)
        setFormData(prev => ({
          ...prev,
          displayName: user.displayName || "Chittatosha Mohanta"
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [isOpen, user])

  if (!isOpen) return null

  // Calculate initials from current typed display name
  const nameToUse = formData.displayName.trim() || user?.displayName || "CM"
  const initials = nameToUse
    .split(" ")
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CM"

  const selectedTheme = AVATAR_COLORS.find(c => c.id === formData.avatarColor) || AVATAR_COLORS[0]

  async function handleSave(e) {
    e?.preventDefault()
    if (!user) return

    setSaving(true)
    setErrorMessage("")
    setSaveSuccess(false)

    try {
      const trimmedName = formData.displayName.trim() || "Chittatosha Mohanta"

      // 1. Update Firebase Auth displayName if currentUser is present
      if (auth.currentUser && auth.currentUser.displayName !== trimmedName) {
        await updateProfile(auth.currentUser, { displayName: trimmedName })
      }

      // 2. Save full profile data to Firestore
      const userDocRef = doc(db, "users", user.uid)
      await setDoc(
        userDocRef,
        {
          displayName: trimmedName,
          email: user.email || "",
          role: formData.role.trim(),
          institution: formData.institution.trim(),
          field: formData.field.trim(),
          bio: formData.bio.trim(),
          citationFormat: formData.citationFormat,
          avatarColor: formData.avatarColor,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3500)
    } catch (err) {
      console.error("Failed to save profile:", err)
      setErrorMessage(err.message || "Could not save profile details")
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <div className="profile-modal-backdrop" onClick={onClose}>
      <div
        className="profile-modal-card"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="profile-modal-header">
          <div className="profile-header-main">
            <div
              className="profile-large-avatar"
              style={{
                background: selectedTheme.gradient,
                boxShadow: `0 0 24px ${selectedTheme.glow}`,
              }}
            >
              {initials}
            </div>
            <div className="profile-header-titles">
              <h2 className="profile-modal-title">{formData.displayName || "My Profile"}</h2>
              <div className="profile-header-sub">
                <span className="profile-sub-email">{user?.email || "Academic Account"}</span>
                <span className="profile-role-badge">{formData.role || "Researcher"}</span>
              </div>
            </div>
          </div>
          <button className="profile-btn-close" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="profile-loading-box">
            <Loader2 className="profile-spin-icon" size={28} />
            <p>Loading profile details...</p>
          </div>
        ) : (
          <form className="profile-modal-form" onSubmit={handleSave}>
            {/* Status alerts */}
            {saveSuccess && (
              <div className="profile-alert success">
                <Check size={16} />
                <span>Profile details saved successfully!</span>
              </div>
            )}
            {errorMessage && (
              <div className="profile-alert error">
                <X size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Avatar Theme Selection */}
            <div className="profile-field-group">
              <label className="profile-field-label">
                <Sparkles size={13} className="field-label-icon" />
                Avatar Theme
              </label>
              <div className="profile-avatar-swatches">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`profile-swatch-btn ${formData.avatarColor === c.id ? "active" : ""}`}
                    style={{ background: c.gradient }}
                    onClick={() => setFormData(prev => ({ ...prev, avatarColor: c.id }))}
                    title={c.label}
                  >
                    {formData.avatarColor === c.id && <Check size={14} color="#fff" />}
                  </button>
                ))}
                <span className="profile-swatch-hint">{selectedTheme.label}</span>
              </div>
            </div>

            {/* Two Column Grid */}
            <div className="profile-fields-grid">
              {/* Full Name */}
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <User size={13} className="field-label-icon" />
                  Full Name
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={formData.displayName}
                  onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="e.g. Chittatosha Mohanta"
                  required
                />
              </div>

              {/* Email (Read Only) */}
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <Mail size={13} className="field-label-icon" />
                  Account Email
                </label>
                <input
                  type="email"
                  className="profile-input disabled"
                  value={user?.email || ""}
                  disabled
                  title="Email cannot be changed"
                />
              </div>

              {/* Role / Title */}
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <Building size={13} className="field-label-icon" />
                  Role / Title
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={formData.role}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. AI Researcher / Engineer / Student"
                />
              </div>

              {/* Institution / Lab / Company */}
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <BookOpen size={13} className="field-label-icon" />
                  Institution / Organization
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={formData.institution}
                  onChange={e => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="e.g. StepsAI / University"
                />
              </div>

              {/* Research Field */}
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <FileText size={13} className="field-label-icon" />
                  Primary Research Field
                </label>
                <input
                  type="text"
                  className="profile-input"
                  value={formData.field}
                  onChange={e => setFormData(prev => ({ ...prev, field: e.target.value }))}
                  placeholder="e.g. LLMs, Agentic Systems, Robotics"
                />
              </div>

              {/* Preferred Citation */}
              <div className="profile-field-group">
                <label className="profile-field-label">
                  <Quote size={13} className="field-label-icon" />
                  Preferred Citation Format
                </label>
                <select
                  className="profile-select"
                  value={formData.citationFormat}
                  onChange={e => setFormData(prev => ({ ...prev, citationFormat: e.target.value }))}
                >
                  {CITATION_FORMATS.map(fmt => (
                    <option key={fmt} value={fmt}>{fmt} Format</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bio / Research Focus */}
            <div className="profile-field-group full-width">
              <label className="profile-field-label">
                <FileText size={13} className="field-label-icon" />
                Bio & Research Focus
              </label>
              <textarea
                className="profile-textarea"
                rows={3}
                value={formData.bio}
                onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Share a short summary about your research interests, projects, or background..."
              />
            </div>

            {/* Footer Buttons */}
            <div className="profile-modal-footer">
              <button
                type="button"
                className="profile-btn-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-btn-save"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="profile-spin-icon" size={15} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
