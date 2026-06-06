import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Pencil,
  Trash2,
  CalendarDays,
} from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import TripSubSidebar from '../components/TripSubSidebar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

const DAYS  = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const HOURS = Array.from({ length: 12 }, (_, i) => i + 6)

function startOfWeek(date) {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

function fmtDay(d) {
  return d.toLocaleDateString(undefined, { day: 'numeric' })
}

function timeToY(isoString) {
  if (!isoString) return 0
  const d = new Date(isoString)
  return ((d.getHours() - HOURS[0]) + d.getMinutes() / 60) * 56
}

function fmtTime(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function dateKey(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toISOLocal(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

export default function Schedule() {
  const { tripId } = useParams()
  const { getTrip, addEvent, updateEvent, removeEvent, refreshTrip, loading } = useTrips()
  const trip       = getTrip(tripId)

  // Refresh the full trip (with nested events) on mount
  useEffect(() => {
    if (tripId) refreshTrip(tripId)
  }, [tripId])

  const initial = trip?.startDate ? new Date(trip.startDate) : new Date()

  // ── All hooks must be declared before any early return ──
  const [weekStart,    setWeekStart]    = useState(startOfWeek(initial))
  const [editing,      setEditing]      = useState(null)
  const [menuId,       setMenuId]       = useState(null)
  const [adding,       setAdding]       = useState(false)

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  }), [weekStart])

  const eventsByDay = useMemo(() => {
    const map = {}
    days.forEach((d) => {
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      map[k] = []
    })
    ;(trip?.events || []).forEach((e) => {
      const k = dateKey(e.startTime)
      if (map[k]) map[k].push(e)
    })
    return map
  }, [trip?.events, weekStart, days])

  // ── Early returns after all hooks ──
  if (loading && !trip) {
    return (
      <PageTransition className="flex flex-1 items-center justify-center">
        <div className="text-center text-white/55">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
          <p className="mt-3 text-sm">Loading schedule...</p>
        </div>
      </PageTransition>
    )
  }

  if (!trip) return <PageTransition>Trip not found.</PageTransition>

  const monthLabel = weekStart.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <PageTransition className="relative flex flex-1 flex-col">
      <TripSubSidebar tripId={tripId} />
      <TopBar />

      <div className="px-6 pb-12 pl-20 md:pl-24">
        <div className="mx-auto max-w-[1500px]">

          {/* ── Calendar ── */}
          <section className="card-dark overflow-hidden p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-brand-300" />
                <div className="lower font-display text-2xl font-extrabold">{monthLabel}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/15"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }}
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
                  <div key={i} className={`flex flex-col items-center gap-1 bg-ink-900 py-2 text-xs ${today ? 'text-white' : 'text-white/65'}`}>
                    <span className="uppercase tracking-wider">{DAYS[d.getDay()]}</span>
                    <span className={`grid h-7 w-7 place-items-center rounded-full font-bold ${today ? 'bg-white text-ink-900' : ''}`}>
                      {fmtDay(d)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Time grid */}
            <div className="relative grid grid-cols-[64px_repeat(7,1fr)] bg-white/5">
              <div className="bg-ink-900">
                {HOURS.map((h) => (
                  <div key={h} className="flex h-14 items-start justify-center pt-1 text-[10px] font-medium uppercase tracking-wider text-white/55">
                    {h <= 12 ? h : h - 12}{h < 12 ? ' am' : ' pm'}
                  </div>
                ))}
              </div>

              {days.map((d) => {
                const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                return (
                  <div key={k} className="relative bg-ink-900" style={{ height: HOURS.length * 56 }}>
                    {HOURS.map((_, i) => (
                      <div key={i} className="absolute inset-x-0 border-t border-white/5" style={{ top: i * 56 }} />
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
                              <div className="text-[10px] opacity-80">{fmtTime(ev.startTime)}–{fmtTime(ev.endTime)}</div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setMenuId(menuId === ev.id ? null : ev.id) }}
                              className="grid h-5 w-5 place-items-center rounded-full text-[14px] leading-none hover:bg-black/10"
                            >⋯</button>
                          </div>
                          {menuId === ev.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute right-0 top-7 z-10 w-32 overflow-hidden rounded-lg bg-white text-ink-900 shadow-xl ring-1 ring-black/5"
                            >
                              <button onClick={(e) => { e.stopPropagation(); setMenuId(null); setEditing(ev) }} className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-ink-900/5">
                                <Pencil className="h-3 w-3" /> Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const idToRemove = ev.id
                                  setMenuId(null)
                                  removeEvent(tripId, idToRemove)
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
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {editing && (
          <Modal onClose={() => setEditing(null)} title="Edit Event">
            <EventForm
              event={editing}
              onSave={async (patch) => { await updateEvent(tripId, editing.id, patch); setEditing(null) }}
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
              onSave={async (patch) => { await addEvent(tripId, patch); setAdding(false) }}
              onCancel={() => setAdding(false)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-900/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}

function EventForm({ event, onSave, onCancel }) {
  const isISO = (s) => s && s.includes('T')

  const initDate  = isISO(event.startTime)
    ? new Date(event.startTime).toISOString().slice(0, 10)
    : (event.date || new Date().toISOString().slice(0, 10))

  const initStart = isISO(event.startTime)
    ? new Date(event.startTime).toTimeString().slice(0, 5)
    : (event.startTime || '09:00')

  const initEnd = isISO(event.endTime)
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
          color:     event.color || 'bg-caper-300/90 text-ink-900',
          startTime: toISOLocal(date, start),
          endTime:   toISOLocal(date, end),
        })
      }}
      className="space-y-3 text-sm"
    >
      <label className="block">
        <span className="mb-1 block text-xs text-ink-900/60">Title</span>
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className="field" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-ink-900/60">Type</span>
        <select value={type} onChange={(e) => setType(e.target.value)} className="field">
          <option value="activity">Activity</option>
          <option value="food">Food</option>
          <option value="flight">Flight</option>
          <option value="hotel">Hotel</option>
        </select>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs text-ink-900/60">Date</span>
        <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="field" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs text-ink-900/60">Start</span>
          <input type="time" required value={start} onChange={(e) => setStart(e.target.value)} className="field" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-900/60">End</span>
          <input type="time" required value={end} onChange={(e) => setEnd(e.target.value)} className="field" />
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn">Cancel</button>
        <button type="submit" className="btn-primary">Save</button>
      </div>
    </form>
  )
}