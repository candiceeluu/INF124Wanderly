import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

async function assertTripAccess(tripId, user) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { members: { where: { userId: user.id } } },
  })
  if (!trip) {
    const e = new Error('Trip not found')
    e.status = 404
    throw e
  }
  if (trip.ownerId !== user.id && trip.members.length === 0) {
    const e = new Error('Forbidden')
    e.status = 403
    throw e
  }
  return trip
}

function activityRow(user, text) {
  return {
    userId: user.id,
    userName: user.name,
    date: new Date(),
    time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    text,
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { tripId } = req.query
    if (!tripId) return res.status(400).json({ error: 'tripId required' })
    await assertTripAccess(tripId, req.user)
    const events = await prisma.event.findMany({
      where: { tripId },
      orderBy: [{ date: 'asc' }, { start: 'asc' }],
    })
    res.json({ events })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { tripId, title, date, start, end, type, color, notes } = req.body
    if (!tripId || !title || !date || !start || !end || !type) {
      return res.status(400).json({ error: 'Missing required event fields' })
    }
    await assertTripAccess(tripId, req.user)

    const event = await prisma.event.create({
      data: {
        tripId,
        title: title.trim(),
        date: new Date(date),
        start,
        end,
        type,
        color: color || 'bg-brand-200 text-ink-900',
        notes: notes || null,
      },
    })

    await prisma.activity.create({
      data: { tripId, ...activityRow(req.user, `Added ${event.title} to schedule`) },
    })

    res.json({ event })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Event not found' })
    await assertTripAccess(existing.tripId, req.user)

    const { title, date, start, end, type, color, notes } = req.body
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(start !== undefined && { start }),
        ...(end !== undefined && { end }),
        ...(type !== undefined && { type }),
        ...(color !== undefined && { color }),
        ...(notes !== undefined && { notes }),
      },
    })

    await prisma.activity.create({
      data: {
        tripId: event.tripId,
        ...activityRow(req.user, `Updated ${event.title}`),
      },
    })

    res.json({ event })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Event not found' })
    await assertTripAccess(existing.tripId, req.user)

    await prisma.event.delete({ where: { id: req.params.id } })

    await prisma.activity.create({
      data: {
        tripId: existing.tripId,
        ...activityRow(req.user, `Removed ${existing.title} from schedule`),
      },
    })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
