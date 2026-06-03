import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
  Search,
  CalendarDays,
} from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import TripSubSidebar from '../components/TripSubSidebar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 6)

const RECO_TAGS = ['All', 'Food', 'Activities', 'Low budget', 'Near hotel']

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

function fmtDay(d) {
  return d.toLocaleDateString(undefined, { day: 'numeric' })
}

function timeToY(t) {
  const [h, m] = t.split(':').map(Number)
  const start = HOURS[0]
  return ((h - start) + m / 60) * 56
}

export default function Schedule() {
  const { tripId } = useParams()
  const { getTrip, addEvent, updateEvent, removeEvent, recommendations } = useTrips()
  const trip = getTrip(tripId)

  const initial = trip?.startDate ? new Date(trip.startDate) : new Date()
  const [weekStart, setWeekStart] = useState(startOfWeek(initial))
  const [activeTag, setActiveTag] = useState('All')
  const [search, setSearch] = useState('')

  const [editing, setEditing] = useState(null)
  const [details, setDetails] = useState(null)
  const [menuId, setMenuId] = useState(null)
  const [adding, setAdding] = useState(false)

  if (!trip) return <PageTransition>Trip not found.</PageTransition>

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const eventsByDay = useMemo(() => {
    const map = {}
    days.forEach((d) => (map[d.toISOString().slice(0, 10)] = []))
    trip.events.forEach((e) => {
      const key = typeof e.date === 'string' ? e.date.slice(0, 10) : new Date(e.date).toISOString().slice(0, 10)
      if (map[key]) map[key].push(e)
    })
    return map
  }, [trip.events, weekStart])

  const filteredRecos = recommendations.filter((r) => {
    const matchTag =
      activeTag === 'All' ||
      r.tag === activeTag.toLowerCase() ||
      (activeTag === 'Activities' && r.tag === 'activity')
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  const monthLabel = weekStart.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  return (
    <PageTransition className="relative flex flex-1 flex-col">
      <TripSubSidebar tripId={tripId} />
      <TopBar />

      <div className="px-6 pb-12 pl-20 md:pl-24">
        <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[1fr_360px]">
          {/* Calendar */}
          <section className="card-dark overflow-hidden p-5">
            {/* Toolbar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-brand-300" />
                <div className="lower font-display text-2xl font-extrabold">{monthLabel}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const d = new Date(weekStart)
                    d.setDate(d.getDate() - 7)
                    setWeekStart(d)
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/15"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    const d = new Date(weekStart)
                    d.setDate(d.getDate() + 7)
                    setWeekStart(d)
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/15"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAdding(true)}
                  className="ml-2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-brand-700"
                >
                  <Plus className="h-3 w-3" /> add event
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-[64px_repeat(7,1fr)] gap-px bg-white/5">
              <div />
              {days.map((d, i) => {
                const today = d.toDateString() === new Date().toDateString()
                return (
                  <div
                    key={i}
                    className={`flex flex-col items-center gap-1 bg-ink-900 py-2 text-xs ${
                      today ? 'text-white' : 'text-white/65'
                    }`}
                  >
                    <span className="uppercase tracking-wider">{DAYS[d.getDay()]}</span>
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-full font-bold ${
                        today ? 'bg-white text-ink-900' : ''
                      }`}
                    >
                      {fmtDay(d)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Grid */}
            <div className="relative grid grid-cols-[64px_repeat(7,1fr)] bg-white/5">
              {/* Hour labels */}
              <div className="bg-ink-900">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="flex h-14 items-start justify-center pt-1 text-[10px] font-medium uppercase tracking-wider text-white/55"
                  >
                    {h <= 12 ? h : h - 12}
                    {h < 12 ? ' am' : ' pm'}
                  </div>
                ))}
              </div>
              {days.map((d) => {
                const key = d.toISOString().slice(0, 10)
                return (
                  <div
                    key={key}
                    className="relative bg-ink-900"
                    style={{ height: HOURS.length * 56 }}
                  >
                    {HOURS.map((_, i) => (
                      <div
                        key={i}
                        className="absolute inset-x-0 border-t border-white/5"
                        style={{ top: i * 56 }}
                      />
                    ))}
                    {(eventsByDay[key] || []).map((ev) => {
                      const top = timeToY(ev.start)
                      const bottom = timeToY(ev.end)
                      const height = Math.max(28, bottom - top)
                      return (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          style={{ top, height }}
                          className={`absolute inset-x-1.5 rounded-md p-2 text-[11px] shadow ${ev.color || 'bg-brand-300/90 text-ink-900'}`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0">
                              <div className="truncate font-semibold leading-tight">
                                {ev.title}
                              </div>
                              <div className="text-[10px] opacity-80">
                                {ev.start}–{ev.end}
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setMenuId(menuId === ev.id ? null : ev.id)
                              }}
                              className="grid h-5 w-5 place-items-center rounded-full text-[14px] leading-none hover:bg-black/10"
                            >
                              ⋯
                            </button>
                          </div>
                          {menuId === ev.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute right-0 top-7 z-10 w-32 overflow-hidden rounded-lg bg-white text-ink-900 shadow-xl ring-1 ring-black/5"
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setMenuId(null)
                                  setEditing(ev)
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-ink-900/5"
                              >
                                <Pencil className="h-3 w-3" /> Edit time
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setMenuId(null)
                                  setDetails(ev)
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-ink-900/5"
                              >
                                <Search className="h-3 w-3" /> View details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setMenuId(null)
                                  removeEvent(tripId, ev.id)
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-dolly-700 hover:bg-dolly-50"
                              >
                                <Trash2 className="h-3 w-3" /> Remove
                              </button>
                            </motion.div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </section>

          {/* AI Recommendations */}
          <aside className="card-dark p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-dolly-400 text-white">
                ✨
              </span>
              <h3 className="lower font-display text-lg font-bold">ai recommendations</h3>
            </div>

            <div className="flex gap-1 rounded-full bg-white/10 p-1 text-[11px]">
              <button
                onClick={() => setSearch('')}
                className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-white/85 hover:bg-white/15"
              >
                <Search className="h-3 w-3" /> Search
              </button>
              <button className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/10 py-1.5 text-white/85 hover:bg-white/15">
                <Plus className="h-3 w-3" /> Manual Add
              </button>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recommendations..."
              className="mt-2 w-full rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none"
            />

            <div className="mt-3 flex flex-wrap gap-1.5">
              {RECO_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                    activeTag === t
                      ? 'bg-white text-ink-900'
                      : 'bg-white/10 text-white/70 hover:bg-white/15'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <ul className="mt-4 space-y-3">
              {filteredRecos.map((r) => (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white/5 p-3 ring-1 ring-white/5 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <div className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-base">
                        {r.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{r.title}</div>
                        <div className="text-[11px] leading-snug text-white/65">
                          {r.subtitle}
                        </div>
                        <div className="mt-1.5 text-[10px] italic text-white/45">
                          Time: {r.time}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const [s, e] = r.time.split(' – ')
                        const to24 = (t) => {
                          const [hm, ap] = t.trim().split(' ')
                          let [h, m] = hm.split(':').map(Number)
                          if (ap?.toLowerCase() === 'pm' && h !== 12) h += 12
                          if (ap?.toLowerCase() === 'am' && h === 12) h = 0
                          return `${String(h).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`
                        }
                        addEvent(tripId, {
                          title: r.title,
                          date: days[2].toISOString().slice(0, 10),
                          start: to24(s),
                          end: to24(e),
                          type: r.tag === 'activity' ? 'activity' : r.tag,
                          color: 'bg-saffron-300/90 text-ink-900',
                        })
                      }}
                      className="rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-brand-600"
                    >
                      Add
                    </button>
                  </div>
                </motion.li>
              ))}
              {filteredRecos.length === 0 && (
                <li className="rounded-lg border border-dashed border-white/15 p-6 text-center text-xs text-white/55">
                  No recommendations match.
                </li>
              )}
            </ul>
          </aside>
        </div>
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <Modal onClose={() => setEditing(null)} title="Edit Time">
            <EventForm
              event={editing}
              onSave={(patch) => {
                updateEvent(tripId, editing.id, patch)
                setEditing(null)
              }}
              onCancel={() => setEditing(null)}
            />
          </Modal>
        )}
        {adding && (
          <Modal onClose={() => setAdding(false)} title="New Event">
            <EventForm
              event={{
                title: '',
                date: days[0].toISOString().slice(0, 10),
                start: '09:00',
                end: '10:00',
                type: 'activity',
                color: 'bg-caper-300/90 text-ink-900',
              }}
              onSave={(patch) => {
                addEvent(tripId, patch)
                setAdding(false)
              }}
              onCancel={() => setAdding(false)}
            />
          </Modal>
        )}
        {details && (
          <Modal onClose={() => setDetails(null)} title={details.title}>
            <div className="space-y-2 text-sm">
              <div className="text-ink-900/65">
                {details.start} – {details.end}
              </div>
              <div className="text-ink-900/65">{details.date}</div>
              <p className="text-ink-900/80">
                Visit and enjoy this event with your crew. Tap edit to adjust the time, or remove
                if your plans change.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    setDetails(null)
                    setEditing(details)
                  }}
                  className="btn-primary"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit time
                </button>
                <button
                  onClick={() => {
                    removeEvent(tripId, details.id)
                    setDetails(null)
                  }}
                  className="btn"
                >
                  <Trash2 className="h-3.5 w-3.5 text-dolly-600" /> Remove
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/60 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-5 text-ink-900 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-display text-lg font-bold">{title}</h4>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-900/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function EventForm({ event, onSave, onCancel }) {
  const [form, setForm] = useState(event)
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave(form)
      }}
      className="space-y-3 text-sm"
    >
      <label className="block">
        <span className="mb-1 block text-xs text-ink-900/60">Title</span>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="field"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-ink-900/60">Date</span>
        <input
          type="date"
          required
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="field"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-900/60">Start</span>
          <input
            type="time"
            required
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            className="field"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-900/60">End</span>
          <input
            type="time"
            required
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
            className="field"
          />
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  )
}
