import { Button } from '@/components/ui/button';
import { getUnsplashPhoto } from '@/service/GlobalApi'; 
import React, { useEffect, useState } from 'react'; 
import { IoIosSend } from "react-icons/io";
import { toast } from 'sonner'; // 1. Import the toast component

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
            const imageUrl = response.data?.results[0]?.urls?.regular;

            if (imageUrl) {
                setPhotoUrl(imageUrl);
            }
        } catch (error) {
            console.error("Failed to fetch image from Unsplash:", error);
        }
    };

    // 2. Add the handleShare function
    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: 'My AI-Generated Travel Itinerary',
            text: `Check out this amazing ${trip?.userSelection?.noOfDays}-day trip I planned to ${trip?.userSelection?.location?.properties.formatted}!`,
            url: url,
        };

        // Check if the Web Share API is supported
        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (error) {
                // This error typically occurs if the user cancels the share action.
                // You can choose to ignore it or log it.
                console.log('User cancelled the share action or it failed.', error);
            }
        } else {
            // Fallback for browsers that don't support the Web Share API
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Link copied to clipboard!");
            } catch (err) {
                toast.error("Failed to copy the link.");
                console.error('Failed to copy: ', err);
            }
        }
    };

    return (
        <div>
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
                {/* 3. Add the onClick handler to the button */}
                <Button onClick={handleShare} title="Share this trip">
                    <IoIosSend />
                </Button>
            </div>
        </div>
    );
}

export default InfoSection;