import './App.css'
import Hero from './components/custom/Hero'
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Header from './components/custom/Header'
import { Toaster } from '@/components/ui/sonner'

function App() {

  return (
    <div>

      <Router>
        <Header />
        <Toaster />
        <Routes>
          <Route path='/' element = {<Hero />}/>
          <Route path='/create-trip' element = {<CreateTrip />}/>
        </Routes>
      </Router>

    </div>
  )
}

export default App
