import React from 'react';
import PlaceCard from './PlaceCard'; 
import { Map } from 'lucide-react';

function PlacesToVisit({ trip }) {
    return (
        <div>
            <div className="flex items-center gap-4">
                <Map className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
                <h2 className='text-3xl font-bold'>
                    Daily Itinerary
                </h2>
            </div>
            <p className="text-gray-500 mt-2">
                Your day-by-day travel plan, curated with the best activities and sights.
            </p>

            <div className='mt-8'>
                {trip?.tripData?.tripData?.itinerary?.map((item, index) => (
                    <div key={index} className="relative flex gap-8 mb-8 last:mb-0">
                        
                        <div className="flex-shrink-0 w-12 flex flex-col items-center">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg z-10">
                                {index + 1}
                            </div>
                            {index !== trip.tripData.tripData?.itinerary.length - 1 && (
                                <div className="flex-grow w-0.5 bg-gray-200"></div>
                            )}
                        </div>

                        <div className="flex-grow pb-8">
                            <h3 className='font-bold text-2xl text-gray-800 mb-4 pt-1'>
                                {item.day}
                            </h3>
                            <div className='grid md:grid-cols-1 gap-5'>
                                {item.activities?.map((place, placeIndex) => (
                                    <PlaceCard key={placeIndex} place={place} />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PlacesToVisit;