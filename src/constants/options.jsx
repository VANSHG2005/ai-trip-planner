export const SelectTravelesList = [
    {
        id: 1,
        title: 'Just Me',
        desc: 'A sole traveles in exploration',
        icon: '✈️',
        people: '1'
    },
    {
        id: 2,
        title: 'A Couple',
        desc: 'Two traveles in tandem',
        icon: '🥂',
        people: '2 People'
    },
    {
        id: 3,
        title: 'Family',
        desc: 'A group of fun loving adv',
        icon: '🏡',
        people: '3 to 5 People'
    },
    {
    id: 4,
    title: 'Friends',
    desc: 'A bunch of thrill-seekes',
    icon: '⛺',
    people: '5 to 10 People'
    },
]

export const SelectBudgetOptions = [
    {
        id: 1,
        title: 'Cheap',
        desc: 'Stay conscious of costs',
        icon: '🪙',
    },
    {
        id: 2,
        title: 'Moderate',
        desc: 'Keep cost on the average side',
        icon: '💰',
    },
    {
        id: 3,
        title: 'Luxury',
        desc: 'Dont worry about cost',
        icon: '💸',
    },
]

// In src/constants/options.js

export const AI_PROMPT = `
Generate a detailed travel plan for the following location based on user preferences.
The user wants to go to: {location} for {totalDays} days.
Their budget is {budget} and they are traveling with {traveler}.

Your entire response MUST be a single, valid JSON object. Do not include any text, explanations, or markdown characters like \`\`\`json before or after the JSON object.
You must strictly follow the JSON format and use the exact key names provided in the example structure below.

Key Requirements:
1.  **Itinerary:** Create a plan for each day. Each day's itinerary must include 4-5 activities. These activities should be a mix of sightseeing, experiences, and at least one specific dining recommendation (for lunch or dinner) featuring famous local cuisine.
2.  **Hotels:** Provide a list of 5-6 diverse hotel recommendations that are suitable for the user's budget and group size.

{
  "tripData": {
    "location": "{location}",
    "duration": "{totalDays} Days",
    "budget": "{budget}",
    "group_size": "{traveler}",
    "itinerary": [
      {
        "day": "Day 1: [Descriptive Title of the Day]",
        "bestTimeToVisit": "Full Day",
        "activities": [
          {
            "placeName": "Example Activity/Restaurant Name",
            "placeDetails": "A detailed description of the activity or place. If it's a restaurant, describe the cuisine and why it's recommended.",
            "timeSpent": "Approximate time to spend, e.g., '2-3 hours'",
            "ticketPricing": "Estimated cost, e.g., '$20 per person' or 'Free'",
            "placeImageUrl": "https://example.com/image.jpg",
            "geoCoordinates": {
              "latitude": 0.0,
              "longitude": 0.0
            }
          }
        ]
      }
    ],
    "hotels": [
      {
        "hotelName": "Example Hotel Name",
        "hotelAddress": "123 Main St, City, Country",
        "description": "A detailed description of the hotel and its amenities, suitable for the traveler type.",
        "rating": "e.g., '4.5/5'",
        "price_per_night_usd": "e.g., 'Starting from $150-$200'",
        "hotelImageUrl": "https://example.com/hotel_image.jpg",
        "geoCoordinates": {
          "latitude": 0.0,
          "longitude": 0.0
        }
      }
    ],
    "notes": "General travel notes, tips for the group, and budget considerations."
  }
}
`;