import AuthShell from '../components/AuthShell.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const { loginWithGoogle } = useAuth()
  return (
    <AuthShell
      mode="login"
      title="Log In"
      onGoogleLogin={loginWithGoogle}
    />
  )
}
