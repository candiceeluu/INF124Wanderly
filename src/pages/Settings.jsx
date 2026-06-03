import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, Lock, Trash2, User } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Settings() {
  const { user, updateUser, logout, deleteAccount } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [birthday, setBirthday] = useState(user?.birthday ? user.birthday.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)
  const [notif, setNotif] = useState({
    schedule: true,
    budget: true,
    invites: true,
    digest: false,
  })
  const navigate = useNavigate()

  return (
    <PageTransition className="relative flex flex-1 flex-col">
      <TopBar />
      <div className="px-6 pb-12 md:px-12">
        <div className="mx-auto max-w-3xl">
          <h1 className="lower font-display text-4xl font-extrabold tracking-tight">settings</h1>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-dark mt-6 p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-brand-300" />
              <h2 className="lower font-display text-lg font-bold">profile</h2>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={user?.avatar}
                alt=""
                className="h-16 w-16 rounded-full object-cover ring-2 ring-white/15"
              />
              <button className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/10">
                Change photo
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full Name">
                <input value={name} onChange={(e) => setName(e.target.value)} className="field" />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="Birthday">
                <input
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="field"
                />
              </Field>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true)
                  try {
                    await updateUser({ name, email, birthday: birthday || null })
                  } finally {
                    setSaving(false)
                  }
                }}
                className="btn-brand disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="card-dark mt-5 p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-300" />
              <h2 className="lower font-display text-lg font-bold">notification preferences</h2>
            </div>
            <ul className="divide-y divide-white/5">
              {Object.entries({
                schedule: 'Schedule changes',
                budget: 'Budget updates',
                invites: 'Trip invitations',
                digest: 'Weekly digest email',
              }).map(([k, label]) => (
                <li key={k} className="flex items-center justify-between py-3">
                  <span className="text-sm">{label}</span>
                  <button
                    onClick={() => setNotif((n) => ({ ...n, [k]: !n[k] }))}
                    className={`relative h-6 w-11 rounded-full transition ${
                      notif[k] ? 'bg-brand-500' : 'bg-white/15'
                    }`}
                    aria-pressed={notif[k]}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                        notif[k] ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card-dark mt-5 p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <Lock className="h-4 w-4 text-brand-300" />
              <h2 className="lower font-display text-lg font-bold">privacy</h2>
            </div>
            <p className="text-sm text-white/65">
              Your trips are visible to invited members only. Manage data export and account
              deletion below.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="rounded-full border border-white/20 px-4 py-2 text-xs font-medium hover:bg-white/10">
                Export my data
              </button>
              <button
                onClick={async () => {
                  if (!confirm('Delete account? This cannot be undone.')) return
                  await deleteAccount()
                  navigate('/', { replace: true })
                }}
                className="inline-flex items-center gap-1 rounded-full bg-dolly-600 px-4 py-2 text-xs font-medium text-white hover:bg-dolly-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete account
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </PageTransition>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] uppercase tracking-widest text-white/55">
        {label}
      </span>
      {children}
    </label>
  )
}
