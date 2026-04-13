import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Github, Twitter, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3 group">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base gradient-text" style={{ fontFamily: 'Sora, sans-serif' }}>TripCortex</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered travel planning for modern explorers.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Product</p>
            <ul className="space-y-2">
              {[['Plan a Trip', '/create-trip'], ['My Trips', '/my-trips'], ['Explore', '/']].map(([label, href]) => (
                <li key={label}><Link to={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Company</p>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Press'].map(label => (
                <li key={label}><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{label}</span></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Legal</p>
            <ul className="space-y-2">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(label => (
                <li key={label}><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{label}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            © {year} TripCortex. Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for travelers.
          </p>
          <div className="flex items-center gap-3">
            {[{ icon: Twitter, label: 'Twitter' }, { icon: Github, label: 'GitHub' }].map(({ icon: Icon, label }) => ( // eslint-disable-line no-unused-vars
              <motion.button key={label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all" aria-label={label}>
                <Icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
