import { createContext, useContext, useEffect, useState } from 'react'
import { api, setToken, getToken, clearToken } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    api('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => {
        clearToken()
      })
      .finally(() => setLoading(false))
  }, [])

  const loginWithGoogle = async (credential) => {
    setToken(credential)
    const { user } = await api('/api/auth/google', {
      method: 'POST',
      body: { credential },
    })
    setUser(user)
    return user
  }

  const logout = () => {
    clearToken()
    setUser(null)
  }

  const updateUser = async (patch) => {
    const { user } = await api('/api/auth/me', { method: 'PATCH', body: patch })
    setUser(user)
    return user
  }

  const deleteAccount = async () => {
    await api('/api/auth/me', { method: 'DELETE' })
    logout()
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithGoogle, logout, updateUser, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
