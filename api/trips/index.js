import { prisma } from "../../lib/prisma.js"
import { requireAuth } from "../../lib/auth.js"

export default async function handler(req, res) {
  let user
  try {
    user = requireAuth(req)
  } catch {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method === "GET") {
    try {
      const trips = await prisma.trip.findMany({
        where: {
            members: {
            some: {
                userId: user.id
            }
            }
        },
        include: {
            members: {
            include: {
                user: {
                select: {
                    id: true,
                    name: true,
                    avatar: true
                }
                }
            }
            }
        }
        })

      return res.status(200).json(trips)

    } catch (error) {
      return res.status(500).json({error: error.message})
    }
  }

  if (req.method === "POST") {
    const { title, destination, startDate, endDate, cover, budgetTotal } = req.body

    if (!title || !destination) {
      return res.status(400).json({ error: "Title and destination are required" })
    }

    try {
      const trip = await prisma.trip.create({
        data: {
          title,
          destination,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          cover,
          budgetTotal,
          ownerId: user.id,
          members: {
            create: {
              userId: user.id,
              role: "OWNER"
            }
          }
        }
      })

      return res.status(201).json(trip)

    } catch (error) {
      return res.status(500).json({ error: "Failed to create trip" })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}