import { OAuth2Client } from "google-auth-library"
import jwt from "jsonwebtoken"
import { prisma } from "../../lib/prisma.js"

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { idToken } = req.body

  if (!idToken) {
    return res.status(400).json({ error: "idToken is required" })
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()

    const { sub: googleId, email, name, picture: avatar } = payload

    const user = await prisma.user.upsert({
      where:  { googleId },
      update: { email, name, avatar },
      create: { googleId, email, name, avatar }
    })

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return res.status(200).json({ token, user })
  } catch (error) {
    return res.status(401).json({ error: "Invalid Google token" })
  }
}