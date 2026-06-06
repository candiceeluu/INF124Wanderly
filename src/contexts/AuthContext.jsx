import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const TOKEN_KEY = 'wanderly.token'
const USER_KEY  = 'wanderly.user'

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })

  const [token,   setToken]   = useState(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else       localStorage.removeItem(TOKEN_KEY)
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else      localStorage.removeItem(USER_KEY)
  }, [user])

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (!storedToken) return

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${storedToken}` }
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setUser(null)
          setToken(null)
          return null
        }
        if (!res.ok) return null
        return res.json()
      })
      .then((freshUser) => {
        if (freshUser) {
          setUser(freshUser)
          setToken(storedToken)
        }
      })
      .catch(() => {})
  }, [])

  const loginWithGoogle = async (idToken) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/google', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Login failed')
      }

      const { token: newToken, user: newUser } = await res.json()
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(USER_KEY, JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
    setToken(null)
  }

  const updateUser = (patch) => setUser((u) => (u ? { ...u, ...patch } : u))

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithGoogle, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)