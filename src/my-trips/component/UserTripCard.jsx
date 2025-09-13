import {React, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getUnsplashPhoto } from '@/service/GlobalApi'; 
import { Calendar, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';

function UserTripCard({ trip, onDelete }) {
  const [photoUrl, setPhotoUrl] = useState('/placeholder.jpg');
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    if (trip) {
      if (trip.tripCoverImageUrl) {
        setPhotoUrl(trip.tripCoverImageUrl);
        setImageLoading(false);
      } else {
        fetchPhotoFromApi();
      }
    }
  }, [trip]);

  const fetchPhotoFromApi = async () => {
    setImageLoading(true);
    try {
      const query = trip?.userSelection?.location?.properties.formatted;
      if (!query) {
        setPhotoUrl('/placeholder.jpg');
        return;
      }
      const response = await getUnsplashPhoto(query);
      const imageUrl = response.data?.results[0]?.urls?.regular;
      setPhotoUrl(imageUrl || '/placeholder.jpg');
    } catch (error) {
      console.error("Failed to fetch image from Unsplash:", error);
      setPhotoUrl('/placeholder.jpg');
    } finally {
        setImageLoading(false);
    }
  };
  
 
  const handleNavigate = () => {
    navigate('/view-trip/' + trip.id);
  };

  const handleDeleteContainerClick = (e) => {
    e.stopPropagation();
  };

  const handleConfirmDelete = () => {
    onDelete();
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl shadow-lg h-[280px] cursor-pointer transition-all duration-300 hover:shadow-2xl"
      onClick={handleNavigate} 
    >
      {imageLoading && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
      )}
      
      <img 
        src={photoUrl} 
        className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" 
        alt={`A scenic view of ${trip?.userSelection?.location?.properties.formatted}`}
        onLoad={() => setImageLoading(false)}
        style={{ opacity: imageLoading ? 0 : 1, transition: 'opacity 0.5s' }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h2 className="text-lg font-bold truncate">
          {trip.userSelection?.location?.properties?.formatted}
        </h2>
        <p className="text-sm text-gray-300 mt-1">
          💰 Budget: {trip.userSelection?.budget}
        </p>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-white text-xs backdrop-blur-sm">
        <Calendar className="h-3 w-3" />
        {trip.userSelection?.noOfDays} Days
      </div>
      
      <div 
        className="absolute top-2 left-2 z-10" 
        onClick={handleDeleteContainerClick}
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="icon"
              className="h-8 w-8 rounded-full bg-red-600/80 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent> 
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your trip to 
                <span className="font-semibold"> {trip.userSelection?.location?.properties?.formatted}</span>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                Yes, delete it
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default UserTripCard;