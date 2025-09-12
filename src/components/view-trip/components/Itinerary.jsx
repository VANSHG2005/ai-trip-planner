import React from 'react'

function Itinerary({trip}) {
  return (
    <div>
      <h2 className='font-bold text-lg mt-5'>Places to Visit</h2>

      <div>
        {trip?.tripData?.tripData?.itinerary?.map((item, index) => (
            <div>
                <h2>{PlayCircle.placeName}</h2>
            </div>
        ))}
      </div>
      
      

    </div>
  )
}

export default Itinerary
