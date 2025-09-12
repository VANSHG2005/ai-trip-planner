import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnsplashPhoto } from '@/service/GlobalApi'; 

const extractSearchableName = (placeName) => {
    const prefixesToRemove = [
        "Check-in & Explore ", "Explore ", "Visit ", "Discover ", "Experience ",
        "Enjoy ", "Dinner at an ", "Lunch at ", "Breakfast at ", "Stroll through ",
        "Wander around ", "Shop at ", "See ", "Admire ", "Tour ", "Indulge in ",
        "Relax at ", "Unwind at ",
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

function PlaceCard({ place }) {
    const [photoUrl, setPhotoUrl] = useState('/placeholder.jpg');

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const searchableName = extractSearchableName(place.placeName);
                if (!searchableName) return;

                const response = await getUnsplashPhoto(searchableName);
                const imageUrl = response.data?.results[0]?.urls?.regular;
                
                if (imageUrl) {
                    setPhotoUrl(imageUrl);
                }
            } catch (error) {
                console.error(`Failed to fetch photo for ${place.placeName}:`, error);
            }
        };

        if (place) {
            fetchPhoto();
        }
    }, [place]);

    const searchableName = extractSearchableName(place.placeName);
    const mapQuery = encodeURIComponent(searchableName);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    return (
        <Link to={mapUrl} target="_blank" rel="noopener noreferrer">
            <div className='flex gap-5 border rounded-lg p-3 hover:scale-105 transition-all cursor-pointer hover:shadow-lg h-full'>
                <img
                    src={photoUrl}
                    className="w-28 h-28 object-cover rounded-lg"
                        onError={(e) => { e.currentTarget.src = "/placeholder.jpg"; }}
                    alt={`A photo of ${place.placeName}`}
                />
                <div className='flex flex-col gap-1 w-full'>
                    <h4 className='font-bold text-md'>{place.placeName}</h4>
                    <p className='text-sm text-gray-500 line-clamp-3'>{place.placeDetails}</p>
                    <div className='mt-auto flex gap-4 pt-2'>
                        <h5 className='text-sm'>🕒 {place.timeSpent}</h5>
                        <h5 className='text-sm'>💰 {place.ticketPricing}</h5>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default PlaceCard;