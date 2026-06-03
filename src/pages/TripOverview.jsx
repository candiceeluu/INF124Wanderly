import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plane, Plus, MapPin, Footprints, Utensils, Briefcase, Clock } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import TripSubSidebar from '../components/TripSubSidebar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

const TYPE_ICON = {
  flight: Plane,
  food: Utensils,
  activity: Footprints,
  hotel: Briefcase,
}

function formatRange(s, e) {
  if (!s || !e) return ''
  const a = new Date(s)
  const b = new Date(e)
  const opts = { month: 'short', day: 'numeric' }
  return `${a.toLocaleDateString(undefined, opts)} – ${b.toLocaleDateString(undefined, opts)}`
}

export default function TripOverview() {
  const { tripId } = useParams()
  const { getTrip } = useTrips()
  const trip = getTrip(tripId)
  const navigate = useNavigate()

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

  const pct = Math.min(100, Math.round((trip.budget.spent / trip.budget.total) * 100))
  const upcoming = [...trip.events]
    .sort((a, b) => `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`))
    .slice(0, 4)

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
            <img src={trip.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-900/70 via-ink-900/30 to-transparent" />
            <div className="absolute inset-0 flex items-end justify-between p-6">
              <div className="text-white">
                <h1 className="lower font-display text-3xl font-extrabold sm:text-4xl">
                  {trip.name}
                </h1>
                <div className="mt-1 inline-flex items-center gap-1.5 text-xs text-white/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {trip.location}
                </div>
              </div>
              <div className="text-right text-white/90">
                <div className="text-[11px] uppercase tracking-widest text-white/70">when</div>
                <div className="text-sm font-semibold">{formatRange(trip.startDate, trip.endDate)}</div>
              </div>
            </div>
          </motion.div>

          {/* Grid */}
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {/* Members */}
            <Card title="members">
              <div className="flex flex-wrap items-center gap-3">
                {trip.members.map((m) => (
                  <motion.div
                    key={m.id}
                    whileHover={{ y: -3 }}
                    className="group relative"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
                    />
                    <span className="pointer-events-none absolute -bottom-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink-800 px-2 py-0.5 text-[10px] text-white group-hover:block">
                      {m.name}
                    </span>
                  </motion.div>
                ))}
                <button className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-white/30 text-white/70 transition hover:border-white hover:text-white">
                  <Plus className="h-4 w-4" />
                </button>
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
                  <li className="py-6 text-center text-xs text-white/55">No events scheduled yet.</li>
                )}
                {upcoming.map((ev) => {
                  const Icon = TYPE_ICON[ev.type] || Clock
                  return (
                    <li key={ev.id} className="flex items-center gap-3 py-3 text-sm">
                      <div className="w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/65">
                        {new Date(ev.date).toLocaleDateString(undefined, {
                          month: 'numeric',
                          day: 'numeric',
                        })}
                        <div className="text-[10px] font-normal text-white/45">{ev.start}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{ev.title}</div>
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
                      ${trip.budget.spent}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl font-extrabold text-caper-600">
                      {pct}%
                    </div>
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
                  ${trip.budget.spent} / ${trip.budget.total}
                </div>
              </div>

              <ul className="mt-3 divide-y divide-white/5 text-sm text-white/85">
                {trip.expenses.slice(0, 2).map((x) => (
                  <li key={x.id} className="flex items-center justify-between py-2">
                    <span>{x.name}</span>
                    <span className="font-semibold">${x.amount}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Accommodations */}
            <Card title="accommodations">
              <div className="grid gap-3 sm:grid-cols-2">
                {trip.accommodations.map((a) => (
                  <div key={a.id} className="rounded-xl bg-white p-3 text-ink-900">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Plane className="h-3.5 w-3.5 text-brand-600" />
                      {a.from} → {a.to}
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] text-ink-900/55">
                      <div>
                        <div className="uppercase tracking-widest">depart</div>
                        <div className="text-[11px] text-ink-900">{a.depart}</div>
                      </div>
                      <div>
                        <div className="uppercase tracking-widest">arrive</div>
                        <div className="text-[11px] text-ink-900">{a.arrive}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="grid place-items-center rounded-xl border border-dashed border-white/25 px-3 py-6 text-[11px] text-white/70 transition hover:border-white hover:text-white">
                  <Plus className="mb-1 h-4 w-4" />
                  add an accommodation
                </button>
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
