import { Button } from '@/components/ui/button';
import { getUnsplashPhoto } from '@/service/GlobalApi'; 
import React, { useEffect, useState } from 'react'; 
import { IoIosSend } from "react-icons/io";

function InfoSection({ trip }) {
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
            
            // Check if Unsplash returned any results and get the URL
            const imageUrl = response.data?.results[0]?.urls?.regular;

            if (imageUrl) {
                setPhotoUrl(imageUrl);
            }
            // If no image is found, it will default to the placeholder
        } catch (error) {
            console.error("Failed to fetch image from Unsplash:", error);
            // On error, we also keep the placeholder image
        }
    };

    return (
        <div>
            {/* Update the img src to use our state variable */}
            <img 
                src={photoUrl} 
                className="h-[350px] w-full object-cover rounded-lg shadow-md" 
                alt={`A scenic view of ${trip?.userSelection?.location?.properties.formatted}`} 
            />

            <div className='flex justify-between items-center'>
                <div className='my-5 flex flex-col gap-2'>
                    <h2 className='font-bold text-2xl'>
                        {trip?.userSelection?.location?.properties.formatted}
                    </h2>
                    <div className='flex flex-wrap gap-5 mt-2'>
                        <h2 className='px-3 p-1 bg-gray-200 rounded-full text-gray-600 text-xs md:text-sm'>
                            🗓️ {trip?.userSelection?.noOfDays} Day Trip
                        </h2>
                        <h2 className='px-3 p-1 bg-gray-200 rounded-full text-gray-600 text-xs md:text-sm'>
                            💰 {trip?.userSelection?.budget} Budget
                        </h2>
                        <h2 className='px-3 p-1 bg-gray-200 rounded-full text-gray-600 text-xs md:text-sm'>
                            🥂 {trip?.userSelection?.traveler}
                        </h2>
                    </div>
                </div> 
                <Button> <IoIosSend /></Button>
            </div>
        </div>
    );
}

export default InfoSection;