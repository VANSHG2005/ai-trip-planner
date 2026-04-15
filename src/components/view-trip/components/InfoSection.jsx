import React, { useEffect, useState } from 'react'
import { getPhotoUrl } from '@/service/GlobalApi'
import { toast } from 'sonner'
import { Share2, Calendar, DollarSign, Users, CheckCircle2 } from 'lucide-react'

function InfoSection({ trip }) {
  const [photoUrl, setPhotoUrl] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!trip) return
    const q = trip?.userSelection?.location?.properties?.formatted
    if (!q) return
    getPhotoUrl(q).then(url => setPhotoUrl(url)).catch(() => {})
  }, [trip])

  const handleShare = async () => {
    const url = window.location.href
    const dest = trip?.userSelection?.location?.properties?.formatted || 'this trip'
    if (navigator.share) {
      try { await navigator.share({ title: `My trip to ${dest}`, text: 'Check out my AI-generated itinerary!', url }) }
      catch (err) { if (err.name !== 'AbortError') console.warn(err) }
    } else {
      try { await navigator.clipboard.writeText(url); toast.success('Link copied!') }
      catch { toast.error('Failed to copy link.') }
    }
  }

  const tags = [
    { icon: Calendar,    label: `${trip?.userSelection?.noOfDays} Days`,          color: 'blue' },
    { icon: DollarSign,  label: `${trip?.userSelection?.budget} Budget`,           color: 'emerald' },
    { icon: Users,       label: trip?.userSelection?.traveler,                     color: 'violet' },
  ]

  return (
    <div>
      {/* Hero image */}
      <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden shadow-xl mb-6"
        style={{ background: 'linear-gradient(135deg,#dbeafe,#ede9fe)' }}>
        {!imgLoaded && !imgError && <div className="absolute inset-0 animate-shimmer" />}
        {(!photoUrl || imgError) && imgLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20">🌍</div>
        )}
        {photoUrl && !imgError && (
          <img src={photoUrl} alt={trip?.userSelection?.location?.properties?.formatted}
            className="w-full h-full object-cover"
            style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.6s' }}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true) }}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight max-w-lg"
            style={{ fontFamily: 'Sora, sans-serif', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            {trip?.userSelection?.location?.properties?.formatted}
          </h1>
          <div role="button" tabIndex={0} onClick={handleShare} onKeyDown={e => e.key === 'Enter' && handleShare()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20 backdrop-blur border border-white/30 text-white text-sm font-medium hover:bg-white/30 transition-all cursor-pointer select-none shrink-0">
            <Share2 className="w-4 h-4" /> Share
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-3">
        {tags.map(tag => tag.label && (
          <div key={tag.label}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-medium ${
              tag.color === 'blue'    ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400' :
              tag.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
              'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 text-violet-700 dark:text-violet-400'
            }`}>
            <tag.icon className="w-4 h-4" />
            {tag.label}
          </div>
        ))}
      </div>

      {/* AI Travel Notes */}
      {trip?.tripData?.tripData?.notes && (
        <div className="mt-5 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
          <div className="flex gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{trip.tripData.tripData.notes}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoSection
