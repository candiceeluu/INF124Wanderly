import { OAuth2Client } from 'google-auth-library'
import prisma from './prisma.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  return ticket.getPayload()
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.replace(/^Bearer\s+/i, '').trim()
  if (!token) return res.status(401).json({ error: 'Missing Authorization header' })

  try {
    const payload = await verifyGoogleToken(token)
    const user = await prisma.user.findUnique({ where: { googleId: payload.sub } })
    if (!user) return res.status(401).json({ error: 'User not registered, sign in first' })
    req.user = user
    next()
  } catch (err) {
    console.error('Auth failed:', err.message)
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
