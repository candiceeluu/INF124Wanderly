import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Signup() {
  const { loginWithGoogle } = useAuth()
  return (
    <AuthShell
      mode="signup"
      title="Sign Up"
      onGoogleLogin={loginWithGoogle}
    />
  )
}
