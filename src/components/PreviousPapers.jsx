import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { db } from "../firebase"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { FileText, Download } from "lucide-react"

export default function PreviousPapers() {
  const { user } = useAuth()
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "users", user.uid, "papers"),
      orderBy("createdAt", "desc")
    )
    const unsub = onSnapshot(q, (snap) => {
      setPapers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  if (loading) return <p style={{ color: "#888" }}>Loading papers...</p>

  if (papers.length === 0) return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
      <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "8px" }}>No papers yet</h3>
      <p style={{ color: "#888", fontSize: "14px" }}>Papers you write will appear here.</p>
    </div>
  )

  return (
    <div>
      <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: "700", marginBottom: "24px" }}>
        Previously written papers
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {papers.map(paper => (
          <div key={paper.id} style={{
            background: "#111118", border: "1px solid #2a2a3a",
            borderRadius: "12px", padding: "20px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <FileText size={20} color="#a78bfa" />
              <div>
                <p style={{ color: "#fff", fontSize: "15px", fontWeight: "600", margin: 0 }}>
                  {paper.title}
                </p>
                <p style={{ color: "#888", fontSize: "12px", margin: "4px 0 0" }}>
                  {paper.format} · {paper.createdAt?.toDate?.()?.toLocaleDateString()}
                </p>
              </div>
            </div>
            {paper.downloadUrl && (
              <a href={paper.downloadUrl} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                borderRadius: "8px", padding: "8px 14px",
                color: "#a78bfa", fontSize: "13px", textDecoration: "none",
              }}>
                <Download size={14} /> Download
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}