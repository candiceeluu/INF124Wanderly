import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, ChevronRight, Plus } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

const HERO =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80'

function TripCard({ trip, index }) {
  const start = trip.startDate
    ? new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : ''
  const end = trip.endDate
    ? new Date(trip.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : ''
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * index }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link
        to={`/app/trips/${trip.id}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-card"
      >
        <motion.img
          src={trip.cover}
          alt={trip.title}
          whileHover={{ scale: 1.08 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <div className="text-[10px] uppercase tracking-wider text-white/70">
            {start} — {end}
          </div>
          <div className="lower font-display text-base font-bold leading-tight">{trip.title}</div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  const { trips } = useTrips()                  
  const navigate = useNavigate()
  const [query, setQuery] = useState('')        

  const onSearch = (e) => {
    e.preventDefault()
    navigate('/app/trips/new', { state: { destination: query } })
  }

  return (
    <PageTransition className="relative flex flex-1 flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-0">
        <img src={HERO} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/60 via-ink-900/35 to-ink-900/85" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col">
        <TopBar />

        <section className="flex flex-col items-center px-6 pb-10 pt-16 text-center text-white md:pt-24">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lower font-display text-5xl font-extrabold tracking-tight drop-shadow-lg md:text-6xl"
          >
            where to?
          </motion.h1>

          <motion.form
            onSubmit={onSearch}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-8 flex w-full max-w-2xl items-center gap-2 rounded-full bg-white/95 p-1.5 pl-6 shadow-2xl"
          >
            <Search className="h-5 w-5 text-ink-900/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Paris, Tokyo, Bali..."
              className="flex-1 bg-transparent py-2 text-sm text-ink-900 placeholder:text-ink-900/40 focus:outline-none"
            />
            <button
              type="submit"
              className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-white transition hover:bg-ink-800"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-5 flex flex-wrap justify-center gap-2 text-xs"
          >
            {['Tokyo', 'Lisbon', 'Banff', 'Cabo'].map((c) => (
              <button
                key={c}
                onClick={() => navigate('/app/trips/new', { state: { destination: c } })}
                className="rounded-full border border-white/30 bg-white/5 px-3 py-1.5 text-white/85 backdrop-blur transition hover:bg-white/15"
              >
                {c}
              </button>
            ))}
          </motion.div>
        </section>

        <section className="mt-auto rounded-t-[28px] bg-white px-6 py-8 text-ink-900 shadow-2xl md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="lower font-display text-2xl font-extrabold tracking-tight md:text-3xl">
                my trips
              </h2>
              <Link
                to="/app/trips"
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline"
              >
                view all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {trips.slice(0, 4).map((t, i) => (
                <TripCard key={t.id} trip={t} index={i} />
              ))}
              <Link
                to="/app/trips/new"
                className="grid aspect-[4/5] place-items-center rounded-2xl border-2 border-dashed border-ink-900/15 text-ink-900/55 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
              >
                <div className="text-center">
                  <Plus className="mx-auto h-7 w-7" />
                  <div className="mt-2 text-xs font-medium">new trip</div>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
