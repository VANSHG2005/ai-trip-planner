import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

function Hero() {
  return (
    <div className='flex flex-col items-center mx-56 gap-9'>

      <h1 className='font-extrabold text-[50px] text-center mt-15'>
        <span className='text-[#f10d0d]'>
          Discover Your Next Adventure with AI:{' '}
        </span>
        Personalised Itineraries at Your Fingertips
      </h1>

      <p className='text-xl text-gray-500 text-center'>
        Your Personalised Trip Planner and Travel Curator, Creating Custom Itineraries Tailored at your Interests and Budget.
      </p>

      <Link to = '/create-trip'>
        <Button className="h-12"> Get Started, It's Free </Button>
      </Link>
      
    </div>
  )
}

export default Hero
