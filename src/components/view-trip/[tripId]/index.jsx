import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { db } from '@/service/firebaseConfig'
import { doc, getDoc } from 'firebase/firestore'
import InfoSection       from '../components/InfoSection'
import Hotels            from '../components/Hotels'
import PlacesToVisit     from '../components/PlacesToVisit'
import WeatherWidget     from '../components/WeatherWidget'
import TripMapView       from '../components/TripMapView'
import BudgetEstimator   from '../components/BudgetEstimator'
import TripChecklist     from '../components/TripChecklist'
import TripRating        from '../components/TripRating'
import TripNotes         from '../components/TripNotes'
import TripExpenses      from '../components/TripExpenses'
import CurrencyConverter from '../components/CurrencyConverter'
import TripTimeline      from '../components/TripTimeline'
import TripAIChat        from '../components/TripAIChat'
import { exportTripAsHTML, copyTripSummary } from '@/lib/exportTrip'
import {
  ArrowLeft, AlertTriangle, Sparkles, Download, Copy,
  Map, Cloud, Hotel, Route, Calculator, Package,
  Receipt, Star, StickyNote, ArrowLeftRight, CalendarDays, Bot
} from 'lucide-react'

const SECTIONS = [
  { id: 'overview',   label: 'Overview',   Icon: Route          },
  { id: 'hotels',     label: 'Hotels',     Icon: Hotel          },
  { id: 'itinerary',  label: 'Itinerary',  Icon: Route          },
  { id: 'map',        label: 'Map',        Icon: Map            },
  { id: 'weather',    label: 'Weather',    Icon: Cloud          },
  { id: 'budget',     label: 'Budget',     Icon: Calculator     },
  { id: 'expenses',   label: 'Expenses',   Icon: Receipt        },
  { id: 'converter',  label: 'Currency',   Icon: ArrowLeftRight },
  { id: 'timeline',   label: 'Timeline',   Icon: CalendarDays   },
  { id: 'ai',         label: 'AI Chat',    Icon: Bot            },
  { id: 'notes',      label: 'Notes',      Icon: StickyNote     },
  { id: 'rating',     label: 'Rate',       Icon: Star           },
  { id: 'packing',    label: 'Packing',    Icon: Package        },
]

function Skeleton() {
  return (
    <div className="space-y-10 animate-pulse">
      <div className="h-72 sm:h-96 rounded-3xl bg-muted" />
      <div className="space-y-3">
        <div className="h-8 bg-muted rounded-xl w-2/3" />
        <div className="flex gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-7 bg-muted rounded-full w-24" />)}</div>
      </div>
      <div className="h-px bg-border" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-muted rounded-2xl" />)}
      </div>
    </div>
  )
}

export default function ViewTrip() {
  const { tripId }            = useParams()
  const [trip,    setTrip]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const [active,  setActive]  = useState('overview')

  useEffect(() => { if (tripId) fetchTrip() }, [tripId]) // eslint-disable-line

  const fetchTrip = async () => {
    setLoading(true); setError(false)
    try {
      const snap = await getDoc(doc(db, 'AITrips', tripId))
      if (snap.exists()) setTrip(snap.data())
      else { toast.error('Trip not found'); setError(true) }
    } catch (e) {
      console.error('ViewTrip:', e)
      toast.error('Failed to load trip.')
      setError(true)
    } finally { setLoading(false) }
  }

  const handleExport = () => { try { exportTripAsHTML(trip); toast.success('Downloaded!') } catch { toast.error('Export failed.') } }
  const handleCopy   = async () => { try { await copyTripSummary(trip); toast.success('Copied!') } catch { toast.error('Copy failed.') } }

  if (loading) return (
    <div className="min-h-screen mesh-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="h-9 w-32 bg-muted animate-pulse rounded-xl mb-8" />
        <Skeleton />
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Trip Not Found</h2>
        <p className="text-muted-foreground mb-6 text-sm">This trip may have been deleted.</p>
        <Link to="/my-trips">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen mesh-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <Link to="/my-trips">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium transition-all shadow-sm">
              <ArrowLeft className="w-4 h-4" /> My Trips
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium transition-all">
              <Copy className="w-4 h-4" /> Copy
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleExport}
              className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold">
              <Download className="w-4 h-4" /> Export
            </motion.button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" /> AI-Generated Itinerary
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <InfoSection trip={trip} />
        </motion.div>

        {/* Sticky section tabs */}
        <div className="sticky top-16 z-30 my-6">
          <div className="glass rounded-2xl border border-border/60 p-1 flex gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {SECTIONS.map(({ id, label, Icon: TabIcon }) => (
              <button key={id} onClick={() => setActive(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  active === id ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}>
                {React.createElement(TabIcon, { className: 'w-3.5 h-3.5' })}{label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={active}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>

            {active === 'overview' && (
              <div className="space-y-6">
                <Hotels          trip={trip} />
                <div className="h-px bg-border" />
                <PlacesToVisit   trip={trip} />
                <div className="h-px bg-border" />
                <TripTimeline    trip={trip} />
                <TripAIChat      trip={trip} />
                <BudgetEstimator trip={trip} tripId={tripId} />
                <TripExpenses    tripId={tripId} />
                <CurrencyConverter />
                <TripNotes       tripId={tripId} />
                <TripRating      tripId={tripId} />
                <TripChecklist   trip={trip} />
              </div>
            )}

            {active === 'hotels'    && <Hotels trip={trip} />}
            {active === 'itinerary' && <PlacesToVisit trip={trip} />}
            {active === 'map'       && <TripMapView trip={trip} />}
            {active === 'weather'   && <WeatherWidget trip={trip} />}
            {active === 'budget'    && <BudgetEstimator trip={trip} tripId={tripId} />}
            {active === 'expenses'  && <TripExpenses tripId={tripId} />}
            {active === 'converter' && <CurrencyConverter />}
            {active === 'timeline'  && <TripTimeline trip={trip} />}
            {active === 'ai'        && <TripAIChat trip={trip} />}
            {active === 'notes'     && <TripNotes tripId={tripId} />}
            {active === 'rating'    && <TripRating tripId={tripId} />}
            {active === 'packing'   && <TripChecklist trip={trip} />}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
