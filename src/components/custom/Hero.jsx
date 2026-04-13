import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MapPin, Star, Users, Zap, Globe, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react'

const DESTINATIONS = ['Paris, France', 'Tokyo, Japan', 'Bali, Indonesia', 'New York, USA', 'Santorini, Greece', 'Dubai, UAE']

const FEATURES = [
  { icon: Zap, label: 'AI-Powered', desc: 'Smart itineraries in seconds' },
  { icon: Globe, label: 'Global Coverage', desc: '150+ countries supported' },
  { icon: Star, label: 'Personalized', desc: 'Tailored to your style' },
]

const STATS = [
  { value: '50K+', label: 'Trips Generated' },
  { value: '150+', label: 'Countries' },
  { value: '4.9★', label: 'User Rating' },
  { value: '< 30s', label: 'Plan Time' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Travel Blogger', text: 'TripCortex saved me hours of planning. The itineraries feel handcrafted!', avatar: 'SK' },
  { name: 'James M.', role: 'Digital Nomad', text: 'The AI understands my budget perfectly. I use it every trip now.', avatar: 'JM' },
  { name: 'Priya R.', role: 'Family Traveler', text: 'Perfect for family trips! Suggested kid-friendly spots I never found elsewhere.', avatar: 'PR' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

function DestinationTag({ text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/80 dark:bg-white/5 backdrop-blur border border-border shadow-sm text-muted-foreground"
    >
      <MapPin className="w-3 h-3 text-primary" />
      {text}
    </motion.div>
  )
}

function FloatingCard({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute glass rounded-2xl p-3 shadow-xl border border-white/30 dark:border-white/10 ${className}`}
    >
      {children}
    </motion.div>
  )
}

function Hero() {
  const [currentDest, setCurrentDest] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDest(prev => (prev + 1) % DESTINATIONS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-bg -z-10" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-cyan-400/08 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 -z-10 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(to right, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }}
      />

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              {/* Badge */}
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary">
                  <span className="status-dot" />
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Travel Planning is here
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6 tracking-tight" style={{ fontFamily: 'Sora, sans-serif' }}>
                Your Perfect{' '}
                <span className="gradient-text">Trip</span>
                <br />
                <span className="text-foreground">Planned by AI</span>
              </motion.h1>

              {/* Rotating destination */}
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
                <div className="shrink-0 w-px h-10 bg-linear-to-b from-primary to-violet-500" />
                <div className="overflow-hidden h-7">
                  <motion.div
                    key={currentDest}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -30, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="text-lg font-medium text-muted-foreground flex items-center gap-2"
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    {DESTINATIONS[currentDest]}
                  </motion.div>
                </div>
              </motion.div>

              <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                Get a complete day-by-day itinerary with hotels, activities, and dining — personalized to your budget and travel style. Ready in under 30 seconds.
              </motion.p>

              {/* Checkpoints */}
              <motion.ul variants={itemVariants} className="space-y-2 mb-10">
                {['No account needed to start', 'Budget-aware recommendations', 'Save & share your itineraries'].map(item => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </motion.ul>

              {/* CTAs */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link to="/create-trip">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-semibold shadow-lg"
                  >
                    <Sparkles className="w-5 h-5" />
                    Start Planning Free
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
                <Link to="/my-trips">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all border border-border"
                  >
                    View My Trips
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Social proof */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 mt-10">
                <div className="flex -space-x-2">
                  {['SK', 'JM', 'PR', 'AL'].map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: `hsl(${220 + i * 30}, 70%, 55%)` }}>
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-muted-foreground"><strong className="text-foreground">50,000+</strong> trips planned this month</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Visual card */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Main mock card */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative card-premium overflow-hidden rounded-3xl"
              >
                <div className="aspect-4/3 relative overflow-hidden bg-linear-to-br from-blue-500 via-violet-500 to-cyan-500">
                  {/* Mock itinerary */}
                  <div className="absolute inset-0 p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-bold text-xl" style={{ fontFamily: 'Sora, sans-serif' }}>Paris, France</h3>
                        <p className="text-white/70 text-sm">7-day itinerary · Moderate budget</p>
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {['Day 1: Eiffel Tower & Champs-Élysées', 'Day 2: Louvre Museum & Seine River', 'Day 3: Versailles Palace & Gardens'].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-white/15 backdrop-blur rounded-xl px-4 py-2.5">
                          <div className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs text-white font-bold">{i + 1}</div>
                          <span className="text-white text-sm font-medium">{item}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2.5 opacity-60">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs text-white font-bold">+</div>
                        <span className="text-white text-sm">4 more days planned...</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between bg-card">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold" style={{ fontFamily: 'Sora, sans-serif' }}>Generated by TripCortex AI</span>
                  </div>
                  <span className="text-xs text-muted-foreground">23s ago</span>
                </div>
              </motion.div>

              {/* Floating badges */}
              <FloatingCard className="-top-4 -left-6" delay={0.8}>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Hotel found</p>
                    <p className="text-xs text-muted-foreground">$89/night · ⭐ 4.8</p>
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard className="-bottom-4 -right-6" delay={1.0}>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="w-8 h-8 rounded-xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Itinerary ready!</p>
                    <p className="text-xs text-muted-foreground">28 activities planned</p>
                  </div>
                </div>
              </FloatingCard>

              <FloatingCard className="top-1/2 -right-10 -translate-y-1/2" delay={1.2}>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold">AI Processing</p>
                    <p className="text-xs text-muted-foreground">Done in 28s</p>
                  </div>
                </div>
              </FloatingCard>
            </motion.div>
          </div>

          {/* Destination tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-16 flex flex-wrap gap-2"
          >
            <span className="text-sm text-muted-foreground font-medium self-center mr-2">Popular:</span>
            {DESTINATIONS.map((dest, i) => (
              <DestinationTag key={dest} text={dest} delay={1 + i * 0.08} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl font-bold gradient-text mb-1" style={{ fontFamily: 'Sora, sans-serif' }}>{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6">
              <Zap className="w-3.5 h-3.5" />
              Why TripCortex
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Travel planning,<br />
              <span className="gradient-text">reimagined</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We combine AI intelligence with curated travel data to give you the perfect trip plan every single time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant AI Itineraries',
                desc: 'Our AI analyzes thousands of travel patterns to create your perfect day-by-day schedule in under 30 seconds.',
                color: 'blue',
                bg: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Star,
                title: 'Budget-Smart Planning',
                desc: 'Tell us your budget and we\'ll find the best hotels, restaurants, and activities that match your spending goals.',
                color: 'violet',
                bg: 'from-violet-500 to-purple-500'
              },
              {
                icon: Globe,
                title: 'Global Destinations',
                desc: 'From hidden gems to iconic landmarks, we cover 150+ countries with real-time local insights and recommendations.',
                color: 'emerald',
                bg: 'from-emerald-500 to-teal-500'
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -4 }}
                className="card-premium p-6"
              >
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${feature.bg} flex items-center justify-center mb-5 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Plan in <span className="gradient-text">3 simple steps</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-linear-to-r from-transparent via-border to-transparent" />
            {[
              { step: '01', title: 'Choose Destination', desc: 'Pick any city or country from 150+ destinations worldwide.' },
              { step: '02', title: 'Set Preferences', desc: 'Select budget, travel style, and who you\'re traveling with.' },
              { step: '03', title: 'Get Your Plan', desc: 'Receive a complete itinerary with hotels, activities, and dining.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-primary to-violet-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-lg" style={{ fontFamily: 'Sora, sans-serif' }}>{item.step}</span>
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>
              Loved by <span className="gradient-text">travelers</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="card-premium p-6"
              >
                <div className="flex items-center gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: `hsl(${220 + i * 40}, 70%, 55%)` }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden rounded-3xl p-12 text-white"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            </div>
            <div className="relative z-10">
              <div className="text-5xl mb-4">✈️</div>
              <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Sora, sans-serif' }}>Ready for your next adventure?</h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of travelers who plan smarter, not harder. Your dream trip is just 30 seconds away.
              </p>
              <Link to="/create-trip">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white text-primary font-bold px-10 py-4 rounded-2xl text-base shadow-xl hover:shadow-2xl transition-all inline-flex items-center gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Planning — It's Free
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Hero
