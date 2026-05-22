// ============================================================================
// Login.jsx — /login route. Thin wrapper around <AuthShell> that wires the
// form submit to AuthContext.login. All visuals live in AuthShell.
// ============================================================================
import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()      // grab the login action from auth context
  return (
    <AuthShell
      mode="login"
      title="Log In"
      cta="start planning"
      onSubmit={({ email, password }) => login(email, password)}
    />
  )
}
