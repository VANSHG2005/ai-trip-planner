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
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',      flag: '🇨🇳' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  { code: 'THB', symbol: '฿',  name: 'Thai Baht',         flag: '🇹🇭' },
]

// Static fallback rates (USD base)
const STATIC = { 
  USD:1, EUR:0.92, GBP:0.79, INR:83.5, JPY:149.5, 
  AUD:1.53, CAD:1.36, SGD:1.34, AED:3.67, CHF:0.89, 
  CNY: 7.24, MYR: 4.72, THB: 35.1, 
}

const CurrencyContext = createContext(null)

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tc_currency')) || CURRENCIES[0] } catch { return CURRENCIES[0] }
  })
  const [rates, setRates] = useState(STATIC)

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json()).then(d => { if (d?.rates) setRates(d.rates) }).catch(() => {})
  }, [])

  const setCurrency = useCallback((c) => {
    setCurrencyState(c)
    try { localStorage.setItem('tc_currency', JSON.stringify(c)) } catch {
      // Silent fail if localStorage is unavailable
    }
  }, [])

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
      // Try INR ₹ pattern
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

export { CURRENCIES }
