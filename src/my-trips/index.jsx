import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/service/firebaseConfig';
import UserTripCard from './component/UserTripCard'; 

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

    const getMyTrips = async () => {
      setLoading(true);
      setUserTrips([]); 

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
      } finally {
        setLoading(false);
      }
    };

    getMyTrips();
  }, [navigate]);

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10'>
      <h2 className='font-bold text-3xl'>
        My Trips 🗺️
      </h2>

      {loading && (
        <div className='mt-10'>
          <p>Loading your trips...</p>
        </div>
      )}

      {!loading && userTrips.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-10">
          {userTrips.map((trip, index) => (
            <UserTripCard key={index} trip={trip} />
          ))}
        </div>
      )}

      {!loading && userTrips.length === 0 && (
        <div className="mt-10 text-center">
          <h3 className="text-xl font-semibold text-gray-700">No Trips Found</h3>
          <p className="text-gray-500 mt-2">
            You haven't created any trips yet. Let's plan a new adventure!
          </p>
        </div>
      )}
    </div>
  );
}

export default MyTrips; 