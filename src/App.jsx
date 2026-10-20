import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"
import Home from "./pages/Home"
import Saved from "./pages/Saved"
import Login from "./pages/Login"
import WritePaper from "./pages/WritePaper"
import ChatPDF from "./pages/ChatPDF"

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ color: '#fff', textAlign: 'center', marginTop: '40vh' }}>Loading...</div>
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/chat-pdf" element={<PrivateRoute><ChatPDF /></PrivateRoute>} />
      <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/saved" element={<PrivateRoute><Saved /></PrivateRoute>} />
      <Route path="/write-paper" element={<PrivateRoute><WritePaper /></PrivateRoute>} />
    </Routes>
  )
}