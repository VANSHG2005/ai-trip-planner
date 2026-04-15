import React, { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, Eye, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'

const getWeatherCode = (code) => {
  if (code === 0)   return { label: 'Clear Sky',      Icon: Sun,       color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/10' }
  if (code <= 3)    return { label: 'Partly Cloudy',  Icon: Cloud,     color: 'text-slate-500',  bg: 'bg-slate-50 dark:bg-slate-500/10' }
  if (code <= 67)   return { label: 'Rainy',          Icon: CloudRain, color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10' }
  if (code <= 77)   return { label: 'Snowy',          Icon: CloudSnow, color: 'text-cyan-500',   bg: 'bg-cyan-50 dark:bg-cyan-500/10' }
  return              { label: 'Stormy',          Icon: CloudRain, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' }
}

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function WeatherWidget({ trip }) {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const [unit, setUnit] = useState('C')

  const coords = trip?.userSelection?.location?.properties
  const lat = coords?.lat
  const lon = coords?.lon
  const locationName = coords?.formatted?.split(',')[0] || 'Destination'

  const toF = (c) => Math.round(c * 9 / 5 + 32)
  const display = (c) => unit === 'C' ? `${Math.round(c)}°C` : `${toF(c)}°F`

  const load = useCallback(async () => {
    if (!lat || !lon) return
    setLoading(true)
    setError(null)
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m,apparent_temperature,visibility&daily=weathercode,temperature_2m_max,temperature_2m_min&temperature_unit=celsius&timezone=auto&forecast_days=7`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Weather fetch failed')
      setWeather(await res.json())
    } catch {
      setError('Could not load weather data.')
    } finally {
      setLoading(false)
    }
  }, [lat, lon])

  // Auto-load on mount
  useEffect(() => { load() }, [load])

  if (!lat || !lon) return null

  const current = weather?.current
  const daily = weather?.daily
  const cond = current ? getWeatherCode(current.weathercode) : null
  const WeatherIcon = cond?.Icon || Sun

  return (
    <div className="card-premium overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer select-none"
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${cond?.bg || 'bg-amber-50 dark:bg-amber-500/10'}`}>
            <WeatherIcon className={`w-5 h-5 ${cond?.color || 'text-amber-500'}`} />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>
              Weather in {locationName}
            </p>
            {loading && <p className="text-xs text-muted-foreground">Loading...</p>}
            {!loading && current && (
              <p className="text-xs text-muted-foreground">{display(current.temperature_2m)} · {cond?.label}</p>
            )}
            {!loading && error && <p className="text-xs text-red-500">{error}</p>}
            {!loading && !current && !error && <p className="text-xs text-muted-foreground">Click to expand</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            role="button"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); load(); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); load(); } }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && !loading && weather && current && (
          <div className="border-t border-border">
            <div className="px-5 pb-5">
              {/* °C / °F toggle */}
              <div className="flex justify-end mt-3 mb-4">
                <div className="flex rounded-xl border border-border overflow-hidden text-xs font-semibold">
                  {['C', 'F'].map(u => (
                    <div key={u} role="button" tabIndex={0}
                      onClick={() => setUnit(u)}
                      onKeyDown={e => e.key === 'Enter' && setUnit(u)}
                      className={`px-3 py-1.5 transition-colors cursor-pointer ${unit === u ? 'bg-primary text-white' : 'hover:bg-muted text-muted-foreground'}`}>
                      °{u}
                    </div>
                  ))}
                </div>
              </div>

              {/* Current stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { Icon: Thermometer, label: 'Feels like', value: display(current.apparent_temperature) },
                  { Icon: Droplets,    label: 'Humidity',   value: `${current.relativehumidity_2m}%` },
                  { Icon: Wind,        label: 'Wind',       value: `${Math.round(current.windspeed_10m)} km/h` },
                  { Icon: Eye,         label: 'Visibility', value: current.visibility ? `${Math.round(current.visibility / 1000)}km` : 'N/A' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-2xl bg-muted/40 text-center">
                    <item.Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="text-sm font-bold">{item.value}</p>
                  </div>
                ))}
              </div>

              {/* 7-day forecast */}
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">7-Day Forecast</p>
              <div className="grid grid-cols-7 gap-1">
                {daily?.time?.map((date, i) => {
                  const d = new Date(date)
                  const c = getWeatherCode(daily.weathercode[i])
                  const DayIcon = c.Icon
                  return (
                    <div key={date} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-muted/40 transition-colors">
                      <p className="text-xs text-muted-foreground font-medium">{DAYS[d.getDay()]}</p>
                      <DayIcon className={`w-4 h-4 ${c.color}`} />
                      <p className="text-xs font-bold">{display(daily.temperature_2m_max[i])}</p>
                      <p className="text-xs text-muted-foreground">{display(daily.temperature_2m_min[i])}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WeatherWidget
