import './App.css'
import Hero from './components/custom/Hero'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header'
import { Toaster } from 'sonner'
import ViewTrip from './components/view-trip/[tripId]/index.jsx'
import JoinTrip from './components/view-trip/components/JoinTrip'
import MyTrips from './my-trips/index.jsx'
import Profile from './profile/index.jsx'
import Footer from './components/custom/Footer'
import NotFound from './components/custom/NotFound'
import { ThemeProvider } from './components/custom/ThemeProvider'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [pathname])
  return null
}

function AppInner() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path='/' element={<Hero />} />
          <Route path='/create-trip' element={<CreateTrip />} />
          <Route path='/view-trip/:tripId' element={<ViewTrip />} />
          <Route path='/join-trip/:tripId' element={<JoinTrip />} />
          <Route path='/my-trips' element={<MyTrips />} />
          <Route path='/profile' element={<Profile />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="tripcortex-theme">
      <Router>
        <AppInner />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: '12px',
              border: '1px solid var(--border)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            },
          }}
          richColors
        />
      </Router>
    </ThemeProvider>
  )
}

export default App
