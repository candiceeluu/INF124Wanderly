import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const demo = await prisma.user.upsert({
    where: { email: 'demo@wanderly.app' },
    update: {},
    create: {
      googleId: 'demo-google-sub',
      email: 'demo@wanderly.app',
      name: 'Demo User',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
  })

  await prisma.trip.create({
    data: {
      name: 'Taipei Trip 2026',
      location: 'Taipei, Taiwan',
      startDate: new Date('2026-05-02'),
      endDate: new Date('2026-05-10'),
      cover:
        'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1600&q=80',
      color: 'from-saffron-400 to-dolly-500',
      budgetTotal: 1000,
      budgetSpent: 400,
      ownerId: demo.id,
      members: {
        create: [
          { name: 'Demo User', email: demo.email, userId: demo.id, avatar: demo.avatar },
          {
            name: 'Tina',
            avatar:
              'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
          },
        ],
      },
      events: {
        create: [
          { title: 'land in TPE', date: new Date('2026-04-25'), start: '08:30', end: '09:00', type: 'flight' },
          { title: 'cafe', date: new Date('2026-04-27'), start: '10:00', end: '10:30', type: 'food' },
        ],
      },
      expenses: {
        create: [
          { date: new Date('2026-04-22'), name: 'night market food', category: 'food', amount: 14 },
          { date: new Date('2026-04-25'), name: 'taxi', category: 'transport', amount: 18 },
        ],
      },
      debts: {
        create: [{ fromName: 'Tina', toName: 'You', amount: 40 }],
      },
    },
  })

  console.log('Seeded demo data')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
