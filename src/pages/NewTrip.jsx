import { useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Crosshair,
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

const STEPS = ['trip details', 'add a photo', 'invite buddies']

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

export default function NewTrip() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addTrip } = useTrips()
  const [step, setStep] = useState(1)

  const [name,        setName]        = useState('')
  const [destination, setDestination] = useState(location.state?.destination || '')
  const [locating, setLocating] = useState(false)

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current=temperature_2m`,
          )
          await res.json()
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&count=1`,
          )
          const geo = await geoRes.json()
          const place = geo?.results?.[0]
          if (place) {
            setDestination(`${place.name}${place.country ? `, ${place.country}` : ''}`)
          } else {
            setDestination(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`)
          }
        } catch {
          setDestination(`${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)}`)
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        alert(err.message || 'Could not get your location.')
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }
  const [duration,    setDuration]    = useState(1)
  const [startDate,   setStartDate]   = useState('')
  const [cover,       setCover]       = useState(COVER_PRESETS[0])
  const [invites,     setInvites]     = useState([])
  const [editingId,   setEditingId]   = useState(null)
  const fileInput = useRef(null)

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const canNext = useMemo(() => {
    if (step === 1) return name.trim().length > 1 && destination.trim().length > 1
    if (step === 2) return !!cover
    return true
  }, [step, name, destination, cover])

  const onFilePick = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => setCover(reader.result)
    reader.readAsDataURL(f)
  }

  const computeEndDate = () => {
    if (!startDate) return ''
    const d = new Date(startDate)
    d.setDate(d.getDate() + Number(duration))
    return d.toISOString().slice(0, 10)
  }

  const submit = async () => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const trip = await addTrip({
        title:       name.trim() || 'Untitled Trip',
        destination: destination.trim(),
        startDate:   startDate || new Date().toISOString().slice(0, 10),
        endDate:
          computeEndDate() ||
          new Date(Date.now() + duration * 86400000).toISOString().slice(0, 10),
        cover,
      })

      const validInvites = invites.filter((i) => i.email.includes('@'))
      for (const invite of validInvites) {
        try {
          await addMemberByEmail(trip.id, invite.email)
        } catch {
        }
      }

      navigate(`/app/trips/${trip.id}`)
    } catch (err) {
      setSubmitError(err.message || 'Failed to create trip. Please try again.')
      setSubmitting(false)
    }
  }


  const addMemberByEmail = async (tripId, email) => {
    const res = await fetch(`/api/members?tripId=${tripId}`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${localStorage.getItem('wanderly.token')}`
      },
      body: JSON.stringify({ email })
    })
    if (!res.ok) throw new Error('Member not found')
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
                    <h2 className="font-display text-2xl font-extrabold">tell us about your trip</h2>

                    <label className="mt-5 block text-xs font-medium text-ink-900/70">trip name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Summer in Kyoto"
                      className="field mt-1.5"
                    />

                    <label className="mt-4 block text-xs font-medium text-ink-900/70">destination</label>
                    <div className="relative mt-1.5 flex items-center gap-2">
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        placeholder="Kyoto, Japan"
                        className="field pl-9 flex-1"
                      />
                      <button
                        type="button"
                        onClick={useMyLocation}
                        disabled={locating}
                        title="Use my current location"
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-ink-900/10 px-3 py-2 text-xs font-medium text-ink-900 transition hover:bg-ink-900/[0.04] disabled:opacity-60"
                      >
                        <Crosshair className={`h-3.5 w-3.5 ${locating ? 'animate-spin' : ''}`} />
                        {locating ? 'Locating...' : 'My location'}
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-ink-900/70">duration (days)</label>
                        <input
                          type="number"
                          min={1}
                          max={365}
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          className="field mt-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-900/70">start date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="field mt-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <h2 className="font-display text-2xl font-extrabold">select a cover photo</h2>
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
                    <h2 className="font-display text-2xl font-extrabold">invite travel buddies</h2>
                    <p className="mt-1 text-xs text-ink-900/55">
                      They need a Wanderly account. You can also invite after creating the trip.
                    </p>

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
                        placeholder="friend@example.com"
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
                                  arr.map((x) =>
                                    x.id === inv.id ? { ...x, email: e.target.value } : x,
                                  ),
                                )
                                setEditingId(null)
                              }}
                              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
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
                              onClick={() => setInvites((arr) => arr.filter((x) => x.id !== inv.id))}
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

                    {submitError && (
                      <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {submitError}
                      </div>
                    )}
                  </div>
                )}

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
                    <button
                      type="button"
                      onClick={submit}
                      disabled={submitting}
                      className="btn-brand disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          creating...
                        </>
                      ) : (
                        <>create trip <Check className="h-4 w-4" /></>
                      )}
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