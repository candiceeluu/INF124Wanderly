import { Link } from 'react-router-dom'

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
