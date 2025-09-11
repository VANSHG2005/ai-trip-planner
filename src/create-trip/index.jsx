import React, { useEffect, useState } from 'react';
import AddressAutocomplete from '@/components/AddressAutocomplete'; 
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';


function CreateTrip() {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

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

  const login = useGoogleLogin({
    onSuccess:(codeResp) => GetUserInfo(codeResp),
    onError:(error) => console.log(error)

  })


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
      .replace('{totalDays}', formData?.noOfDays);

    console.log("Sending prompt to AI:", FINAL_PROMPT);

    try {
      const result = await generateAiResponse(FINAL_PROMPT); 
      console.log("AI Response:", result);
      
    } catch (error) {
        toast("Something went wrong while generating your trip.");
        console.error(error);
    } finally {
        setLoading(false); 
    }
  } 

  const GetUserInfo = (tokenInfo) => {
    axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenInfo?.access_token}`, {
      headers: {
        Authorization: `Bearer ${tokenInfo?.access_token}`,
        Accept: 'Application/json'
      }
    }).then((resp) => {
      console.log(resp);
      localStorage.setItem('user', JSON.stringify(resp.data));
      setOpenDialog(false);
      OnGenerateTrip();
    }).catch(error => {
      console.error("Failed to fetch user info:", error);
      toast("Failed to sign in. Please try again.");
    });
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
            <DialogDescription>
              <img src="/logo.svg" className='w-50'/>
              <h2 className='font-bold text-lg mt-7'>Sign In with Google</h2>
              <p>Sign In to the Website with google Authentication Securely.</p>

              <Button 
              onClick = {login}
              className="w-full mt-5 flex gap-4 items=center">
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