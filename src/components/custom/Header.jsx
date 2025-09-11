import React from 'react'
import { Button } from '../ui/button'
import { Link } from 'react-router-dom'

function Header() {

  return (
    <div className='p-3 shadow-sm flex justify-between items-center px-5'>
      <Link to = '/'>
        <img src='/logo.svg ' className='w-40 h-12 cursor-pointer'/>
      </Link>
      <div>
        <Button className="h-10"> Sign In </Button>
      </div>
    </div>
  )
}

export default Header
