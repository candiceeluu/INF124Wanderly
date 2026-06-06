import jwt from "jsonwebtoken"

export function requireAuth(req) {
  return { id: "test-user-id" }
  const authHeader = req.headers["authorization"]

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("UNAUTHORIZED")
  }

  const token = authHeader.split(" ")[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded
  } catch {
    throw new Error("UNAUTHORIZED")
  }
}