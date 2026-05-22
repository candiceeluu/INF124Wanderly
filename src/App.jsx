// ============================================================================
// App.jsx — Top-level router. Declares every URL path → page component mapping
// and gates the authenticated section (/app/*) behind RequireAuth.
// ============================================================================
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'  // animates components as they mount/unmount
import { useAuth } from './contexts/AuthContext.jsx'

// Public pages (no login required)
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
// Authenticated pages (live under /app)
import Home from './pages/Home.jsx'
import AllTrips from './pages/AllTrips.jsx'
import NewTrip from './pages/NewTrip.jsx'
import TripOverview from './pages/TripOverview.jsx'
import Schedule from './pages/Schedule.jsx'
import Budget from './pages/Budget.jsx'
import Activity from './pages/Activity.jsx'
import Settings from './pages/Settings.jsx'
import AppShell from './components/AppShell.jsx'  // sidebar + outlet layout shared by all /app pages

// ---------------------------------------------------------------------------
// RequireAuth — guard wrapper. If no user is in AuthContext, redirect to
// /login and remember where we came from (so login can bounce back).
// ---------------------------------------------------------------------------
function RequireAuth({ children }) {
  const { user } = useAuth()                                // pulls user from AuthContext
  const location = useLocation()                            // current URL — saved for post-login redirect
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children                                           // user exists → render the protected tree
}

// ---------------------------------------------------------------------------
// App — declares the entire route table. `AnimatePresence` + the `key` on
// Routes lets framer-motion animate page transitions on URL change.
// ---------------------------------------------------------------------------
export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      {/* keyed by pathname so each route swap is treated as a fresh mount */}
      <Routes location={location} key={location.pathname}>
        {/* --- Public routes --- */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* --- Protected routes (nested under /app) ---
            AppShell renders the trips sidebar + an <Outlet/> for the child page. */}
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />                                  {/* /app           */}
          <Route path="trips" element={<AllTrips />} />                       {/* /app/trips     */}
          <Route path="trips/new" element={<NewTrip />} />                    {/* /app/trips/new */}
          <Route path="trips/:tripId" element={<TripOverview />} />           {/* /app/trips/:id */}
          <Route path="trips/:tripId/schedule" element={<Schedule />} />
          <Route path="trips/:tripId/budget" element={<Budget />} />
          <Route path="trips/:tripId/activity" element={<Activity />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all: any unknown URL kicks the user back to the landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
