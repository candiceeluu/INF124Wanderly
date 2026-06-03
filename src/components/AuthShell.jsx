import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import Logo from './Logo.jsx'

const HERO =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80'

export default function AuthShell({ mode = 'login', title, onGoogleLogin }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleGoogle = async (response) => {
    setBusy(true)
    setError(null)
    try {
      await onGoogleLogin?.(response.credential)
      const dest = location.state?.from?.pathname || '/app'
      navigate(dest, { replace: true })
    } catch (e) {
      setError(e.message || 'Login failed, try again')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900">
      <motion.img
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        src={HERO}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/30 to-ink-900/70" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <Logo dark className="text-white" />
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === 'login'
                ? 'bg-white text-ink-900'
                : 'border border-white/30 text-white hover:bg-white/10'
            }`}
          >
            log in
          </Link>
          <Link
            to="/signup"
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === 'signup'
                ? 'bg-ink-900 text-white'
                : 'border border-white/30 text-white hover:bg-white/10'
            }`}
          >
            sign up
          </Link>
        </nav>
      </header>

      <section className="relative z-10 flex min-h-[calc(100vh-80px)] items-center px-6 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
        >
          <h1 className="font-display text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-ink-900/60">
            {mode === 'login'
              ? 'welcome back, wanderer.'
              : 'a new adventure starts here.'}
          </p>

          <div className="mt-8 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => setError('Google sign-in was cancelled')}
              theme="outline"
              size="large"
              shape="pill"
              text={mode === 'login' ? 'signin_with' : 'signup_with'}
              useOneTap={mode === 'login'}
            />
          </div>

          {busy && (
            <p className="mt-4 text-center text-xs text-ink-900/55">Signing you in...</p>
          )}
          {error && (
            <p className="mt-4 rounded-lg bg-dolly-50 px-3 py-2 text-center text-xs text-dolly-700">
              {error}
            </p>
          )}

          <p className="mt-8 text-center text-[11px] text-ink-900/55">
            We use your Google account to remember your trips, photos, and budgets.
            No password required.
          </p>

          <p className="mt-5 text-center text-xs text-ink-900/60">
            {mode === 'login' ? (
              <>
                new here?{' '}
                <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
                  create an account
                </Link>
              </>
            ) : (
              <>
                already a wanderer?{' '}
                <Link to="/login" className="font-semibold text-brand-700 hover:underline">
                  log in
                </Link>
              </>
            )}
          </p>
        </motion.div>
      </section>
    </main>
  )
}
