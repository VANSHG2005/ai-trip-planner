import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useOnClickOutside } from '@/hooks'

export default function CurrencyPicker() {
  const { currency, setCurrency, currencies } = useCurrency()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useOnClickOutside(ref, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold transition-all"
      >
        <span>{currency.flag}</span>
        <span className="hidden sm:inline">{currency.code}</span>
        <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-52 z-50 card-premium overflow-hidden"
            style={{ maxHeight: '280px', overflowY: 'auto' }}
          >
            <div className="p-1.5">
              <p className="text-xs font-semibold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">Currency</p>
              {currencies.map(c => (
                <button
                  key={c.code}
                  onClick={() => { setCurrency(c); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                    currency.code === c.code
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-xs">{c.code}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.name}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">{c.symbol}</span>
                  {currency.code === c.code && <Check className="w-3 h-3 text-primary shrink-0" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
