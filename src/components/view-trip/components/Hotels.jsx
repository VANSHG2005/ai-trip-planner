import React from 'react';
import HotelCard from '../components/HotelCard'; 
import { Hotel } from 'lucide-react';

function Hotels({ trip }) {
    return (
        <div>
            <div className="flex items-center gap-4">
                <Hotel className="h-10 w-10 text-blue-600" strokeWidth={1.5} />
                <h2 className='text-3xl font-bold'>
                    Hotel Recommendations
                </h2>
            </div>
            
            <p className="text-gray-500 mt-2">
                Discover top-rated hotels chosen to fit your budget and travel style.
            </p>

            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-5'>
                {trip?.tripData?.tripData?.hotels?.map((hotel, index) => (
                    <HotelCard key={hotel.hotelName || index} hotel={hotel} />
                ))}
            </div>
        </div>
    );
}

export default Hotels;