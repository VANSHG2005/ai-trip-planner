import React, { useState, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, ChevronDown, ChevronUp, Save, RefreshCw, Users, AlertCircle, CheckCircle2 } from 'lucide-react'
import { db, auth } from '@/service/firebaseConfig'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'

const PRESETS = {
  Cheap:    { hotel: 25,  food: 15,  activities: 10, transport: 5  },
  Moderate: { hotel: 80,  food: 40,  activities: 25, transport: 15 },
  Luxury:   { hotel: 250, food: 120, activities: 80, transport: 50 },
}

const CATS = [
  { key: 'hotel',      label: 'Accommodation',   color: 'bg-blue-500'   },
  { key: 'food',       label: 'Food & Dining',   color: 'bg-amber-500'  },
  { key: 'activities', label: 'Activities',      color: 'bg-violet-500' },
  { key: 'transport',  label: 'Local Transport', color: 'bg-emerald-500'},
]

export default function BudgetEstimator({ trip, tripId }) {
  const budgetType = trip?.userSelection?.budget || 'Moderate'
  const days       = Number(trip?.userSelection?.noOfDays || 3)
  const travStr    = trip?.userSelection?.traveler || '1'
  const travelers  = travStr.includes('10') ? 8 : travStr.includes('5') ? 4
                   : travStr.includes('3') ? 3 : travStr.includes('2') ? 2 : 1

  const preset = PRESETS[budgetType] || PRESETS.Moderate

  const [expanded,  setExpanded]  = useState(false)
  const [costs,     setCosts]     = useState({ ...preset })
  const [saving,    setSaving]    = useState(false)
  const [dirty,     setDirty]     = useState(false)
  const [savedBy,   setSavedBy]   = useState(null)
  const [loading,   setLoading]   = useState(false)

  // Load existing saved budget when panel opens
  useEffect(() => {
    if (!expanded || !tripId) return
    const docRef = doc(db, 'BudgetSettings', tripId)
    setLoading(true)
    getDoc(docRef).then(snap => {
      if (snap.exists()) {
        const d = snap.data()
        if (d.costs) setCosts(d.costs)
        if (d.savedBy) setSavedBy(d.savedBy)
        setDirty(false)
      }
    }).catch(e => {
      console.warn('Budget load:', e.message)
    }).finally(() => setLoading(false))
  }, [expanded, tripId])

  const save = async () => {
    const user = auth.currentUser
    if (!user) { toast.error('Please sign in to save the budget.'); return }
    if (!tripId) { toast.error('Trip ID missing.'); return }

    setSaving(true)
    try {
      await setDoc(doc(db, 'BudgetSettings', tripId), {
        costs,
        tripId,
        savedBy:    user.displayName || user.email,
        savedByUid: user.uid,
        savedAt:    serverTimestamp(),
        budget:     budgetType,
        travelers,
        days,
      }, { merge: true })
      setSavedBy(user.displayName || user.email)
      setDirty(false)
      toast.success('Budget saved! ✓')
    } catch (err) {
      console.error('Budget save error:', err)
      toast.error(`Save failed: ${err.message}. Make sure you deployed firestore.rules.`)
    } finally {
      setSaving(false)
    }
  }

  const adj   = (k, d) => { setCosts(p => ({ ...p, [k]: Math.max(0, p[k] + d) })); setDirty(true) }
  const reset = ()     => { setCosts({ ...preset }); setDirty(true) }

  const perPersonDay = useMemo(() => Object.values(costs).reduce((a, b) => a + b, 0), [costs])
  const perDay       = useMemo(() => perPersonDay * travelers, [perPersonDay, travelers])
  const total        = useMemo(() => perDay * days, [perDay, days])
  const fmt          = n => `$${Math.round(n).toLocaleString()}`

  return (
    <div className="card-premium overflow-hidden">
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 cursor-pointer select-none transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Budget Estimator</p>
            <p className="text-xs text-muted-foreground">
              {fmt(perPersonDay)}/person/day · {fmt(total)} total
              {savedBy && <span className="ml-1 text-emerald-500">· Saved ✓</span>}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-border">

              {loading && <div className="mt-4 h-4 w-24 bg-muted animate-pulse rounded" />}

              {!loading && (
                <>
                  {/* Auth warning */}
                  {!auth.currentUser && (
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">Sign in to save and sync with your group.</p>
                    </div>
                  )}

                  {/* Firestore rules reminder */}
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      If save fails, run: <code className="font-mono bg-blue-100 dark:bg-blue-900/50 px-1 rounded">firebase deploy --only firestore:rules</code>
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 grid grid-cols-3 gap-2 mb-5">
                    {[
                      { l: 'Total (USD)',      v: fmt(total),        sub: `${days} days · ${travelers} people`, hi: true },
                      { l: 'Per Day',          v: fmt(perDay),       sub: 'whole group' },
                      { l: 'Per Person / Day', v: fmt(perPersonDay), sub: budgetType },
                    ].map(c => (
                      <div key={c.l} className={`p-3 rounded-2xl border text-center ${c.hi ? 'bg-linear-to-br from-primary/10 to-violet-500/10 border-primary/20' : 'bg-muted/30 border-border'}`}>
                        <p className={`text-lg font-bold ${c.hi ? 'gradient-text' : ''}`} style={{ fontFamily: 'Sora, sans-serif' }}>{c.v}</p>
                        <p className="text-xs font-semibold mt-0.5">{c.l}</p>
                        <p className="text-xs text-muted-foreground">{c.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* Controls */}
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Per Person Per Day (USD)</p>
                  <div className="space-y-4">
                    {CATS.map(({ key, label, color }) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{label}</span>
                          <div className="flex items-center gap-2">
                            <div role="button" tabIndex={0} onClick={() => adj(key, -5)} onKeyDown={e => e.key === 'Enter' && adj(key, -5)}
                              className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80 cursor-pointer select-none">−</div>
                            <span className="text-sm font-bold w-16 text-center">${costs[key]}<span className="text-xs text-muted-foreground">/p/d</span></span>
                            <div role="button" tabIndex={0} onClick={() => adj(key, 5)} onKeyDown={e => e.key === 'Enter' && adj(key, 5)}
                              className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center text-sm font-bold hover:bg-muted/80 cursor-pointer select-none">+</div>
                          </div>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min((costs[key] / 400) * 100, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Breakdown table */}
                  <div className="mt-5 rounded-2xl border border-border overflow-hidden">
                    <div className="grid grid-cols-3 text-xs font-semibold text-muted-foreground bg-muted/40 px-4 py-2.5">
                      <span>Category</span><span className="text-center">Per Day (group)</span><span className="text-right">Total</span>
                    </div>
                    {CATS.map(({ key, label }) => (
                      <div key={key} className="grid grid-cols-3 text-xs px-4 py-2.5 border-t border-border">
                        <span className="font-medium">{label}</span>
                        <span className="text-center text-muted-foreground">{fmt(costs[key] * travelers)}</span>
                        <span className="text-right font-semibold">{fmt(costs[key] * travelers * days)}</span>
                      </div>
                    ))}
                    <div className="grid grid-cols-3 text-xs font-bold px-4 py-2.5 border-t-2 border-border bg-muted/20">
                      <span>TOTAL</span>
                      <span className="text-center">{fmt(perDay)}/day</span>
                      <span className="text-right text-primary">{fmt(total)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">* All amounts in USD. Excludes international flights.</p>

                  {savedBy && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />Last saved by {savedBy}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={save} disabled={saving || !dirty || !auth.currentUser}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all ${
                        !dirty || !auth.currentUser
                          ? 'opacity-40 cursor-not-allowed bg-muted border border-border text-muted-foreground'
                          : 'btn-primary cursor-pointer'
                      }`}>
                      {saving
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <><Save className="w-4 h-4" />Save & Sync with Group</>}
                    </motion.button>
                    <button onClick={reset}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl border border-border text-sm font-medium hover:bg-muted cursor-pointer transition-colors">
                      <RefreshCw className="w-3.5 h-3.5" />Reset
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
