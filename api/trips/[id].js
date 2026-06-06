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

  const { id } = req.query

  const membership = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: {
        tripId: id,
        userId: user.id
      }
    }
  })

  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this trip" })
  }

  if (req.method === "GET") {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  email: true
                }
              }
            }
          },
          events: {
            orderBy: { startTime: "asc" }
          },
          expenses: {
            include: {
              paidBy: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              },
              participants: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      return res.status(200).json(trip)

    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch trip" })
    }
  }

  if (req.method === "PATCH") {
    if (membership.role !== "OWNER") {
      return res.status(403).json({ error: "Only the trip owner can edit trip details" })
    }

    const { title, destination, startDate, endDate, cover, budgetTotal } = req.body

    try {
      const before = await prisma.trip.findUnique({ where: { id }, select: { budgetTotal: true, title: true } })

      const updated = await prisma.trip.update({
        where: { id },
        data: {
          title,
          destination,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          cover,
          budgetTotal
        }
      })

      if (budgetTotal !== undefined && Number(budgetTotal) !== Number(before?.budgetTotal)) {
        await notifyTripMembers(id, {
          excludeUserId: user.id,
          type: "BUDGET_CHANGED",
          text: `Budget for "${updated.title}" changed to $${Number(budgetTotal).toFixed(2)}`,
        })
      }

      return res.status(200).json(updated)

    } catch (error) {
      return res.status(500).json({ error: "Failed to update trip" })
    }
  }

  if (req.method === "DELETE") {
    if (membership.role !== "OWNER") {
      return res.status(403).json({ error: "Only the trip owner can delete a trip" })
    }

    try {
      await prisma.trip.delete({
        where: { id }
      })

      return res.status(200).json({ message: "Trip deleted" })

    } catch (error) {
      return res.status(500).json({ error: "Failed to delete trip" })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}