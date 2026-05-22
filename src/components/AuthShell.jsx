// ============================================================================
// AuthShell.jsx — Shared chrome for the Login and Signup screens.
// Both pages render <AuthShell mode="..." onSubmit={...} />; this component
// owns the form, the parallax hero image, the Google button, and the
// post-submit redirect logic.
// ============================================================================
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Logo from './Logo.jsx'

// Hero photo used as the full-bleed background on both auth screens.
const HERO =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80'

// AuthShell — props:
//   mode:     'login' | 'signup' — tweaks tab styling and helper copy.
//   onSubmit: callback invoked with { email, password } before navigation.
//   title:    big heading at the top of the card ("Log In" / "Sign Up").
//   cta:      label of the submit button.
export default function AuthShell({ mode = 'login', onSubmit, title, cta }) {
  const navigate = useNavigate()
  const location = useLocation()

  // handle — form submit handler. Reads the form via FormData, calls
  // the parent's onSubmit, then redirects either to wherever RequireAuth
  // was trying to go (location.state.from) or /app by default.
  const handle = (e) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSubmit?.({ email: fd.get('email'), password: fd.get('password') })
    const dest = location.state?.from?.pathname || '/app'
    navigate(dest, { replace: true })
  }

  // handleGoogle — pretend SSO. Hard-codes a fake email/password so the demo
  // can show the "Google" path without any real OAuth.
  const handleGoogle = () => {
    onSubmit?.({ email: 'google.user@wanderly.app', password: 'sso' })
    navigate('/app', { replace: true })
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink-900">
      {/* Background image with parallax-ish subtle motion */}
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

      {/* Top bar */}
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

      {/* Card */}
      <section className="relative z-10 flex min-h-[calc(100vh-80px)] items-center px-6 md:px-16">
        <motion.form
          onSubmit={handle}
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

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-ink-900/10 bg-white px-4 py-3 text-sm font-semibold text-ink-900 transition hover:bg-ink-900/[0.03]"
          >
            <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden>
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 16 4 9.1 8.5 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.4 0 10.4-2 14.1-5.4l-6.5-5.5C29.5 34.7 26.9 36 24 36c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9 39.6 16 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.7 2-2 3.7-3.7 5l6.5 5.5C42 35 44 30 44 24c0-1.3-.1-2.5-.4-3.5z"
              />
            </svg>
            Google {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-ink-900/40">
            <span className="h-px flex-1 bg-ink-900/10" />
            or
            <span className="h-px flex-1 bg-ink-900/10" />
          </div>

          <label className="block text-xs font-medium text-ink-900/70">email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@wanderly.app"
            className="field mt-1.5"
            defaultValue={mode === 'login' ? 'demo@wanderly.app' : ''}
          />

          <label className="mt-4 block text-xs font-medium text-ink-900/70">password</label>
          <input
            name="password"
            type="password"
            required
            minLength={4}
            placeholder="••••••••"
            className="field mt-1.5"
            defaultValue={mode === 'login' ? 'demopass' : ''}
          />

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-brand-700 active:scale-[0.99]"
          >
            {cta}
          </button>

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
        </motion.form>
      </section>
    </main>
  )
}
