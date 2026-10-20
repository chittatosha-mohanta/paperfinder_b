import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PlusCircle, BookOpen, ArrowLeft } from "lucide-react"
import Sidebar from "../components/Sidebar"
import PaperWizard from "../components/PaperWizard"
import PreviousPapers from "../components/PreviousPapers"

export default function WritePaper() {
    const [view, setView] = useState("home") // home | wizard | previous
    const navigate = useNavigate()

    return (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#0a0a0f" }}>
            <Sidebar onNewSearch={(q) => { if (q) navigate(`/?q=${q}`) }} />

            <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>

                {/* Background grid */}
                <div style={{
                    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
                    backgroundImage: `
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px",
                }} />

                <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 24px 80px", position: "relative", zIndex: 1 }}>

                    {/* Back button */}
                    {view !== "home" && (
                        <button onClick={() => setView("home")} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            background: "none", border: "none", color: "#888",
                            fontSize: "13px", cursor: "pointer", marginBottom: "24px",
                            padding: "0"
                        }}>
                            <ArrowLeft size={14} /> Back
                        </button>
                    )}

                    {/* HOME VIEW */}
                    {view === "home" && (
                        <>
                            {/* Header */}
                            <div style={{ textAlign: "center", padding: "20px 0 56px" }}>
                                <div style={{
                                    display: "inline-flex", alignItems: "center", gap: "8px",
                                    background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)",
                                    borderRadius: "100px", padding: "6px 16px", marginBottom: "24px",
                                    fontFamily: "JetBrains Mono, monospace", fontSize: "11px",
                                    color: "#a78bfa", letterSpacing: "2px",
                                }}>
                                    <span style={{
                                        width: "6px", height: "6px", borderRadius: "50%",
                                        background: "#a78bfa", animation: "pulse 2s infinite",
                                    }} />
                                    AI RESEARCH WRITER
                                </div>

                                <h1 style={{
                                    fontSize: "clamp(32px, 5vw, 56px)", fontWeight: "800",
                                    letterSpacing: "-2px", lineHeight: "1.05", marginBottom: "16px",
                                    background: "linear-gradient(135deg, #fff 0%, #a78bfa 50%, #0ef 100%)",
                                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}>
                                    Write Research Papers
                                </h1>

                                <p style={{
                                    color: "#888", fontSize: "15px", maxWidth: "480px",
                                    margin: "0 auto",
                                    fontFamily: "JetBrains Mono, monospace", lineHeight: "1.7",
                                }}>
                                    AI-powered paper writing — IEEE, APA, and more.
                                    Upload references, diagrams, and get a full Word document.
                                </p>
                            </div>

                            {/* Two option cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

                                {/* New Paper */}
                                <button onClick={() => setView("wizard")} style={{
                                    background: "rgba(124,58,237,0.06)",
                                    border: "1px solid rgba(124,58,237,0.25)",
                                    borderRadius: "16px", padding: "36px 28px",
                                    cursor: "pointer", textAlign: "left",
                                    transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.6)"; e.currentTarget.style.background = "rgba(124,58,237,0.1)" }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"; e.currentTarget.style.background = "rgba(124,58,237,0.06)" }}
                                >
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "12px",
                                        background: "rgba(124,58,237,0.2)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        marginBottom: "20px",
                                    }}>
                                        <PlusCircle size={24} color="#a78bfa" />
                                    </div>
                                    <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                                        Write new paper
                                    </h3>
                                    <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                                        Start fresh — add your title, abstract, references, diagrams and let AI write your full paper.
                                    </p>
                                </button>

                                {/* Previous Papers */}
                                <button onClick={() => setView("previous")} style={{
                                    background: "rgba(0,229,255,0.04)",
                                    border: "1px solid rgba(0,229,255,0.15)",
                                    borderRadius: "16px", padding: "36px 28px",
                                    cursor: "pointer", textAlign: "left",
                                    transition: "all 0.2s",
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.4)"; e.currentTarget.style.background = "rgba(0,229,255,0.08)" }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(0,229,255,0.15)"; e.currentTarget.style.background = "rgba(0,229,255,0.04)" }}
                                >
                                    <div style={{
                                        width: "48px", height: "48px", borderRadius: "12px",
                                        background: "rgba(0,229,255,0.1)",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        marginBottom: "20px",
                                    }}>
                                        <BookOpen size={24} color="#0ef" />
                                    </div>
                                    <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>
                                        Previously written papers
                                    </h3>
                                    <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                                        View and download papers you have already written with PaperFinder.
                                    </p>
                                </button>

                            </div>
                        </>
                    )}

                    {/* WIZARD VIEW */}
                    {view === "wizard" && <PaperWizard />}

                    {/* PREVIOUS PAPERS VIEW */}
                    {view === "previous" && <PreviousPapers />}

                </div>

                <style>{`
          @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
        `}</style>
            </div>
        </div>
    )
}