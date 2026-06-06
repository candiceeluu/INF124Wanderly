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
  Loader2,
} from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import TripSubSidebar from '../components/TripSubSidebar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

// ============================================================================
// Schedule.jsx — /app/trips/:tripId/schedule. Weekly calendar view.
// Left: 7-day grid (6 AM – 5 PM) with absolutely-positioned event blocks.
// Right: AI recommendations panel powered by the Gemini API.
// ============================================================================

const DAYS  = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 6) // 6am – 5pm

const RECO_TAGS = ['All', 'Food', 'Activities', 'Low budget', 'Near hotel']

function startOfWeek(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function fmtDay(d) {
  return d.toLocaleDateString(undefined, { day: 'numeric' })
}

// timeToY — converts a DateTime string into a pixel offset from the top
// of the calendar grid. Each hour row is 56px tall, grid starts at 6am.
function timeToY(isoString) {
  if (!isoString) return 0
  const d     = new Date(isoString)
  const h     = d.getHours()
  const m     = d.getMinutes()
  const start = HOURS[0]
  return ((h - start) + m / 60) * 56
}

// fmtTime — format a DateTime string as "9:00 AM"
function fmtTime(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

// dateKey — extract yyyy-mm-dd from a DateTime string in local time
function dateKey(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// toISOLocal — combine a date string (yyyy-mm-dd) and time string (HH:MM)
// into a full ISO DateTime string for sending to the API.
function toISOLocal(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

export default function Schedule() {
  const { tripId }                                = useParams()
  const { getTrip, addEvent, updateEvent, removeEvent } = useTrips()
  const { token }                                 = useAuth()
  const trip                                      = getTrip(tripId)

  const initial   = trip?.startDate ? new Date(trip.startDate) : new Date()
  const [weekStart, setWeekStart] = useState(startOfWeek(initial))
  const [activeTag, setActiveTag] = useState('All')
  const [search,    setSearch]    = useState('')

  const [editing,  setEditing]  = useState(null)
  const [details,  setDetails]  = useState(null)
  const [menuId,   setMenuId]   = useState(null)
  const [adding,   setAdding]   = useState(false)

  // AI recommendations state
  const [recos,        setRecos]        = useState([])
  const [recosLoading, setRecosLoading] = useState(false)
  const [recosError,   setRecosError]   = useState(null)
  const [recosFetched, setRecosFetched] = useState(false)

  if (!trip) return <PageTransition>Trip not found.</PageTransition>

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  // Group events by local date key for the calendar columns
  const eventsByDay = useMemo(() => {
    const map = {}
    days.forEach((d) => {
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      map[k] = []
    })
    ;(trip.events || []).forEach((e) => {
      const k = dateKey(e.startTime)
      if (map[k]) map[k].push(e)
    })
    return map
  }, [trip.events, weekStart])

  const monthLabel = weekStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  // fetchRecos — calls the Gemini API via our backend to get AI recommendations
  // for this trip's destination. Only fetches once per page load.
  const fetchRecos = async () => {
    if (recosFetched || recosLoading) return
    setRecosLoading(true)
    setRecosError(null)
    try {
      const res = await fetch('/api/recommendations', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination: trip.destination,
          startDate:   trip.startDate,
          endDate:     trip.endDate,
        }),
      })
      if (!res.ok) throw new Error('Failed to fetch recommendations')
      const data = await res.json()
      setRecos(data.recommendations || [])
      setRecosFetched(true)
    } catch (err) {
      setRecosError(err.message)
    } finally {
      setRecosLoading(false)
    }
  }

  // filteredRecos — apply tag and search filters to the fetched recommendations
  const filteredRecos = recos.filter((r) => {
    const matchTag    = activeTag === 'All' || r.category?.toLowerCase() === activeTag.toLowerCase()
    const matchSearch = r.name?.toLowerCase().includes(search.toLowerCase())
    return matchTag && matchSearch
  })

  return (
    <PageTransition className="relative flex flex-1 flex-col">
      <TripSubSidebar tripId={tripId} />
      <TopBar />

      <div className="px-6 pb-12 pl-20 md:pl-24">
        <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[1fr_360px]">

          {/* ── Calendar ── */}
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
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                return (
                  <div
                    key={k}
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
                    {(eventsByDay[k] || []).map((ev) => {
                      const top    = timeToY(ev.startTime)
                      const bottom = timeToY(ev.endTime)
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
                              <div className="truncate font-semibold leading-tight">{ev.title}</div>
                              <div className="text-[10px] opacity-80">
                                {fmtTime(ev.startTime)}–{fmtTime(ev.endTime)}
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
                                onClick={(e) => { e.stopPropagation(); setMenuId(null); setEditing(ev) }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-ink-900/5"
                              >
                                <Pencil className="h-3 w-3" /> Edit time
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setMenuId(null); setDetails(ev) }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-ink-900/5"
                              >
                                <Search className="h-3 w-3" /> View details
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setMenuId(null); removeEvent(tripId, ev.id) }}
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

          {/* ── AI Recommendations ── */}
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
              <button
                onClick={fetchRecos}
                disabled={recosLoading || recosFetched}
                className="flex flex-1 items-center justify-center gap-1 rounded-full bg-brand-600 py-1.5 text-white transition hover:bg-brand-700 disabled:opacity-60"
              >
                {recosLoading
                  ? <Loader2 className="h-3 w-3 animate-spin" />
                  : <Plus className="h-3 w-3" />}
                {recosLoading ? 'Loading...' : recosFetched ? 'Loaded' : 'Get ideas'}
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

            {recosError && (
              <div className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {recosError}
              </div>
            )}

            {!recosFetched && !recosLoading && (
              <div className="mt-6 rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-white/55">
                Click "Get ideas" to get AI-powered recommendations for {trip.destination}.
              </div>
            )}

            <ul className="mt-4 space-y-3">
              {filteredRecos.map((r, i) => (
                <motion.li
                  key={r.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-white/5 p-3 ring-1 ring-white/5 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{r.name}</div>
                      <div className="text-[11px] leading-snug text-white/65">{r.description}</div>
                      {r.duration && (
                        <div className="mt-1 text-[10px] italic text-white/45">
                          Duration: {r.duration}
                        </div>
                      )}
                      {r.priceRange && (
                        <div className="text-[10px] text-white/45">{r.priceRange}</div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        // Add this recommendation as an event on day 3 of the visible week at 10am
                        const day  = days[2]
                        const date = day.toISOString().slice(0, 10)
                        addEvent(tripId, {
                          title:     r.name,
                          type:      r.category?.toLowerCase() || 'activity',
                          color:     'bg-saffron-300/90 text-ink-900',
                          startTime: toISOLocal(date, '10:00'),
                          endTime:   toISOLocal(date, '12:00'),
                          location:  r.location || null,
                        })
                      }}
                      className="rounded-full bg-brand-500 px-3 py-1 text-[11px] font-semibold text-white transition hover:bg-brand-600"
                    >
                      Add
                    </button>
                  </div>
                </motion.li>
              ))}
              {recosFetched && filteredRecos.length === 0 && (
                <li className="rounded-lg border border-dashed border-white/15 p-6 text-center text-xs text-white/55">
                  No recommendations match.
                </li>
              )}
            </ul>
          </aside>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {editing && (
          <Modal onClose={() => setEditing(null)} title="Edit Event">
            <EventForm
              event={editing}
              onSave={(patch) => { updateEvent(tripId, editing.id, patch); setEditing(null) }}
              onCancel={() => setEditing(null)}
            />
          </Modal>
        )}
        {adding && (
          <Modal onClose={() => setAdding(false)} title="New Event">
            <EventForm
              event={{
                title:     '',
                date:      days[0].toISOString().slice(0, 10),
                startTime: '09:00',
                endTime:   '10:00',
                type:      'activity',
                color:     'bg-caper-300/90 text-ink-900',
              }}
              onSave={(patch) => { addEvent(tripId, patch); setAdding(false) }}
              onCancel={() => setAdding(false)}
            />
          </Modal>
        )}
        {details && (
          <Modal onClose={() => setDetails(null)} title={details.title}>
            <div className="space-y-2 text-sm">
              <div className="text-ink-900/65">
                {fmtTime(details.startTime)} – {fmtTime(details.endTime)}
              </div>
              {details.location && (
                <div className="text-ink-900/65">{details.location}</div>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => { setDetails(null); setEditing(details) }}
                  className="btn-primary"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit time
                </button>
                <button
                  onClick={() => { removeEvent(tripId, details.id); setDetails(null) }}
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
  const initDate  = event.startTime
    ? new Date(event.startTime).toISOString().slice(0, 10)
    : (event.date || new Date().toISOString().slice(0, 10))
  const initStart = event.startTime
    ? new Date(event.startTime).toTimeString().slice(0, 5)
    : (event.startTime || '09:00')
  const initEnd   = event.endTime
    ? new Date(event.endTime).toTimeString().slice(0, 5)
    : (event.endTime || '10:00')

  const [title, setTitle] = useState(event.title || '')
  const [date,  setDate]  = useState(initDate)
  const [start, setStart] = useState(initStart)
  const [end,   setEnd]   = useState(initEnd)
  const [type,  setType]  = useState(event.type || 'activity')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSave({
          title,
          type,
          color: event.color || 'bg-caper-300/90 text-ink-900',
          startTime: toISOLocal(date, start),
          endTime:   toISOLocal(date, end),
        })
      }}
      className="space-y-3 text-sm"
    >
      <label className="block">
        <span className="mb-1 block text-xs text-ink-900/60">Title</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="field"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-ink-900/60">Type</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="field"
        >
          <option value="activity">Activity</option>
          <option value="food">Food</option>
          <option value="flight">Flight</option>
          <option value="hotel">Hotel</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-ink-900/60">Date</span>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="field"
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-900/60">Start</span>
          <input
            type="time"
            required
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="field"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-900/60">End</span>
          <input
            type="time"
            required
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="field"
          />
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn">Cancel</button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  )
}