const TOKEN_KEY = 'wanderly.token'


function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

function authHeaders() {
  return {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${getToken()}`
  }
}

async function handleResponse(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const authApi = {
  me: () =>
    fetch('/api/auth/me', {
      headers: authHeaders()
    }).then(handleResponse),

  logout: () =>
    fetch('/api/auth/logout', {
      method:  'POST',
      headers: authHeaders()
    }).then(handleResponse)
}


export const tripsApi = {
  getAll: () =>
    fetch('/api/trips', {
      headers: authHeaders()
    }).then(handleResponse),

  getById: (id) =>
    fetch(`/api/trips/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),

  create: (data) =>
    fetch('/api/trips', {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(data)
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`/api/trips/${id}`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify(data)
    }).then(handleResponse),

  delete: (id) =>
    fetch(`/api/trips/${id}`, {
      method:  'DELETE',
      headers: authHeaders()
    }).then(handleResponse)
}

export const membersApi = {
  getAll: (tripId) =>
    fetch(`/api/members?tripId=${tripId}`, {
      headers: authHeaders()
    }).then(handleResponse),

  add: (tripId, email) =>
    fetch(`/api/members?tripId=${tripId}`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify({ email })
    }).then(handleResponse),

  remove: (memberId) =>
    fetch(`/api/members/${memberId}`, {
      method:  'DELETE',
      headers: authHeaders()
    }).then(handleResponse)
}

export const eventsApi = {
  getAll: (tripId) =>
    fetch(`/api/events?tripId=${tripId}`, {
      headers: authHeaders()
    }).then(handleResponse),

  getById: (id) =>
    fetch(`/api/events/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),

  create: (tripId, data) =>
    fetch(`/api/events?tripId=${tripId}`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(data)
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`/api/events/${id}`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify(data)
    }).then(handleResponse),

  delete: (id) =>
    fetch(`/api/events/${id}`, {
      method:  'DELETE',
      headers: authHeaders()
    }).then(handleResponse)
}


export const expensesApi = {
  getAll: (tripId) =>
    fetch(`/api/expenses?tripId=${tripId}`, {
      headers: authHeaders()
    }).then(handleResponse),

  getById: (id) =>
    fetch(`/api/expenses/${id}`, {
      headers: authHeaders()
    }).then(handleResponse),

  create: (tripId, data) =>
    fetch(`/api/expenses?tripId=${tripId}`, {
      method:  'POST',
      headers: authHeaders(),
      body:    JSON.stringify(data)
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`/api/expenses/${id}`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify(data)
    }).then(handleResponse),

  settle: (expenseId, userId) =>
    fetch(`/api/expenses/${expenseId}`, {
      method:  'PATCH',
      headers: authHeaders(),
      body:    JSON.stringify({ settleUserId: userId })
    }).then(handleResponse),

  delete: (id) =>
    fetch(`/api/expenses/${id}`, {
      method:  'DELETE',
      headers: authHeaders()
    }).then(handleResponse)
}