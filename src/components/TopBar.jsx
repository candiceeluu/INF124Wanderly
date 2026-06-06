import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Check, ChevronRight, LogOut, User } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

function useClickOutside(ref, fn) {
  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) fn()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc) 
  }, [ref, fn])
}

export default function TopBar({ light = false }) {
  const { user, logout } = useAuth()                                 
  const { notifications, markNotifRead, markAllNotifsRead } = useTrips() 
  const [openNotif, setOpenNotif] = useState(false)                   
  const [openProfile, setOpenProfile] = useState(false)             
  const navigate = useNavigate()

  const notifRef = useRef(null)
  const profileRef = useRef(null)
  useClickOutside(notifRef, () => setOpenNotif(false))
  useClickOutside(profileRef, () => setOpenProfile(false))

  const unread = notifications.filter((n) => !n.read).length

  return (
    <header
      className={`relative z-20 flex items-center justify-between px-6 py-4 ${
        light ? 'text-ink-900' : 'text-white'
      }`}
    >
      <Logo to={user ? '/app' : '/'} dark={!light} className={light ? 'text-ink-900' : 'text-white'} />
      <div className="flex items-center gap-2">
        <div ref={notifRef} className="relative">
          <button
            onClick={() => {
              setOpenNotif((v) => !v)
              setOpenProfile(false)
            }}
            className={`relative grid h-10 w-10 place-items-center rounded-full transition ${
              light ? 'bg-ink-900/5 hover:bg-ink-900/10' : 'bg-white/10 hover:bg-white/20'
            }`}
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-dolly-500 text-[10px] font-bold text-white ring-2 ring-ink-900">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {openNotif && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl bg-white text-ink-900 shadow-2xl ring-1 ring-black/5"
              >
                <div className="flex items-center justify-between border-b border-ink-900/5 px-4 py-3">
                  <div className="font-semibold">Notifications</div>
                  <button
                    onClick={markAllNotifsRead}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-700 hover:underline"
                  >
                    <Check className="h-3 w-3" /> Mark all as read
                  </button>
                </div>
                <ul className="max-h-80 divide-y divide-ink-900/5 overflow-y-auto">
                  {notifications.length === 0 && (
                    <li className="p-6 text-center text-xs text-ink-900/50">All caught up ✨</li>
                  )}
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 text-sm ${
                        n.read ? 'opacity-60' : ''
                      }`}
                    >
                      <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                      <div className="flex-1">
                        <div>{n.text}</div>
                        <div className="mt-0.5 text-[11px] text-ink-900/50">{n.when}</div>
                      </div>
                      {!n.read && (
                        <button
                          onClick={() => markNotifRead(n.id)}
                          className="text-[11px] font-medium text-brand-700 hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => {
              setOpenProfile((v) => !v)
              setOpenNotif(false)
            }}
            className={`flex items-center gap-2 rounded-full p-1 pr-3 transition ${
              light ? 'hover:bg-ink-900/5' : 'hover:bg-white/10'
            }`}
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="h-9 w-9 rounded-full ring-2 ring-white/30 object-cover"
            />
            <span className="hidden text-sm font-medium md:block">{user?.name}</span>
          </button>

          <AnimatePresence>
            {openProfile && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl bg-white text-ink-900 shadow-2xl ring-1 ring-black/5"
              >
                <div className="px-4 pb-3 pt-4 text-center">
                  <img
                    src={user?.avatar}
                    alt=""
                    className="mx-auto h-16 w-16 rounded-full object-cover ring-2 ring-brand-100"
                  />
                  <div className="mt-2 font-semibold">{user?.name}</div>
                  <div className="text-xs text-ink-900/55">{user?.email}</div>
                  <div className="text-[11px] text-ink-900/50">
                    Member since {user?.memberSince}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t border-ink-900/5 bg-ink-900/[0.02] px-3 py-3 text-center text-[11px]">
                  <div>
                    <div className="font-bold">2</div>
                    <div className="text-ink-900/55">Upcoming</div>
                  </div>
                  <div>
                    <div className="font-bold">5</div>
                    <div className="text-ink-900/55">Past</div>
                  </div>
                  <div>
                    <div className="font-bold">12</div>
                    <div className="text-ink-900/55">Saved</div>
                  </div>
                </div>
                <div className="border-t border-ink-900/5 p-2">
                  <button
                    onClick={() => {
                      logout()
                      navigate('/', { replace: true })
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-dolly-700 hover:bg-dolly-50"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
