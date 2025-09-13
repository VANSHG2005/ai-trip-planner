import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { db } from '@/service/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import InfoSection from '../components/InfoSection';
import Hotels from '../components/Hotels';
import PlacesToVisit from '../components/PlacesToVisit';
import Footer from '../components/Footer';
import TripViewSkeleton from '../components/TripViewSkeleton'; 
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

function ViewTrip() {
    const { tripId } = useParams();
    const [trip, setTrip] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (tripId) {
            GetTripData();
        }
    }, [tripId]);

    const GetTripData = async () => {
        setLoading(true);
        setError(false);
        const docRef = doc(db, 'AITrips', tripId);
        
        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setTrip(docSnap.data());
            } else {
                console.log("No such document");
                toast.error("No Trip Found");
                setError(true); 
            }
        } catch (err) {
            console.error("Error fetching document:", err);
            toast.error("Failed to fetch trip data.");
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='px-4 sm:px-10 md:px-20 lg:px-32 py-10'>
                <TripViewSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center p-4">
                <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">Trip Not Found</h2>
                <p className="text-gray-500 mt-2">
                    We couldn't find the trip you were looking for. It might have been deleted or the link is incorrect.
                </p>
                <Link to="/my-trips" className="mt-6">
                    <Button>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to My Trips
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className='px-4 sm:px-10 md:px-20 lg:px-32 py-10 bg-gray-50/50'>
            <div className="max-w-5xl mx-auto">
                {/* Back Button */}
                <div className="mb-8">
                    <Link to="/my-trips">
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to My Trips
                        </Button>
                    </Link>
                </div>

                {/* Main Content Sections */}
                <div className="space-y-12">
                    <InfoSection trip={trip} />
                    <hr />
                    <Hotels trip={trip} />
                    <hr />
                    <PlacesToVisit trip={trip} />
                </div>
            </div>
            
            <div className="mt-20">
              <Footer />
            </div>
        </div>
    );
}

export default ViewTrip;