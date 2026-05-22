// ============================================================================
// Signup.jsx — /signup route. Mirrors Login.jsx but calls signup() instead.
// In this demo signup() == login() (no real backend to register against).
// ============================================================================
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Signup() {
  const { signup } = useAuth()
  return (
    <AuthShell
      mode="signup"
      title="Sign Up"
      cta="start planning"
      onSubmit={({ email, password }) => signup(email, password)}
    />
  )
}
