import React, { useState, useEffect } from 'react'
import { getPhotoUrl } from '@/service/GlobalApi'
import { Clock, Ticket, ExternalLink, ChevronDown, ChevronUp, Utensils, Camera, MapPin, TreePine, Waves } from 'lucide-react'

const detectCat = (name = '', details = '') => {
  const t = (name + ' ' + details).toLowerCase()
  if (t.match(/\bpub\b|\barms\b|\btavern\b/))                          return 'food'
  if (t.match(/bakery|patisserie|cake\b/))                             return 'food'
  if (t.match(/café|cafe|coffee/))                                     return 'food'
  if (t.match(/restaurant|dinner|lunch|breakfast|dining|bistro|brasserie|roast|curry/)) return 'food'
  if (t.match(/theatre|theater|musical|opera/))                        return 'culture'
  if (t.match(/museum|gallery|exhibit|tate\b/))                        return 'culture'
  if (t.match(/palace|fort\b|castle|abbey|heritage|monument/))         return 'culture'
  if (t.match(/beach|coast|sea\b|ocean|island|bay\b/))                 return 'beach'
  if (t.match(/park\b|garden\b|green\b/))                              return 'nature'
  if (t.match(/forest|jungle|nature|mountain|valley/))                 return 'nature'
  if (t.match(/waterfall|falls\b|rapids/))                             return 'adventure'
  if (t.match(/rafting|kayak|bungee|zipline|trek|hike|climb/))         return 'adventure'
  if (t.match(/yoga|meditation|ashram/))                               return 'spiritual'
  if (t.match(/ghat|aarti|ganges|ganga|temple|mandir|shrine|mosque|church|cathedral/)) return 'spiritual'
  return 'attraction'
}

const STYLES = {
  food:       { Icon: Utensils, bg: 'bg-orange-100 dark:bg-orange-500/20', text: 'text-orange-600 dark:text-orange-400' },
  culture:    { Icon: Camera,   bg: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-600 dark:text-violet-400' },
  beach:      { Icon: Waves,    bg: 'bg-cyan-100 dark:bg-cyan-500/20',     text: 'text-cyan-600 dark:text-cyan-400'     },
  nature:     { Icon: TreePine, bg: 'bg-emerald-100 dark:bg-emerald-500/20',text:'text-emerald-600 dark:text-emerald-400'},
  adventure:  { Icon: MapPin,   bg: 'bg-blue-100 dark:bg-blue-500/20',    text: 'text-blue-600 dark:text-blue-400'     },
  spiritual:  { Icon: MapPin,   bg: 'bg-amber-100 dark:bg-amber-500/20',  text: 'text-amber-600 dark:text-amber-400'   },
  attraction: { Icon: MapPin,   bg: 'bg-blue-100 dark:bg-blue-500/20',    text: 'text-blue-600 dark:text-blue-400'     },
}

// globalIndex: unique int across ALL activities — prevents same photo on different cards
function PlaceCard({ place, globalIndex = 0 }) {
  const [photoUrl, setPhotoUrl] = useState(null)
  const [loaded,   setLoaded]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const cat   = detectCat(place.placeName, place.placeDetails)
  const style = STYLES[cat] || STYLES.attraction
  const { Icon } = style

  // Strip verb prefix for map link
  const clean = place.placeName
    .replace(/^(Dinner at |Lunch at |Breakfast at |Visit |Explore |See |Stroll through |Wander around )/i, '')
    .replace(/ \(.*/, '').replace(/ - .*/, '').trim()

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean)}`

  useEffect(() => {
    let cancelled = false
    // NEVER use place.placeImageUrl — always broken CDN URLs from AI
    getPhotoUrl(place.placeName, globalIndex).then(url => {
      if (!cancelled) setPhotoUrl(url)
    })
    return () => { cancelled = true }
  }, [place.placeName, globalIndex])

  const isFree = (place.ticketPricing || '').toLowerCase().includes('free')

  return (
    <div className="card-premium overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="flex">
        <div className="relative shrink-0 overflow-hidden"
          style={{ width: '7.5rem', minHeight: '9rem', background: 'linear-gradient(135deg,#f1f5f9,#e2e8f0)' }}>
          {!loaded && <div className="absolute inset-0 animate-shimmer" />}
          {(!photoUrl || imgError) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.bg}`}>
                <Icon className={`w-6 h-6 ${style.text}`} />
              </div>
            </div>
          )}
          {photoUrl && !imgError && (
            <img src={photoUrl} alt={clean}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s', minHeight: '9rem' }}
              onLoad={() => setLoaded(true)}
              onError={() => { setImgError(true); setLoaded(true) }}
            />
          )}
          <div className={`absolute top-2 left-2 w-7 h-7 rounded-xl flex items-center justify-center shadow ${style.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${style.text}`} />
          </div>
        </div>

        <div className="flex-1 p-4 min-w-0 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h4 className="font-bold text-sm leading-snug line-clamp-2" style={{ fontFamily: 'Sora, sans-serif' }}>
                {place.placeName}
              </h4>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                <div className="shrink-0 w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 cursor-pointer">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            </div>
            <p className={`text-xs text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {place.placeDetails}
            </p>
            {(place.placeDetails || '').length > 100 && (
              <button onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-0.5 text-xs text-primary font-medium mt-1 hover:underline cursor-pointer">
                {expanded ? <><ChevronUp className="w-3 h-3" />Less</> : <><ChevronDown className="w-3 h-3" />More</>}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2.5 pt-2.5 border-t border-border/50">
            {place.timeSpent && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 text-primary shrink-0" />{place.timeSpent}
              </span>
            )}
            {place.ticketPricing && (
              <span className={`flex items-center gap-1 text-xs font-medium ${isFree ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                <Ticket className="w-3 h-3 text-primary shrink-0" />{place.ticketPricing}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceCard
