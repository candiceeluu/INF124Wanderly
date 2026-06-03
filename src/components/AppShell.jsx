import { Outlet, useMatch } from 'react-router-dom'
import TripsSidebar from './TripsSidebar.jsx'

export default function AppShell() {
  const inHome = useMatch('/app')
  return (
    <div className="flex min-h-screen w-full bg-ink-900 text-white">
      <TripsSidebar />
      <div
        className={`relative flex min-h-screen flex-1 flex-col ${
          inHome ? '' : 'bg-dash-gradient'
        }`}
      >
        <Outlet />
      </div>
    </div>
  )
}
