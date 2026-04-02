import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { db, auth } from '@/service/firebaseConfig'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'

const ASPECTS = [
  { id: 'planning',   label: 'Planning Quality' },
  { id: 'activities', label: 'Activity Mix' },
  { id: 'hotels',     label: 'Hotel Picks' },
  { id: 'overall',    label: 'Overall Experience' },
]

function StarRow({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n}
          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          className="cursor-pointer transition-transform hover:scale-110 focus:outline-none">
          <Star className={`w-5 h-5 transition-colors ${(hover || value) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  )
}

export default function TripRating({ tripId }) {
  const [expanded, setExpanded] = useState(false)
  const [reviews,  setReviews]  = useState([])
  const [ratings,  setRatings]  = useState({ planning: 0, activities: 0, hotels: 0, overall: 0 })
  const [review,   setReview]   = useState('')
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [loaded,   setLoaded]   = useState(false)

  // Load once when panel opens — NOT onSnapshot (that caused infinite spinner)
  useEffect(() => {
    if (!expanded || !tripId || loaded) return
    setLoading(true)
    getDoc(doc(db, 'TripRatings', tripId))
      .then(snap => {
        if (snap.exists()) setReviews(snap.data().reviews || [])
        setLoaded(true)
      })
      .catch(err => {
        console.warn('TripRating load:', err.message)
        setLoaded(true) // stop spinner on error
      })
      .finally(() => setLoading(false))
  }, [expanded, tripId, loaded])

  const submit = async () => {
    const user = auth.currentUser
    if (!user) { toast.error('Sign in to leave a review.'); return }
    if (!ratings.overall) { toast.error('Please rate Overall Experience at minimum.'); return }

    setSaving(true)
    const entry = {
      uid:     user.uid,
      name:    user.displayName || user.email?.split('@')[0] || 'Traveller',
      photo:   user.photoURL || null,
      ratings: { ...ratings },
      review:  review.trim(),
      date:    new Date().toISOString(),
    }
    const prev    = reviews.filter(r => r.uid !== user.uid) // replace user's old review
    const updated = [...prev, entry]

    try {
      await setDoc(doc(db, 'TripRatings', tripId), {
        reviews:   updated,
        updatedAt: serverTimestamp(),
      }, { merge: true })
      setReviews(updated)
      setReview('')
      toast.success('Review saved! ✓')
    } catch (err) {
      toast.error(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const avg = (key) => {
    const vals = reviews.map(r => r.ratings?.[key]).filter(v => v > 0)
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—'
  }

  return (
    <div className="card-premium overflow-hidden">
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 cursor-pointer select-none transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Rate this Trip</p>
            <p className="text-xs text-muted-foreground">
              {reviews.length > 0
                ? `${avg('overall')} ★ · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                : 'Share your experience with the group'}
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

              {loading && (
                <div className="mt-6 flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading reviews…</span>
                </div>
              )}

              {!loading && (
                <>
                  {/* Aggregate scores */}
                  {reviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-2 mb-4">
                      {ASPECTS.map(a => (
                        <div key={a.id} className="p-2.5 rounded-xl bg-muted/40 border border-border text-center">
                          <p className="text-xs text-muted-foreground">{a.label}</p>
                          <p className="text-lg font-bold text-amber-500">{avg(a.id)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Rating form */}
                  <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border mb-4 mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Rating</p>
                    {ASPECTS.map(a => (
                      <div key={a.id} className="flex items-center justify-between">
                        <span className="text-sm">{a.label}</span>
                        <StarRow value={ratings[a.id]} onChange={v => setRatings(r => ({ ...r, [a.id]: v }))} />
                      </div>
                    ))}
                    <textarea value={review} onChange={e => setReview(e.target.value)}
                      placeholder="What did you love about this itinerary? (optional)"
                      rows={2}
                      className="w-full text-sm px-3 py-2 rounded-xl border border-border bg-card focus:outline-none focus:border-primary resize-none transition-colors" />
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={submit} disabled={saving || !auth.currentUser}
                      className="w-full btn-primary py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                      {saving
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : auth.currentUser ? 'Submit Review' : 'Sign in to review'}
                    </motion.button>
                  </div>

                  {/* Reviews list */}
                  {reviews.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">All Reviews</p>
                      {[...reviews].reverse().map((r, i) => (
                        <div key={i} className="p-3 rounded-2xl border border-border bg-card/50">
                          <div className="flex items-center gap-2 mb-1">
                            {r.photo
                              ? <img src={r.photo} alt={r.name} className="w-7 h-7 rounded-full object-cover" />
                              : <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{r.name?.[0]}</div>
                            }
                            <div>
                              <p className="text-xs font-semibold">{r.name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString()}</p>
                            </div>
                            <div className="ml-auto flex">
                              {[1, 2, 3, 4, 5].map(n => (
                                <Star key={n} className={`w-3 h-3 ${(r.ratings?.overall || 0) >= n ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'}`} />
                              ))}
                            </div>
                          </div>
                          {r.review && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.review}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {loaded && reviews.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-2">No reviews yet. Be the first!</p>
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
