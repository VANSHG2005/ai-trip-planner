import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '@/service/firebaseConfig'
import { toast } from 'sonner'
import { LogOut, MapPinned, UserPlus, Sun, Moon, Menu, X, Sparkles, Globe, User } from 'lucide-react'
import { useTheme } from './ThemeProvider'

function Header() {
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(userAuth => {
      if (userAuth) {
        const profile = { name: userAuth.displayName, email: userAuth.email, photoURL: userAuth.photoURL, uid: userAuth.uid }
        localStorage.setItem('user', JSON.stringify(profile))
        setUser(profile)
      } else {
        localStorage.removeItem('user')
        setUser(null)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  const handleSignIn = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then(() => toast.success('Welcome! 👋'))
      .catch(() => toast.error('Sign-in failed. Please try again.'))
  }

  const handleLogout = () => {
    signOut(auth).then(() => { toast.success('Signed out'); navigate('/') })
      .catch(() => toast.error('Failed to sign out.'))
  }

  const navLinks = [
    { label: 'Explore', href: '/', icon: Globe },
    { label: 'My Trips', href: '/my-trips', icon: MapPinned },
    { label: 'Plan Trip', href: '/create-trip', icon: Sparkles },
  ]

  const isActive = (href) => location.pathname === href

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-lg border-b border-border/50' : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <span className="font-bold text-lg gradient-text hidden sm:block" style={{ fontFamily: 'Sora, sans-serif' }}>
                TripCortex
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}>
                    <link.icon className="w-3.5 h-3.5" />
                    {link.label}
                  </motion.div>
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark'
                    ? <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}><Sun className="w-4 h-4" /></motion.div>
                    : <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}><Moon className="w-4 h-4" /></motion.div>
                  }
                </AnimatePresence>
              </motion.button>

              {user ? (
                <div className="relative group">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <img
                      src={user.photoURL || '/placeholder.jpg'}
                      className="w-9 h-9 rounded-xl border-2 border-border object-cover cursor-pointer"
                      alt={user.name}
                      onError={e => { e.currentTarget.style.display='none' }}
                    />
                  </motion.button>
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-56 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 pointer-events-none group-hover:pointer-events-auto">
                    <div className="card-premium p-2">
                      <div className="px-3 py-2 mb-1">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="border-t border-border my-1" />
                      <Link to="/profile">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted cursor-pointer transition-colors">
                          <User className="w-4 h-4 text-muted-foreground" /> Profile
                        </div>
                      </Link>
                      <Link to="/my-trips">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-muted cursor-pointer transition-colors">
                          <MapPinned className="w-4 h-4 text-muted-foreground" /> My Trips
                        </div>
                      </Link>
                      <div className="border-t border-border my-1" />
                      <div onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSignIn}
                  className="hidden sm:flex btn-primary items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                >
                  <UserPlus className="w-4 h-4" /> Sign In
                </motion.button>
              )}

              {/* Mobile toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-muted transition-colors"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-border overflow-hidden glass"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link key={link.href} to={link.href}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}>
                      <link.icon className="w-4 h-4" /> {link.label}
                    </div>
                  </Link>
                ))}
                {user && (
                  <Link to="/profile">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </div>
                  </Link>
                )}
                {!user ? (
                  <button onClick={handleSignIn}
                    className="w-full btn-primary flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold mt-2">
                    <UserPlus className="w-4 h-4" /> Sign In with Google
                  </button>
                ) : (
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
      <div className="h-16" />
    </>
  )
}

export default Header
