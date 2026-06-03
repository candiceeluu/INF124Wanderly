import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

const FULL_TRIP_INCLUDE = {
  members: { orderBy: { joinedAt: 'asc' } },
  events: { orderBy: [{ date: 'asc' }, { start: 'asc' }] },
  expenses: { orderBy: { date: 'desc' } },
  debts: true,
  accommodations: true,
  activities: { orderBy: { createdAt: 'desc' }, take: 100 },
}

async function loadTripForUser(tripId, user, { ownerOnly = false } = {}) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { members: true },
  })
  if (!trip) {
    const err = new Error('Trip not found')
    err.status = 404
    throw err
  }
  const isOwner = trip.ownerId === user.id
  const isMember = trip.members.some((m) => m.userId === user.id)
  if (!isOwner && (ownerOnly || !isMember)) {
    const err = new Error('Forbidden')
    err.status = 403
    throw err
  }
  return trip
}

router.get('/', async (req, res, next) => {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: FULL_TRIP_INCLUDE,
      orderBy: { createdAt: 'desc' },
    })
    res.json({ trips })
  } catch (err) {
    next(err)
  }
})

router.get('/:id', async (req, res, next) => {
  try {
    await loadTripForUser(req.params.id, req.user)
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: FULL_TRIP_INCLUDE,
    })
    res.json({ trip })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const {
      name,
      location,
      startDate,
      endDate,
      cover,
      color,
      budgetTotal,
      members = [],
    } = req.body

    const trip = await prisma.trip.create({
      data: {
        name: name?.trim() || 'Untitled Trip',
        location: location?.trim() || '',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        cover,
        color,
        budgetTotal: Number(budgetTotal) || 1000,
        ownerId: req.user.id,
        members: {
          create: [
            {
              name: req.user.name,
              email: req.user.email,
              avatar: req.user.avatar,
              userId: req.user.id,
            },
            ...members
              .filter((m) => m && (m.email || m.name))
              .map((m) => ({
                name: m.name || m.email.split('@')[0],
                email: m.email || null,
                avatar:
                  m.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.name || m.email)}`,
              })),
          ],
        },
        activities: {
          create: {
            userId: req.user.id,
            userName: req.user.name,
            date: new Date(),
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            text: `Created the trip`,
          },
        },
      },
      include: FULL_TRIP_INCLUDE,
    })

    res.json({ trip })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    await loadTripForUser(req.params.id, req.user, { ownerOnly: true })
    const { name, location, startDate, endDate, cover, color } = req.body
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(location !== undefined && { location }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(cover !== undefined && { cover }),
        ...(color !== undefined && { color }),
      },
      include: FULL_TRIP_INCLUDE,
    })
    res.json({ trip })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/budget', async (req, res, next) => {
  try {
    await loadTripForUser(req.params.id, req.user)
    const total = Number(req.body.budgetTotal)
    if (!Number.isFinite(total) || total < 0) {
      return res.status(400).json({ error: 'budgetTotal must be a non-negative number' })
    }
    const trip = await prisma.trip.update({
      where: { id: req.params.id },
      data: {
        budgetTotal: total,
        activities: {
          create: {
            userId: req.user.id,
            userName: req.user.name,
            date: new Date(),
            time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
            text: `Updated total budget to $${total}`,
          },
        },
      },
      include: FULL_TRIP_INCLUDE,
    })
    res.json({ trip })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    await loadTripForUser(req.params.id, req.user, { ownerOnly: true })
    await prisma.trip.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
