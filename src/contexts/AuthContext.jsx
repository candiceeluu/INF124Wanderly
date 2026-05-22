// ============================================================================
// AuthContext.jsx — Global authentication state.
// There is NO real backend; "logging in" just constructs a fake user object
// from the email and persists it to localStorage so the session survives
// page reloads. Any component can read/modify the user via useAuth().
// ============================================================================
import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)        // React Context handle that providers/consumers share
const STORAGE_KEY = 'wanderly.user'             // localStorage key for the persisted user blob

// ---------------------------------------------------------------------------
// AuthProvider — wraps the app and supplies { user, login, signup, logout,
// updateUser } to every descendant via context.
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
  // Lazy initializer: runs once on mount. Rehydrates the user from localStorage
  // so a refresh keeps you signed in. Wrapped in try/catch in case JSON is bad.
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // Sync to localStorage whenever `user` changes. Writes on login/update,
  // clears the key on logout. This is the "save side" of the persistence loop.
  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  // login — fake auth. Derives a display name from the email's local part
  // (e.g. "jane.doe@x.com" → "Jane Doe") and stores a synthetic user object.
  const login = (email, _password) => {
    const name = email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')                       // turn dots/underscores into spaces
      .replace(/\b\w/g, (c) => c.toUpperCase())      // Title Case each word
    setUser({
      id: 'u_' + Math.random().toString(36).slice(2, 8),  // random demo id
      name,
      email,
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      memberSince: 'March 2025',
    })
  }

  // signup — for the demo, signup is exactly login (no backend to register against).
  const signup = (email, password) => login(email, password)

  // logout — null out the user; the effect above will purge localStorage.
  const logout = () => setUser(null)

  // updateUser — shallow-merge a patch onto the current user (used by Settings).
  const updateUser = (patch) => setUser((u) => (u ? { ...u, ...patch } : u))

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth — convenience hook so components don't have to import AuthContext
// directly. Usage: `const { user, login } = useAuth()`.
export const useAuth = () => useContext(AuthContext)
