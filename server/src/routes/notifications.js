import { Router } from 'express'
import prisma from '../prisma.js'
import { requireAuth } from '../auth.js'

const router = Router()
router.use(requireAuth)

router.get('/', async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json({ notifications })
  } catch (err) {
    next(err)
  }
})

router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { read: true },
    })
    res.json({ ok: true, count: notification.count })
  } catch (err) {
    next(err)
  }
})

router.post('/read-all', async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
