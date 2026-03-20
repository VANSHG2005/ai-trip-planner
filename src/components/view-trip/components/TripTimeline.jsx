import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, ChevronDown, ChevronUp, Clock, Plane, CheckCircle2, Circle } from 'lucide-react'

export default function TripTimeline({ trip }) {
  const [expanded,    setExpanded]    = useState(false)
  const [startDate,   setStartDate]   = useState('')
  const [checkedDays, setCheckedDays] = useState({})

  const itinerary = trip?.tripData?.tripData?.itinerary || []
  const days      = Number(trip?.userSelection?.noOfDays || itinerary.length || 0)
  const location  = trip?.userSelection?.location?.properties?.formatted || 'your destination'

  // Compute countdown
  const today = new Date(); today.setHours(0,0,0,0)
  const start = startDate ? new Date(startDate) : null
  const daysUntil = start ? Math.ceil((start - today) / 86400000) : null
  const tripEnd   = start ? new Date(start.getTime() + (days - 1) * 86400000) : null

  const toggleDay = (i) => setCheckedDays(prev => ({ ...prev, [i]: !prev[i] }))
  const doneCount = Object.values(checkedDays).filter(Boolean).length

  return (
    <div className="card-premium overflow-hidden">
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 cursor-pointer select-none transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Trip Countdown</p>
            <p className="text-xs text-muted-foreground">
              {daysUntil !== null
                ? daysUntil > 0 ? `${daysUntil} days until departure ✈️`
                  : daysUntil === 0 ? '🎉 Trip starts today!'
                  : `Trip in progress · Day ${Math.abs(daysUntil) + 1}`
                : `${days}-day trip · Set your start date`}
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

              {/* Date picker */}
              <div className="mt-4 mb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  Trip Start Date
                </label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full text-sm px-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:border-primary transition-colors" />
              </div>

              {/* Countdown card */}
              {start && (
                <div className="mb-5 p-4 rounded-2xl bg-linear-to-r from-sky-500/10 to-blue-600/10 border border-sky-500/20">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <Plane className="w-6 h-6 text-sky-500" />
                      <div>
                        <p className="font-bold text-sm">
                          {daysUntil > 0 ? `${daysUntil} days to go!`
                            : daysUntil === 0 ? "Today's the day! 🎉"
                            : `Day ${Math.abs(daysUntil) + 1} of ${days}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {start.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                          {tripEnd && ` → ${tripEnd.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`}
                        </p>
                      </div>
                    </div>
                    {daysUntil !== null && daysUntil <= 0 && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="text-sm font-bold text-sky-500">{doneCount}/{itinerary.length} days</p>
                      </div>
                    )}
                  </div>
                  {/* Progress bar */}
                  {itinerary.length > 0 && (
                    <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-sky-500 rounded-full transition-all"
                        style={{ width: `${(doneCount / itinerary.length) * 100}%` }} />
                    </div>
                  )}
                </div>
              )}

              {/* Day checklist */}
              {itinerary.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Day Tracker</p>
                  <div className="space-y-2">
                    {itinerary.map((day, i) => {
                      const dayDate = start ? new Date(start.getTime() + i * 86400000) : null
                      return (
                        <div key={i}
                          onClick={() => toggleDay(i)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${checkedDays[i] ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 opacity-70' : 'border-border hover:border-primary/30 hover:bg-muted/20'}`}>
                          {checkedDays[i]
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            : <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate ${checkedDays[i] ? 'line-through text-muted-foreground' : ''}`}>
                              {day.day}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {day.activities?.length || 0} activities
                              {dayDate && ` · ${dayDate.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="w-3 h-3" />
                            {day.bestTimeToVisit || 'Full Day'}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
