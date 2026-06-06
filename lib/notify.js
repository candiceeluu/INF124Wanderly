import { prisma } from "./prisma.js"

export async function notifyTripMembers(tripId, { excludeUserId, type, text }) {
  const members = await prisma.tripMember.findMany({
    where: { tripId },
    select: { userId: true },
  })

  const recipients = members
    .map((m) => m.userId)
    .filter((id) => id !== excludeUserId)

  if (recipients.length === 0) return

  await prisma.notification.createMany({
    data: recipients.map((userId) => ({
      userId,
      tripId,
      type,
      text,
    })),
  })
}

export async function notifyUser(userId, { tripId = null, type, text }) {
  await prisma.notification.create({
    data: { userId, tripId, type, text },
  })
}
