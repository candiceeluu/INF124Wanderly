import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import tripRoutes from './routes/trips.js'
import eventRoutes from './routes/events.js'
import expenseRoutes from './routes/expenses.js'
import memberRoutes from './routes/members.js'
import notificationRoutes from './routes/notifications.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }))

app.use('/api/auth', authRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/members', memberRoutes)
app.use('/api/notifications', notificationRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ error: err.message || 'Server error' })
})

const PORT = Number(process.env.PORT) || 4000
app.listen(PORT, () => {
  console.log(`Wanderly API listening on http://localhost:${PORT}`)
})
