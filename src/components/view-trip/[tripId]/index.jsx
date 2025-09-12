import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner';
import { db } from '@/service/firebaseConfig';
import {doc, getDoc} from 'firebase/firestore'
import InfoSection from '../components/InfoSection';
import Hero from '@/components/custom/Hero';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import Itinerary from '../components/Itinerary';
import Footer from '../components/Footer';

function ViewTrip() {

    const {tripId} = useParams();
    const [trip, setTrip] = useState([]);

    useEffect(()=>{
        tripId&&GetTripData();
    },[tripId])

    const GetTripData = async() => {
        const docRef = doc (db,'AITrips',tripId);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            console.log("Document: ",docSnap.data());
            setTrip(docSnap.data());
        }
        else{
            console.log("No sich document");
            toast("No Trip Found")
        }
    }

  return (
    <div className='p-10 md:px-20 lg:px-44 xl:px-56'>
      {/* Information Section  */}
      <InfoSection trip={trip} />

      {/* Recommended Hotels  */}
      <Hotels trip = {trip} />

      {/* Daily Plan  */}
      <PlacesToVisit trip = {trip}/>
      {/* <Itinerary trip = {trip} /> */}

      {/* Footer */}
      <Footer />

    </div>
  )
}

export default ViewTrip
