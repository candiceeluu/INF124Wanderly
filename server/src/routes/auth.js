import { Router } from 'express'
import prisma from '../prisma.js'
import { verifyGoogleToken, requireAuth } from '../auth.js'

const router = Router()

router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body
    if (!credential) return res.status(400).json({ error: 'Missing credential' })

    const payload = await verifyGoogleToken(credential)

    const existing = await prisma.user.findUnique({ where: { googleId: payload.sub } })

    const user = await prisma.user.upsert({
      where: { googleId: payload.sub },
      update: {
        email: payload.email,
        name: payload.name || payload.email,
        givenName: payload.given_name,
        familyName: payload.family_name,
        avatar: payload.picture,
      },
      create: {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        givenName: payload.given_name,
        familyName: payload.family_name,
        avatar: payload.picture,
      },
    })

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          text: `Welcome to Wanderly, ${user.givenName || user.name}!`,
          when: 'just now',
        },
      })
    }

    res.json({ user })
  } catch (err) {
    next(err)
  }
})

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user })
})

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const {
      name,
      email,
      birthday,
      notifSchedule,
      notifBudget,
      notifInvites,
      notifDigest,
    } = req.body

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
        ...(notifSchedule !== undefined && { notifSchedule }),
        ...(notifBudget !== undefined && { notifBudget }),
        ...(notifInvites !== undefined && { notifInvites }),
        ...(notifDigest !== undefined && { notifDigest }),
      },
    })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

router.delete('/me', requireAuth, async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
