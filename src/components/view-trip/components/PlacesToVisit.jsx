import React from 'react';
import { Link } from 'react-router-dom';

const extractSearchableName = (placeName) => {
  const prefixesToRemove = [
    "Check-in & Explore ",
    "Explore ",
    "Visit ",
    "Discover ",
    "Experience ",
    "Enjoy ",
    "Dinner at an ",
    "Lunch at ",
    "Breakfast at ",
    "Stroll through ",
    "Wander around ",
    "Shop at ",
    "See ",
    "Admire ",
    "Tour ",
    "Indulge in ",
    "Relax at ",
    "Unwind at ",
  ];

  let cleanedName = placeName;
  for (const prefix of prefixesToRemove) {
    if (cleanedName.startsWith(prefix)) {
      cleanedName = cleanedName.substring(prefix.length);
      break; 
    }
  }

  const delimiters = [" (", " - ", ": "];
  for (const delimiter of delimiters) {
    const index = cleanedName.indexOf(delimiter);
    if (index !== -1) {
      cleanedName = cleanedName.substring(0, index);
    }
  }

  return cleanedName.trim();
};

function PlacesToVisit({ trip }) {
  return (
    <div>
      <h2 className='font-bold text-xl mt-5'>
        Daily Itinerary
      </h2>

      <div className='mt-5'>
        {trip?.tripData?.tripData?.itinerary?.map((item, index) => (
          <div key={index} className='mb-5'>
            <h3 className='font-medium text-lg'>{item.day}</h3>
            <div className='flex flex-col gap-4 mt-2'>
              {item.activities?.map((place, placeIndex) => {
                
                const searchableName = extractSearchableName(place.placeName);
                const mapQuery = encodeURIComponent(searchableName);
                const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

                return (
                  <Link to={mapUrl} key={placeIndex} target="_blank" rel="noopener noreferrer">
                    <div className='flex gap-5 border rounded-lg p-3 hover:scale-105 transition-all cursor-pointer hover:shadow-lg'>
                      <img 
                        src={place.placeImageUrl || "/placeholder.jpg"} 
                        className="w-28 h-28 object-cover rounded-lg" 
                        onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                      />
                      <div className='flex flex-col gap-1 w-full'>
                        <h4 className='font-bold text-md'>{place.placeName}</h4>
                        <p className='text-sm text-gray-500 line-clamp-3'>{place.placeDetails}</p>
                        <div className='mt-2 flex gap-4'>
                          <h5 className='text-sm'>🕒 {place.timeSpent}</h5>
                          <h5 className='text-sm'>💰 {place.ticketPricing}</h5>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlacesToVisit;