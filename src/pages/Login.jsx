import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import "./Login.css"

export default function Login() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (isSignup) await signup(email, password)
      else await login(email, password)
      navigate("/")
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""))
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setError("")
    try {
      await loginWithGoogle()
      navigate("/")
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""))
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🔬</div>
        <h1>PaperFinder Pro</h1>
        <p className="login-sub">Find research papers — free & legal</p>

        <button className="google-btn" onClick={handleGoogle}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Continue with Google
        </button>

        <div className="login-divider"><span>or</span></div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="login-toggle">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <button onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? " Sign In" : " Sign Up"}
          </button>
        </p>
      </div>
    </div>
  )
}