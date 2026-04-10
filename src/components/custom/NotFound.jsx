import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Sparkles } from 'lucide-react'

function NotFound() {
  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-[9rem] font-black leading-none mb-4 gradient-text select-none"
          style={{ fontFamily: 'Sora, sans-serif' }}>
          404
        </div>
        <div className="text-5xl mb-5">🗺️</div>
        <h1 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Sora, sans-serif' }}>
          This destination doesn&apos;t exist
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Looks like you&apos;ve wandered off the map. The page you&apos;re looking for has gone on its own adventure.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/">
            <button className="btn-primary flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold">
              <Home className="w-4 h-4" /> Go Home
            </button>
          </Link>
          <Link to="/create-trip">
            <button className="flex items-center gap-2 px-7 py-3 rounded-2xl text-sm font-semibold border border-border hover:bg-muted transition-all">
              <Sparkles className="w-4 h-4" /> Plan a Trip
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
