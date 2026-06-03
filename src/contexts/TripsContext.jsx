import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { api } from '../lib/api.js'
import { useAuth } from './AuthContext.jsx'

const TripsContext = createContext(null)

export function TripsProvider({ children }) {
  const { user } = useAuth()

  const [trips, setTrips] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setTrips([])
      setNotifications([])
      return
    }
    let alive = true
    setLoading(true)
    Promise.all([api('/api/trips'), api('/api/notifications')])
      .then(([t, n]) => {
        if (!alive) return
        setTrips(t.trips.map(normalize))
        setNotifications(n.notifications)
      })
      .catch((e) => console.error('Failed to load trips:', e))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [user])

  const normalize = (trip) => ({
    ...trip,
    budget: { total: trip.budgetTotal, spent: trip.budgetSpent },
  })

  const upsertTrip = useCallback((trip) => {
    const t = normalize(trip)
    setTrips((all) => {
      const idx = all.findIndex((x) => x.id === t.id)
      if (idx === -1) return [t, ...all]
      const copy = [...all]
      copy[idx] = t
      return copy
    })
  }, [])

  const refreshTrip = useCallback(async (tripId) => {
    const { trip } = await api(`/api/trips/${tripId}`)
    upsertTrip(trip)
    return trip
  }, [upsertTrip])

  const getTrip = useCallback((id) => trips.find((t) => t.id === id), [trips])

  const addTrip = useCallback(async (input) => {
    const { trip } = await api('/api/trips', { method: 'POST', body: input })
    const t = normalize(trip)
    setTrips((all) => [t, ...all])
    return t
  }, [])

  const updateTrip = useCallback(async (id, patch) => {
    const { trip } = await api(`/api/trips/${id}`, { method: 'PATCH', body: patch })
    upsertTrip(trip)
    return trip
  }, [upsertTrip])

  const removeTrip = useCallback(async (id) => {
    await api(`/api/trips/${id}`, { method: 'DELETE' })
    setTrips((all) => all.filter((t) => t.id !== id))
  }, [])

  const addEvent = useCallback(async (tripId, event) => {
    await api('/api/events', { method: 'POST', body: { tripId, ...event } })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const updateEvent = useCallback(async (tripId, eventId, patch) => {
    await api(`/api/events/${eventId}`, { method: 'PATCH', body: patch })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const removeEvent = useCallback(async (tripId, eventId) => {
    await api(`/api/events/${eventId}`, { method: 'DELETE' })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const addExpense = useCallback(async (tripId, expense) => {
    await api('/api/expenses', { method: 'POST', body: { tripId, ...expense } })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const updateExpense = useCallback(async (tripId, expenseId, patch) => {
    await api(`/api/expenses/${expenseId}`, { method: 'PATCH', body: patch })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const removeExpense = useCallback(async (tripId, expenseId) => {
    await api(`/api/expenses/${expenseId}`, { method: 'DELETE' })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const setBudgetTotal = useCallback(async (tripId, total) => {
    const { trip } = await api(`/api/trips/${tripId}/budget`, {
      method: 'PATCH',
      body: { budgetTotal: total },
    })
    upsertTrip(trip)
  }, [upsertTrip])

  const addMember = useCallback(async (tripId, member) => {
    await api('/api/members', { method: 'POST', body: { tripId, ...member } })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const removeMember = useCallback(async (tripId, memberId) => {
    await api(`/api/members/${memberId}`, { method: 'DELETE' })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const markNotifRead = useCallback(async (id) => {
    setNotifications((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)))
    await api(`/api/notifications/${id}/read`, { method: 'PATCH' })
  }, [])

  const markAllNotifsRead = useCallback(async () => {
    setNotifications((arr) => arr.map((n) => ({ ...n, read: true })))
    await api('/api/notifications/read-all', { method: 'POST' })
  }, [])

  const value = useMemo(
    () => ({
      trips,
      loading,
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
      recommendations: STATIC_RECOMMENDATIONS,
      refreshTrip,
    }),
    [
      trips,
      loading,
      notifications,
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
      markNotifRead,
      markAllNotifsRead,
      refreshTrip,
    ],
  )

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
}

export const useTrips = () => useContext(TripsContext)

const STATIC_RECOMMENDATIONS = [
  { id: 'r1', title: 'Taipei 101', subtitle: 'Check out the iconic 101-story skyscraper.', time: '9:00 am – 11:00 am', tag: 'activity', icon: '🏙️' },
  { id: 'r2', title: 'Ximending Shopping', subtitle: 'Shop at malls, trendy boutiques and vibrant night markets.', time: '3:00 pm – 5:00 pm', tag: 'shopping', icon: '🛍️' },
  { id: 'r3', title: 'Shilin Night Market', subtitle: 'Enjoy the night life with food, thrills, and fun at a popular night market.', time: '10:00 pm – 12:00 am', tag: 'food', icon: '🍜' },
  { id: 'r4', title: 'Taipei Zoo', subtitle: 'Check out the zoo and enjoy the variety of animals!', time: '12:00 pm – 2:00 pm', tag: 'activity', icon: '🐼' },
  { id: 'r5', title: 'Din Tai Fung Original', subtitle: 'World famous xiao long bao at the original location.', time: '6:00 pm – 8:00 pm', tag: 'food', icon: '🥟' },
]
