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

  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      participants: true,
      paidBy: {
        select: { id: true, name: true, avatar: true }
      }
    }
  })

  if (!expense) {
    return res.status(404).json({ error: "Expense not found" })
  }

  const membership = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId: expense.tripId, userId: user.id }
    }
  })

  if (!membership) {
    return res.status(403).json({ error: "You are not a member of this trip" })
  }

  if (req.method === "GET") {
    return res.status(200).json(expense)
  }

  if (req.method === "PATCH") {
    const { name, amount, category, splitType, date, settleUserId } = req.body

    if (settleUserId !== undefined) {
      try {
        const participant = await prisma.expenseParticipant.findUnique({
          where: {
            expenseId_userId: { expenseId: id, userId: settleUserId }
          }
        })

        if (!participant) {
          return res.status(404).json({ error: "Participant not found on this expense" })
        }

        const updated = await prisma.expenseParticipant.update({
          where: {
            expenseId_userId: { expenseId: id, userId: settleUserId }
          },
          data: { settled: true }
        })

        return res.status(200).json(updated)
      } catch (error) {
        return res.status(500).json({ error: error.message })
      }
    }

    if (expense.paidById !== user.id && membership.role !== "OWNER") {
      return res.status(403).json({ error: "Only the person who paid can edit this expense" })
    }

    try {
      const updated = await prisma.expense.update({
        where: { id },
        data: {
          ...(name      !== undefined && { name }),
          ...(amount    !== undefined && { amount }),
          ...(category  !== undefined && { category }),
          ...(splitType !== undefined && { splitType }),
          ...(date      !== undefined && { date: date ? new Date(date) : null })
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
      return res.status(200).json(updated)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === "DELETE") {
    if (expense.paidById !== user.id && membership.role !== "OWNER") {
      return res.status(403).json({ error: "Only the person who paid or the trip owner can delete this expense" })
    }

    try {
      await prisma.expense.delete({ where: { id } })
      return res.status(200).json({ message: "Expense deleted" })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}