import React, { useState, useEffect } from 'react'
import { getPhotoUrl } from '@/service/GlobalApi'
import { Hotel, Star, MapPin } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

// Extract just the city name from address
const cityFromAddress = (addr = '') => {
  const parts = addr.split(',').map(s => s.trim()).filter(Boolean)
  // "157 Waterloo Rd, London SE1 8XA, United Kingdom" → "London"
  // Find the segment that looks like a city (no postcode, not "United Kingdom")
  const city = parts.find(p =>
    !p.match(/\d/) && !p.match(/united kingdom|uk|usa|india|australia/i) && p.length > 2
  )
  return city || parts[0] || ''
}

// Query strategies rotated by index → each card gets different photo
const buildQuery = (hotel, index) => {
  const city = cityFromAddress(hotel.hotelAddress || hotel.hotel_address || '')
  const strategies = [
    `${city} luxury hotel lobby interior`,
    `${city} boutique hotel bedroom`,
    `${city} hotel swimming pool`,
    `${city} hotel exterior architecture`,
    `${city} hotel rooftop terrace`,
    `${city} hotel lounge bar`,
    `hotel suite bedroom luxury`,
    `${city} city hotel modern`,
  ]
  return strategies[index % strategies.length]
}

function HotelCard({ hotel, index }) {
  const [photoUrl, setPhotoUrl] = useState(null)
  const [loaded,   setLoaded]   = useState(false)
  const [imgError, setImgError] = useState(false)
  const { formatPrice, currency } = useCurrency()

  useEffect(() => {
    let cancelled = false
    // CRITICAL: NEVER use hotel.hotelImageUrl — AI provides citizenM, PointA,
    // Hilton.com etc. which all return 404 or ERR_NAME_NOT_RESOLVED.
    // Always use our city-based query strategy instead.
    getPhotoUrl(buildQuery(hotel, index), index).then(url => {
      if (!cancelled) setPhotoUrl(url)
    })
    return () => { cancelled = true }
  }, [hotel.hotelName]) // eslint-disable-line

  // Price: extract dollar amounts, convert to selected currency
  const rawPrice = hotel.price_range || hotel.price_per_night_usd || ''
  const priceDisplay = formatPrice(
    rawPrice
      .replace(/per night/gi, '')
      .replace(/Starting from /gi, '')
      .trim()
  )

  const rating   = (hotel.rating || '').split('(')[0].trim()
  const name     = hotel.hotel_name || hotel.hotelName || 'Hotel'
  const addr     = hotel.hotel_address || hotel.hotelAddress || ''
  const mapUrl   = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${addr}`)}`

  return (
    <div className="card-premium overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-36 overflow-hidden" style={{ background: 'linear-gradient(135deg,#dbeafe,#ede9fe)' }}>
        {!loaded && <div className="absolute inset-0 animate-shimmer" />}

        {(!photoUrl || imgError) && loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Hotel className="w-10 h-10 text-blue-300 dark:text-blue-600" />
          </div>
        )}

        {photoUrl && !imgError && (
          <img src={photoUrl} alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s' }}
            onLoad={() => setLoaded(true)}
            onError={() => { setImgError(true); setLoaded(true) }}
          />
        )}

        {rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-xl bg-black/60 backdrop-blur text-white text-xs font-semibold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{rating}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-sm mb-0.5 line-clamp-1" style={{ fontFamily: 'Sora, sans-serif' }} title={name}>
          {name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1 mb-3" title={addr}>
          <MapPin className="w-3 h-3 shrink-0" />{addr}
        </p>
        <div className="flex items-center justify-between">
          {priceDisplay && (
            <div className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="text-xs">{currency.symbol}</span>{priceDisplay}
              <span className="text-muted-foreground font-normal">/night</span>
            </div>
          )}
          <a href={mapUrl} target="_blank" rel="noopener noreferrer">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer">
              <MapPin className="w-3 h-3" /> Map
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}

function Hotels({ trip }) {
  const hotels = trip?.tripData?.tripData?.hotels || []
  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
          <Hotel className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>Hotel Recommendations</h2>
          <p className="text-sm text-muted-foreground">{hotels.length} curated picks for your stay</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {hotels.map((hotel, i) => (
          <HotelCard key={hotel.hotelName || i} hotel={hotel} index={i} />
        ))}
      </div>
    </div>
  )
}

export default Hotels
