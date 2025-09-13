import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

function Hero() {
  return (
    <section className="relative bg-white dark:bg-gray-900">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        
        {/* Background Glow Effect */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#80ff8c] to-[#007bff] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-4xl py-20 sm:py-28 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Discover Your Next Adventure with AI:
              </span>
              <br className="hidden sm:block" />
              Personalised Itineraries at Your Fingertips
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Your personal trip planner and travel curator, creating custom itineraries tailored to your interests and budget.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href='/create-trip'>
                <Button 
                  size="lg" 
                  className="rounded-full bg-blue-600 px-8 py-6 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2"
                >
                  Get Started, It's Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
            </div>
            
            {/* Social Proof Section */}
            <div className="mt-16 flex justify-center">
              <div className="relative flex items-center gap-x-2">
                <div className="flex -space-x-2">
                  <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User 1"/>
                  <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User 2"/>
                  <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80" alt="User 3"/>
                </div>
                <div className="text-sm font-medium leading-6 text-gray-700">
                  <span className="font-semibold">10,000+</span> travelers are planning their trips with us.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero;