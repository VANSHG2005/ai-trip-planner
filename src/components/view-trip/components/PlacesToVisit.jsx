import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import PlaceCard from './PlaceCard'
import { Map, Calendar, Grid3X3, List, ChevronDown } from 'lucide-react'

function PlacesToVisit({ trip }) {
  const itinerary = trip?.tripData?.tripData?.itinerary || []
  const [activeDay, setActiveDay] = useState('all')
  const [viewMode,  setViewMode]  = useState('timeline')

  const totalActivities = itinerary.reduce((a, d) => a + (d.activities?.length || 0), 0)

  // KEY FIX: compute a global starting index for each day
  // Day 0 activities: globalIndex 0,1,2,3
  // Day 1 activities: globalIndex 4,5,6,7
  // Day 2 activities: globalIndex 8,9,10,11 ... etc
  // This ensures EVERY activity across ALL days gets a unique integer,
  // so getPhotoUrl picks a different image for each one.
  const dayOffsets = []
  let running = 0
  for (const day of itinerary) {
    dayOffsets.push(running)
    running += day.activities?.length || 0
  }

  const displayedDays = activeDay === 'all'
    ? itinerary
    : [itinerary[Number(activeDay)]].filter(Boolean)

  const getOffset = (displayIdx) =>
    activeDay === 'all'
      ? dayOffsets[displayIdx] ?? 0
      : dayOffsets[Number(activeDay)] ?? 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Daily Itinerary</h2>
            <p className="text-sm text-muted-foreground">{itinerary.length} days · {totalActivities} activities</p>
          </div>
        </div>
        <div className="flex items-center rounded-xl border border-border overflow-hidden">
          {[{ id: 'timeline', Icon: List }, { id: 'grid', Icon: Grid3X3 }].map(({ id, Icon }) => ( // eslint-disable-line no-unused-vars
            <div key={id} role="button" tabIndex={0}
              onClick={() => setViewMode(id)}
              onKeyDown={e => e.key === 'Enter' && setViewMode(id)}
              className={`w-8 h-8 flex items-center justify-center transition-colors cursor-pointer ${viewMode === id ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
          ))}
        </div>
      </div>

      {itinerary.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <div role="button" tabIndex={0}
            onClick={() => setActiveDay('all')}
            onKeyDown={e => e.key === 'Enter' && setActiveDay('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${activeDay === 'all' ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
            All Days
          </div>
          {itinerary.map((_, i) => (
            <div key={i} role="button" tabIndex={0}
              onClick={() => setActiveDay(String(i))}
              onKeyDown={e => e.key === 'Enter' && setActiveDay(String(i))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${activeDay === String(i) ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:border-primary/30'}`}>
              Day {i + 1}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {viewMode === 'timeline' ? (
          <div key="timeline" className="space-y-8">
            {displayedDays.map((item, displayIdx) => (
              <DayBlock
                key={displayIdx}
                item={item}
                dayNumber={activeDay === 'all' ? displayIdx + 1 : Number(activeDay) + 1}
                isLast={displayIdx === displayedDays.length - 1}
                globalOffset={getOffset(displayIdx)}
              />
            ))}
          </div>
        ) : (
          <div key="grid" className="space-y-6">
            {displayedDays.map((item, displayIdx) => {
              const offset = getOffset(displayIdx)
              return (
                <div key={displayIdx}>
                  <h3 className="font-bold text-base mb-3 flex items-center gap-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                    <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {activeDay === 'all' ? displayIdx + 1 : Number(activeDay) + 1}
                    </span>
                    {item.day}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {item.activities?.map((place, pi) => (
                      <PlaceCard key={pi} place={place} globalIndex={offset + pi} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DayBlock({ item, dayNumber, isLast, globalOffset }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="relative flex gap-5">
      <div className="shrink-0 flex flex-col items-center">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-lg z-10 select-none">
          {dayNumber}
        </div>
        {!isLast && <div className="flex-1 w-0.5 bg-linear-to-b from-violet-300/60 via-violet-200/40 to-transparent mt-1.5 min-h-8" />}
      </div>
      <div className="flex-1 pb-4">
        <div role="button" tabIndex={0}
          onClick={() => setCollapsed(c => !c)}
          onKeyDown={e => e.key === 'Enter' && setCollapsed(c => !c)}
          className="w-full flex items-center justify-between gap-2 mb-4 cursor-pointer select-none">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{item.day}</h3>
            {item.bestTimeToVisit && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium border border-border">
                <Calendar className="w-3 h-3" />{item.bestTimeToVisit}
              </span>
            )}
            <span className="text-xs text-muted-foreground">{item.activities?.length} activities</span>
          </div>
          <div style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        {!collapsed && (
          <div className="space-y-3">
            {item.activities?.map((place, pi) => (
              <PlaceCard key={pi} place={place} globalIndex={globalOffset + pi} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlacesToVisit

