import { prisma } from "../../lib/prisma.js"
import { requireAuth } from "../../lib/auth.js"
import { notifyTripMembers, notifyUser } from "../../lib/notify.js"

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
      const members = await prisma.tripMember.findMany({
        where: { tripId },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      })
      return res.status(200).json(members)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === "POST") {
    if (membership.role !== "OWNER") {
      return res.status(403).json({ error: "Only the trip owner can add members" })
    }

    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    try {
      const userToAdd = await prisma.user.findUnique({
        where: { email }
      })

      if (!userToAdd) {
        return res.status(404).json({ error: "No user found with that email" })
      }

      const existing = await prisma.tripMember.findUnique({
        where: {
          tripId_userId: { tripId, userId: userToAdd.id }
        }
      })

      if (existing) {
        return res.status(409).json({ error: "User is already a member of this trip" })
      }

      const newMember = await prisma.tripMember.create({
        data: {
          tripId,
          userId: userToAdd.id,
          role: "MEMBER"
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      })

      const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { title: true } })
      await notifyTripMembers(tripId, {
        excludeUserId: user.id,
        type: "MEMBER_ADDED",
        text: `${userToAdd.name} joined "${trip?.title || 'a trip'}"`,
      })
      await notifyUser(userToAdd.id, {
        tripId,
        type: "TRIP_INVITE",
        text: `You were added to "${trip?.title || 'a trip'}"`,
      })

      return res.status(201).json(newMember)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}