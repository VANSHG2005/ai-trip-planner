import React, { useEffect, useState } from 'react';
import AddressAutocomplete from '@/components/custom/AddressAutocomplete'; 
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options';
import { toast } from 'sonner';
import { generateAiResponse } from '@/lib/gemini'; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {doc, setDoc} from "firebase/firestore"
import { db, auth } from '@/service/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { LoaderCircle, Sparkles } from 'lucide-react';
import { getUnsplashPhoto } from '@/service/GlobalApi';


function CreateTrip() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handlePlaceSelect = (place) => {
    handleInputChange('location', place);
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(() => {
        setOpenDialog(false);
        OnGenerateTrip();
      }).catch((error) => {
        console.error("Google Sign-In Error:", error);
        toast.error("Failed to sign in. Please try again.");
      });
  };

  const OnGenerateTrip = async () => {
    const user = auth.currentUser;
    if (!user) {
      setOpenDialog(true);
      return;
    }

    if (!formData?.location || !formData?.noOfDays || !formData?.budget || !formData?.traveler) {
      toast.error("Please fill in all the details to continue.");
      return;
    }
    if (formData.noOfDays > 10) {
      toast.warning("For best results, please plan trips of 10 days or less.");
      return;
    }

    setLoading(true); 

    const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', formData.location.properties.formatted)
      .replace('{totalDays}', formData.noOfDays)
      .replace('{traveler}', formData.traveler)
      .replace('{budget}', formData.budget);

    try {
      const result = await generateAiResponse(FINAL_PROMPT); 
      await SaveAiTrip(result, user);
    } catch (error) {
        toast.error("Something went wrong while generating your trip.");
        console.error(error);
    } finally {
        setLoading(false); 
    }
  };

  const SaveAiTrip = async (TripData, user) => {
    const docId = Date.now().toString();
    const cleanedResponse = TripData.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    try {
      const parsedData = JSON.parse(cleanedResponse);
      await setDoc(doc(db, "AITrips", docId), {
        userSelection: formData,
        tripData: parsedData,
        userEmail: user.email,
        id: docId
      });
      toast.success("Your trip has been saved successfully!");
      navigate('/view-trip/' + docId);
    } catch (error) {
      console.error("Failed to parse AI response or save trip:", error);
      toast.error("Error saving your trip. The AI response was not valid.");
    }
  };

  const renderStep = (stepNumber, title, children) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-4 mb-5">
        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
          {stepNumber}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className='px-4 sm:px-6 lg:px-8 py-10 md:py-16'>
      <div className='max-w-4xl mx-auto'>
        <div className='text-center'>
          <h2 className='text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800'>
            Tell Us Your Travel Preference 🏕️🌴
          </h2>
          <p className='mt-4 text-lg text-gray-500 max-w-2xl mx-auto'>
            Just provide some basic information, and our AI will generate a customized itinerary based on your preferences.
          </p>
        </div>

        <div className='mt-12 space-y-8'>
          {renderStep(1, "What is your destination of choice?",
            <AddressAutocomplete onPlaceSelect={handlePlaceSelect} />
          )}

          {renderStep(2, "How many days are you planning?",
            <Input 
              placeholder="E.g., 3"
              type="number"
              onChange={(e) => handleInputChange('noOfDays', e.target.value)}
              className="h-12 text-lg focus:ring-blue-500 focus:border-blue-500"
            />
          )}

          {renderStep(3, "What is your budget?", 
            <>
              <p className='text-gray-500 mb-5'>
                The budget is exclusively for activities and dining, excluding flights and hotels.
              </p>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {SelectBudgetOptions.map((item, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleInputChange('budget', item.title)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:border-blue-600 hover:bg-blue-50 ${formData?.budget === item.title && 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'}`}
                  >
                    <h2 className='text-4xl'>{item.icon}</h2>
                    <h2 className='font-bold text-lg mt-2'>{item.title}</h2>
                    <h2 className='text-sm text-gray-500'>{item.desc}</h2>
                  </div>
                ))}
              </div>
            </>
          )}

          {renderStep(4, "Who are you traveling with?", 
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              {SelectTravelesList.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => handleInputChange('traveler', item.people)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:border-blue-600 hover:bg-blue-50 ${formData?.traveler === item.people && 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'}`}
                >
                  <h2 className='text-4xl'>{item.icon}</h2>
                  <h2 className='font-bold text-lg mt-2'>{item.title}</h2>
                  <h2 className='text-sm text-gray-500'>{item.desc}</h2>
                </div>
              ))}
            </div>
          )}
        </div>
      
        <div className='my-10 flex justify-center'>
          <Button 
            onClick={OnGenerateTrip} 
            disabled={loading}
            size="lg"
            className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-7 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-6 w-6 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6" />
                Generate My Trip
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                    One Last Step!
                </DialogTitle>
                <DialogDescription className="mt-2 text-gray-500">
                    Sign in with your Google account to save and manage your trips.
                </DialogDescription>
            </DialogHeader>
            <div className='py-4'>
                <Button 
                    onClick={handleGoogleSignIn}
                    className="w-full h-12 flex gap-3 items-center text-lg transition-transform hover:scale-105"
                    variant="outline"
                >
                    <FcGoogle className='h-6 w-6' />
                    Sign In with Google
                </Button>
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateTrip;