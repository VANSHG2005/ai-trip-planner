import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import UserTripCard from './component/UserTripCard'; 
import SkeletonCard from './component/SkeletonCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Frown } from 'lucide-react';
import { toast } from 'sonner';

function MyTrips() {
  const [userTrips, setUserTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
      navigate('/');
      return; 
    }
    getMyTrips();
  }, [navigate]);

  const getMyTrips = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const q = query(
        collection(db, "AITrips"), 
        where("userEmail", "==", user.email)
      );
      
      const querySnapshot = await getDocs(q);
      const trips = [];
      querySnapshot.forEach((doc) => {
        trips.push(doc.data());
      });
      setUserTrips(trips);
    } catch (error) {
      console.error("Error fetching user trips:", error);
      toast.error("Failed to load your trips.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (tripId) => {
    const toastId = toast.loading("Deleting trip...");
    
    try {
        const tripRef = doc(db, "AITrips", tripId);
        await deleteDoc(tripRef);

        setUserTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
        
        toast.success("Trip deleted successfully!", { id: toastId });
    } catch (error) {
        console.error("Error deleting trip: ", error);
        toast.error("Failed to delete trip. Please try again.", { id: toastId });
    }
  };

  return (
    <div className='px-4 sm:px-6 lg:px-8 py-10 md:py-16'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-10'>
          <div>
            <h2 className='text-3xl md:text-4xl font-extrabold tracking-tight text-gray-800'>
              My Trips 🗺️
            </h2>
            <p className='mt-2 text-gray-500'>Here are the adventures you've planned so far.</p>
          </div>
          <Link to="/create-trip">
            <Button className='hidden sm:flex items-center gap-2 rounded-full'>
              <PlusCircle className='h-5 w-5' /> Create New Trip
            </Button>
          </Link>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => ( <SkeletonCard key={index} /> ))}
          </div>
        )}
        
        {!loading && userTrips.length === 0 && (
            <div className="mt-16 flex flex-col items-center justify-center text-center p-10 border-2 border-dashed rounded-2xl bg-gray-50">
              <Frown className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-800">No Trips Found</h3>
              <p className="text-gray-500 mt-2 max-w-sm">
                Looks like your passport is feeling a bit too clean. Let's plan a new adventure and put some stamps in it!
              </p>
              <Link to="/create-trip" className='mt-6'>
                <Button size="lg" className="rounded-full flex items-center gap-2">
                  <PlusCircle className='h-5 w-5' /> Plan a New Trip
                </Button>
              </Link>
            </div>
        )}

        {!loading && userTrips.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {userTrips.map((trip) => (
              <UserTripCard 
                key={trip.id} 
                trip={trip} 
                onDelete={() => handleDeleteTrip(trip.id)} 
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MyTrips;