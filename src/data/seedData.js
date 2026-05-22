// ============================================================================
// seedData.js — Initial values written into TripsContext on the very first
// load (before localStorage has anything saved). After that, the actual
// state lives in localStorage and this file is ignored.
//
// Three named exports:
//   seedTrips           — array of demo trips (Taipei, Korea, Cabo, NYC) with
//                         events, expenses, members, debts, and activity logs.
//   seedRecommendations — static AI-style recommendations shown on Schedule.
//   seedNotifications   — items that appear in the bell dropdown.
//
// No functions are defined here — it's purely data. Each top-level array is
// imported by TripsContext.jsx in the useState initializer fallback.
// ============================================================================

export const seedTrips = [
  {
    id: 'taipei-2026',
    name: 'Taipei Trip 2026',
    location: 'Taipei, Taiwan',
    startDate: '2026-05-02',
    endDate: '2026-05-10',
    cover:
      'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?auto=format&fit=crop&w=1600&q=80',
    color: 'from-saffron-400 to-dolly-500',
    budget: { total: 1000, spent: 400 },
    members: [
      {
        id: 'm1',
        name: 'Candice',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'm2',
        name: 'Tina',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'm3',
        name: 'Hamin',
        avatar:
          'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'm4',
        name: 'Chiwei',
        avatar:
          'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=200&q=80',
      },
    ],
    accommodations: [
      {
        id: 'a1',
        type: 'flight',
        from: 'LAX',
        to: 'TPE',
        depart: '4/23/26 1:45 AM',
        arrive: '4/25/26 2:00 PM',
        confirmation: 'DL412',
      },
    ],
    events: [
      {
        id: 'e1',
        title: 'land in TPE',
        date: '2026-04-25',
        start: '08:30',
        end: '09:00',
        type: 'flight',
        color: 'bg-saffron-300/90 text-ink-900',
      },
      {
        id: 'e2',
        title: 'morning hike',
        date: '2026-04-26',
        start: '07:00',
        end: '10:00',
        type: 'activity',
        color: 'bg-dolly-300/90 text-ink-900',
      },
      {
        id: 'e3',
        title: 'cafe',
        date: '2026-04-27',
        start: '10:00',
        end: '10:30',
        type: 'food',
        color: 'bg-brand-300/90 text-ink-900',
      },
      {
        id: 'e4',
        title: 'dinner @ din tai fung',
        date: '2026-05-04',
        start: '12:00',
        end: '13:30',
        type: 'food',
        color: 'bg-brand-300/90 text-ink-900',
      },
    ],
    expenses: [
      { id: 'x1', date: '2026-04-20', name: 'sunscreen', category: 'misc', amount: 3 },
      { id: 'x2', date: '2026-04-15', name: 'clothes for trip', category: 'shopping', amount: 50 },
      { id: 'x3', date: '2026-04-10', name: 'portable charger', category: 'misc', amount: 30 },
      { id: 'x4', date: '2026-04-22', name: 'night market food', category: 'food', amount: 14 },
      { id: 'x5', date: '2026-04-22', name: 'milk tea', category: 'food', amount: 1 },
      { id: 'x6', date: '2026-04-25', name: 'taxi', category: 'transport', amount: 18 },
      { id: 'x7', date: '2026-04-26', name: 'museum tickets', category: 'activity', amount: 24 },
    ],
    debts: [
      { id: 'd1', from: 'Tina', to: 'You', amount: 40 },
      { id: 'd2', from: 'Hamin', to: 'You', amount: 40 },
      { id: 'd3', from: 'Chiwei', to: 'You', amount: 40 },
    ],
    activity: [
      {
        id: 'act1',
        date: '2026-04-04',
        time: '12:01 AM',
        user: 'Tina Tsai',
        text: 'Added event to schedule',
      },
      {
        id: 'act2',
        date: '2026-04-04',
        time: '12:01 AM',
        user: 'Tina Tsai',
        text: 'Added event to schedule',
      },
      {
        id: 'act3',
        date: '2026-04-01',
        time: '12:01 AM',
        user: 'Hamin',
        text: 'Updated total budget to $1000',
      },
    ],
  },
  {
    id: 'korea-friends',
    name: 'Trip to Korea with Friends!',
    location: 'Seoul, South Korea',
    startDate: '2026-08-12',
    endDate: '2026-08-22',
    cover:
      'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1600&q=80',
    color: 'from-dolly-400 to-brand-700',
    budget: { total: 1800, spent: 220 },
    members: [
      {
        id: 'm1',
        name: 'Candice',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
      {
        id: 'm2',
        name: 'Min',
        avatar:
          'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80',
      },
    ],
    accommodations: [],
    events: [],
    expenses: [
      { id: 'kx1', date: '2026-04-01', name: 'flight deposit', category: 'transport', amount: 220 },
    ],
    debts: [],
    activity: [],
  },
  {
    id: 'cabo-spring',
    name: 'Spring Break in Cabo',
    location: 'Cabo San Lucas, Mexico',
    startDate: '2026-03-21',
    endDate: '2026-03-27',
    cover:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    color: 'from-brand-300 to-brand-700',
    budget: { total: 1500, spent: 800 },
    members: [
      {
        id: 'm1',
        name: 'Candice',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    ],
    accommodations: [],
    events: [],
    expenses: [],
    debts: [],
    activity: [],
  },
  {
    id: 'nyc-girls',
    name: 'NYC Girls Trip',
    location: 'New York, NY',
    startDate: '2026-09-04',
    endDate: '2026-09-08',
    cover:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1600&q=80',
    color: 'from-dolly-500 to-brand-800',
    budget: { total: 900, spent: 0 },
    members: [
      {
        id: 'm1',
        name: 'Candice',
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      },
    ],
    accommodations: [],
    events: [],
    expenses: [],
    debts: [],
    activity: [],
  },
]

export const seedRecommendations = [
  {
    id: 'r1',
    title: 'Taipei 101',
    subtitle: 'Check out the iconic 101-story skyscraper.',
    time: '9:00 am – 11:00 am',
    tag: 'activity',
    icon: '🏙️',
  },
  {
    id: 'r2',
    title: 'Ximending Shopping',
    subtitle: 'Shop at malls, trendy boutiques and vibrant night markets.',
    time: '3:00 pm – 5:00 pm',
    tag: 'shopping',
    icon: '🛍️',
  },
  {
    id: 'r3',
    title: 'Shilin Night Market',
    subtitle: 'Enjoy the night life with food, thrills, and fun at a popular night market.',
    time: '10:00 pm – 12:00 am',
    tag: 'food',
    icon: '🍜',
  },
  {
    id: 'r4',
    title: 'Taipei Zoo',
    subtitle: 'Check out the zoo and enjoy the variety of animals!',
    time: '12:00 pm – 2:00 pm',
    tag: 'activity',
    icon: '🐼',
  },
  {
    id: 'r5',
    title: 'Din Tai Fung Original',
    subtitle: 'World famous xiao long bao at the original location.',
    time: '6:00 pm – 8:00 pm',
    tag: 'food',
    icon: '🥟',
  },
]

export const seedNotifications = [
  { id: 'n1', text: 'Time changed for Santa Monica Visit', when: '5 minutes ago', read: false },
  { id: 'n2', text: 'Budget updated', when: '1 hour ago', read: false },
  { id: 'n3', text: 'Time changed for Shilin Night Market', when: '2 hours ago', read: false },
  { id: 'n4', text: 'Time changed for Taipei 101', when: '5 hours ago', read: false },
  { id: 'n5', text: 'New member added!', when: 'April 12', read: false },
]
