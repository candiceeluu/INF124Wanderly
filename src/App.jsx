
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion' 
import { useAuth } from './contexts/AuthContext.jsx'

import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Home from './pages/Home.jsx'
import AllTrips from './pages/AllTrips.jsx'
import NewTrip from './pages/NewTrip.jsx'
import TripOverview from './pages/TripOverview.jsx'
import Schedule from './pages/Schedule.jsx'
import Budget from './pages/Budget.jsx'
import AppShell from './components/AppShell.jsx'
import OfflineBanner from './components/OfflineBanner.jsx'

function RequireAuth({ children }) {
  const { user } = useAuth()                               
  const location = useLocation()                        
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children                                           
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <OfflineBanner />
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />                               
          <Route path="trips" element={<AllTrips />} />                      
          <Route path="trips/new" element={<NewTrip />} />                   
          <Route path="trips/:tripId" element={<TripOverview />} />          
          <Route path="trips/:tripId/schedule" element={<Schedule />} />
          <Route path="trips/:tripId/budget" element={<Budget />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
    </>
  )
}
