import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options'
import { toast } from 'sonner'
import { generateAiResponse, parseAiJson, hasGeminiKey } from '@/lib/gemini'
import { FcGoogle } from 'react-icons/fc'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db, auth } from '@/service/firebaseConfig'
import { useNavigate } from 'react-router-dom'
import {
  LoaderCircle, Sparkles, ArrowRight, MapPin, Calendar,
  DollarSign, Users, CheckCircle2, X, AlertCircle, RefreshCw
} from 'lucide-react'
import AddressAutocomplete from '@/components/custom/AddressAutocomplete'

const STEP_CONFIG = [
  { id: 1, icon: MapPin,      label: 'Destination' },
  { id: 2, icon: Calendar,    label: 'Duration'    },
  { id: 3, icon: DollarSign,  label: 'Budget'      },
  { id: 4, icon: Users,       label: 'Travelers'   },
]

/* ── Sign-in modal ── */
function SignInModal({ open, onClose, onSignIn }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22,1,0.36,1] }}
          className="relative card-premium w-full max-w-md p-8"
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>Sign in to continue</h2>
            <p className="text-muted-foreground text-sm">Save and access your trip plans from anywhere.</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onSignIn}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted transition-all text-sm font-semibold shadow-sm"
          >
            <FcGoogle className="w-5 h-5" /> Continue with Google
          </motion.button>
          <p className="text-xs text-muted-foreground text-center mt-4">By signing in, you agree to our Terms of Service.</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Step progress indicator ── */
function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEP_CONFIG.map((step, i) => {
        const done   = currentStep > step.id
        const active = currentStep === step.id
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              <motion.div animate={{ scale: active ? 1.12 : 1 }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  done   ? 'bg-primary text-primary-foreground' :
                  active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' :
                           'bg-muted text-muted-foreground'
                }`}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : step.id}
              </motion.div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
            {i < STEP_CONFIG.length - 1 && (
              <div className="flex-1 h-px bg-border relative overflow-hidden max-w-12">
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                  className="absolute inset-0 bg-primary origin-left" />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/* ── Selectable option card ── */
function OptionCard({ item, selected, onClick }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${
        selected
          ? 'border-primary bg-primary/5 shadow-glow'
          : 'border-border hover:border-primary/40 hover:bg-muted/50 bg-card'
      }`}
    >
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute top-3 right-3 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary-foreground" />
        </motion.div>
      )}
      <div className="text-3xl mb-3">{item.icon}</div>
      <h3 className="font-bold text-base mb-0.5" style={{ fontFamily: 'Sora, sans-serif' }}>{item.title}</h3>
      <p className="text-xs text-muted-foreground">{item.desc}</p>
      {item.people && <p className="text-xs font-medium text-primary mt-1.5">{item.people}</p>}
    </motion.div>
  )
}

/* ── Loading overlay with tips ── */
const LOADING_TIPS = [
  'Curating the best activities for your style…',
  'Finding hidden gems locals love…',
  'Matching hotels to your budget…',
  'Building your day-by-day schedule…',
  'Adding dining recommendations…',
  'Almost ready — finalizing your itinerary!',
]

function LoadingOverlay() {
  const [tipIdx, setTipIdx] = useState(0)
  React.useEffect(() => {
    const t = setInterval(() => setTipIdx(i => (i + 1) % LOADING_TIPS.length), 2800)
    return () => clearInterval(t)
  }, [])
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center max-w-sm px-6">
        {/* Spinning gradient ring */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-muted" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Generating your trip…</h3>
        <AnimatePresence mode="wait">
          <motion.p key={tipIdx}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="text-sm text-muted-foreground min-h-[1.5rem]"
          >
            {LOADING_TIPS[tipIdx]}
          </motion.p>
        </AnimatePresence>
        <div className="mt-5 flex gap-1.5 justify-center">
          {LOADING_TIPS.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === tipIdx ? 'w-6 bg-primary' : 'w-1.5 bg-muted'}`} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ── No API key banner ── */
function NoKeyBanner({ type }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs mb-4">
      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
      <span>
        <strong>{type} API key not configured.</strong> Add it to your <code>.env</code> file. Check <code>.env.example</code> for instructions.
      </span>
    </div>
  )
}

/* ── Main component ── */
export default function CreateTrip() {
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const navigate = useNavigate()

  const handlePlaceSelect = useCallback((place) => {
    setFormData(p => ({ ...p, location: place }))
  }, [])

  const set = useCallback((name, value) => {
    setFormData(p => ({ ...p, [name]: value }))
  }, [])

  const isValid = (step) => {
    switch (step) {
      case 1: return !!formData?.location
      case 2: return !!formData?.noOfDays && Number(formData.noOfDays) > 0 && Number(formData.noOfDays) <= 10
      case 3: return !!formData?.budget
      case 4: return !!formData?.traveler
      default: return false
    }
  }

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then(() => { setOpenDialog(false); generate() })
      .catch(() => toast.error('Sign-in failed. Please try again.'))
  }

  const generate = async () => {
    if (!isValid(1) || !isValid(2) || !isValid(3) || !isValid(4)) {
      toast.error('Please complete all steps.'); return
    }
    if (!hasGeminiKey()) {
      toast.error('Gemini API key not configured. See .env.example'); return
    }

    setLoading(true)
    const prompt = AI_PROMPT
      .replace('{location}', formData.location.properties.formatted)
      .replace('{totalDays}', formData.noOfDays)
      .replace('{traveler}', formData.traveler)
      .replace('{budget}', formData.budget)

    try {
      const raw = await generateAiResponse(prompt)
      const parsed = parseAiJson(raw)
      if (!parsed) throw new Error('Invalid JSON from AI')

      const docId = Date.now().toString()
      await setDoc(doc(db, 'AITrips', docId), {
        userSelection: formData,
        tripData: parsed,
        userEmail: auth.currentUser?.email,
        id: docId,
        createdAt: new Date().toISOString(),
      })
      toast.success('🎉 Trip generated!')
      navigate('/view-trip/' + docId)
    } catch (err) {
      console.error(err)
      if (err.message === 'GEMINI_NO_KEY') {
        toast.error('Gemini API key missing. Add VITE_GOOGLE_GEMINI_API_KEY to .env')
      } else if (err?.message?.includes('API_KEY_INVALID') || err?.message?.includes('API key not valid')) {
        toast.error('Invalid Gemini API key. Check your .env file.')
      } else if (err?.message?.includes('QUOTA') || err?.message?.includes('quota')) {
        toast.error('API quota exceeded. Try again later.')
      } else {
        toast.error('Generation failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const OnGenerateTrip = async () => {
    const user = auth.currentUser
    if (!user) { setOpenDialog(true); return }
    await generate()
  }

  const next = () => {
    if (!isValid(currentStep)) {
      const msgs = ['Please select a destination.','Enter number of days (1–10).','Please select a budget.','Please select travelers.']
      toast.error(msgs[currentStep - 1]); return
    }
    setCurrentStep(s => Math.min(s + 1, 4))
  }

  /* Step content */
  const stepContent = {
    1: (
      <div>
        {!import.meta.env.VITE_GEOAPIFY_API_KEY && <NoKeyBanner type="Geoapify" />}
        <AddressAutocomplete onPlaceSelect={handlePlaceSelect} />
        {formData?.location && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 text-sm text-primary font-medium">
            <CheckCircle2 className="w-4 h-4" />
            {formData.location.properties.formatted}
          </motion.div>
        )}
      </div>
    ),
    2: (
      <div>
        <div className="relative">
          <Input placeholder="E.g., 5" type="number" min="1" max="10"
            value={formData?.noOfDays || ''}
            onChange={e => set('noOfDays', e.target.value)}
            className="h-14 text-2xl font-bold text-center rounded-2xl border-2 focus:border-primary pr-16"
            style={{ fontFamily: 'Sora, sans-serif' }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">days</span>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {[1, 2, 3, 5, 7].map(n => (
            <motion.button key={n} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => set('noOfDays', n)}
              className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                Number(formData?.noOfDays) === n ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground'
              }`}>
              {n}d
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">Maximum 10 days for best results</p>
      </div>
    ),
    3: (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SelectBudgetOptions.map(item => (
          <OptionCard key={item.id} item={item}
            selected={formData?.budget === item.title}
            onClick={() => set('budget', item.title)} />
        ))}
      </div>
    ),
    4: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SelectTravelesList.map(item => (
          <OptionCard key={item.id} item={item}
            selected={formData?.traveler === item.people}
            onClick={() => set('traveler', item.people)} />
        ))}
      </div>
    ),
  }

  const stepTitles    = ['Where do you want to go?','How many days?','What\'s your budget?','Who\'s joining you?']
  const stepSubtitles = ['Search any city, country, or region.','Plan between 1–10 days.','We\'ll match hotels & activities to your spend.','We\'ll recommend spots for your group type.']

  return (
    <>
      <AnimatePresence>{loading && <LoadingOverlay />}</AnimatePresence>

      <div className="min-h-screen mesh-bg py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/20 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" /> AI Trip Planner
            </div>
            <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>Plan your dream trip</h1>
            <p className="text-muted-foreground">Answer 4 quick questions and get a complete itinerary in seconds.</p>
            {!hasGeminiKey() && <NoKeyBanner type="Gemini AI" />}
          </motion.div>

          {/* Card */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }} className="card-premium p-8">
            <StepIndicator currentStep={currentStep} />

            <AnimatePresence mode="wait">
              <motion.div key={currentStep}
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}
              >
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {stepTitles[currentStep - 1]}
                  </h2>
                  <p className="text-sm text-muted-foreground">{stepSubtitles[currentStep - 1]}</p>
                </div>
                {stepContent[currentStep]}
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                disabled={currentStep === 1}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                Back
              </motion.button>

              {currentStep < 4 ? (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={next}
                  className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold">
                  Continue <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={OnGenerateTrip}
                  disabled={loading || !isValid(4)}
                  className="btn-primary flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading
                    ? <><LoaderCircle className="w-4 h-4 animate-spin" /> Generating…</>
                    : <><Sparkles className="w-4 h-4" /> Generate My Trip</>}
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Summary pills */}
          <AnimatePresence>
            {(formData?.location || formData?.noOfDays || formData?.budget || formData?.traveler) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }} className="mt-4 card-premium p-4">
                <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Your Trip</p>
                <div className="flex flex-wrap gap-2">
                  {formData?.location && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-medium border border-blue-100 dark:border-blue-500/20">
                      <MapPin className="w-3 h-3" />{formData.location.properties.formatted.split(',')[0]}
                    </span>
                  )}
                  {formData?.noOfDays && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 text-xs font-medium border border-violet-100 dark:border-violet-500/20">
                      <Calendar className="w-3 h-3" />{formData.noOfDays} days
                    </span>
                  )}
                  {formData?.budget && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-500/20">
                      <DollarSign className="w-3 h-3" />{formData.budget}
                    </span>
                  )}
                  {formData?.traveler && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium border border-amber-100 dark:border-amber-500/20">
                      <Users className="w-3 h-3" />{formData.traveler}
                    </span>
                  )}
                  {/* Reset */}
                  <button onClick={() => { setFormData({}); setCurrentStep(1) }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors">
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <SignInModal open={openDialog} onClose={() => setOpenDialog(false)} onSignIn={handleSignIn} />
    </>
  )
}
