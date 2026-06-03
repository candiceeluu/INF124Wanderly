import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { Pencil, Plus, Trash2, X } from 'lucide-react'
import TopBar from '../components/TopBar.jsx'
import TripSubSidebar from '../components/TripSubSidebar.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useTrips } from '../contexts/TripsContext.jsx'

const CATEGORY_COLORS = {
  food: '#9bc855',
  shopping: '#FA9397',
  transport: '#1B729D',
  activity: '#EFCB59',
  hotel: '#D7C6AC',
  misc: '#87c1d6',
}

const CATEGORIES = Object.keys(CATEGORY_COLORS)

export default function Budget() {
  const { tripId } = useParams()
  const { getTrip, addExpense, updateExpense, removeExpense, setBudgetTotal } = useTrips()
  const trip = getTrip(tripId)
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [editingBudget, setEditingBudget] = useState(false)

  if (!trip) return <PageTransition>Trip not found.</PageTransition>

  const pct = Math.min(100, Math.round((trip.budget.spent / trip.budget.total) * 100))

  const pieData = useMemo(() => {
    const acc = {}
    trip.expenses.forEach((x) => {
      acc[x.category] = (acc[x.category] || 0) + Number(x.amount)
    })
    return Object.entries(acc).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#94a3b8',
    }))
  }, [trip.expenses])

  return (
    <PageTransition className="relative flex flex-1 flex-col">
      <TripSubSidebar tripId={tripId} />
      <TopBar />

      <div className="px-6 pb-12 pl-20 md:pl-24">
        <div className="mx-auto max-w-7xl">
          <h1 className="lower font-display text-4xl font-extrabold tracking-tight">budgeting</h1>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            {/* Left column */}
            <div className="space-y-5">
              {/* Top metrics card */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-dark p-5"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-widest text-white/55">spent</div>
                    <div className="font-display text-4xl font-extrabold">${trip.budget.spent}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-4xl font-extrabold text-caper-400">{pct}%</div>
                    <div className="text-[11px] text-white/55">of your budget</div>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-caper-400 to-caper-600"
                  />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-white/55">
                  <button
                    onClick={() => setEditingBudget(true)}
                    className="inline-flex items-center gap-1 hover:text-white"
                  >
                    <Pencil className="h-3 w-3" /> edit total
                  </button>
                  <span>
                    ${trip.budget.spent} / ${trip.budget.total}
                  </span>
                </div>
              </motion.div>

              {/* Pie chart */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card-dark p-5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="lower font-display text-lg font-bold">spending by category</h3>
                </div>
                <div className="h-72">
                  {pieData.length === 0 ? (
                    <div className="grid h-full place-items-center text-sm text-white/55">
                      Add expenses to see your breakdown.
                    </div>
                  ) : (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          stroke="rgba(0,0,0,0)"
                        >
                          {pieData.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          formatter={(v) => (
                            <span className="text-xs capitalize text-white/80">{v}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* You are owed */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-dark p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="lower font-display text-lg font-bold">you are owed</h3>
                  <div className="text-right">
                    <div className="font-display text-2xl font-extrabold text-caper-400">
                      ${trip.debts.reduce((s, d) => s + Number(d.amount), 0)}
                    </div>
                  </div>
                </div>
                <ul className="space-y-2">
                  {trip.debts.length === 0 && (
                    <li className="rounded-lg border border-dashed border-white/15 p-4 text-center text-xs text-white/55">
                      You're all settled up.
                    </li>
                  )}
                  {trip.debts.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-300 to-brand-700 text-xs font-bold text-white">
                          {d.from
                            .split(' ')
                            .map((p) => p[0])
                            .join('')}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{d.from}</div>
                          <div className="text-[11px] text-white/55">owes you</div>
                        </div>
                      </div>
                      <div className="text-base font-bold">${d.amount}</div>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Expenses */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card-dark p-5"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="lower font-display text-lg font-bold">expenses</h3>
                  <button
                    onClick={() => setAdding(true)}
                    className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white hover:bg-brand-700"
                    title="Add expense"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <ul className="divide-y divide-white/5">
                  {trip.expenses.map((x) => (
                    <li
                      key={x.id}
                      className="flex items-center gap-3 py-3 text-sm"
                    >
                      <div className="w-12 text-[11px] uppercase tracking-wider text-white/55">
                        {new Date(x.date).toLocaleDateString(undefined, {
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </div>
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: CATEGORY_COLORS[x.category] || '#94a3b8' }}
                      />
                      <div className="flex-1 truncate font-medium">{x.name}</div>
                      <div className="font-semibold">${x.amount}</div>
                      <button
                        onClick={() => setEditing(x)}
                        className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                  {trip.expenses.length === 0 && (
                    <li className="py-6 text-center text-xs text-white/55">No expenses yet.</li>
                  )}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingBudget && (
          <BudgetModal
            current={trip.budget.total}
            onClose={() => setEditingBudget(false)}
            onSave={(v) => {
              setBudgetTotal(tripId, v)
              setEditingBudget(false)
            }}
          />
        )}
        {editing && (
          <ExpenseModal
            expense={editing}
            members={trip.members}
            onClose={() => setEditing(null)}
            onSave={(patch) => {
              updateExpense(tripId, editing.id, patch)
              setEditing(null)
            }}
            onDelete={() => {
              removeExpense(tripId, editing.id)
              setEditing(null)
            }}
          />
        )}
        {adding && (
          <ExpenseModal
            title="Add Expense"
            members={trip.members}
            expense={{
              date: new Date().toISOString().slice(0, 10),
              name: '',
              category: 'food',
              amount: 0,
              paidBy: 'you',
              splitWith: 'equal',
            }}
            onClose={() => setAdding(false)}
            onSave={(patch) => {
              addExpense(tripId, patch)
              setAdding(false)
            }}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  )
}

function BudgetModal({ current, onClose, onSave }) {
  const [v, setV] = useState(current)
  return (
    <Modal title="Edit Budget" onClose={onClose}>
      <label className="block text-xs text-ink-900/65">Total Budget</label>
      <input
        type="number"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="field mt-1"
      />
      <div className="mt-4 flex justify-end gap-2">
        <button onClick={onClose} className="btn">Cancel</button>
        <button onClick={() => onSave(Number(v))} className="btn-primary">Save</button>
      </div>
    </Modal>
  )
}

function ExpenseModal({ expense, members = [], onClose, onSave, onDelete, title = 'Edit Expense' }) {
  const [form, setForm] = useState({
    paidBy: 'you',
    splitWith: 'equal',
    ...expense,
  })
  return (
    <Modal title={title} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSave({ ...form, amount: Number(form.amount) })
        }}
        className="space-y-3 text-sm"
      >
        <label className="block">
          <span className="mb-1 block text-xs text-ink-900/60">Date</span>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="field"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-ink-900/60">Expense Name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="field"
            placeholder="Dinner @ Din Tai Fung"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-900/60">Category</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="field"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-900/60">Amount</span>
            <input
              type="number"
              min={0}
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="field"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-xs text-ink-900/60">Paid by</span>
            <select
              value={form.paidBy}
              onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
              className="field"
            >
              <option value="you">You</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-ink-900/60">Split with</span>
            <select
              value={form.splitWith}
              onChange={(e) => setForm({ ...form, splitWith: e.target.value })}
              className="field"
            >
              <option value="equal">Everyone (split equally)</option>
              <option value="solo">Just me</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  Just {m.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-between">
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-dolly-700 hover:bg-dolly-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center bg-ink-900/60 px-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.96, y: 12, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 12, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-5 text-ink-900 shadow-2xl"
      >
        <div className="mb-3 flex items-center justify-between">
          <h4 className="font-display text-lg font-bold">{title}</h4>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink-900/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}
