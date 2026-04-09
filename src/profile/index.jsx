import React, { useState, useEffect } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import { updateProfile, signOut } from 'firebase/auth'
import { db, auth } from '@/service/firebaseConfig'
import { toast } from 'sonner'
import {
  User, MapPin, Calendar, DollarSign, Globe, LogOut,
  Edit3, Save, X, Sparkles, TrendingUp, Heart,
  Shield, Bell, ChevronRight, CheckCircle2, Star,
  Plane, Mountain, Utensils, Building, Sun, Compass,
  BarChart3, Bookmark, BookmarkX, Flame, Eye, EyeOff,
  Trash2, Download, Share2, Camera, Lock, Plus, Map,
  Award, Zap, Target, Clock
} from 'lucide-react'

const TRAVEL_STYLES = [
  { id: 'adventure',   label: 'Adventure',    Icon: Mountain  },
  { id: 'culture',     label: 'Culture',      Icon: Building  },
  { id: 'food',        label: 'Food & Dining',Icon: Utensils  },
  { id: 'relaxation',  label: 'Relaxation',   Icon: Sun       },
  { id: 'city',        label: 'City Explorer',Icon: Globe     },
  { id: 'nature',      label: 'Nature',       Icon: Compass   },
]
const BUDGET_OPTIONS = ['Backpacker','Cheap','Moderate','Comfort','Luxury']

const ACHIEVEMENTS = [
  { label: 'First Step',   emoji: '🌍', desc: 'Plan your first trip',   cond: s => s.trips >= 1     },
  { label: 'Explorer',     emoji: '🗺️', desc: '5 trips planned',        cond: s => s.trips >= 5     },
  { label: 'Globetrotter', emoji: '✈️', desc: '10 trips planned',       cond: s => s.trips >= 10    },
  { label: 'Wanderlust',   emoji: '🏔️', desc: '3 countries visited',    cond: s => s.countries >= 3 },
  { label: 'Adventurer',   emoji: '🎯', desc: '5+ days on a single trip',cond: s => s.maxDays >= 5  },
  { label: 'Luxurist',     emoji: '💎', desc: 'Plan a luxury trip',      cond: s => s.hasLuxury      },
  { label: 'Budget Pro',   emoji: '🪙', desc: 'Plan a budget trip',      cond: s => s.hasBudget      },
  { label: 'Marathon',     emoji: '🏃', desc: '14+ day trip planned',    cond: s => s.maxDays >= 14  },
]

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
        active ? 'bg-primary text-white shadow' : 'text-muted-foreground hover:bg-muted/80'
      }`}>
      {children}
    </button>
  )
}

function Toggle({ value, onChange }) {
  return (
    <div role="button" tabIndex={0} onClick={() => onChange(!value)} onKeyDown={e => e.key === 'Enter' && onChange(!value)}
      className={`w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 relative ${value ? 'bg-primary' : 'bg-muted'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </div>
  )
}

export default function Profile() {
  const navigate   = useNavigate()
  const user       = auth.currentUser
  const [activeTab, setActiveTab] = useState('overview')
  const [trips,     setTrips]     = useState([])
  const [wishlist,  setWishlist]  = useState([]) // [{dest, budget, days, note}]
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [editingName, setEditingName] = useState(false)

  // Profile fields
  const [displayName,    setDisplayName]    = useState(user?.displayName || '')
  const [bio,            setBio]            = useState('')
  const [homeLocation,   setHomeLocation]   = useState('')
  const [travelStyles,   setTravelStyles]   = useState([])
  const [preferredBudget,setPreferredBudget]= useState('')
  const [notifyEmail,    setNotifyEmail]    = useState(true)
  const [notifyTrip,     setNotifyTrip]     = useState(true)
  const [publicProfile,  setPublicProfile]  = useState(true)
  const [shareTrips,     setShareTrips]     = useState(true)

  // Stats
  const [stats, setStats] = useState({
    trips: 0, countries: 0, days: 0, topBudget: '',
    maxDays: 0, hasLuxury: false, hasBudget: false,
    totalCountries: [], budgetBreakdown: {}, monthlyTrips: {},
  })

  // Wishlist new item form
  const [wlDest,   setWlDest]   = useState('')
  const [wlBudget, setWlBudget] = useState('')
  const [wlDays,   setWlDays]   = useState('')
  const [wlNote,   setWlNote]   = useState('')

  useEffect(() => {
    if (!user) { navigate('/'); return }
    loadAll()
  }, []) // eslint-disable-line

  const loadAll = async () => {
    setLoading(true)
    try {
      // Load user profile from Firestore
      const profSnap = await getDoc(doc(db, 'UserProfiles', user.uid))
      if (profSnap.exists()) {
        const d = profSnap.data()
        setBio(d.bio || '')
        setHomeLocation(d.homeLocation || '')
        setTravelStyles(d.travelStyles || [])
        setPreferredBudget(d.preferredBudget || '')
        setNotifyEmail(d.notifyEmail !== false)
        setNotifyTrip(d.notifyTrip !== false)
        setPublicProfile(d.publicProfile !== false)
        setShareTrips(d.shareTrips !== false)
        setWishlist(d.wishlist || [])
      }

      // Load trips for stats
      const q    = query(collection(db, 'AITrips'), where('userEmail', '==', user.email))
      const snap = await getDocs(q)
      const data = snap.docs.map(d => d.data())
      setTrips(data)

      // Compute stats
      const countries = new Set()
      let totalDays = 0, maxDays = 0
      const budgetBreakdown = {}
      let hasLuxury = false, hasBudget = false
      data.forEach(t => {
        const city = t.userSelection?.location?.properties?.formatted?.split(',').pop()?.trim()
        if (city) countries.add(city)
        const d = Number(t.userSelection?.noOfDays || 0)
        totalDays += d
        if (d > maxDays) maxDays = d
        const b = t.userSelection?.budget || 'Moderate'
        budgetBreakdown[b] = (budgetBreakdown[b] || 0) + 1
        if (b === 'Luxury') hasLuxury = true
        if (b === 'Cheap' || b === 'Backpacker') hasBudget = true
      })
      const topBudget = Object.entries(budgetBreakdown).sort((a,b)=>b[1]-a[1])[0]?.[0] || ''
      setStats({ trips: data.length, countries: countries.size, days: totalDays, topBudget,
                 maxDays, hasLuxury, hasBudget, budgetBreakdown, totalCountries: [...countries] })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName })
      }
      await setDoc(doc(db, 'UserProfiles', user.uid), {
        bio, homeLocation, travelStyles, preferredBudget,
        notifyEmail, notifyTrip, publicProfile, shareTrips,
        wishlist, email: user.email, updatedAt: new Date().toISOString(),
      }, { merge: true })
      toast.success('Profile saved! ✓')
      setEditingName(false)
    } catch (err) {
      toast.error(`Save failed: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => signOut(auth).then(() => { navigate('/'); toast.success('Signed out.') })
  const toggleStyle  = (id) => setTravelStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const addWishlistItem = async () => {
    if (!wlDest.trim()) return
    const item = { id: Date.now().toString(), dest: wlDest.trim(), budget: wlBudget, days: wlDays, note: wlNote.trim(), added: new Date().toISOString() }
    const upd = [...wishlist, item]
    setWishlist(upd)
    setWlDest(''); setWlBudget(''); setWlDays(''); setWlNote('')
    await setDoc(doc(db, 'UserProfiles', user.uid), { wishlist: upd }, { merge: true })
    toast.success('Added to wishlist!')
  }

  const removeWishlistItem = async (id) => {
    const upd = wishlist.filter(w => w.id !== id)
    setWishlist(upd)
    await setDoc(doc(db, 'UserProfiles', user.uid), { wishlist: upd }, { merge: true })
  }

  const achievements = ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.cond(stats) }))
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const recentTrips   = [...trips].reverse().slice(0, 5)

  return (
    <div className="min-h-screen mesh-bg px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Hero card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'T')}&background=6366f1&color=fff&size=96`}
                alt="Avatar" className="w-20 h-20 rounded-3xl object-cover ring-4 ring-primary/20" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-card" title="Online" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                      className="text-xl font-bold bg-muted/50 px-3 py-1 rounded-xl border border-primary focus:outline-none"
                      style={{ fontFamily: 'Sora, sans-serif' }} autoFocus
                      onKeyDown={e => e.key === 'Enter' && handleSave()} />
                    <button onClick={handleSave} className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingName(false)} className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
                      {user?.displayName || 'Traveller'}
                    </h1>
                    <button onClick={() => setEditingName(true)} className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 cursor-pointer">
                      <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-2">
                <Globe className="w-3.5 h-3.5" />{user?.email}
                {homeLocation && <><span className="mx-1">·</span><MapPin className="w-3.5 h-3.5" />{homeLocation}</>}
              </p>
              {bio && <p className="text-sm text-muted-foreground italic">"{bio}"</p>}
              {/* Mini achievement bar */}
              <div className="flex items-center gap-2 mt-3">
                <div className="flex -space-x-1">
                  {achievements.filter(a => a.unlocked).slice(0,5).map(a => (
                    <span key={a.label} className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs" title={a.label}>{a.emoji}</span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{unlockedCount}/{achievements.length} achievements</span>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex sm:flex-col gap-3 shrink-0">
              <div className="text-center p-3 rounded-2xl bg-primary/5 border border-primary/20 min-w-16">
                <p className="text-xl font-bold text-primary" style={{ fontFamily: 'Sora, sans-serif' }}>{stats.trips}</p>
                <p className="text-xs text-muted-foreground">Trips</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-muted/40 border border-border min-w-16">
                <p className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{stats.countries}</p>
                <p className="text-xs text-muted-foreground">Countries</p>
              </div>
              <div className="text-center p-3 rounded-2xl bg-muted/40 border border-border min-w-16">
                <p className="text-xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>{stats.days}</p>
                <p className="text-xs text-muted-foreground">Days</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tabs card ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium p-6">
          <div className="flex items-center gap-1 mb-6 p-1 bg-muted/50 rounded-2xl flex-wrap">
            {[
              { id: 'overview',   label: 'Overview'              },
              { id: 'trips',      label: `Trips (${trips.length})`},
              { id: 'wishlist',   label: `Wishlist (${wishlist.length})` },
              { id: 'analytics',  label: 'Analytics'             },
              { id: 'achievements',label: `🏆 Achievements`      },
              { id: 'preferences',label: 'Preferences'           },
              { id: 'settings',   label: 'Settings'              },
            ].map(t => <TabBtn key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>{t.label}</TabBtn>)}
          </div>

          <AnimatePresence mode="wait">

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
                className="grid md:grid-cols-2 gap-6">
                {/* Travel styles */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ fontFamily:'Sora,sans-serif' }}>
                    <Heart className="w-4 h-4 text-primary" /> Travel Interests
                  </h3>
                  {travelStyles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {travelStyles.map(s => {
                        const style = TRAVEL_STYLES.find(ts => ts.id === s)
                        if (!style) return null
                        return (
                          <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                            <style.Icon className="w-3.5 h-3.5" />{style.label}
                          </span>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No styles set.{' '}
                      <button onClick={() => setActiveTab('preferences')} className="text-primary hover:underline">Add some</button>
                    </p>
                  )}
                </div>

                {/* Recent trips */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ fontFamily:'Sora,sans-serif' }}>
                    <TrendingUp className="w-4 h-4 text-primary" /> Recent Trips
                  </h3>
                  {loading ? (
                    <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-8 animate-shimmer rounded-lg" />)}</div>
                  ) : recentTrips.length > 0 ? (
                    <div className="space-y-1.5">
                      {recentTrips.map(t => (
                        <Link key={t.id} to={`/view-trip/${t.id}`}>
                          <motion.div whileHover={{ x:4 }}
                            className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-muted transition-colors group cursor-pointer">
                            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary to-violet-500 flex items-center justify-center shrink-0">
                              <Plane className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{t.userSelection?.location?.properties?.formatted?.split(',')[0]}</p>
                              <p className="text-xs text-muted-foreground">{t.userSelection?.noOfDays} days · {t.userSelection?.budget}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No trips yet. <Link to="/create-trip" className="text-primary hover:underline">Plan one!</Link>
                    </p>
                  )}
                </div>

                {/* Wishlist preview */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ fontFamily:'Sora,sans-serif' }}>
                    <Bookmark className="w-4 h-4 text-primary" /> Wishlist
                  </h3>
                  {wishlist.length > 0 ? (
                    <div className="space-y-1.5">
                      {wishlist.slice(0,3).map(w => (
                        <div key={w.id} className="flex items-center gap-2 py-2 px-3 rounded-xl bg-muted/30 border border-border">
                          <span className="text-lg">🌍</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{w.dest}</p>
                            <p className="text-xs text-muted-foreground">{w.budget}{w.days ? ` · ${w.days} days` : ''}</p>
                          </div>
                        </div>
                      ))}
                      {wishlist.length > 3 && (
                        <button onClick={() => setActiveTab('wishlist')} className="text-xs text-primary hover:underline">
                          +{wishlist.length - 3} more destinations →
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No wishlist items. <button onClick={() => setActiveTab('wishlist')} className="text-primary hover:underline">Add a destination!</button>
                    </p>
                  )}
                </div>

                {/* Top achievements */}
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2" style={{ fontFamily:'Sora,sans-serif' }}>
                    <Award className="w-4 h-4 text-primary" /> Top Achievements
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {achievements.slice(0,4).map(b => (
                      <div key={b.label} className={`p-2 rounded-xl text-center border text-xs transition-all ${b.unlocked ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30 opacity-40 grayscale'}`}>
                        <div className="text-xl mb-0.5">{b.emoji}</div>
                        <p className="font-bold leading-tight">{b.label}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('achievements')} className="text-xs text-primary hover:underline mt-2 block">
                    View all achievements →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── TRIPS ── */}
            {activeTab === 'trips' && (
              <motion.div key="trips" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                {loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-16 animate-shimmer rounded-2xl" />)}</div>
                ) : trips.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🗺️</div>
                    <Link to="/create-trip">
                      <button className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold mt-3 inline-flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> Plan Your First Trip
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {[...trips].reverse().map((trip, i) => (
                      <Link key={trip.id} to={`/view-trip/${trip.id}`}>
                        <motion.div initial={{ opacity:0,x:-16 }} animate={{ opacity:1,x:0 }}
                          transition={{ delay: i*0.04 }} whileHover={{ x:4 }}
                          className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group cursor-pointer">
                          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-violet-500 flex items-center justify-center shrink-0">
                            <Plane className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate" style={{ fontFamily:'Sora,sans-serif' }}>
                              {trip.userSelection?.location?.properties?.formatted || 'Unknown destination'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-0.5">
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.userSelection?.noOfDays} days</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" />{trip.userSelection?.budget}</span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{trip.userSelection?.traveler}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0" />
                        </motion.div>
                      </Link>
                    ))}
                    <div className="mt-4 pt-4 border-t border-border">
                      <Link to="/create-trip">
                        <button className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold">
                          <Sparkles className="w-4 h-4" /> Plan a New Trip
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ── WISHLIST ── */}
            {activeTab === 'wishlist' && (
              <motion.div key="wishlist" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} className="space-y-4">
                <p className="text-sm text-muted-foreground">Save destinations you dream of visiting. Plan them whenever you're ready!</p>

                {/* Add form */}
                <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add Destination</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={wlDest} onChange={e => setWlDest(e.target.value)}
                      placeholder="Destination *" onKeyDown={e => e.key === 'Enter' && addWishlistItem()}
                      className="col-span-2 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary" />
                    <select value={wlBudget} onChange={e => setWlBudget(e.target.value)}
                      className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary">
                      <option value="">Budget…</option>
                      {BUDGET_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <input value={wlDays} onChange={e => setWlDays(e.target.value)}
                      type="number" min="1" max="60" placeholder="Days"
                      className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary" />
                    <input value={wlNote} onChange={e => setWlNote(e.target.value)}
                      placeholder="Personal note…"
                      className="col-span-2 px-3 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:border-primary" />
                  </div>
                  <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                    onClick={addWishlistItem} disabled={!wlDest.trim()}
                    className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40">
                    <Plus className="w-4 h-4" /> Add to Wishlist
                  </motion.button>
                </div>

                {/* Wishlist items */}
                {wishlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Your wishlist is empty. Add dream destinations above!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wishlist.map(w => (
                      <motion.div key={w.id} layout initial={{ opacity:0 }} animate={{ opacity:1 }}
                        className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card/50 group">
                        <span className="text-2xl mt-0.5">🌍</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm" style={{ fontFamily:'Sora,sans-serif' }}>{w.dest}</p>
                          <div className="flex gap-2 mt-0.5 flex-wrap">
                            {w.budget && <span className="text-xs text-muted-foreground">💰 {w.budget}</span>}
                            {w.days && <span className="text-xs text-muted-foreground">📅 {w.days} days</span>}
                          </div>
                          {w.note && <p className="text-xs text-muted-foreground mt-1 italic">"{w.note}"</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Link to="/create-trip">
                            <button title="Plan this trip"
                              className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 cursor-pointer">
                              <Plane className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                          <button onClick={() => removeWishlistItem(w.id)} title="Remove"
                            className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-100 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                            <BookmarkX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── ANALYTICS ── */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} className="space-y-6">
                {loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="h-24 animate-shimmer rounded-2xl" />)}</div>
                ) : (
                  <>
                    {/* Key metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { icon: Plane,    label: 'Trips Planned',   v: stats.trips,     color:'text-blue-500',   bg:'bg-blue-50 dark:bg-blue-500/10' },
                        { icon: Globe,    label: 'Countries/Cities', v: stats.countries, color:'text-violet-500', bg:'bg-violet-50 dark:bg-violet-500/10' },
                        { icon: Calendar, label: 'Total Days',       v: stats.days,      color:'text-emerald-500',bg:'bg-emerald-50 dark:bg-emerald-500/10' },
                        { icon: Target,   label: 'Longest Trip',     v: `${stats.maxDays}d`, color:'text-amber-500', bg:'bg-amber-50 dark:bg-amber-500/10' },
                      ].map(m => (
                        <div key={m.label} className={`p-4 rounded-2xl border border-border ${m.bg}`}>
                          <m.icon className={`w-5 h-5 ${m.color} mb-2`} />
                          <p className="text-2xl font-bold" style={{ fontFamily:'Sora,sans-serif' }}>{m.v}</p>
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Budget breakdown */}
                    {Object.keys(stats.budgetBreakdown).length > 0 && (
                      <div>
                        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ fontFamily:'Sora,sans-serif' }}>
                          <BarChart3 className="w-4 h-4 text-primary" /> Budget Breakdown
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(stats.budgetBreakdown).sort((a,b) => b[1]-a[1]).map(([b, count]) => {
                            const pct = Math.round((count / stats.trips) * 100)
                            return (
                              <div key={b}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{b}</span>
                                  <span className="text-xs text-muted-foreground">{count} trip{count!==1?'s':''} · {pct}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }} transition={{ duration:0.8 }}
                                    className="h-full bg-primary rounded-full" />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Countries visited */}
                    {stats.totalCountries.length > 0 && (
                      <div>
                        <h3 className="font-bold mb-3 flex items-center gap-2" style={{ fontFamily:'Sora,sans-serif' }}>
                          <Map className="w-4 h-4 text-primary" /> Destinations Planned
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {stats.totalCountries.map(c => (
                            <span key={c} className="px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-medium">
                              🌍 {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Travel streak */}
                    <div className="p-4 rounded-2xl bg-linear-to-r from-orange-500/10 to-red-500/10 border border-orange-200 dark:border-orange-500/30">
                      <div className="flex items-center gap-3">
                        <Flame className="w-8 h-8 text-orange-500" />
                        <div>
                          <p className="font-bold" style={{ fontFamily:'Sora,sans-serif' }}>
                            {stats.trips >= 3 ? '🔥 On Fire!' : stats.trips >= 1 ? 'Getting started!' : 'Plan your first trip!'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {stats.trips >= 10 ? 'You\'re a seasoned traveler with 10+ trips!'
                              : stats.trips >= 5 ? `${10 - stats.trips} more trips to reach Globetrotter status!`
                              : stats.trips >= 1 ? `${5 - stats.trips} more trips to reach Explorer status!`
                              : 'Start planning to unlock achievements!'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {trips.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No data yet. Start planning trips to see your analytics!</p>
                        <Link to="/create-trip">
                          <button className="btn-primary mt-4 px-5 py-2 rounded-xl text-sm font-semibold">Plan a Trip</button>
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── ACHIEVEMENTS ── */}
            {activeTab === 'achievements' && (
              <motion.div key="achievements" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">{unlockedCount} of {achievements.length} unlocked</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width:`${(unlockedCount/achievements.length)*100}%` }} />
                    </div>
                    {Math.round((unlockedCount/achievements.length)*100)}%
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {achievements.map(b => (
                    <motion.div key={b.label} whileHover={{ y:-2 }}
                      className={`p-4 rounded-2xl text-center border transition-all ${b.unlocked ? 'border-primary/20 bg-primary/5' : 'border-border bg-muted/30 opacity-50 grayscale'}`}>
                      <div className="text-3xl mb-2">{b.emoji}</div>
                      <p className="text-xs font-bold leading-tight">{b.label}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-tight">{b.desc}</p>
                      {b.unlocked && (
                        <div className="flex items-center justify-center gap-1 mt-2 text-xs text-primary font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked!
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── PREFERENCES ── */}
            {activeTab === 'preferences' && (
              <motion.div key="preferences" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} className="space-y-6">
                <div>
                  <label className="text-sm font-semibold mb-2 block">Bio</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} maxLength={200}
                    placeholder="Tell other travelers about yourself…"
                    className="w-full rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/200</p>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-2 block">Home Location</label>
                  <input value={homeLocation} onChange={e => setHomeLocation(e.target.value)}
                    placeholder="e.g. New Delhi, India"
                    className="w-full rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold mb-3 block">Travel Style</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {TRAVEL_STYLES.map(style => {
                      const sel = travelStyles.includes(style.id)
                      return (
                        <motion.button key={style.id} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                          onClick={() => toggleStyle(style.id)}
                          className={`flex items-center gap-2.5 p-3.5 rounded-2xl border-2 text-sm font-medium transition-all text-left ${sel ? 'border-primary bg-primary/8 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground'}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${sel ? 'bg-primary/15' : 'bg-muted'}`}>
                            <style.Icon className="w-4 h-4" />
                          </div>
                          {style.label}
                          {sel && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" />}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold mb-3 block">Preferred Budget</label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_OPTIONS.map(b => (
                      <motion.button key={b} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
                        onClick={() => setPreferredBudget(b)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${preferredBudget === b ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground'}`}>
                        {b}
                      </motion.button>
                    ))}
                  </div>
                </div>
                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleSave} disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Preferences
                </motion.button>
              </motion.div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }} className="space-y-6">
                {/* Account info */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" />Account</h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Name',          value: user?.displayName || '—' },
                      { label: 'Email',          value: user?.email || '—'       },
                      { label: 'Auth Provider',  value: 'Google'                  },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-3 px-4 rounded-2xl bg-muted/30 border border-border">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Lock className="w-4 h-4 text-primary" />Privacy</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Public Profile',  desc: 'Let others view your travel profile', val: publicProfile, set: setPublicProfile },
                      { label: 'Share My Trips',  desc: 'Allow invited editors to view trips',  val: shareTrips,     set: setShareTrips   },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-3 px-4 rounded-2xl bg-muted/30 border border-border">
                        <div>
                          <p className="text-sm font-medium flex items-center gap-1.5">
                            {item.val ? <Eye className="w-3.5 h-3.5 text-primary" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                            {item.label}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Toggle value={item.val} onChange={item.set} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" />Notifications</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Email notifications', desc: 'Receive updates via email',  val: notifyEmail, set: setNotifyEmail },
                      { label: 'Trip reminders',      desc: 'Reminders before your trip', val: notifyTrip,  set: setNotifyTrip  },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-3 px-4 rounded-2xl bg-muted/30 border border-border">
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                        <Toggle value={item.val} onChange={item.set} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Danger zone */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-red-500">Danger Zone</h3>
                  <motion.button whileHover={{ scale:1.01 }} whileTap={{ scale:0.99 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl border-2 border-red-200 dark:border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-sm font-medium">
                    <LogOut className="w-4 h-4" /> Sign Out of TripCortex
                  </motion.button>
                </div>

                <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                  onClick={handleSave} disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Settings
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
