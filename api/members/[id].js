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

  const targetMembership = await prisma.tripMember.findUnique({
    where: { id }
  })

  if (!targetMembership) {
    return res.status(404).json({ error: "Member not found" })
  }

  const requesterMembership = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: {
        tripId: targetMembership.tripId,
        userId: user.id
      }
    }
  })

  if (!requesterMembership) {
    return res.status(403).json({ error: "You are not a member of this trip" })
  }

  if (req.method === "DELETE") {
    const isOwner         = requesterMembership.role === "OWNER"
    const isRemovingSelf  = targetMembership.userId === user.id

    if (!isOwner && !isRemovingSelf) {
      return res.status(403).json({ error: "You do not have permission to remove this member" })
    }

    if (targetMembership.role === "OWNER") {
      return res.status(400).json({ error: "The trip owner cannot be removed. Delete the trip instead." })
    }

    try {
      await prisma.tripMember.delete({ where: { id } })
      return res.status(200).json({ message: "Member removed" })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}