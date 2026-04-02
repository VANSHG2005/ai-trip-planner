import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StickyNote, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { db, auth } from '@/service/firebaseConfig'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'

const COLORS = [
  { bg: 'bg-amber-100 dark:bg-amber-900/30',    border: 'border-amber-300 dark:border-amber-700',   dot: 'bg-amber-400'   },
  { bg: 'bg-sky-100 dark:bg-sky-900/30',        border: 'border-sky-300 dark:border-sky-700',       dot: 'bg-sky-400'     },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30',border: 'border-emerald-300 dark:border-emerald-700',dot: 'bg-emerald-400'},
  { bg: 'bg-rose-100 dark:bg-rose-900/30',      border: 'border-rose-300 dark:border-rose-700',     dot: 'bg-rose-400'    },
  { bg: 'bg-violet-100 dark:bg-violet-900/30',  border: 'border-violet-300 dark:border-violet-700', dot: 'bg-violet-400'  },
]

export default function TripNotes({ tripId }) {
  const [expanded, setExpanded] = useState(false)
  const [notes,    setNotes]    = useState([])
  const [draft,    setDraft]    = useState('')
  const [color,    setColor]    = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [loaded,   setLoaded]   = useState(false) // track if we've fetched once

  // Load notes once when panel opens (getDoc, not onSnapshot — avoids infinite spinner)
  useEffect(() => {
    if (!expanded || !tripId || loaded) return
    setLoading(true)
    getDoc(doc(db, 'TripNotes', tripId))
      .then(snap => {
        if (snap.exists()) setNotes(snap.data().notes || [])
        setLoaded(true)
      })
      .catch(err => {
        console.warn('TripNotes load:', err.message)
        setLoaded(true) // stop spinner even on error
      })
      .finally(() => setLoading(false))
  }, [expanded, tripId, loaded])

  const persist = async (updNotes) => {
    const user = auth.currentUser
    if (!user) { toast.error('Sign in to save notes.'); return }
    if (!tripId) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'TripNotes', tripId), {
        notes:     updNotes,
        tripId,
        updatedBy: user.email,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    } catch (err) {
      toast.error(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const addNote = async () => {
    const text = draft.trim()
    if (!text) return
    const user = auth.currentUser
    const note = {
      id:     Date.now().toString(),
      text,
      color,
      author: user?.displayName || user?.email?.split('@')[0] || 'You',
      date:   new Date().toISOString(),
    }
    const upd = [...notes, note]
    setNotes(upd)
    setDraft('')
    await persist(upd)
  }

  const del = async (id) => {
    const upd = notes.filter(n => n.id !== id)
    setNotes(upd)
    await persist(upd)
  }

  return (
    <div className="card-premium overflow-hidden">
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 cursor-pointer select-none transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
            <StickyNote className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Trip Notes</p>
            <p className="text-xs text-muted-foreground">
              {notes.length > 0 ? `${notes.length} note${notes.length !== 1 ? 's' : ''} · shared with group` : 'Collaborative sticky notes'}
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
                  <span className="ml-2 text-sm text-muted-foreground">Loading notes…</span>
                </div>
              )}

              {!loading && (
                <>
                  {notes.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 max-h-80 overflow-y-auto pr-1">
                      <AnimatePresence>
                        {notes.map(n => {
                          const c = COLORS[n.color] || COLORS[0]
                          return (
                            <motion.div key={n.id}
                              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className={`relative p-3.5 rounded-2xl border ${c.bg} ${c.border} group`}>
                              <p className="text-sm leading-relaxed whitespace-pre-wrap pr-6">{n.text}</p>
                              <div className="flex items-center gap-1.5 mt-2">
                                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                                <p className="text-xs text-muted-foreground">{n.author} · {new Date(n.date).toLocaleDateString()}</p>
                              </div>
                              <button onClick={() => del(n.id)}
                                className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-all cursor-pointer">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  )}

                  {notes.length === 0 && loaded && (
                    <p className="mt-4 text-sm text-muted-foreground text-center py-2">No notes yet. Add the first one below!</p>
                  )}

                  {/* Add note */}
                  <div className="mt-4 space-y-2">
                    <div className="flex gap-1.5 mb-2">
                      {COLORS.map((c, i) => (
                        <button key={i} onClick={() => setColor(i)}
                          className={`w-6 h-6 rounded-full ${c.dot} transition-transform cursor-pointer ${color === i ? 'scale-125 ring-2 ring-primary ring-offset-1' : ''}`} />
                      ))}
                    </div>
                    <textarea value={draft} onChange={e => setDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote() }}
                      placeholder="Add a note for the group… (Ctrl+Enter to save)"
                      rows={2}
                      className="w-full text-sm px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:border-primary resize-none transition-colors" />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={addNote} disabled={!draft.trim() || saving || !auth.currentUser}
                      className="w-full btn-primary py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus className="w-4 h-4" />
                      {auth.currentUser ? 'Add Note' : 'Sign in to add notes'}
                    </motion.button>
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
