import React from 'react';
import { Link } from 'react-router-dom';

const extractPrice = (priceString) => {
  if (!priceString) {
    return 'N/A';
  }
  const priceMatch = priceString.match(/\$[\d,.]+(?:\s*-\s*\$?\d[\d,.]*)?/);
  return priceMatch ? priceMatch[0] : priceString;
};

const formatRating = (ratingString) => {
  if (!ratingString) {
    return 'N/A';
  }
  return ratingString.split('(')[0].trim();
};

function Hotels({ trip }) {
  return (
    <div>
      <h2 className='font-bold text-xl mt-5'>
        Hotel Recommendation
      </h2>

      <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 mt-5'>
        {trip?.tripData?.tripData?.hotels?.map((hotel, index) => {
          const rawPrice = hotel.price_range || hotel.price_per_night_usd;
          
          const mapQuery = encodeURIComponent(`${hotel.hotelName}, ${hotel.hotelAddress}`);
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

          return (
            
            <Link to={mapUrl} key={hotel.hotelName || index} target="_blank" rel="noopener noreferrer">

              <div className='hover:scale-105 transition-all cursor-pointer'>
                <img src="/placeholder.jpg" className="rounded-lg" />
                <div className='my-2 flex flex-col gap-2'>
                  <h2 className='font-medium'>{hotel.hotel_name || hotel.hotelName}</h2>
                  <h2 className='text-xs text-gray-500'>📍 {hotel.hotel_address || hotel.hotelAddress}</h2>
                  <h2 className='text-sm font-medium'>💰 {extractPrice(rawPrice)} per night</h2>
                  <h2 className='text-sm font-medium'>⭐ {formatRating(hotel.rating)}</h2>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Hotels;