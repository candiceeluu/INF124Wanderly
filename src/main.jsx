// ============================================================================
// main.jsx — Application entry point.
// Mounts the React tree into the #root DOM node defined in index.html and
// wraps everything in the global providers (router + auth + trip state).
// Provider order matters: outer providers are visible to inner providers/pages.
// ============================================================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'      // enables URL-based routing via the History API
import App from './App.jsx'                           // top-level route definitions
import { AuthProvider } from './contexts/AuthContext.jsx'   // exposes current user + login/logout
import { TripsProvider } from './contexts/TripsContext.jsx' // exposes trips, events, expenses, notifications
import './index.css'                                  // Tailwind base + global styles

// Bootstrap React 18 root and render the provider stack.
// StrictMode triggers double-invocation of effects/renders in dev to surface bugs.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TripsProvider>
          <App />
        </TripsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
