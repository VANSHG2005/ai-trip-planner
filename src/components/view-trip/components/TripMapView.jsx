import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Map, ExternalLink, MapPin, Loader2 } from 'lucide-react'

// Fallback city coordinates so map always loads even without geoCoordinates in trip data
const CITY_COORDS = {
  'rishikesh': [30.0869, 78.2676], 'haridwar': [29.9457, 78.1642], 'mussoorie': [30.4598, 78.0664],
  'delhi': [28.6139, 77.2090], 'new delhi': [28.6139, 77.2090], 'mumbai': [19.0760, 72.8777],
  'jaipur': [26.9124, 75.7873], 'agra': [27.1767, 78.0081], 'goa': [15.2993, 74.1240],
  'varanasi': [25.3176, 82.9739], 'kolkata': [22.5726, 88.3639], 'bangalore': [12.9716, 77.5946],
  'kerala': [10.8505, 76.2711], 'manali': [32.2396, 77.1887], 'shimla': [31.1048, 77.1734],
  'london': [51.5074, -0.1278], 'paris': [48.8566, 2.3522], 'rome': [41.9028, 12.4964],
  'barcelona': [41.3851, 2.1734], 'amsterdam': [52.3676, 4.9041], 'tokyo': [35.6762, 139.6503],
  'bali': [-8.3405, 115.0920], 'singapore': [1.3521, 103.8198], 'dubai': [25.2048, 55.2708],
  'new york': [40.7128, -74.0060], 'miami': [25.7617, -80.1918], 'bangkok': [13.7563, 100.5018],
  'sydney': [-33.8688, 151.2093], 'istanbul': [41.0082, 28.9784], 'kyoto': [35.0116, 135.7681],
  'prague': [50.0755, 14.4378], 'vienna': [48.2082, 16.3738], 'maldives': [3.2028, 73.2207],
}

function getCityCoords(trip) {
  const formatted = (trip?.userSelection?.location?.properties?.formatted || '').toLowerCase()
  const city = formatted.split(',')[0].trim()
  for (const [k, coords] of Object.entries(CITY_COORDS)) {
    if (city.includes(k) || k.includes(city.split(' ')[0])) return coords
  }
  // Try lat/lon from Geoapify location properties
  const props = trip?.userSelection?.location?.properties
  if (props?.lat && props?.lon) return [props.lat, props.lon]
  return [20.5937, 78.9629] // center of India fallback
}

export default function TripMapView({ trip }) {
  const containerRef     = useRef(null)
  const mapInstanceRef   = useRef(null)
  const [ready, setReady]   = useState(false)
  const [error, setError]   = useState(false)

  const itinerary = trip?.tripData?.tripData?.itinerary || []
  const hotels    = trip?.tripData?.tripData?.hotels    || []
  const location  = trip?.userSelection?.location?.properties

  // Collect places — including city-center fallback if no geoCoords
  const places = []
  const cityCenter = getCityCoords(trip)

  itinerary.forEach((day, di) => {
    day.activities?.forEach(act => {
      const lat = act.geoCoordinates?.latitude
      const lng = act.geoCoordinates?.longitude
      // Only add if coordinates look valid (not 0,0)
      if (lat && lng && (Math.abs(lat) > 0.01 || Math.abs(lng) > 0.01)) {
        places.push({ lat, lng, label: act.placeName, type: 'activity', day: di+1, detail: act.placeDetails?.slice(0,80) })
      }
    })
  })
  hotels.forEach(h => {
    const lat = h.geoCoordinates?.latitude
    const lng = h.geoCoordinates?.longitude
    if (lat && lng && (Math.abs(lat) > 0.01 || Math.abs(lng) > 0.01)) {
      places.push({ lat, lng, label: h.hotelName || h.hotel_name, type: 'hotel', detail: h.hotelAddress || '' })
    }
  })

  // If no coordinates from data, use city center
  const center = places.length > 0
    ? [places.reduce((s,p)=>s+p.lat,0)/places.length, places.reduce((s,p)=>s+p.lng,0)/places.length]
    : cityCenter
  const zoom = places.length > 0 ? 13 : 12

  const mapUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.formatted || '')}`
    : 'https://maps.google.com'

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Load Leaflet CSS + JS from CDN
    const loadLeaflet = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      if (!window.L) {
        await new Promise((res, rej) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = res
          script.onerror = rej
          document.head.appendChild(script)
        })
      }

      const L = window.L
      if (!L) { setError(true); return }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }

      try {
        const map = L.map(el, { zoomControl: true, scrollWheelZoom: false })
        mapInstanceRef.current = map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors', maxZoom: 19,
        }).addTo(map)
        map.setView(center, zoom)

        // Activity markers (blue)
        const actIcon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#6366f1);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:11px;"></div>`,
          iconSize: [28, 28], iconAnchor: [14, 14],
        })

        // Hotel markers (gold)
        const hotelIcon = L.divIcon({
          className: '',
          html: `<div style="width:28px;height:28px;border-radius:6px;background:linear-gradient(135deg,#f59e0b,#ef4444);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:10px;">H</div>`,
          iconSize: [28, 28], iconAnchor: [14, 14],
        })

        // City center pin if no place coordinates
        if (places.length === 0) {
          const cityIcon = L.divIcon({
            className: '',
            html: `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#8b5cf6,#3b82f6);border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:16px;">📍</div>`,
            iconSize: [36, 36], iconAnchor: [18, 18],
          })
          const dest = trip?.userSelection?.location?.properties?.formatted || 'Destination'
          L.marker(center, { icon: cityIcon }).addTo(map)
            .bindPopup(`<b>${dest}</b><br/><small>Your destination</small>`, { maxWidth: 200 })
        }

        places.forEach(p => {
          const icon = p.type === 'hotel' ? hotelIcon : actIcon
          L.marker([p.lat, p.lng], { icon }).addTo(map)
            .bindPopup(`<b>${p.label}</b>${p.day ? `<br/><small>Day ${p.day}</small>` : ''}${p.detail ? `<br/><small>${p.detail}…</small>` : ''}`, { maxWidth: 220 })
        })

        setReady(true)
      } catch (e) {
        console.error('Map error:', e)
        setError(true)
      }
    }

    loadLeaflet().catch(() => setError(true))

    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null }
    }
  }, [trip]) // eslint-disable-line

  return (
    <div className="card-premium overflow-hidden">
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>Interactive Map</h2>
            <p className="text-xs text-muted-foreground">
              {places.length > 0 ? `${places.filter(p=>p.type==='activity').length} activities · ${places.filter(p=>p.type==='hotel').length} hotels` : 'Destination overview'}
            </p>
          </div>
        </div>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="btn-primary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold">
            <ExternalLink className="w-3.5 h-3.5" /> Google Maps
          </motion.button>
        </a>
      </div>

      {/* Legend */}
      <div className="px-5 py-2.5 border-b border-border flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-linear-to-br from-blue-500 to-violet-600 border-2 border-background shadow" />
          <span className="text-xs text-muted-foreground">Activities</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-linear-to-br from-amber-500 to-red-500 border-2 border-background shadow" />
          <span className="text-xs text-muted-foreground">Hotels</span>
        </div>
        {places.length === 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-400">📍 Showing destination center (AI didn't provide coordinates)</span>
        )}
      </div>

      {/* Map container */}
      <div className="relative" style={{ height: '420px' }}>
        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading map…</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <Map className="w-12 h-12 text-muted-foreground/40" />
            <div>
              <p className="font-semibold">Map unavailable</p>
              <p className="text-sm text-muted-foreground mt-1">Could not load Leaflet — check internet connection.</p>
            </div>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
              <motion.button whileHover={{ scale: 1.05 }} className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold">
                <ExternalLink className="w-4 h-4" /> Open in Google Maps
              </motion.button>
            </a>
          </div>
        )}
        <div ref={containerRef} style={{ height: '100%', display: error ? 'none' : 'block' }} />
      </div>
    </div>
  )
}
