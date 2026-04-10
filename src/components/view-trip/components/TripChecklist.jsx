import React, { useState, useEffect } from 'react'
import { CheckSquare, Square, ChevronDown, ChevronUp, Plus, Trash2, RefreshCw, Package } from 'lucide-react'

const BASE_ITEMS = {
  '📄 Documents': ['Passport / ID','Travel insurance','Hotel confirmations','Flight tickets','Visa (if required)','Emergency contacts'],
  '👕 Clothing':  ['T-shirts','Pants / Shorts','Underwear & socks','Walking shoes','Jacket / Sweater','Pajamas'],
  '🧴 Toiletries':['Toothbrush & toothpaste','Shampoo','Deodorant','Sunscreen','Medications','First aid kit'],
  '📱 Electronics':['Phone charger','Power bank','Travel adapter','Earphones','Camera'],
  '🎒 Essentials': ['Cash & cards','Water bottle','Travel snacks','Travel pillow','Umbrella','Padlock'],
}

const CLIMATE_EXTRAS = {
  beach:     ['Swimwear','Beach towel','Flip flops','Sunglasses','Waterproof bag'],
  cold:      ['Thermal underwear','Gloves','Scarf','Warm hat','Heavy coat'],
  adventure: ['Hiking boots','Bug repellent','Waterproof backpack','Energy bars'],
}

function TripChecklist({ trip }) {
  const [expanded, setExpanded] = useState(false)
  const [checked, setChecked] = useState({})
  const [newItem, setNewItem] = useState('')
  const [customItems, setCustomItems] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)

  const loc = (trip?.userSelection?.location?.properties?.formatted || '').toLowerCase()
  const extras = []
  if (/beach|bali|maldives|phuket|goa|hawaii|miami/.test(loc)) extras.push(...CLIMATE_EXTRAS.beach)
  if (/iceland|norway|alaska|canada|himalayas|manali|shimla/.test(loc)) extras.push(...CLIMATE_EXTRAS.cold)
  if (/trek|hike|nepal|peru|adventure|rishikesh|mussoorie/.test(loc)) extras.push(...CLIMATE_EXTRAS.adventure)

  const allCategories = { ...BASE_ITEMS }
  if (extras.length > 0) allCategories['⭐ Destination Extras'] = extras

  const storageKey = `checklist-${trip?.id || 'default'}`

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}')
      setChecked(saved.checked || {})
      setCustomItems(saved.custom || [])
    } catch {}
  }, [storageKey])

  const persist = (ch, ci) => {
    try { localStorage.setItem(storageKey, JSON.stringify({ checked: ch, custom: ci })) } catch {}
  }

  const toggle = (item) => {
    const next = { ...checked, [item]: !checked[item] }
    setChecked(next); persist(next, customItems)
  }

  const addItem = () => {
    const t = newItem.trim(); if (!t) return
    const next = [...customItems, t]
    setCustomItems(next); setNewItem(''); persist(checked, next)
  }

  const removeCustom = (item) => {
    const next = customItems.filter(i => i !== item)
    setCustomItems(next); persist(checked, next)
  }

  const reset = () => { setChecked({}); persist({}, customItems) }

  const allItems = [...Object.values(allCategories).flat(), ...customItems]
  const doneCount = allItems.filter(i => checked[i]).length
  const progress = allItems.length > 0 ? (doneCount / allItems.length) * 100 : 0

  const shownCategories = { ...allCategories }
  if (customItems.length > 0) shownCategories['✏️ My Items'] = customItems

  return (
    <div className="card-premium overflow-hidden">
      {/* Header */}
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm" style={{ fontFamily: 'Sora, sans-serif' }}>Packing Checklist</p>
            <p className="text-xs text-muted-foreground">{doneCount}/{allItems.length} packed</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border">
          {/* Progress */}
          <div className="mt-4 mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{doneCount} of {allItems.length} packed</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${progress}%` }} />
            </div>
            {progress === 100 && (
              <p className="text-xs text-emerald-600 font-semibold mt-1.5">✅ All packed! Have a great trip!</p>
            )}
          </div>

          {/* Category filter */}
          <div className="flex gap-1.5 flex-wrap mb-4">
            <div role="button" tabIndex={0}
              onClick={() => setActiveCategory(null)}
              onKeyDown={e => e.key === 'Enter' && setActiveCategory(null)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${!activeCategory ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground'}`}>
              All
            </div>
            {Object.entries(shownCategories).map(([cat, items]) => {
              const done = items.filter(i => checked[i]).length
              return (
                <div key={cat} role="button" tabIndex={0}
                  onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                  onKeyDown={e => e.key === 'Enter' && setActiveCategory(activeCategory === cat ? null : cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer ${activeCategory === cat ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground'}`}>
                  {cat.split(' ').slice(1).join(' ')} {done}/{items.length}
                </div>
              )
            })}
          </div>

          {/* Items */}
          <div className="space-y-5 max-h-72 overflow-y-auto pr-1">
            {Object.entries(shownCategories)
              .filter(([cat]) => !activeCategory || cat === activeCategory)
              .map(([cat, items]) => (
                <div key={cat}>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{cat}</p>
                  <div className="space-y-1.5">
                    {items.map(item => (
                      <div key={item}
                        onClick={() => toggle(item)}
                        className="flex items-center gap-2.5 cursor-pointer group select-none"
                      >
                        <div className={`shrink-0 w-4 h-4 transition-colors ${checked[item] ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                          {checked[item] ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </div>
                        <span className={`text-sm transition-all flex-1 ${checked[item] ? 'line-through text-muted-foreground' : ''}`}>{item}</span>
                        {cat === '✏️ My Items' && (
                          <div role="button" tabIndex={0}
                            onClick={e => { e.stopPropagation(); removeCustom(item); }}
                            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); removeCustom(item); } }}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {/* Add item */}
          <div className="flex gap-2 mt-4">
            <input value={newItem} onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Add a custom item..."
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-border bg-muted/30 focus:outline-none focus:border-primary transition-colors"
            />
            <div role="button" tabIndex={0}
              onClick={addItem}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer">
              <Plus className="w-4 h-4" />
            </div>
          </div>

          {/* Reset */}
          <div role="button" tabIndex={0}
            onClick={reset}
            onKeyDown={e => e.key === 'Enter' && reset()}
            className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-fit">
            <RefreshCw className="w-3 h-3" /> Reset checkmarks
          </div>
        </div>
      )}
    </div>
  )
}

export default TripChecklist
