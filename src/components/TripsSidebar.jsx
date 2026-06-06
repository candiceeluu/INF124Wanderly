// ============================================================================
// TripsSidebar.jsx — The narrow left rail (Discord-style) inside AppShell.
// Shows the Home button on top, then one tile per saved trip, and an
// "Add new trip" button at the bottom. Highlights the currently-viewed trip
// using the :tripId URL param.
// ============================================================================
import { Link, NavLink, useParams } from 'react-router-dom'
import { Plus, Home as HomeIcon } from 'lucide-react'
import { useTrips } from '../contexts/TripsContext.jsx'

// Initials — tiny helper component that renders the first letters of the
// first two words of `name` (e.g. "Taipei Trip 2026" → "TT") for the trip tile.
function Initials({ name }) {
  if (!name) return null
  const parts = name.trim().split(/\s+/)
  const text = (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
  return <span className="text-[11px] font-bold text-white">{text.toUpperCase()}</span>
}

// TripsSidebar — reads the trip list from context and the current :tripId
// from the URL to decide which tile gets the "active" outline.
export default function TripsSidebar() {
  const { trips } = useTrips()
  const { tripId } = useParams()

  return (
    <aside className="hidden w-[68px] shrink-0 flex-col items-center gap-2 border-r border-white/5 bg-ink-900 py-4 sm:flex">
      <NavLink
        to="/app"
        end
        className={({ isActive }) =>
          `grid h-11 w-11 place-items-center rounded-2xl transition ${
            isActive
              ? 'bg-white text-ink-900'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`
        }
        title="Home"
      >
        <HomeIcon className="h-5 w-5" />
      </NavLink>
      <div className="my-1 h-px w-8 bg-white/10" />

      <div className="no-scrollbar flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto overflow-x-hidden pb-2">
        {trips.map((t) => {
          const active = t.id === tripId
          return (
            <Link
              key={t.id}
              to={`/app/trips/${t.id}`}
              title={t.title}
            className={`group relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 text-white shadow-card transition hover:rounded-xl ${
              active ? 'ring-2 ring-inset ring-white' : ''
            }`}
            >
              {t.cover ? (
                <img
                  src={t.cover}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-90"
                />
              ) : null}
              <span className="absolute inset-0 bg-ink-900/30" />
              <span className="relative">
                <Initials name={t.title} />
              </span>
              {active && (
                <span className="absolute -left-2 top-1/2 h-7 w-1.5 -translate-y-1/2 rounded-r bg-white" />
              )}
              <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-ink-800 px-2 py-1 text-[11px] font-medium text-white shadow-lg group-hover:block">
                {t.title}
              </span>
            </Link>
          )
        })}
      </div>

      <Link
        to="/app/trips/new"
        title="New trip"
        className="grid h-11 w-11 place-items-center rounded-2xl border border-dashed border-white/30 text-white/80 transition hover:border-white hover:bg-white/10 hover:text-white"
      >
        <Plus className="h-5 w-5" />
      </Link>
    </aside>
  )
}
