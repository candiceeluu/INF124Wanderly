import { prisma } from "../../lib/prisma.js"
import { requireAuth } from "../../lib/auth.js"

export default async function handler(req, res) {
  let user
  try {
    user = requireAuth(req)
  } catch {
    return res.status(401).json({ error: "Unauthorized" })
  }

  const { id } = req.query

  const event = await prisma.event.findUnique({
    where: { id }
  })

  if (!event) {
    return res.status(404).json({ error: "Event not found" })
  }

  const membership = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId: event.tripId, userId: user.id }
    }
  })

  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this trip" })
  }

  if (req.method === "GET") {
    return res.status(200).json(event)
  }

  if (req.method === "PATCH") {
    const { title, type, color, startTime, endTime, location } = req.body

    try {
      const updated = await prisma.event.update({
        where: { id },
        data: {
          ...(title     !== undefined && { title }),
          ...(type      !== undefined && { type }),
          ...(color     !== undefined && { color }),
          ...(location  !== undefined && { location }),
          ...(startTime !== undefined && { startTime: startTime ? new Date(startTime) : null }),
          ...(endTime   !== undefined && { endTime:   endTime   ? new Date(endTime)   : null })
        }
      })
      return res.status(200).json(updated)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.event.delete({ where: { id } })
      return res.status(200).json({ message: "Event deleted" })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}