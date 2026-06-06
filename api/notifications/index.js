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
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
      return res.status(200).json(notifications)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === "POST") {
    try {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      })
      return res.status(200).json({ ok: true })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}
