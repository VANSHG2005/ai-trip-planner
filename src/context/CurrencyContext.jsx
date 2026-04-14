import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CURRENCIES = [
  { code:'USD', symbol:'$',   name:'US Dollar',         flag:'🇺🇸' },
  { code:'EUR', symbol:'€',   name:'Euro',               flag:'🇪🇺' },
  { code:'GBP', symbol:'£',   name:'British Pound',      flag:'🇬🇧' },
  { code:'INR', symbol:'₹',   name:'Indian Rupee',       flag:'🇮🇳' },
  { code:'JPY', symbol:'¥',   name:'Japanese Yen',       flag:'🇯🇵' },
  { code:'AUD', symbol:'A$',  name:'Australian Dollar',  flag:'🇦🇺' },
  { code:'CAD', symbol:'C$',  name:'Canadian Dollar',    flag:'🇨🇦' },
  { code:'SGD', symbol:'S$',  name:'Singapore Dollar',   flag:'🇸🇬' },
  { code:'AED', symbol:'د.إ', name:'UAE Dirham',         flag:'🇦🇪' },
  { code:'CHF', symbol:'Fr',  name:'Swiss Franc',        flag:'🇨🇭' },
  { code:'CNY', symbol:'¥',   name:'Chinese Yuan',       flag:'🇨🇳' },
  { code:'MYR', symbol:'RM',  name:'Malaysian Ringgit',  flag:'🇲🇾' },
  { code:'THB', symbol:'฿',   name:'Thai Baht',          flag:'🇹🇭' },
  { code:'HKD', symbol:'HK$', name:'Hong Kong Dollar',   flag:'🇭🇰' },
  { code:'KRW', symbol:'₩',   name:'South Korean Won',   flag:'🇰🇷' },
  { code:'NZD', symbol:'NZ$', name:'New Zealand Dollar', flag:'🇳🇿' },
  { code:'MXN', symbol:'$',   name:'Mexican Peso',       flag:'🇲🇽' },
  { code:'BRL', symbol:'R$',  name:'Brazilian Real',     flag:'🇧🇷' },
  { code:'IDR', symbol:'Rp',  name:'Indonesian Rupiah',  flag:'🇮🇩' },
  { code:'ZAR', symbol:'R',   name:'South African Rand', flag:'🇿🇦' },
]

// Static fallback rates (USD base)
const STATIC = {
  USD:1, EUR:0.92, GBP:0.79, INR:83.5, JPY:149.5,
  AUD:1.53, CAD:1.36, SGD:1.34, AED:3.67, CHF:0.89,
  CNY:7.24, MYR:4.72, THB:35.1, HKD:7.82, KRW:1325,
  NZD:1.63, MXN:17.2, BRL:4.97, IDR:15600, ZAR:18.6,
}

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try {
      const saved = localStorage.getItem('tc_currency')
      return saved ? JSON.parse(saved) : CURRENCIES[0]
    } catch { return CURRENCIES[0] }
  })
  const [rates, setRates] = useState(STATIC)

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d?.rates) setRates(d.rates) })
      .catch(() => {})
  }, [])

  const setCurrency = useCallback((c) => {
    setCurrencyState(c)
    try { localStorage.setItem('tc_currency', JSON.stringify(c)) } catch {
      // Ignore storage failures (private mode/quota issues).
    }
  }, [])

  // Convert a USD number to selected currency value (number)
  const convert = useCallback((usd) => {
    const r = rates[currency.code] || 1
    return Math.round(usd * r)
  }, [rates, currency.code])

  // formatAmount: converts a USD number → "₹4,175"
  const formatAmount = useCallback((usd) => {
    const n = convert(usd)
    return `${currency.symbol}${n.toLocaleString()}`
  }, [convert, currency])

  // formatPrice: converts "$50-$100" strings → "₹4,175–₹8,350"
  const formatPrice = useCallback((str) => {
    if (!str) return ''
    if (currency.code === 'USD') return str
    const s = String(str).trim()
    if (/^free$/i.test(s)) return s
    const r = rates[currency.code] || 1
    const converted = s.replace(/\$\s*([\d,]+)/g, (_, n) => {
      const num = parseFloat(n.replace(/,/g, ''))
      return `${currency.symbol}${Math.round(num * r).toLocaleString()}`
    })
    if (converted === s) {
      // Try INR ₹ pattern as fallback
      return s.replace(/₹\s*([\d,]+)/g, (_, n) => {
        const inr = parseFloat(n.replace(/,/g, ''))
        const usd = inr / (rates['INR'] || 83.5)
        return `${currency.symbol}${Math.round(usd * r).toLocaleString()}`
      })
    }
    return converted
  }, [rates, currency])

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, currencies: CURRENCIES, convert, formatAmount, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider')
  return ctx
}
