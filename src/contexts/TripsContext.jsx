import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { tripsApi, eventsApi, expensesApi, membersApi, notificationsApi } from '../lib/api.js'
import { useAuth } from './AuthContext.jsx'

const TripsContext = createContext(null)

export function TripsProvider({ children }) {
  const { user, token } = useAuth()

  const [trips,         setTrips]         = useState([])
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [notifications, setNotifications] = useState([])

  const refreshNotifications = useCallback(async () => {
    if (!user || !token) return
    try {
      const data = await notificationsApi.getAll()
      setNotifications(data.map((n) => ({ ...n, when: relativeTime(n.createdAt) })))
    } catch {
      // swallow transient errors so the UI stays usable
    }
  }, [user, token])

  useEffect(() => {
    if (!user || !token) {
      setTrips([])
      setNotifications([])
      return
    }

    setLoading(true)
    tripsApi.getAll()
      .then((data) => setTrips(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))

    refreshNotifications()
    const interval = setInterval(refreshNotifications, 30000)
    return () => clearInterval(interval)
  }, [user, token, refreshNotifications])

  const getTrip = useCallback((id) => trips.find((t) => t.id === id), [trips])

  const addTrip = useCallback(async (tripData) => {
    const newTrip = await tripsApi.create({
      title:       tripData.title || tripData.name || 'Untitled Trip',
      destination: tripData.destination || tripData.location || '',
      startDate:   tripData.startDate || null,
      endDate:     tripData.endDate   || null,
      cover:       tripData.cover     || null,
      budgetTotal: tripData.budgetTotal ?? tripData.budget?.total ?? 1000,
    })
    setTrips((all) => [newTrip, ...all])
    return newTrip
  }, [])

  const updateTrip = useCallback(async (id, patch) => {
    const updated = await tripsApi.update(id, patch)
    setTrips((all) => all.map((t) => (t.id === id ? { ...t, ...updated } : t)))
    return updated
  }, [])

  const removeTrip = useCallback(async (id) => {
    await tripsApi.delete(id)
    setTrips((all) => all.filter((t) => t.id !== id))
  }, [])

  const refreshTrip = useCallback(async (id) => {
    const fresh = await tripsApi.getById(id)
    setTrips((all) => all.map((t) => (t.id === id ? fresh : t)))
    return fresh
  }, [])

  const addEvent = useCallback(async (tripId, event) => {
    await eventsApi.create(tripId, {
      title:     event.title,
      type:      event.type      || null,
      color:     event.color     || null,
      location:  event.location  || null,
      startTime: event.startTime || event.start || null,
      endTime:   event.endTime   || event.end   || null,
    })
    await refreshTrip(tripId)
  }, [refreshTrip])

  const updateEvent = useCallback(async (tripId, eventId, patch) => {
    await eventsApi.update(eventId, patch)
    await refreshTrip(tripId)
  }, [refreshTrip])

  const removeEvent = useCallback(async (tripId, eventId) => {
    await eventsApi.delete(eventId)
    await refreshTrip(tripId)
  }, [refreshTrip])

  const addExpense = useCallback(async (tripId, expense) => {
    const trip = trips.find((t) => t.id === tripId)

    const paidById = expense.paidById || user?.id

    const participants = expense.participants?.length
      ? expense.participants
      : (trip?.members || []).map((m) => ({ userId: m.userId || m.user?.id || m.id }))

    await expensesApi.create(tripId, {
      name:         expense.name,
      amount:       Number(expense.amount),
      category:     expense.category  || null,
      splitType:    expense.splitType || 'EQUAL',
      date:         expense.date      || null,
      paidById,
      participants,
    })
    await refreshTrip(tripId)
  }, [trips, user, refreshTrip])

  const updateExpense = useCallback(async (tripId, expenseId, patch) => {
    await expensesApi.update(expenseId, patch)
    await refreshTrip(tripId)
  }, [refreshTrip])

  const removeExpense = useCallback(async (tripId, expenseId) => {
    await expensesApi.delete(expenseId)
    await refreshTrip(tripId)
  }, [refreshTrip])

  const settleExpense = useCallback(async (tripId, expenseId, userId) => {
    await expensesApi.settle(expenseId, userId)
    await refreshTrip(tripId)
  }, [refreshTrip])

  const setBudgetTotal = useCallback(async (tripId, total) => {
    await updateTrip(tripId, { budgetTotal: Number(total) })
  }, [updateTrip])

  const addMember = useCallback(async (tripId, member) => {
    const email = member.email || member
    await membersApi.add(tripId, email)
    await refreshTrip(tripId)
  }, [refreshTrip])

  const removeMember = useCallback(async (tripId, memberId) => {
    await membersApi.remove(memberId)
    await refreshTrip(tripId)
  }, [refreshTrip])

  
  const markNotifRead = useCallback(async (id) => {
    setNotifications((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try { await notificationsApi.markRead(id) } catch {}
  }, [])

  const markAllNotifsRead = useCallback(async () => {
    setNotifications((arr) => arr.map((n) => ({ ...n, read: true })))
    try { await notificationsApi.markAllRead() } catch {}
  }, [])

  const getTripBudget = useCallback((tripId) => {
    const trip = trips.find((t) => t.id === tripId)
    if (!trip) return { total: 0, spent: 0 }
    const spent = (trip.expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0)
    return { total: trip.budgetTotal ?? 1000, spent }
  }, [trips])

  const value = useMemo(() => ({
    trips,
    loading,
    error,
    getTrip,
    addTrip,
    updateTrip,
    removeTrip,
    refreshTrip,
    addEvent,
    updateEvent,
    removeEvent,
    addExpense,
    updateExpense,
    removeExpense,
    settleExpense,
    setBudgetTotal,
    getTripBudget,
    addMember,
    removeMember,
    notifications,
    recommendations:      [],
    refreshNotifications,
    markNotifRead,
    markAllNotifsRead,
  }), [
    trips, loading, error,
    getTrip, addTrip, updateTrip, removeTrip, refreshTrip,
    addEvent, updateEvent, removeEvent,
    addExpense, updateExpense, removeExpense, settleExpense,
    setBudgetTotal, getTripBudget,
    addMember, removeMember,
    notifications, refreshNotifications, markNotifRead, markAllNotifsRead,
  ])

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
}

export const useTrips = () => useContext(TripsContext)

function relativeTime(iso) {
  if (!iso) return ''
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}