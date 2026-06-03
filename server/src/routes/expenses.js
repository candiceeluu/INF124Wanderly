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

const activityRow = (user, text) => ({
  userId: user.id,
  userName: user.name,
  date: new Date(),
  time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
  text,
})

router.get('/', async (req, res, next) => {
  try {
    const { tripId } = req.query
    if (!tripId) return res.status(400).json({ error: 'tripId required' })
    await assertTripAccess(tripId, req.user)
    const expenses = await prisma.expense.findMany({
      where: { tripId },
      orderBy: { date: 'desc' },
    })
    res.json({ expenses })
  } catch (err) {
    next(err)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { tripId, date, name, category, amount, paidById, splitWith } = req.body
    if (!tripId || !name || amount == null) {
      return res.status(400).json({ error: 'tripId, name, amount required' })
    }
    await assertTripAccess(tripId, req.user)
    const amt = Number(amount)

    const [expense] = await prisma.$transaction([
      prisma.expense.create({
        data: {
          tripId,
          date: date ? new Date(date) : new Date(),
          name: name.trim(),
          category: category || 'misc',
          amount: amt,
          paidById: paidById || null,
          splitWith: splitWith || 'equal',
        },
      }),
      prisma.trip.update({
        where: { id: tripId },
        data: { budgetSpent: { increment: amt } },
      }),
      prisma.activity.create({
        data: { tripId, ...activityRow(req.user, `Added expense ${name} ($${amt})`) },
      }),
    ])

    res.json({ expense })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Expense not found' })
    await assertTripAccess(existing.tripId, req.user)

    const { date, name, category, amount, paidById, splitWith } = req.body
    const newAmt = amount != null ? Number(amount) : existing.amount
    const delta = newAmt - existing.amount

    const [expense] = await prisma.$transaction([
      prisma.expense.update({
        where: { id: req.params.id },
        data: {
          ...(date !== undefined && { date: new Date(date) }),
          ...(name !== undefined && { name }),
          ...(category !== undefined && { category }),
          ...(amount !== undefined && { amount: newAmt }),
          ...(paidById !== undefined && { paidById }),
          ...(splitWith !== undefined && { splitWith }),
        },
      }),
      prisma.trip.update({
        where: { id: existing.tripId },
        data: { budgetSpent: { increment: delta } },
      }),
      prisma.activity.create({
        data: {
          tripId: existing.tripId,
          ...activityRow(req.user, `Updated expense ${name || existing.name}`),
        },
      }),
    ])

    res.json({ expense })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Expense not found' })
    await assertTripAccess(existing.tripId, req.user)

    await prisma.$transaction([
      prisma.expense.delete({ where: { id: req.params.id } }),
      prisma.trip.update({
        where: { id: existing.tripId },
        data: { budgetSpent: { decrement: existing.amount } },
      }),
      prisma.activity.create({
        data: {
          tripId: existing.tripId,
          ...activityRow(req.user, `Removed expense ${existing.name}`),
        },
      }),
    ])

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
