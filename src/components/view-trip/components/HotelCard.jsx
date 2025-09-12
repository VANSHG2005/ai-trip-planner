import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUnsplashPhoto } from '@/service/GlobalApi'; 

const extractPrice = (priceString) => {
    if (!priceString) return 'N/A';
    const priceMatch = priceString.match(/\$[\d,.]+(?:\s*-\s*\$?\d[\d,.]*)?/);
    return priceMatch ? priceMatch[0] : priceString;
};

const formatRating = (ratingString) => {
    if (!ratingString) return 'N/A';
    return ratingString.split('(')[0].trim();
};

function HotelCard({ hotel }) {
    const [photoUrl, setPhotoUrl] = useState('/placeholder.jpg');

    useEffect(() => {
        const fetchPhoto = async () => {
            try {
                const query = `${hotel.hotelName}`;
                const response = await getUnsplashPhoto(query);
                const imageUrl = response.data?.results[0]?.urls?.regular;
                if (imageUrl) {
                    setPhotoUrl(imageUrl);
                }
            } catch (error) {
                console.error(`Failed to fetch photo for ${hotel.hotelName}:`, error);
            }
        };

        if (hotel) {
            fetchPhoto();
        }
    }, [hotel]); 

    const rawPrice = hotel.price_range || hotel.price_per_night_usd;
    
    const mapQuery = encodeURIComponent(`${hotel.hotelName}, ${hotel.hotelAddress}`);
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    return (
        <Link to={mapUrl} target="_blank" rel="noopener noreferrer">
            <div className='hover:scale-105 transition-all cursor-pointer h-full'>
                <img 
                    src={photoUrl} 
                    className="rounded-lg h-40 w-full object-cover" 
                    alt={`A photo of ${hotel.hotelName}`}
                />
                <div className='my-2 flex flex-col gap-1'>
                    <h2 className='font-medium truncate' title={hotel.hotel_name || hotel.hotelName}>
                        {hotel.hotel_name || hotel.hotelName}
                    </h2>
                    <h2 className='text-xs text-gray-500 truncate' title={hotel.hotel_address || hotel.hotelAddress}>
                        📍 {hotel.hotel_address || hotel.hotelAddress}
                    </h2>
                    <h2 className='text-sm font-medium mt-1'>
                        💰 {extractPrice(rawPrice)} per night
                    </h2>
                    <h2 className='text-sm font-medium'>
                        ⭐ {formatRating(hotel.rating)}
                    </h2>
                </div>
            </div>
        </Link>
    );
}

export default HotelCard;