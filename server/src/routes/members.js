import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

router.post('/', async (req, res, next) => {
  try {
    const { tripId, email, name, avatar } = req.body
    if (!tripId || (!email && !name)) {
      return res.status(400).json({ error: 'tripId + (email or name) required' })
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })
    if (trip.ownerId !== req.user.id) return res.status(403).json({ error: 'Owner only' })

    const existingUser = email
      ? await prisma.user.findUnique({ where: { email } })
      : null

    const displayName = name || existingUser?.name || email.split('@')[0]

    const member = await prisma.tripMember.create({
      data: {
        tripId,
        userId: existingUser?.id || null,
        name: displayName,
        email: email || null,
        avatar:
          avatar ||
          existingUser?.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      },
    })

    await prisma.activity.create({
      data: {
        tripId,
        userId: req.user.id,
        userName: req.user.name,
        date: new Date(),
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        text: `Invited ${displayName}`,
      },
    })

    if (existingUser) {
      await prisma.notification.create({
        data: {
          userId: existingUser.id,
          text: `${req.user.name} added you to "${trip.name}"`,
          when: 'just now',
        },
      })
    }

    res.json({ member })
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const member = await prisma.tripMember.findUnique({ where: { id: req.params.id } })
    if (!member) return res.status(404).json({ error: 'Not found' })

    const trip = await prisma.trip.findUnique({ where: { id: member.tripId } })
    if (trip.ownerId !== req.user.id) return res.status(403).json({ error: 'Owner only' })

    await prisma.tripMember.delete({ where: { id: req.params.id } })

    await prisma.activity.create({
      data: {
        tripId: trip.id,
        userId: req.user.id,
        userName: req.user.name,
        date: new Date(),
        time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        text: `Removed ${member.name}`,
      },
    })

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
