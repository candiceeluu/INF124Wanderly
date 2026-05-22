// ============================================================================
// TripSubSidebar.jsx — Floating mini-nav that appears on every trip-scoped
// page (Overview, Schedule, Budget, Activity). Centered vertically on the
// left edge with icons for the four sub-views plus a settings shortcut.
// ============================================================================
import { NavLink } from 'react-router-dom'
import { Home, CalendarDays, Wallet, Activity as ActivityIcon, Settings } from 'lucide-react'

// Sub-routes within a trip — `to: ''` means the trip overview itself.
const items = [
  { to: '', icon: Home, label: 'home' },
  { to: 'schedule', icon: CalendarDays, label: 'sched' },
  { to: 'budget', icon: Wallet, label: 'budget' },
  { to: 'activity', icon: ActivityIcon, label: 'activity' },
]

// TripSubSidebar — receives the current trip id from the parent page so it
// can build absolute URLs like /app/trips/abc/schedule.
export default function TripSubSidebar({ tripId }) {
  return (
    <aside className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-2xl bg-ink-700/60 p-1.5 shadow-card backdrop-blur">
      <nav className="flex flex-col gap-1">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={label}
            end={to === ''}
            to={to ? `/app/trips/${tripId}/${to}` : `/app/trips/${tripId}`}
            className={({ isActive }) =>
              `group relative grid h-10 w-10 place-items-center rounded-xl transition ${
                isActive
                  ? 'bg-white text-ink-900 shadow-card'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover:block">
              {label}
            </span>
          </NavLink>
        ))}
        <div className="my-1 h-px w-full bg-white/10" />
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `grid h-10 w-10 place-items-center rounded-xl transition ${
              isActive ? 'bg-white text-ink-900 shadow-card' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`
          }
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </NavLink>
      </nav>
    </aside>
  )
}
