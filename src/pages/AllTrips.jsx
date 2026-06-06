import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

const HERO =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80'

export default function AllTrips() {
  const { trips } = useTrips()  
  return (
    <PageTransition className="relative flex flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 -z-0">
        <img src={HERO} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/65 via-ink-900/55 to-ink-900/85" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col text-white">
        <TopBar />

        <section className="px-6 pb-16 pt-8 md:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <Link
                  to="/app"
                  className="mb-2 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-white/70 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> back
                </Link>
                <h1 className="lower font-display text-4xl font-extrabold tracking-tight md:text-5xl">
                  my trips
                </h1>
              </div>
              <Link to="/app/trips/new" className="btn-light">
                <Plus className="h-4 w-4" />
                new trip
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trips.map((t, i) => {
                const start = t.startDate
                  ? new Date(t.startDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : ''
                const end = t.endDate
                  ? new Date(t.endDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : ''
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    whileHover={{ y: -6 }}
                  >
                    <Link
                      to={`/app/trips/${t.id}`}
                      className="relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-card"
                    >
                      <motion.img
                        src={t.cover}
                        alt={t.name}
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-5">
                        <div className="text-[10px] uppercase tracking-wider text-white/70">
                          {start} — {end}
                        </div>
                        <div className="lower font-display text-lg font-bold leading-tight">
                          {t.name}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
