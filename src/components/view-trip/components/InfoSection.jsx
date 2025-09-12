import { Button } from '@/components/ui/button'
import React from 'react'
import { IoIosSend } from "react-icons/io";

function InfoSection({trip}) {
  return (
    <div>
      <img src="/placeholder.jpg" className ="h-[350px] w-full object-cover rounded" />

      <div className='flex justify-between items-center'>
        <div className='my-5 flex flex-col gap-2'>
            <h2 className='font-bold text-2xl'>
                {trip?.userSelection?.location?.properties.formatted}
            </h2>
            <div className='hidden sm:flex gap-5'>
                <h2 className='px-3 p-1 bg-gray-200 rounded-full text-gray-500 text-xs md:text-base'>
                    🗓️ {trip?.userSelection?.noOfDays} Day
                </h2>
                <h2 className='px-3 p-1 bg-gray-200 rounded-full text-gray-500 text-xs md:text-base'>
                    💰 {trip?.userSelection?.budget} Budget
                </h2>
                <h2 className='px-3 p-1 bg-gray-200 rounded-full text-gray-500 text-xs md:text-base'>
                    🥂 No. of Traveler: {trip?.userSelection?.traveler}
                </h2>
            </div>
        </div> 

        <Button> <IoIosSend /></Button>
      </div>
    </div>
  )
}

export default InfoSection
