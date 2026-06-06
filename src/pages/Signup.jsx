
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
