import { prisma } from "../../lib/prisma.js"
import { requireAuth } from "../../lib/auth.js"
import { notifyTripMembers } from "../../lib/notify.js"

export default async function handler(req, res) {
  let user
  try {
    user = requireAuth(req)
  } catch {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { tripId } = req.query

  if (!tripId) {
    return res.status(400).json({ error: "tripId query parameter is required" })
  }

  const membership = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId, userId: user.id }
    }
  })

  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this trip" })
  }

  if (req.method === "GET") {
    try {
      const events = await prisma.event.findMany({
        where: { tripId },
        orderBy: { startTime: "asc" }
      })
      return res.status(200).json(events)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === "POST") {
    const { title, type, color, startTime, endTime, location } = req.body

    if (!title) {
      return res.status(400).json({ error: "Title is required" })
    }

    try {
      const event = await prisma.event.create({
        data: {
          tripId,
          title,
          type:      type      ?? null,
          color:     color     ?? null,
          location:  location  ?? null,
          startTime: startTime ? new Date(startTime) : null,
          endTime:   endTime   ? new Date(endTime)   : null
        }
      })

      const actor = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } })
      await notifyTripMembers(tripId, {
        excludeUserId: user.id,
        type: "EVENT_ADDED",
        text: `${actor?.name || 'Someone'} added "${event.title}" to the schedule`,
      })

      return res.status(201).json(event)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}