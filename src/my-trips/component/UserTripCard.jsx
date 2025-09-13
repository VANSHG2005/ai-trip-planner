import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import { getUnsplashPhoto } from '@/service/GlobalApi'; 

function UserTripCard({ trip }) {

    const [photoUrl, setPhotoUrl] = useState('/placeholder.jpg');
    
        useEffect(() => {
            if (trip) {
                getPlacePhoto();
            }
        }, [trip]);
    
        const getPlacePhoto = async () => {
            try {
                const query = trip?.userSelection?.location?.properties.formatted;
                if (!query) return; 
    
                const response = await getUnsplashPhoto(query);
                
                const imageUrl = response.data?.results[0]?.urls?.regular;
    
                if (imageUrl) {
                    setPhotoUrl(imageUrl);
                }
            } catch (error) {
                console.error("Failed to fetch image from Unsplash:", error);
            }
        };

  return (
    <Link to={'/view-trip/' + trip.id}>
      <div className="hover:scale-105 transition-all cursor-pointer">
        <img 
          src={photoUrl} 
          className="w-full h-[180px] object-cover rounded-xl" 
          alt={`A scenic view of ${trip?.userSelection?.location?.properties.formatted}`}
        />
        <div className="my-2">
          <h2 className="font-bold text-lg truncate">
            {trip.userSelection?.location?.properties?.formatted}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span>🗓️ {trip.userSelection?.noOfDays} Days</span>
            <span>💰 {trip.userSelection?.budget}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default UserTripCard;