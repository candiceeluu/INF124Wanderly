import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane, Plus, MapPin, Footprints, Utensils, Briefcase, Clock } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import TripSubSidebar from '../components/TripSubSidebar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

const TYPE_ICON = {
  flight:   Plane,
  food:     Utensils,
  activity: Footprints,
  hotel:    Briefcase,
}

function formatRange(s, e) {
  if (!s || !e) return ''
  const a = new Date(s)
  const b = new Date(e)
  const opts = { month: 'short', day: 'numeric' }
  return `${a.toLocaleDateString(undefined, opts)} – ${b.toLocaleDateString(undefined, opts)}`
}

export default function TripOverview() {
  const { tripId }                          = useParams()
  const { getTrip, getTripBudget, refreshTrip, loading } = useTrips()
  const navigate                            = useNavigate()
  const trip                                = getTrip(tripId)

  // Fetch the full trip with nested members, events, expenses on mount
  useEffect(() => {
    if (tripId) refreshTrip(tripId)
  }, [tripId])

  // Loading state — show spinner while initial fetch is in progress
  if (loading && !trip) {
    return (
      <PageTransition className="flex flex-1 items-center justify-center">
        <div className="text-center text-white/55">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          <p className="mt-3 text-sm">Loading trip...</p>
        </div>
      </PageTransition>
    )
  }

  if (!trip) {
    return (
      <PageTransition className="flex flex-1 items-center justify-center text-white">
        <div className="text-center">
          <p className="text-sm text-white/70">Trip not found.</p>
          <Link to="/app" className="btn-light mt-4">go home</Link>
        </div>
      </PageTransition>
    )
  }

  const budget  = getTripBudget(tripId)
  const pct     = budget.total > 0
    ? Math.min(100, Math.round((budget.spent / budget.total) * 100))
    : 0

  const upcoming = [...(trip.events || [])]
    .sort((a, b) => {
      const ta = a.startTime ? new Date(a.startTime).getTime() : 0
      const tb = b.startTime ? new Date(b.startTime).getTime() : 0
      return ta - tb
    })
    .slice(0, 4)

  const members = trip.members || []

  return (
    <PageTransition className="relative flex flex-1 flex-col">
      <TripSubSidebar tripId={tripId} />
      <TopBar />

      <div className="px-6 pb-16 pl-20 md:pl-24">
        <div className="mx-auto max-w-7xl">

          {/* Cover */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-48 overflow-hidden rounded-3xl shadow-card sm:h-56"
          >
            <img
              src={trip.cover || 'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1600&q=80'}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/70 via-ink-900/30 to-transparent" />
            <div className="absolute inset-0 flex items-end justify-between p-6">
              <div className="text-white">
                <h1 className="lower font-display text-3xl font-extrabold sm:text-4xl">
                  {trip.title}
                </h1>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.destination}
                </div>
              </div>
              <div className="text-right text-white/90">
                <div className="text-[11px] uppercase tracking-widest text-white/70">when</div>
                <div className="text-sm font-semibold">
                  {formatRange(trip.startDate, trip.endDate)}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">

            {/* Members */}
            <Card title="members">
              <div className="flex flex-wrap items-center gap-3">
                {members.map((m) => {
                  const u = m.user || m
                  return (
                    <motion.div key={m.id} whileHover={{ y: -3 }} className="group relative">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
                        />
                      ) : (
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-600 ring-2 ring-white/20">
                          <span className="text-sm font-bold text-white">
                            {u.name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                      <span className="pointer-events-none absolute -bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-800 px-2 py-0.5 text-[10px] text-white group-hover:block">
                        {u.name}
                      </span>
                    </motion.div>
                  )
                })}
                {members.length === 0 && (
                  <p className="text-xs text-white/45">No members yet.</p>
                )}
              </div>
            </Card>

            {/* Upcoming events */}
            <Card
              title="upcoming events"
              action={
                <button
                  onClick={() => navigate(`/app/trips/${tripId}/schedule`)}
                  className="text-[11px] font-semibold text-brand-300 hover:underline"
                >
                  View all
                </button>
              }
            >
              <ul className="divide-y divide-white/5">
                {upcoming.length === 0 && (
                  <li className="py-6 text-center text-xs text-white/55">
                    No events scheduled yet.
                  </li>
                )}
                {upcoming.map((ev) => {
                  const Icon = TYPE_ICON[ev.type] || Clock
                  const time = ev.startTime
                    ? new Date(ev.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                    : null
                  const date = ev.startTime
                    ? new Date(ev.startTime).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })
                    : '—'
                  return (
                    <li key={ev.id} className="flex items-center gap-3 py-3 text-sm">
                      <div className="w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/65">
                        {date}
                        {time && <div className="text-[10px] font-normal text-white/45">{time}</div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{ev.title}</div>
                        {ev.location && <div className="text-[11px] text-white/50">{ev.location}</div>}
                      </div>
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/10">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>

            {/* Budget */}
            <Card
              title="budget progress"
              action={
                <button
                  onClick={() => navigate(`/app/trips/${tripId}/budget`)}
                  className="text-[11px] font-semibold text-brand-300 hover:underline"
                >
                  Open budget
                </button>
              }
            >
              <div className="rounded-xl bg-white p-4 text-ink-900">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-ink-900/55">spent</div>
                    <div className="font-display text-3xl font-extrabold">
                      ${budget.spent.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl font-extrabold text-caper-600">{pct}%</div>
                    <div className="text-[11px] text-ink-900/55">of your budget</div>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-900/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-caper-400 to-caper-600"
                  />
                </div>
                <div className="mt-1 text-right text-[11px] text-ink-900/55">
                  ${budget.spent.toFixed(2)} / ${budget.total.toFixed(2)}
                </div>
              </div>
              <ul className="mt-3 divide-y divide-white/5 text-sm text-white/85">
                {(trip.expenses || []).slice(0, 2).map((x) => (
                  <li key={x.id} className="flex items-center justify-between py-2">
                    <span>{x.name}</span>
                    <span className="font-semibold">${Number(x.amount).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Accommodations */}
            <Card title="accommodations">
              <div className="grid gap-3 sm:grid-cols-2">
                {(trip.accommodations || []).map((a) => (
                  <div key={a.id} className="rounded-xl bg-white p-3 text-ink-900">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Briefcase className="h-3.5 w-3.5 text-brand-600" />
                      {a.name}
                    </div>
                    {a.address && <div className="mt-1 text-[11px] text-ink-900/55">{a.address}</div>}
                    {(a.checkIn || a.checkOut) && (
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-ink-900/55">
                        {a.checkIn && (
                          <div>
                            <div className="uppercase tracking-widest">check in</div>
                            <div className="text-[11px] text-ink-900">{new Date(a.checkIn).toLocaleDateString()}</div>
                          </div>
                        )}
                        {a.checkOut && (
                          <div>
                            <div className="uppercase tracking-widest">check out</div>
                            <div className="text-[11px] text-ink-900">{new Date(a.checkOut).toLocaleDateString()}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {(trip.accommodations || []).length === 0 && (
                  <p className="text-xs text-white/45">No accommodations added yet.</p>
                )}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </PageTransition>
  )
}

function Card({ title, action, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-dark p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="lower font-display text-lg font-bold">{title}</h3>
        {action}
      </div>
      {children}
    </motion.section>
  )
}