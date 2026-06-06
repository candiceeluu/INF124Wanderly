import { prisma } from "../../lib/prisma.js"
import { requireAuth } from "../../lib/auth.js"

export default async function handler(req, res) {
  let user
  try {
    user = requireAuth(req)
  } catch {
    return res.status(401).json({ error: "Unauthorized" })
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id:     true,
        email:  true,
        name:   true,
        avatar: true
      }
    })

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" })
    }

    return res.status(200).json(currentUser)
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}