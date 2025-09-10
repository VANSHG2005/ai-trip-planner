import React from 'react'
import { Button } from '../ui/button'

function Header() {
  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-5'>
      <img src='/logo.svg ' className='w-40 h-12'/>
      <div>
        <Button className="h-10"> Sign In </Button>
      </div>
    </div>
  )
}

export default Header
