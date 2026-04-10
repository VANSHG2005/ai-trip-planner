import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Sparkles, MapPin, Calendar, Loader2, Check, AlertTriangle, LogIn } from 'lucide-react'
import { db, auth } from '@/service/firebaseConfig'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { toast } from 'sonner'

export default function JoinTrip() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState('loading') // loading | preview | joining | joined | error | already
  const [groupData, setGroupData] = useState(null)
  const [tripData, setTripData] = useState(null)

  useEffect(() => {
    loadTrip()
  }, [tripId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadTrip = async () => {
    try {
      const [groupSnap, tripSnap] = await Promise.all([
        getDoc(doc(db, 'GroupTrips', `group_${tripId}`)),
        getDoc(doc(db, 'AITrips', tripId)),
      ])
      if (!groupSnap.exists() || !tripSnap.exists()) { setState('error'); return }
      const gd = groupSnap.data()
      const td = tripSnap.data()
      setGroupData(gd)
      setTripData(td)

      // Check if already a member
      const user = auth.currentUser
      if (user && gd.members?.some(m => m.uid === user.uid)) {
        setState('already')
      } else {
        setState('preview')
      }
    } catch { setState('error') }
  }

  const handleJoin = async () => {
    const user = auth.currentUser
    if (!user) {
      // Sign in first
      try {
        setState('joining')
        const provider = new GoogleAuthProvider()
        await signInWithPopup(auth, provider)
        // After sign in, re-check
        loadTrip()
      } catch { setState('preview') }
      return
    }

    setState('joining')
    try {
      const newMember = {
        uid: user.uid,
        name: user.displayName || user.email,
        email: user.email,
        photo: user.photoURL || '',
        joinedAt: new Date().toISOString(),
        role: 'member',
      }
      await updateDoc(doc(db, 'GroupTrips', `group_${tripId}`), {
        members: arrayUnion(newMember),
      })
      setState('joined')
      toast.success('You joined the trip! 🎉')
      setTimeout(() => navigate(`/view-trip/${tripId}`), 2000)
    } catch { toast.error('Failed to join.'); setState('preview') }
  }

  const destination = tripData?.userSelection?.location?.properties?.formatted || 'Trip'
  const days = tripData?.userSelection?.noOfDays
  const budget = tripData?.userSelection?.budget
  const memberCount = groupData?.members?.length || 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-bg">
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md">

        {state === 'loading' && (
          <div className="card-premium p-10 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading trip details…</p>
          </div>
        )}

        {state === 'error' && (
          <div className="card-premium p-10 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2">Trip Not Found</h2>
            <p className="text-muted-foreground text-sm mb-6">This invite link may be invalid or expired.</p>
            <Link to="/"><button className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">Go Home</button></Link>
          </div>
        )}

        {state === 'already' && (
          <div className="card-premium p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">You're Already In! 🎉</h2>
            <p className="text-muted-foreground text-sm mb-6">You're already a member of this trip.</p>
            <Link to={`/view-trip/${tripId}`}>
              <button className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">View Trip</button>
            </Link>
          </div>
        )}

        {state === 'joined' && (
          <div className="card-premium p-10 text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">You Joined! 🎉</h2>
            <p className="text-muted-foreground text-sm">Redirecting to the trip plan…</p>
            <div className="mt-4 w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        )}

        {state === 'joining' && (
          <div className="card-premium p-10 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Joining trip…</p>
          </div>
        )}

        {state === 'preview' && groupData && (
          <div className="card-premium overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">TripCortex · Group Invite</span>
              </div>
              <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                Join the Trip! ✈️
              </h1>
              <p className="text-muted-foreground text-sm">
                <strong>{groupData.ownerName}</strong> invited you to plan a trip together.
              </p>
            </div>

            {/* Trip details */}
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-bold text-sm">{destination}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/30 border border-border">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="text-sm font-semibold">{days} Days</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/30 border border-border">
                  <Users className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Members</p>
                    <p className="text-sm font-semibold">{memberCount} joined</p>
                  </div>
                </div>
              </div>

              {/* Members preview */}
              {groupData.members?.length > 0 && (
                <div className="p-4 rounded-2xl bg-muted/20 border border-border">
                  <p className="text-xs text-muted-foreground mb-2.5">People in this trip</p>
                  <div className="flex -space-x-2 flex-wrap gap-y-1">
                    {groupData.members.slice(0, 8).map((m, i) => (
                      m.photo
                        ? <img key={i} src={m.photo} alt={m.name} title={m.name} className="w-8 h-8 rounded-xl border-2 border-background object-cover" onError={e => { e.currentTarget.style.display = 'none' }} />
                        : <div key={i} title={m.name} className="w-8 h-8 rounded-xl border-2 border-background bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">{(m.name || '?')[0].toUpperCase()}</div>
                    ))}
                    {memberCount > 8 && <div className="w-8 h-8 rounded-xl border-2 border-background bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">+{memberCount - 8}</div>}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="px-6 pb-6">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleJoin}
                className="w-full btn-primary flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-bold">
                {!auth.currentUser ? <><LogIn className="w-5 h-5" /> Sign In &amp; Join Trip</> : <><Users className="w-5 h-5" /> Join This Trip</>}
              </motion.button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                You'll be able to view the itinerary, collaborate on budget, and track expenses.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
