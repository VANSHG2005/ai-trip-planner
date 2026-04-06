import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoverPhotoUrl } from '@/service/GlobalApi'
import { Calendar, Trash2, Users } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export default function UserTripCard({ trip, onDelete, isShared = false }) {
  const [photoUrl,     setPhotoUrl]     = useState(null)
  const [imageLoading, setImageLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!trip) return
    const formatted = trip.userSelection?.location?.properties?.formatted
    if (!formatted) { setImageLoading(false); return }
    getCoverPhotoUrl(formatted)
      .then(url => setPhotoUrl(url))
      .catch(() => {})
      .finally(() => setImageLoading(false))
  }, [trip])

  const location = trip.userSelection?.location?.properties?.formatted
  const budget   = trip.userSelection?.budget
  const noOfDays = trip.userSelection?.noOfDays
  const traveler = trip.userSelection?.traveler

  return (
    <div
      className="group relative overflow-hidden rounded-2xl shadow-lg h-70 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      onClick={() => navigate('/view-trip/' + trip.id)}>

      {imageLoading && <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse" />}

      {photoUrl && (
        <img src={photoUrl}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          alt={location}
          onLoad={() => setImageLoading(false)}
          style={{ opacity: imageLoading ? 0 : 1, transition: 'opacity 0.5s' }}
        />
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h2 className="text-lg font-bold truncate" style={{ fontFamily: 'Sora, sans-serif' }}>
          {location}
        </h2>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {budget   && <p className="text-xs text-gray-300">💰 {budget}</p>}
          {traveler && <p className="text-xs text-gray-300">· 👥 {traveler}</p>}
        </div>
      </div>

      {/* Days badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-white text-xs backdrop-blur-sm">
        <Calendar className="h-3 w-3" />{noOfDays} Days
      </div>

      {/* Shared badge */}
      {isShared && (
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-primary/80 px-2.5 py-1 text-white text-xs backdrop-blur-sm">
          <Users className="h-3 w-3" /> Shared
        </div>
      )}

      {/* Delete — owned trips only */}
      {!isShared && onDelete && (
        <div className="absolute top-2 left-2 z-10" onClick={e => e.stopPropagation()}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon"
                className="h-8 w-8 rounded-full bg-red-600/80 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your trip to <strong>{location}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                  Yes, delete it
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}
