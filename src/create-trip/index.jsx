import React, { useEffect, useState } from 'react';
import AddressAutocomplete from '@/components/AddressAutocomplete'; 
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AI_PROMPT, SelectBudgetOptions, SelectTravelesList } from '@/constants/options';
import { toast } from 'sonner';
// Import the new AI function
import { generateAiResponse } from '@/lib/gemini'; // Make sure the path is correct

function CreateTrip() {
  const [selectedDestination, setSelectedDestination] = useState(null);
  // Initialize formData as an object, not an array
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

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


  const OnGenerateTrip = async () => { // Make the function async
    if (!formData?.noOfDays || !formData?.location || !formData?.budget || !formData?.traveler){
      toast("Please Enter All the Details");
      return;
    }
    if(formData?.noOfDays > 5){
      toast("Please Enter Trip Dates Less than 5");
      return;
    }

    setLoading(true); // Set loading state to true

    const FINAL_PROMPT = AI_PROMPT
      .replace('{location}', formData?.location?.properties?.formatted)
      .replace('{totalDays}', formData?.noOfDays)
      .replace('{traveler}', formData?.traveler)
      .replace('{budget}', formData?.budget)
      .replace('{totalDays}', formData?.noOfDays);

    console.log("Sending prompt to AI:", FINAL_PROMPT);

    try {
      const result = await generateAiResponse(FINAL_PROMPT); // Call the AI model and wait for the result
      console.log("AI Response:", result);
      // Now you can use the 'result' state to display it in your UI
      // For example: setAiResult(result);
    } catch (error) {
        toast("Something went wrong while generating your trip.");
        console.error(error);
    } finally {
        setLoading(false); // Set loading state to false after completion or error
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
        {/* ... your existing JSX for inputs ... */}
        
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

    </div>
  );
}

export default CreateTrip;