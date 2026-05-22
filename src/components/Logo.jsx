// ============================================================================
// Logo.jsx — Brand mark used in the top bar and auth pages.
// Renders a gradient tile + the "wanderly" wordmark, wrapped in a Link so
// clicking it navigates back to the destination passed in `to` (default: "/").
// ============================================================================
import { Link } from 'react-router-dom'

// Logo — props:
//   to:        route to navigate to when clicked (default "/")
//   className: extra Tailwind classes (used to tint the wordmark)
//   dark:      when true, adds a subtle white ring for visibility on dark bgs
export default function Logo({ to = '/', className = '', dark = false }) {
  return (
    <Link
      to={to}
      className={`group inline-flex items-center gap-2 font-display font-extrabold tracking-tight ${className}`}
    >
      <span
        className={`relative grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-glow transition group-hover:scale-105 ${
          dark ? 'ring-1 ring-white/10' : ''
        }`}
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4">
          <path
            fill="currentColor"
            d="M3 17 8 7l4 8 4-10 5 12Z"
          />
        </svg>
      </span>
      <span className="lower text-[1.1rem] leading-none">wanderly</span>
    </Link>
  )
}
