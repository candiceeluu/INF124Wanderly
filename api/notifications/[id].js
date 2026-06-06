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

  if (req.method === "PATCH") {
    try {
      const result = await prisma.notification.updateMany({
        where: { id, userId: user.id },
        data: { read: true },
      })
      if (result.count === 0) {
        return res.status(404).json({ error: "Notification not found" })
      }
      return res.status(200).json({ ok: true })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.notification.deleteMany({
        where: { id, userId: user.id },
      })
      return res.status(200).json({ ok: true })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: "Method not allowed" })
}
