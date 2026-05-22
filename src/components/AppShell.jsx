// ============================================================================
// AppShell.jsx — Persistent layout for every authenticated route (/app/*).
// Renders the trip switcher sidebar on the left and an <Outlet/> for the
// nested page on the right. Only mounts once → sidebar state survives
// navigation between pages.
// ============================================================================
import { Outlet, useMatch } from 'react-router-dom'
import TripsSidebar from './TripsSidebar.jsx'

export default function AppShell() {
  // useMatch returns truthy only on the exact /app URL (the Home page).
  // On Home we let the page draw its own background image; on every other
  // page we paint a soft gradient via the bg-dash-gradient class.
  const inHome = useMatch('/app')
  return (
    <div className="flex min-h-screen w-full bg-ink-900 text-white">
      <TripsSidebar />
      <div
        className={`relative flex min-h-screen flex-1 flex-col ${
          inHome ? '' : 'bg-dash-gradient'
        }`}
      >
        {/* Outlet is where react-router injects the matched child route */}
        <Outlet />
      </div>
    </div>
  )
}
