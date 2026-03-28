import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, ChevronDown, ChevronUp, Loader2, Sparkles } from 'lucide-react'
import { GoogleGenAI } from '@google/genai'

const KEY   = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY
const MODEL = 'gemini-2.5-flash'

const SUGGESTIONS = [
  'What should I pack for this trip?',
  'What is the best local food to try?',
  'How do I get around the city?',
  'What are safety tips for this destination?',
  'What currency should I carry?',
  'What are must-buy souvenirs?',
  'Best time to visit each attraction?',
  'How much should I budget per day?',
]

export default function TripAIChat({ trip }) {
  const [expanded, setExpanded] = useState(false)
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef = useRef(null)

  const location = trip?.userSelection?.location?.properties?.formatted || 'the destination'
  const budget   = trip?.userSelection?.budget || 'moderate'
  const days     = trip?.userSelection?.noOfDays || '?'
  const traveler = trip?.userSelection?.traveler || 'travellers'
  const notes    = trip?.tripData?.tripData?.notes || ''
  const itinerary = trip?.tripData?.tripData?.itinerary || []
  const dayNames  = itinerary.map(d => d.day).join(', ')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    const userMsg = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      if (!KEY || KEY.length < 10) throw new Error('No Gemini API key configured.')

      const ai = new GoogleGenAI({ apiKey: KEY })
      const systemCtx = `You are a helpful AI travel assistant for TripCortex.
Trip details: ${days}-day trip to ${location}, ${budget} budget, ${traveler}.
Itinerary overview: ${dayNames}.
Travel notes: ${notes}
Answer concisely (under 150 words). Use bullet points for lists. Be specific to this trip.`

      // Build conversation history for Gemini multi-turn
      const history = messages.map(m => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      const contents = [
        { role: 'user',  parts: [{ text: systemCtx }] },
        { role: 'model', parts: [{ text: 'Understood! I\'m ready to help with your trip.' }] },
        ...history,
        { role: 'user',  parts: [{ text: q }] },
      ]

      const response = await ai.models.generateContent({ model: MODEL, contents })
      const reply = response.candidates?.[0]?.content?.parts?.[0]?.text
        || "Sorry, I couldn't get a response. Please try again."

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error('TripAIChat Gemini error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: err.message.includes('API key')
          ? '⚠️ Gemini API key not configured. Add VITE_GOOGLE_GEMINI_API_KEY to your .env file.'
          : `Error: ${err.message}. Please try again.`
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-premium overflow-hidden">
      <div role="button" tabIndex={0}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={e => e.key === 'Enter' && setExpanded(x => !x)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 cursor-pointer select-none transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-sm flex items-center gap-1.5" style={{ fontFamily: 'Sora, sans-serif' }}>
              Trip AI Assistant <Sparkles className="w-3.5 h-3.5 text-fuchsia-500" />
            </p>
            <p className="text-xs text-muted-foreground">Powered by Gemini · Ask anything about {location}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="border-t border-border">
              {/* Messages */}
              <div className="h-72 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-4">
                    <Bot className="w-8 h-8 text-fuchsia-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Ask me anything about your <strong>{days}-day trip to {location}</strong>!
                    </p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {SUGGESTIONS.slice(0, 4).map(s => (
                        <button key={s} onClick={() => sendMessage(s)}
                          className="text-xs px-2.5 py-1.5 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-500/10 border border-fuchsia-200 dark:border-fuchsia-500/30 text-fuchsia-700 dark:text-fuchsia-300 hover:bg-fuchsia-100 cursor-pointer transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      m.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-muted border border-border rounded-bl-sm'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-muted border border-border flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-fuchsia-500" />
                      <span className="text-xs text-muted-foreground">Gemini is thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Suggestion chips */}
              {messages.length > 0 && !loading && (
                <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {SUGGESTIONS.map(s => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-muted border border-border hover:border-primary/30 hover:text-primary cursor-pointer transition-colors whitespace-nowrap">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder={`Ask about ${location}…`}
                  className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-border bg-card focus:outline-none focus:border-primary transition-colors" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 cursor-pointer shrink-0">
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
