import React from 'react';
import PlaceCard from '../components/PlaceCard'; 

function PlacesToVisit({ trip }) {
    return (
        <div>
            <h2 className='font-bold text-xl mt-5'>
                Daily Itinerary
            </h2>

            <div className='mt-5'>
                {trip?.tripData?.tripData?.itinerary?.map((item, index) => (
                    <div key={index} className='mb-6'>
                        <h3 className='font-medium text-lg mb-3'>{item.day}</h3>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                            {item.activities?.map((place, placeIndex) => (
                                <PlaceCard key={placeIndex} place={place} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PlacesToVisit;