const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const TOKEN_KEY = 'wanderly.googleToken'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.error || `Request failed (${res.status})`)
  }
  if (res.status === 204) return null
  return res.json()
}
