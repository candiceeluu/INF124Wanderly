# wanderly

plan trips with friends, split costs without the awkward math, and discover places that actually fit your vibe — all in one place.

> **INF 124 — Spring 2026 final project**
> Candice Lu · Chiwei Tai · Hamin Lee

---

## features

- **collaborative itinerary** — drop events onto a weekly calendar that every member of the trip can see and edit
- **budget tracking** — set a budget goal and split shared expenses; the app does the math so nobody has to
- **live notifications** — when a teammate adds an event, expense, member, or changes the budget, everyone else's bell lights up
- **google sign-in** — sign in once with your google account; your trips and profile photo follow you between devices
- **weather at destination** — pulls live weather for each trip's location via the [open-meteo](https://open-meteo.com) api
- **"use my location"** — the new-trip wizard can geocode your current coordinates into a destination via the geolocation web api
- **installable pwa** — the app installs to your phone or desktop and the static shell + trip data keeps working offline

---

## the tech stack

| layer | tools |
| --- | --- |
| **frontend** | react 18 · vite · tailwind css · react router · framer motion · recharts · lucide-react |
| **backend** | vercel serverless functions (node.js) · prisma 7 · google-auth-library · jsonwebtoken |
| **database** | postgresql hosted on supabase |
| **auth** | google identity services (id token) verified server-side, then exchanged for a 7-day jwt |
| **deployment** | vercel (auto-deploys on push to main) |
| **dx** | vite-plugin-pwa (service worker via workbox) |

---

## request flow at a glance

```
React SPA ──fetch /api/* + Bearer JWT──► Vercel Serverless Function
                                              │
                                              ├─► lib/auth.js   (verify JWT)
                                              ├─► lib/prisma.js (DB client)
                                              └─► lib/notify.js (fan-out notifications)
                                              │
                                              ▼
                                        PostgreSQL (Supabase)
```

---

## quick start

### 1. clone & install

```bash
git clone https://github.com/HALOKIWI/INF124Wanderly.git
cd INF124Wanderly
npm install
```

> requires **node 22 LTS** or newer (prisma 7 won't install on older versions)

### 2. set up environment variables

create a `.env` file in the project root with:

```
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/postgres
JWT_SECRET=<any long random string>
GOOGLE_CLIENT_ID=<your oauth client id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your oauth client secret>
VITE_GOOGLE_CLIENT_ID=<same as GOOGLE_CLIENT_ID>
```

> get the google credentials at https://console.cloud.google.com/apis/credentials → "OAuth 2.0 Client IDs" → add `http://localhost:3000` as an authorized javascript origin.

### 3. sync the database schema

```bash
npx prisma db push
```

this creates every table defined in `prisma/schema.prisma` on supabase.

### 4. run locally

because the api routes live in `api/*.js` as serverless functions, you can't use plain `npm run dev` — they need vercel's local dev server.

```bash
npm install -g vercel    # one-time, if you don't have it
vercel link              # one-time, picks the project on first run
vercel dev               # runs frontend + api together on http://localhost:3000
```

vite-only mode still works for ui-only changes:

```bash
npm run dev              # frontend only, no api endpoints
```

---

## project structure

```
INF124Wanderly/
├── api/                 # vercel serverless functions (each file = one endpoint)
│   ├── auth/            # /api/auth/google, /api/auth/me
│   ├── trips/           # CRUD + nested resources
│   ├── events/
│   ├── expenses/
│   ├── members/
│   └── notifications/
├── lib/                 # shared backend helpers
│   ├── auth.js          # JWT verify middleware
│   ├── prisma.js        # singleton Prisma client
│   └── notify.js        # notification fan-out
├── prisma/
│   ├── schema.prisma    # database schema (single source of truth)
│   └── migrations/      # version-controlled migration history
├── src/                 # react frontend
│   ├── components/      # reusable UI bits (TopBar, Logo, WeatherCard, OfflineBanner, …)
│   ├── contexts/        # global state (AuthContext, TripsContext)
│   ├── lib/api.js       # fetch wrapper that attaches the Bearer JWT
│   └── pages/           # one file per route
├── public/              # static assets
├── vite.config.js       # vite config + vite-plugin-pwa setup
└── vercel.json          # SPA rewrites so reloads on deep URLs serve index.html
```

---

## available scripts

| command | what it does |
| --- | --- |
| `npm run dev` | vite-only frontend on `localhost:5173` (api won't work) |
| `vercel dev` | full stack locally on `localhost:3000` |
| `npm run build` | production build (also generates the PWA service worker) |
| `npm run preview` | serves the production build — useful for testing offline mode |
| `npx prisma db push` | sync schema changes to supabase |
| `npx prisma studio` | local GUI for browsing the database |

---

## deployment

every push to `main` triggers an automatic vercel build:

1. vite builds the react app
2. each `api/*.js` is bundled as its own serverless function
3. environment variables come from the vercel project settings (never committed)
4. supabase stays as the database — no migrations run automatically, so we apply schema changes with `prisma db push` before deploying

> **note** — the vercel hobby plan caps you at 12 serverless functions. our api uses exactly 12 endpoints; if you add a new one you'll need to either merge another or upgrade the plan.

---

## team resources

- **Jira Board:** https://trello.com/b/ikPLf1BG/current-sprint

---

## acknowledgments

- weather data: [open-meteo](https://open-meteo.com) (free, no api key required)
- reverse geocoding: open-meteo geocoding api
- icons: [lucide](https://lucide.dev)
- photography: [unsplash](https://unsplash.com)
- charts: [recharts](https://recharts.org)
