import { PrismaClient } from "@prisma/client"

// creates a shared Prisma instance that every API function can use!!
const globalForPrisma = globalThis

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient()
}

export const prisma = globalForPrisma.prisma