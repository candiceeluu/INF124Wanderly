// ============================================================================
// TripsContext.jsx — The application's primary data store.
// Holds every trip (with nested events, expenses, members, debts, activity)
// plus the notification feed. State is persisted to localStorage on every
// change, so the app behaves like it has a backend without one.
//
// Exposes a CRUD-style API via useTrips() so pages don't manipulate state
// directly — they call addEvent / removeExpense / setBudgetTotal / etc.
// ============================================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { seedTrips, seedNotifications, seedRecommendations } from '../data/seedData.js'

const TripsContext = createContext(null)
const STORAGE_KEY = 'wanderly.trips.v2'         // versioned key — bump to invalidate old saved data
const NOTIF_KEY = 'wanderly.notifs.v2'

// uid — generate a short random unique id with an optional prefix.
// Used for new trips, events, expenses, members, and activity rows.
const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`

export function TripsProvider({ children }) {
  // ---- Persistent state ---------------------------------------------------
  // Trip list — rehydrate from localStorage on first render, fall back to seed data.
  const [trips, setTrips] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return seedTrips
  })

  // Notifications — same pattern as trips, separate key.
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY)
      if (raw) return JSON.parse(raw)
    } catch {}
    return seedNotifications
  })

  // Write-through effects: any change to trips/notifications is mirrored to localStorage.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
  }, [trips])

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications))
  }, [notifications])

  // ---- Trip CRUD ----------------------------------------------------------
  // getTrip — find a trip by id; memoized so consumers don't rebuild every render.
  const getTrip = useCallback((id) => trips.find((t) => t.id === id), [trips])

  // addTrip — insert a new trip at the top of the list. Fills in safe defaults
  // for any field the caller omits (cover image, empty arrays, default budget).
  const addTrip = useCallback((trip) => {
    const id = trip.id || uid('trip')
    const newTrip = {
      id,
      name: trip.name || 'Untitled Trip',
      location: trip.location || '',
      startDate: trip.startDate || '',
      endDate: trip.endDate || '',
      cover:
        trip.cover ||
        'https://images.unsplash.com/photo-1500835556837-99ac94a94552?auto=format&fit=crop&w=1600&q=80',
      color: trip.color || 'from-brand-400 to-brand-700',
      budget: { total: 1000, spent: 0 },
      members: trip.members || [],
      accommodations: [],
      events: [],
      expenses: [],
      debts: [],
      activity: [],
      ...trip,
    }
    setTrips((all) => [newTrip, ...all])
    return newTrip
  }, [])

  // updateTrip — patch one trip. Accepts either a shallow-merge object OR
  // a transformer function (t) => newTrip for more complex updates like
  // appending to nested arrays.
  const updateTrip = useCallback((id, patch) => {
    setTrips((all) =>
      all.map((t) => (t.id === id ? (typeof patch === 'function' ? patch(t) : { ...t, ...patch }) : t)),
    )
  }, [])

  // removeTrip — delete a trip by id (currently unused by the UI but exposed).
  const removeTrip = useCallback((id) => {
    setTrips((all) => all.filter((t) => t.id !== id))
  }, [])

  // ---- Sub-resource helpers ----------------------------------------------
  // Each helper below mutates a slice of one trip (events/expenses/etc) AND,
  // where relevant, appends a row to that trip's activity log so the
  // Activity page shows a timeline of changes.

  // addEvent — push a new calendar event onto a trip and log "Added X to schedule".
  const addEvent = useCallback(
    (tripId, event) => {
      const e = { id: uid('e'), color: 'bg-brand-200 text-ink-900', ...event }
      updateTrip(tripId, (t) => ({
        ...t,
        events: [...t.events, e],
        activity: [
          {
            id: uid('act'),
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            user: 'You',
            text: `Added ${e.title} to schedule`,
          },
          ...t.activity,
        ],
      }))
    },
    [updateTrip],
  )

  // updateEvent — patch a single event inside a trip (title/time/etc).
  const updateEvent = useCallback(
    (tripId, eventId, patch) => {
      updateTrip(tripId, (t) => ({
        ...t,
        events: t.events.map((e) => (e.id === eventId ? { ...e, ...patch } : e)),
      }))
    },
    [updateTrip],
  )

  // removeEvent — delete an event from a trip's schedule.
  const removeEvent = useCallback(
    (tripId, eventId) => {
      updateTrip(tripId, (t) => ({
        ...t,
        events: t.events.filter((e) => e.id !== eventId),
      }))
    },
    [updateTrip],
  )

  // addExpense — record a new expense, bump trip.budget.spent, and log activity.
  const addExpense = useCallback(
    (tripId, expense) => {
      const e = { id: uid('x'), ...expense }
      updateTrip(tripId, (t) => ({
        ...t,
        expenses: [e, ...t.expenses],
        budget: { ...t.budget, spent: (t.budget?.spent || 0) + Number(e.amount || 0) },
        activity: [
          {
            id: uid('act'),
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            user: 'You',
            text: `Added expense ${e.name} ($${e.amount})`,
          },
          ...t.activity,
        ],
      }))
    },
    [updateTrip],
  )

  // updateExpense — patch an expense; also reconciles budget.spent by
  // subtracting the old amount and adding the new one (keeps totals in sync).
  const updateExpense = useCallback(
    (tripId, expenseId, patch) => {
      updateTrip(tripId, (t) => {
        const old = t.expenses.find((x) => x.id === expenseId)
        const oldAmt = Number(old?.amount || 0)
        const newAmt = Number(patch.amount ?? oldAmt)
        return {
          ...t,
          expenses: t.expenses.map((x) => (x.id === expenseId ? { ...x, ...patch } : x)),
          budget: { ...t.budget, spent: (t.budget?.spent || 0) - oldAmt + newAmt },
        }
      })
    },
    [updateTrip],
  )

  // removeExpense — delete an expense and refund its amount from budget.spent
  // (clamped at 0 to avoid negative spent values).
  const removeExpense = useCallback(
    (tripId, expenseId) => {
      updateTrip(tripId, (t) => {
        const old = t.expenses.find((x) => x.id === expenseId)
        const amt = Number(old?.amount || 0)
        return {
          ...t,
          expenses: t.expenses.filter((x) => x.id !== expenseId),
          budget: { ...t.budget, spent: Math.max(0, (t.budget?.spent || 0) - amt) },
        }
      })
    },
    [updateTrip],
  )

  // setBudgetTotal — change a trip's total budget cap (used by Budget edit modal).
  const setBudgetTotal = useCallback(
    (tripId, total) => {
      updateTrip(tripId, (t) => ({ ...t, budget: { ...t.budget, total: Number(total) } }))
    },
    [updateTrip],
  )

  // addMember — invite someone to a trip. Auto-generates an avatar URL from
  // the dicebear "initials" service if no avatar is provided.
  const addMember = useCallback(
    (tripId, member) => {
      const m = {
        id: uid('m'),
        avatar:
          member.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name || 'guest')}`,
        ...member,
      }
      updateTrip(tripId, (t) => ({ ...t, members: [...t.members, m] }))
    },
    [updateTrip],
  )

  // removeMember — kick someone out of a trip.
  const removeMember = useCallback(
    (tripId, memberId) => {
      updateTrip(tripId, (t) => ({ ...t, members: t.members.filter((m) => m.id !== memberId) }))
    },
    [updateTrip],
  )

  // ---- Notifications ------------------------------------------------------
  // markNotifRead — flip a single notification's `read` flag to true.
  const markNotifRead = useCallback(
    (id) =>
      setNotifications((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n))),
    [],
  )
  // markAllNotifsRead — bulk mark every notification as read (used by TopBar).
  const markAllNotifsRead = useCallback(
    () => setNotifications((arr) => arr.map((n) => ({ ...n, read: true }))),
    [],
  )

  // value — the object handed to every consumer via useTrips(). Memoized so
  // consumers don't re-render unless the underlying state actually changed.
  const value = useMemo(
    () => ({
      trips,
      getTrip,
      addTrip,
      updateTrip,
      removeTrip,
      addEvent,
      updateEvent,
      removeEvent,
      addExpense,
      updateExpense,
      removeExpense,
      setBudgetTotal,
      addMember,
      removeMember,
      recommendations: seedRecommendations,
      notifications,
      markNotifRead,
      markAllNotifsRead,
    }),
    [
      trips,
      getTrip,
      addTrip,
      updateTrip,
      removeTrip,
      addEvent,
      updateEvent,
      removeEvent,
      addExpense,
      updateExpense,
      removeExpense,
      setBudgetTotal,
      addMember,
      removeMember,
      notifications,
      markNotifRead,
      markAllNotifsRead,
    ],
  )

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
}

// useTrips — sugar hook for components to grab the trips API in one line.
// Usage: `const { trips, addEvent, addExpense } = useTrips()`.
export const useTrips = () => useContext(TripsContext)
