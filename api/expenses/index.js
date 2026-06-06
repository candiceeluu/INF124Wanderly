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
      const expenses = await prisma.expense.findMany({
        where: { tripId },
        include: {
          paidBy: {
            select: { id: true, name: true, avatar: true }
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        },
        orderBy: { date: "desc" }
      })
      return res.status(200).json(expenses)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === "POST") {
    const {
      name,
      amount,
      category,
      splitType = "EQUAL",
      date,
      paidById,
      participants = []
    } = req.body

    if (!name || amount === undefined) {
      return res.status(400).json({ error: "Name and amount are required" })
    }

    if (!paidById) {
      return res.status(400).json({ error: "paidById is required" })
    }

    if (participants.length === 0) {
      return res.status(400).json({ error: "At least one participant is required" })
    }

    if (splitType === "EXACT") {
      const total = participants.reduce((sum, p) => sum + (p.share ?? 0), 0)
      const diff  = Math.abs(total - amount)
      if (diff > 0.01) {
        return res.status(400).json({
          error: `Participant shares (${total}) must sum to the total amount (${amount})`
        })
      }
    }

    try {
      const expense = await prisma.expense.create({
        data: {
          tripId,
          name,
          amount,
          category:  category  ?? null,
          splitType,
          date:      date      ? new Date(date) : null,
          paidById,
          participants: {
            create: participants.map((p) => ({
              userId:  p.userId,
              share:   p.share ?? null,
              settled: false
            }))
          }
        },
        include: {
          paidBy: {
            select: { id: true, name: true, avatar: true }
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        }
      })

      const actor = await prisma.user.findUnique({ where: { id: user.id }, select: { name: true } })
      await notifyTripMembers(tripId, {
        excludeUserId: user.id,
        type: "EXPENSE_ADDED",
        text: `${actor?.name || 'Someone'} added expense ${expense.name} ($${Number(expense.amount).toFixed(2)})`,
      })

      return res.status(201).json(expense)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}