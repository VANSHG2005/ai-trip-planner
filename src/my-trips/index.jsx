import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/service/firebaseConfig'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import UserTripCard from './components/UserTripCard'
import SkeletonCard from './components/SkeletonCard'
import { Button } from '@/components/ui/button'
import { PlusCircle, Frown, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function MyTrips() {
  const [myTrips,     setMyTrips]     = useState([])
  const [sharedTrips, setSharedTrips] = useState([])
  const [loading,     setLoading]     = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) { navigate('/'); return }
    fetchAllTrips(user)
  }, [navigate])

  const fetchAllTrips = async (user) => {
    setLoading(true)
    try {
      // 1. Owned trips
      const ownedSnap = await getDocs(query(collection(db, 'AITrips'), where('userEmail', '==', user.email)))
      const owned = ownedSnap.docs.map(d => ({ ...d.data(), _source: 'owned' }))
      setMyTrips(owned)

      // 2. Trips shared via TripExpenses editors array
      const expSnap = await getDocs(query(collection(db, 'TripExpenses'), where('editors', 'array-contains', user.email)))
      const sharedIds = expSnap.docs
        .map(d => d.data().tripId)
        .filter(id => id && !owned.find(t => t.id === id))

      const sharedData = await Promise.all(
        sharedIds.map(async id => {
          try {
            const snap = await getDoc(doc(db, 'AITrips', id))
            if (snap.exists()) return { ...snap.data(), _source: 'shared' }
          } catch {
            // Failed to fetch shared trip, return null
          }
          return null
        })
      )
      setSharedTrips(sharedData.filter(Boolean))
    } catch (err) {
      console.error(err)
      toast.error('Failed to load trips.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (tripId) => {
    const tid = toast.loading('Deleting…')
    try {
      await deleteDoc(doc(db, 'AITrips', tripId))
      setMyTrips(prev => prev.filter(t => t.id !== tripId))
      toast.success('Deleted!', { id: tid })
    } catch { toast.error('Delete failed.', { id: tid }) }
  }

  const allEmpty = myTrips.length === 0 && sharedTrips.length === 0

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 md:py-16 min-h-screen mesh-bg">
      <div className="max-w-7xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
              My Trips 🗺️
            </h2>
            <p className="mt-2 text-muted-foreground text-sm">Your AI-planned adventures.</p>
          </div>
          <Link to="/create-trip">
            <Button className="hidden sm:flex items-center gap-2 rounded-full">
              <PlusCircle className="h-5 w-5" /> Plan New Trip
            </Button>
          </Link>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && allEmpty && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-16 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-2xl bg-muted/20">
            <Frown className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl font-semibold">No Trips Yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm text-sm">Let's plan something epic!</p>
            <Link to="/create-trip" className="mt-6">
              <Button size="lg" className="rounded-full flex items-center gap-2">
                <PlusCircle className="h-5 w-5" /> Plan a New Trip
              </Button>
            </Link>
          </motion.div>
        )}

        {!loading && myTrips.length > 0 && (
          <div className="mb-12">
            {sharedTrips.length > 0 && (
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Your Trips</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {myTrips.map(trip => (
                  <motion.div key={trip.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} layout>
                    <UserTripCard trip={trip} onDelete={() => handleDelete(trip.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {!loading && sharedTrips.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Shared With Me</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {sharedTrips.map(trip => (
                  <motion.div key={trip.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} layout>
                    <UserTripCard trip={trip} isShared onDelete={null} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
