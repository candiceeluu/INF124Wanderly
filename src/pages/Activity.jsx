// ============================================================================
// Activity.jsx — /app/trips/:tripId/activity. Read-only timeline of every
// change made to a trip (added/removed events, updated budget, etc).
// The entries come from trip.activity which is written by TripsContext
// helpers like addEvent and addExpense.
// ============================================================================
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import TopBar from '../components/TopBar.jsx'
import TripSubSidebar from '../components/TripSubSidebar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

// groupByDate — bucket activity entries by their `date` field so we can
// render one row of entries per date heading in the timeline.
function groupByDate(items) {
  const groups = {}
  items.forEach((it) => {
    const k = it.date
    groups[k] = groups[k] || []
    groups[k].push(it)
  })
  return groups
}

// Activity — page component. Sorts the date keys descending so the most
// recent day appears at the top.
export default function Activity() {
  const { tripId } = useParams()
  const { getTrip } = useTrips()
  const trip = getTrip(tripId)
  if (!trip) return null                                   // guard for an invalid URL

  const grouped = groupByDate(trip.activity)
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))  // newest first

  return (
    <PageTransition className="relative flex flex-1 flex-col">
      <TripSubSidebar tripId={tripId} />
      <TopBar />

      <div className="px-6 pb-12 pl-20 md:pl-24">
        <div className="mx-auto max-w-5xl">
          <h1 className="lower font-display text-4xl font-extrabold tracking-tight">activity</h1>
          <p className="mt-1 text-sm text-white/60">A timeline of every change to your trip.</p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-dark mt-6 overflow-hidden"
          >
            {dates.length === 0 && (
              <div className="p-8 text-center text-sm text-white/55">
                No activity yet — start adding events or expenses to see updates here.
              </div>
            )}
            {dates.map((d) => (
              <div key={d} className="grid grid-cols-[100px_1fr] gap-4 border-b border-white/5 p-5 last:border-0">
                <div>
                  <div className="text-xs uppercase tracking-widest text-white/55">
                    {new Date(d).toLocaleDateString(undefined, { month: 'long' })}
                  </div>
                  <div className="font-display text-3xl font-extrabold">
                    {new Date(d).getDate()}
                  </div>
                </div>
                <ul className="space-y-2">
                  {grouped[d].map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/5"
                    >
                      <div
                        className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-700 text-xs font-bold text-white"
                        aria-hidden
                      >
                        {a.user
                          .split(' ')
                          .map((p) => p[0])
                          .join('')}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-semibold">{a.user}</span>{' '}
                          <span className="text-white/75">{a.text}</span>
                        </div>
                      </div>
                      <div className="text-[11px] text-white/55">{a.time}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
