import './App.css'
import Hero from './components/custom/Hero'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header'
import { Toaster } from '@/components/ui/sonner'
import { GoogleOAuthProvider } from '@react-oauth/google'

function App() {

  return (
    <div>

      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>

      <Router>
        <Header />
        <Toaster />
        <Routes>
          <Route path='/' element = {<Hero />}/>
          <Route path='/create-trip' element = {<CreateTrip />}/>
        </Routes>
      </Router>

      </GoogleOAuthProvider>
     

    </div>
  )
}

export default App
