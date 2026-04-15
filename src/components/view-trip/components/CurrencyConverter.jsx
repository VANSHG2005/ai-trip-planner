import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeftRight, ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'

let RATE_CACHE = null
let CACHE_TS   = 0

export default function CurrencyConverter() {
  const { currency: ctxCurrency, currencies = [] } = useCurrency()
  const [expanded, setExpanded] = useState(false)
  const [amount,   setAmount]   = useState('100')
  const [from,     setFrom]     = useState('USD')
  const [to,       setTo]       = useState(() => ctxCurrency?.code || 'INR')
  const [rates,    setRates]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [lastUpd,  setLastUpd]  = useState(null)

  // Sync 'to' with global currency context
  useEffect(() => {
    if (ctxCurrency?.code) setTo(ctxCurrency.code)
  }, [ctxCurrency?.code])

  const fetchRates = useCallback(async (force = false) => {
    const now = Date.now()
    if (!force && RATE_CACHE && now - CACHE_TS < 3_600_000) {
      setRates(RATE_CACHE); setLastUpd(new Date(CACHE_TS)); return
    }
    setLoading(true); setError(null)
    try {
      const res  = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = await res.json()
      if (data.result === 'success') {
        RATE_CACHE = data.rates; CACHE_TS = now
        setRates(data.rates); setLastUpd(new Date())
      } else throw new Error('Bad response')
    } catch {
      setError('Using offline estimates.')
      setRates({ USD:1, EUR:0.92, GBP:0.79, JPY:149.5, INR:83.1, AUD:1.52, CAD:1.36,
                 CHF:0.88, SGD:1.34, AED:3.67, THB:35.1, IDR:15600, MYR:4.68, HKD:7.82,
                 NZD:1.63, KRW:1325, CNY:7.23, MXN:17.2, BRL:4.97, ZAR:18.6 })
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { if (expanded) fetchRates() }, [expanded, fetchRates])

  const convert = () => {
    if (!rates || !amount) return '—'
    const n = parseFloat(amount)
    if (isNaN(n)) return '—'
    const usd = from === 'USD' ? n : n / (rates[from] || 1)
    const res = to === 'USD' ? usd : usd * (rates[to] || 1)
    return res >= 1000
      ? res.toLocaleString('en', { maximumFractionDigits: 0 })
      : res.toLocaleString('en', { maximumFractionDigits: 2 })
  }

  const swap = () => { setFrom(to); setTo(from) }
  const fromC = currencies.find(c => c.code === from)
  const toC   = currencies.find(c => c.code === to)

  return (
    <div className="card-premium overflow-hidden">
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 cursor-pointer select-none transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Currency Converter</p>
            <p className="text-xs text-muted-foreground">Live rates · {currencies.length} currencies</p>
          </div>
        </div>
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> :
          expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-border space-y-4 pt-4">
              {error && <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-xl">{error}</p>}

              <div>
                <label className="text-xs text-muted-foreground font-medium mb-1.5 block">Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0"
                  className="w-full text-2xl font-bold px-4 py-3 rounded-2xl border border-border bg-card focus:outline-none focus:border-primary transition-colors"
                  placeholder="100" />
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">From</label>
                  <div className="relative">
                    <select value={from} onChange={e => setFrom(e.target.value)}
                      className="w-full appearance-none text-sm px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:border-primary pr-8 cursor-pointer">
                      {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <button onClick={swap}
                  className="mb-0.5 w-10 h-10 rounded-2xl border border-border bg-muted flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all cursor-pointer shrink-0">
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground font-medium mb-1.5 block">To</label>
                  <div className="relative">
                    <select value={to} onChange={e => setTo(e.target.value)}
                      className="w-full appearance-none text-sm px-3 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:border-primary pr-8 cursor-pointer">
                      {currencies.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-linear-to-r from-primary/10 to-violet-500/10 border border-primary/20 text-center">
                <p className="text-xs text-muted-foreground mb-1">{fromC?.flag} {amount || 0} {from} =</p>
                <p className="text-4xl font-bold gradient-text" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {loading ? '…' : `${toC?.symbol}${convert()}`}
                </p>
                <p className="text-sm font-medium mt-0.5 text-muted-foreground">{toC?.name}</p>
                {rates && (
                  <p className="text-xs text-muted-foreground mt-2">
                    1 {from} = {toC?.symbol}{from === 'USD'
                      ? (rates[to] || 1).toFixed(4)
                      : ((rates[to] || 1) / (rates[from] || 1)).toFixed(4)} {to}
                  </p>
                )}
              </div>

              {rates && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Quick Reference</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 50, 100, 200, 500, 1000].map(n => {
                      const usd  = from === 'USD' ? n : n / (rates[from] || 1)
                      const conv = to === 'USD' ? usd : usd * (rates[to] || 1)
                      const str  = conv >= 1000
                        ? conv.toLocaleString('en', { maximumFractionDigits: 0 })
                        : conv.toLocaleString('en', { maximumFractionDigits: 2 })
                      return (
                        <div key={n} onClick={() => setAmount(String(n))}
                          className="p-2 rounded-xl bg-muted/40 border border-border text-center cursor-pointer hover:border-primary/30 transition-colors">
                          <p className="text-xs text-muted-foreground">{from} {n}</p>
                          <p className="text-xs font-bold">{toC?.symbol}{str}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {lastUpd && (
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Updated {lastUpd.toLocaleTimeString()}</p>
                  <button onClick={() => fetchRates(true)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline cursor-pointer">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
