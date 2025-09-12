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
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {doc, setDoc} from "firebase/firestore"
import { db, auth } from '@/service/firebaseConfig';
import { useNavigate } from 'react-router-dom';

function CreateTrip() {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  const handlePlaceSelect = (place) => {
    setSelectedDestination(place);
    handleInputChange('location',place)
  };

    const handleInputChange = (name,value) => {
    setFormData({
      ...formData,
      [name] : value
    })
  }

  useEffect(()=>{
    console.log(formData);
  },[formData])

    const handleGoogleSignIn = () => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log(user);

                const userProfile = {
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    uid: user.uid,
                };
                
                localStorage.setItem('user', JSON.stringify(userProfile));
                setOpenDialog(false);
                OnGenerateTrip();
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error("Google Sign-In Error:", errorCode, errorMessage);
                toast("Failed to sign in with Google. Please try again.");
            });
    };

  const OnGenerateTrip = async () => {

    const user = localStorage.getItem('user');

    if (!user){
      setOpenDialog(true);
      return;
    }

    if (!formData?.noOfDays || !formData?.location || !formData?.budget || !formData?.traveler){
      toast("Please Enter All the Details");
      return;
    }
    if(formData?.noOfDays > 5){
      toast("Please Enter Trip Dates Less than 5");
      return;
    }

    setLoading(true); 

    const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', formData?.location?.properties?.formatted)
      .replace('{totalDays}', formData?.noOfDays)
      .replace('{traveler}', formData?.traveler)
      .replace('{budget}', formData?.budget)
//       .replace('{totalDays}', formData?.noOfDays);

//     console.log("Sending prompt to AI:", FINAL_PROMPT);

    try {
      const result = await generateAiResponse(FINAL_PROMPT); 
//       console.log("AI Response:", result);
      await SaveAiTrip(result);
      
    } catch (error) {
        toast("Something went wrong while generating your trip.");
        console.error(error);
    } finally {
        setLoading(false); 
    }
  } 

  const SaveAiTrip = async(TripData) =>{
    const user = JSON.parse(localStorage.getItem('user'));
    const docId = Date.now().toString();

    // 1. Clean the AI response to remove the markdown code block wrapper
    const cleanedResponse = TripData.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    try {
      // 2. Parse the cleaned string
      const parsedData = JSON.parse(cleanedResponse);

      // 3. Save the valid JSON to Firestore
      await setDoc(doc(db,"AITrips",docId),{
        userSelection: formData,
        tripData: parsedData,
        userEmail: user?.email,
        id: docId
      });
      toast("Your trip has been saved successfully!");
      navigate('/view-trip/'+docId)

    } catch (error) {
      console.error("Failed to parse AI response or save trip:", error);
      toast("There was an error saving your trip. The AI response was not valid JSON.");
    }
  }

  return (
    <div className='sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10'>
      <h2 className='font-bold text-3xl'>
        Tell Us Your Travel Preference 🏕️🌴
      </h2>
      <p className='mt-3 text-gray-500 text-xl'>
        Just provide some basic information, and our trip planner will generate a customized itinerary based on your preferences.
      </p>

      <div className='mt-20 flex flex-col gap-10'>
        
        <div>
          <h2 className='text-xl my-3 font-medium'>
            What is your destination of choice?
          </h2>
          <AddressAutocomplete 
          onPlaceSelect={handlePlaceSelect} 
          />
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>
            How many days are you planning your trip ?
          </h2>
          <Input 
            placeholder = {'Ex.3'}
            type='number'
            onChange = {(e) => handleInputChange('noOfDays',e.target.value)}
          />
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>
            What is Your Budget ?
          </h2>
          <p className='mt-3 text-gray-500 text-lg'>
            The Budget is exclusively allocated for activities and dining purpose.
          </p>
          <div className='grid grid-cols-3 gap-5 mt-5'>
            {SelectBudgetOptions.map((item,index) => (
              <div 
                key={index} 
                onClick={() => handleInputChange('budget',item.title)}
                className= {`p-4 border cursor-pointer rounded-lg hover:shadow-lg
                  ${formData?.budget == item.title && 'shadow-lg border-black'}`}
              >
                <h2 className='text-4xl'>{item.icon}</h2>
                <h2 className='font-bold text-lg'>{item.title}</h2>
                <h2 className='text-sm text-gray-500'>{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className='text-xl my-3 font-medium'>
            Who do you plan on traveling with on your next adventure ?
          </h2>
          <div className='grid grid-cols-3 gap-5 mt-5'>
            {SelectTravelesList.map((item,index) => (
              <div 
                key={index} 
                onClick={() => handleInputChange('traveler',item.people)}
                className= {`p-4 border cursor-pointer rounded-lg hover:shadow-lg
                  ${formData?.traveler == item.people && 'shadow-lg border-black'}`}
                >
                <h2 className='text-4xl'>{item.icon}</h2>
                <h2 className='font-bold text-lg'>{item.title}</h2>
                <h2 className='text-sm text-gray-500'>{item.desc}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className='my-10 flex justify-end'>
        <Button onClick={OnGenerateTrip} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Trip'}
        </Button>
      </div>

      <Dialog open = {openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogDescription className="text-center">
              <img src="/logo.svg" className='w-40 mx-auto'/>
              <h2 className='font-bold text-lg mt-7'>Sign In with Google</h2>
              <p>Sign In to the Website with Google Authentication Securely.</p>

              <Button 
                onClick={handleGoogleSignIn}
                className="w-full mt-5 flex gap-4 items-center">
                <FcGoogle className='h-7 w-7' />
                Sign In with Google
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default CreateTrip;