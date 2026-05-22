import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  MapPin,
  Plus,
  Trash2,
  Pencil,
  X,
} from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1600&q=80',
]

// ============================================================================
// NewTrip.jsx — /app/trips/new. A 3-step wizard for creating a new trip:
//   1. trip details   (name, destination, duration, start date)
//   2. add a photo    (upload or pick a preset)
//   3. invite buddies (collect emails)
// On submit, calls TripsContext.addTrip() and navigates to the new trip.
// ============================================================================

const STEPS = ['trip details', 'add a photo', 'invite buddies']

// Stepper — the small numbered progress bar at the top of the wizard.
// `step` is 1-based; circles before it are checkmarks, the current one is bold.
function Stepper({ step }) {
  return (
    <div className="mb-8 flex items-center justify-center gap-3">
      {STEPS.map((label, i) => {
        const idx = i + 1
        const active = idx === step
        const done = idx < step
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                  done
                    ? 'bg-caper-500 text-white'
                    : active
                    ? 'bg-ink-900 text-white shadow-lg'
                    : 'bg-white/15 text-white/70'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : idx}
              </div>
              <div
                className={`mt-1 text-[10px] uppercase tracking-wider ${
                  active ? 'text-white' : 'text-white/55'
                }`}
              >
                {label}
              </div>
            </div>
            {idx < STEPS.length && (
              <div
                className={`h-0.5 w-10 rounded-full transition ${
                  done ? 'bg-caper-500' : 'bg-white/15'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// NewTrip — the wizard's container component. Holds every piece of form
// state in local useState so nothing touches global storage until "create".
export default function NewTrip() {
  const location = useLocation()                 // router-injected URL info; carries pre-fill state
  const navigate = useNavigate()
  const { addTrip } = useTrips()                 // global action that appends to the trip list
  const [step, setStep] = useState(1)            // which wizard step is showing (1, 2, or 3)

  // ---- Form fields (local state, lost on unmount) ------------------------
  const [name, setName] = useState('')
  const [destination, setDestination] = useState(location.state?.destination || '') // pre-filled if user came from Home search
  const [duration, setDuration] = useState(4)
  const [startDate, setStartDate] = useState('')
  const [cover, setCover] = useState(COVER_PRESETS[0])
  const [invites, setInvites] = useState([
    { id: 'i1', email: 'tina.tsai@example.com' },
    { id: 'i2', email: 'hamin@example.com' },
  ])
  const [editingId, setEditingId] = useState(null)   // which invite row is currently in edit mode
  const fileInput = useRef(null)                     // ref to the hidden <input type="file"> for cover uploads

  // canNext — derived flag for "is the current step complete enough to advance".
  // useMemo avoids recomputing on every keystroke unless deps change.
  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length > 1 && destination.trim().length > 1
    if (step === 2) return !!cover
    return true
  }, [step, name, destination, cover])

  // onFilePick — handler for the cover image <input type="file">. Reads the
  // chosen image as a base64 data URL so we can save it inline (no upload).
  const onFilePick = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setCover(reader.result)
    reader.readAsDataURL(f)
  }

  // computeEndDate — adds `duration` days to startDate and returns it as
  // an ISO date (yyyy-mm-dd) for storage.
  const computeEndDate = () => {
    if (!startDate) return ''
    const d = new Date(startDate)
    d.setDate(d.getDate() + Number(duration))
    return d.toISOString().slice(0, 10)
  }

  // submit — finalize the wizard. Calls addTrip with everything we collected,
  // then navigates the user straight into the new trip's overview page.
  const submit = () => {
    const trip = addTrip({
      name: name.trim() || 'Untitled Trip',
      location: destination.trim(),
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate:
        computeEndDate() ||
        new Date(Date.now() + duration * 86400000).toISOString().slice(0, 10),
      cover,
      members: invites
        .filter((i) => i.email.includes('@'))
        .map((i, idx) => ({
          id: 'mem_' + idx,
          name: i.email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(i.email)}`,
        })),
    })
    navigate(`/app/trips/${trip.id}`)
  }

  return (
    <PageTransition className="relative flex flex-1 flex-col">
      <div className="absolute inset-0 -z-0">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=80"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/65 to-ink-900/85" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col text-white">
        <TopBar />

        <section className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-2xl">
            <Stepper step={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-3xl bg-white p-8 text-ink-900 shadow-2xl"
              >
                {step === 1 && (
                  <div>
                    <h2 className="lower font-display text-2xl font-extrabold">trip name</h2>
                    <input
                      autoFocus
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Italy trip 2026, Summer in Spain..."
                      className="mt-3 w-full border-0 border-b border-ink-900/15 bg-transparent pb-2 text-lg placeholder:text-ink-900/30 focus:border-brand-500 focus:outline-none"
                    />

                    <div className="mt-8 rounded-3xl bg-gradient-to-br from-caper-600 to-caper-700 p-6 text-white shadow-card">
                      <div className="flex items-center gap-2 text-sm opacity-90">
                        <MapPin className="h-4 w-4" />
                        <input
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          placeholder="taipei, taiwan"
                          className="flex-1 border-b border-white/30 bg-transparent pb-1 text-sm font-semibold placeholder:text-white/60 focus:border-white focus:outline-none"
                        />
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-6">
                        <div>
                          <div className="mb-2 text-[11px] uppercase tracking-widest opacity-80">
                            duration
                          </div>
                          <div className="flex items-end gap-2">
                            <input
                              type="number"
                              min={1}
                              max={120}
                              value={duration}
                              onChange={(e) => setDuration(Number(e.target.value))}
                              className="w-16 border-b border-white/40 bg-transparent text-4xl font-extrabold focus:border-white focus:outline-none"
                            />
                            <span className="pb-1 text-xs opacity-80">/ days</span>
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 text-[11px] uppercase tracking-widest opacity-80">
                            start date
                          </div>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full border-b border-white/40 bg-transparent pb-1 text-sm font-semibold focus:border-white focus:outline-none [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="lower font-display text-2xl font-extrabold">
                      select a cover photo
                    </h2>
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      className="mt-5 grid w-full place-items-center rounded-2xl border-2 border-dashed border-ink-900/15 bg-ink-900/[0.02] py-10 text-center transition hover:border-brand-500 hover:bg-brand-50"
                    >
                      <Camera className="h-7 w-7 text-ink-900/55" />
                      <div className="mt-2 text-xs font-medium text-ink-900/60">upload a photo</div>
                      <input
                        ref={fileInput}
                        onChange={onFilePick}
                        type="file"
                        accept="image/*"
                        className="hidden"
                      />
                    </button>

                    <div className="mt-5 text-xs uppercase tracking-widest text-ink-900/55">
                      or pick a preset
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {COVER_PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCover(p)}
                          className={`relative aspect-[4/3] overflow-hidden rounded-xl ring-2 transition ${
                            cover === p
                              ? 'ring-brand-500'
                              : 'ring-transparent hover:ring-ink-900/20'
                          }`}
                        >
                          <img src={p} alt="" className="h-full w-full object-cover" />
                          {cover === p && (
                            <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="lower font-display text-2xl font-extrabold">
                      invite travel buddies
                    </h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const fd = new FormData(e.currentTarget)
                        const email = String(fd.get('email') || '').trim()
                        if (!email) return
                        setInvites((arr) => [...arr, { id: 'i' + arr.length, email }])
                        e.currentTarget.reset()
                      }}
                      className="mt-4 flex items-center gap-2"
                    >
                      <input
                        name="email"
                        type="email"
                        placeholder="search by email or pick a buddy..."
                        className="field"
                      />
                      <button
                        type="submit"
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-caper-500 text-white transition hover:bg-caper-600"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </form>

                    <ul className="mt-5 space-y-2">
                      {invites.map((inv) => (
                        <li
                          key={inv.id}
                          className="flex items-center justify-between rounded-xl border border-ink-900/5 bg-ink-900/[0.02] px-4 py-3 text-sm"
                        >
                          {editingId === inv.id ? (
                            <input
                              autoFocus
                              defaultValue={inv.email}
                              onBlur={(e) => {
                                setInvites((arr) =>
                                  arr.map((x) => (x.id === inv.id ? { ...x, email: e.target.value } : x)),
                                )
                                setEditingId(null)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') e.target.blur()
                              }}
                              className="flex-1 border-b border-brand-500 bg-transparent text-sm focus:outline-none"
                            />
                          ) : (
                            <span className="truncate">{inv.email}</span>
                          )}
                          <div className="ml-3 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingId(inv.id)}
                              className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-900/5"
                            >
                              <Pencil className="h-3.5 w-3.5 text-ink-900/55" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setInvites((arr) => arr.filter((x) => x.id !== inv.id))
                              }
                              className="grid h-8 w-8 place-items-center rounded-full hover:bg-dolly-50"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-dolly-600" />
                            </button>
                          </div>
                        </li>
                      ))}
                      {invites.length === 0 && (
                        <li className="rounded-xl border border-dashed border-ink-900/10 px-4 py-6 text-center text-xs text-ink-900/55">
                          You can travel solo too — invite friends later.
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => (step === 1 ? navigate(-1) : setStep((s) => s - 1))}
                    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-ink-900/65 hover:text-ink-900"
                  >
                    {step === 1 ? <X className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
                    {step === 1 ? 'cancel' : 'back'}
                  </button>
                  {step < 3 ? (
                    <button
                      type="button"
                      disabled={!canNext}
                      onClick={() => setStep((s) => s + 1)}
                      className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      next <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={submit} className="btn-brand">
                      create trip <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </div>
    </PageTransition>
  )
}
