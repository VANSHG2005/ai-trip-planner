import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Receipt, Plus, Trash2, ChevronDown, ChevronUp, ArrowRight, Check, UserPlus, Loader2, AlertCircle } from 'lucide-react'
import { db, auth } from '@/service/firebaseConfig'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'

const CATS = [
  { id: 'food',       label: 'Food & Dining',  icon: '🍽️' },
  { id: 'hotel',      label: 'Accommodation',  icon: '🏨' },
  { id: 'transport',  label: 'Transport',      icon: '🚗' },
  { id: 'activities', label: 'Activities',     icon: '🎯' },
  { id: 'shopping',   label: 'Shopping',       icon: '🛍️' },
  { id: 'other',      label: 'Other',          icon: '💸' },
]

function greedySettle(members, expenses) {
  const bal = {}
  members.forEach(m => { bal[m] = 0 })
  expenses.forEach(e => {
    const split = e.splitAmong?.length ? e.splitAmong : [...members]
    if (!split.length) return
    const share = e.amount / split.length
    split.forEach(m => { if (m in bal) bal[m] -= share })
    if (e.paidBy in bal) bal[e.paidBy] += e.amount
  })
  const pos = Object.entries(bal).filter(([, v]) => v > 0.01).sort((a, b) => b[1] - a[1])
  const neg = Object.entries(bal).filter(([, v]) => v < -0.01).sort((a, b) => a[1] - b[1])
  const res = []
  const pa = pos.map(([n, a]) => ({ n, a }))
  const na = neg.map(([n, a]) => ({ n, a: -a }))
  let pi = 0, ni = 0
  while (pi < pa.length && ni < na.length) {
    const s = Math.min(pa[pi].a, na[ni].a)
    if (s > 0.01) res.push({ from: na[ni].n, to: pa[pi].n, amount: s })
    pa[pi].a -= s; na[ni].a -= s
    if (pa[pi].a < 0.01) pi++
    if (na[ni].a < 0.01) ni++
  }
  return { balance: bal, settlements: res }
}

export default function TripExpenses({ tripId }) {
  const [expanded, setExpanded] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [members,  setMembers]  = useState([])
  const [editors,  setEditors]  = useState([])
  const [settled,  setSettled]  = useState([])
  const [tab,      setTab]      = useState('expenses')
  const [saving,   setSaving]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newMember,   setNewMember]   = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInvite,  setShowInvite]  = useState(false)
  const [form, setForm] = useState({ desc: '', amount: '', paidBy: '', category: 'food', splitAmong: [] })

  const docRef = tripId ? doc(db, 'TripExpenses', tripId) : null

  // Initialize "Me" from auth user
  useEffect(() => {
    const user = auth.currentUser
    if (user && members.length === 0) {
      setMembers([user.displayName || user.email?.split('@')[0] || 'Me'])
    }
  }, []) // eslint-disable-line

  // Load once when opened — NOT onSnapshot (that caused infinite spinner)
  useEffect(() => {
    if (!expanded || !docRef || loaded) return
    setLoading(true)
    getDoc(docRef)
      .then(snap => {
        if (snap.exists()) {
          const d = snap.data()
          setExpenses(d.expenses || [])
          setMembers(d.members?.length ? d.members : [auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || 'Me'])
          setEditors(d.editors || [])
          setSettled(d.settled || [])
        }
        setLoaded(true)
      })
      .catch(err => {
        console.warn('TripExpenses load:', err.message)
        setLoaded(true)
      })
      .finally(() => setLoading(false))
  }, [expanded, tripId, loaded]) // eslint-disable-line

  const persist = async ({ exp = expenses, mem = members, set = settled, ed = editors } = {}) => {
    if (!docRef) return
    const user = auth.currentUser
    if (!user) { toast.error('Sign in to save.'); return }
    setSaving(true)
    try {
      await setDoc(docRef, {
        expenses: exp, members: mem, settled: set, editors: ed,
        tripId, updatedBy: user.email, updatedAt: serverTimestamp(),
      }, { merge: true })
    } catch (err) {
      toast.error(`Could not save: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addExpense = async () => {
    if (!form.desc.trim() || !form.amount || !form.paidBy) {
      toast.error('Fill in description, amount and paid by.')
      return
    }
    const exp = {
      id:         Date.now().toString(),
      desc:       form.desc.trim(),
      amount:     parseFloat(form.amount),
      paidBy:     form.paidBy,
      category:   form.category,
      splitAmong: form.splitAmong.length ? form.splitAmong : [...members],
      date:       new Date().toISOString(),
    }
    const upd = [...expenses, exp]
    setExpenses(upd)
    setForm({ desc: '', amount: '', paidBy: '', category: 'food', splitAmong: [] })
    setShowForm(false)
    await persist({ exp: upd })
    toast.success('Expense added!')
  }

  const delExpense = async (id) => {
    const upd = expenses.filter(e => e.id !== id)
    setExpenses(upd)
    await persist({ exp: upd })
  }

  const addMember = async () => {
    const name = newMember.trim()
    if (!name) return
    if (members.includes(name)) { toast.error('Already exists.'); return }
    const upd = [...members, name]
    setMembers(upd)
    setNewMember('')
    await persist({ mem: upd })
  }

  // NOTE: "Invite editor" stores their email in Firestore.
  // The person needs to OPEN THE SAME TRIP URL to see the expenses.
  // No email is actually sent — this is a UI/UX note.
  const inviteEditor = async () => {
    const email = inviteEmail.trim().toLowerCase()
    if (!email.includes('@')) { toast.error('Enter a valid email.'); return }
    if (editors.includes(email)) { toast.error('Already invited.'); return }
    const updEd  = [...editors, email]
    const name   = email.split('@')[0]
    const updMem = members.includes(name) ? members : [...members, name]
    setEditors(updEd)
    setMembers(updMem)
    setInviteEmail('')
    setShowInvite(false)
    await persist({ ed: updEd, mem: updMem })
    toast.success(
      `Added ${email} as editor. Share the trip URL with them — they'll see all expenses when they open it.`,
      { duration: 6000 }
    )
  }

  const markPaid = async (key) => {
    const upd = settled.includes(key) ? settled.filter(k => k !== key) : [...settled, key]
    setSettled(upd)
    await persist({ set: upd })
  }

  const toggleSplit = (m) => setForm(f => ({
    ...f,
    splitAmong: f.splitAmong.includes(m) ? f.splitAmong.filter(x => x !== m) : [...f.splitAmong, m],
  }))

  const total = expenses.reduce((a, e) => a + e.amount, 0)
  const { balance, settlements } = greedySettle(members, expenses)
  const catTotals = {}
  expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount })
  const fmt = n => `$${Math.round(n).toLocaleString()}`

  return (
    <div className="card-premium overflow-hidden">
      {/* Header */}
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 cursor-pointer select-none transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Expense Splitter <span className="font-normal text-muted-foreground">(Splitwise-style)</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {expenses.length > 0
                ? `${fmt(total)} total · ${members.length} people · ${settlements.length} to settle`
                : 'Track & split group expenses'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-border">

              {loading && (
                <div className="mt-6 flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading expenses…</span>
                </div>
              )}

              {!loading && (
                <>
                  {/* Auth warning */}
                  {!auth.currentUser && (
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">Sign in to save expenses.</p>
                    </div>
                  )}

                  {/* Members */}
                  <div className="mt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Group Members</p>
                      <button onClick={() => setShowInvite(v => !v)}
                        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer">
                        <UserPlus className="w-3.5 h-3.5" /> Invite
                      </button>
                    </div>

                    {/* Invite form */}
                    <AnimatePresence>
                      {showInvite && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} className="mb-3 overflow-hidden">
                          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                            <div className="flex items-start gap-2 mb-2">
                              <AlertCircle className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                              <p className="text-xs text-blue-700 dark:text-blue-300">
                                <strong>How it works:</strong> No email is sent. Their name is added as a member and their email stored. Share the trip URL with them — they'll see all expenses when they open it while signed in.
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && inviteEditor()}
                                placeholder="friend@email.com"
                                className="flex-1 text-xs px-3 py-2 rounded-xl border border-border bg-card focus:outline-none focus:border-primary" />
                              <button onClick={inviteEditor}
                                className="btn-primary px-3 py-2 rounded-xl text-xs font-semibold shrink-0 cursor-pointer">
                                Add
                              </button>
                            </div>
                            {editors.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-2">Editors: {editors.join(', ')}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-wrap gap-2 items-center">
                      {members.map(m => (
                        <div key={m} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted border border-border text-sm font-medium group">
                          <span>{m}</span>
                          {members.length > 1 && (
                            <button onClick={async () => {
                              const upd = members.filter(x => x !== m)
                              setMembers(upd)
                              await persist({ mem: upd })
                            }}
                              className="w-4 h-4 rounded-full hidden group-hover:flex items-center justify-center bg-red-100 dark:bg-red-500/20 text-red-500 text-xs cursor-pointer">
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <div className="flex gap-1">
                        <input value={newMember} onChange={e => setNewMember(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMember() } }}
                          placeholder="Add name…"
                          className="w-28 text-xs px-2.5 py-1.5 rounded-xl border border-border bg-muted/30 focus:outline-none focus:border-primary" />
                        <button onClick={addMember}
                          className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 cursor-pointer">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 mb-4 p-1 bg-muted/40 rounded-xl">
                    {[
                      { id: 'expenses', l: `Expenses (${expenses.length})` },
                      { id: 'settle',   l: `Settle (${settlements.length})` },
                      { id: 'summary',  l: 'Summary' },
                    ].map(t => (
                      <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        {t.l}
                      </button>
                    ))}
                  </div>

                  {/* EXPENSES TAB */}
                  {tab === 'expenses' && (
                    <div>
                      {expenses.length > 0 && (
                        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto pr-1">
                          {expenses.map(exp => {
                            const cat   = CATS.find(c => c.id === exp.category)
                            const share = exp.amount / (exp.splitAmong?.length || members.length || 1)
                            return (
                              <div key={exp.id} className="flex items-center gap-3 p-3 rounded-2xl border border-border hover:bg-muted/20 group">
                                <span className="text-xl shrink-0">{cat?.icon || '💸'}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate">{exp.desc}</p>
                                  <p className="text-xs text-muted-foreground">Paid by <strong>{exp.paidBy}</strong> · {fmt(share)}/person</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-bold">{fmt(exp.amount)}</p>
                                  <p className="text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</p>
                                </div>
                                <button onClick={() => delExpense(exp.id)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {showForm ? (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-border">
                          <div className="grid grid-cols-2 gap-2">
                            <input value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                              placeholder="Description *"
                              className="col-span-2 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary" />
                            <input value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                              type="number" min="0" step="0.01" placeholder="Amount ($) *"
                              className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary" />
                            <select value={form.paidBy} onChange={e => setForm(f => ({ ...f, paidBy: e.target.value }))}
                              className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary">
                              <option value="">Paid by *</option>
                              {members.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                              className="col-span-2 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary">
                              {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1.5">Split among (empty = all):</p>
                            <div className="flex flex-wrap gap-1.5">
                              {members.map(m => {
                                const active = form.splitAmong.includes(m) || form.splitAmong.length === 0
                                return (
                                  <button key={m} onClick={() => toggleSplit(m)}
                                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${active ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground'}`}>
                                    {m}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={addExpense}
                              className="flex-1 btn-primary py-2.5 rounded-xl text-sm font-semibold">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add & Save'}
                            </button>
                            <button onClick={() => setShowForm(false)}
                              className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-muted cursor-pointer">
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <button onClick={() => setShowForm(true)}
                          className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold cursor-pointer">
                          <Plus className="w-4 h-4" /> Add Expense
                        </button>
                      )}
                    </div>
                  )}

                  {/* SETTLE TAB */}
                  {tab === 'settle' && (
                    <div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {members.map(m => {
                          const b = balance[m] || 0
                          return (
                            <div key={m} className={`p-3 rounded-2xl border text-sm ${b > 0.01 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200' : b < -0.01 ? 'bg-red-50 dark:bg-red-500/10 border-red-200' : 'bg-muted/30 border-border'}`}>
                              <p className="font-semibold truncate">{m}</p>
                              <p className={`text-xs font-bold mt-0.5 ${b > 0.01 ? 'text-emerald-600' : b < -0.01 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {b > 0.01 ? `gets back ${fmt(b)}` : b < -0.01 ? `owes ${fmt(-b)}` : 'settled ✓'}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                      {settlements.length === 0
                        ? <p className="text-sm text-muted-foreground text-center py-4">{expenses.length === 0 ? 'Add expenses to see settlements.' : '✅ All settled!'}</p>
                        : (
                          <div className="space-y-2">
                            {settlements.map((s, i) => {
                              const key  = `${s.from}→${s.to}`
                              const done = settled.includes(key)
                              return (
                                <div key={i} className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${done ? 'opacity-50 bg-muted/20' : 'bg-card border-border'}`}>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                      <span>{s.from}</span>
                                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                                      <span>{s.to}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{fmt(s.amount)}</p>
                                  </div>
                                  <button onClick={() => markPaid(key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${done ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>
                                    {done ? <><Check className="w-3 h-3" />Settled</> : 'Mark Paid'}
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )
                      }
                    </div>
                  )}

                  {/* SUMMARY TAB */}
                  {tab === 'summary' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-linear-to-r from-primary/10 to-violet-500/10 border border-primary/20 flex justify-between flex-wrap gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                          <p className="text-3xl font-bold gradient-text" style={{ fontFamily: 'Sora, sans-serif' }}>{fmt(total)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Per Person</p>
                          <p className="text-2xl font-bold">{members.length ? fmt(total / members.length) : '—'}</p>
                        </div>
                      </div>
                      {Object.keys(catTotals).length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">By Category</p>
                          {Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([cid, amt]) => {
                            const cat = CATS.find(c => c.id === cid)
                            return (
                              <div key={cid} className="flex items-center justify-between text-sm">
                                <span>{cat?.icon} {cat?.label}</span>
                                <span className="font-semibold">{fmt(amt)}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
