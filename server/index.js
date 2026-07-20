import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveTrip, getTrip, getAllTrips } from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize LLM APIs
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  console.log("Gemini API key loaded successfully.");
}
if (OPENAI_API_KEY) {
  console.log("OpenAI API key loaded successfully.");
}
if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
  console.warn("WARNING: Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured. Running in sandbox mode with fallback mock data.");
}

// Fallback Mock Data for Demo
const MOCK_TRIPS = {
  kolkata: {
    destination: "Kolkata, West Bengal, India",
    noOfDays: 3,
    budget: "Medium",
    traveler: "Couple",
    coordinates: { latitude: 22.5726, longitude: 88.3639 },
    tripOverview: {
      description: "Kolkata, the City of Joy, is the cultural capital of India. Known for its grand colonial architecture, rich artistic heritage, and legendary street food, it offers a deep, soul-stirring experience.",
      packingSuggestions: ["Light cotton clothing", "Comfortable walking shoes", "Umbrella", "Hand sanitizer"],
      bestTimeToVisit: "October to February"
    },
    hotels: [
      {
        hotelName: "The Oberoi Grand",
        address: "15, Jawaharlal Nehru Rd, Dharmatala, Kolkata",
        price: "180 USD/night",
        rating: 4.8,
        description: "Elegant colonial-era luxury hotel in the heart of Kolkata's shopping district."
      },
      {
        hotelName: "Fairlawn Hotel",
        address: "13-A, Sudder St, Kolkata",
        price: "60 USD/night",
        rating: 4.2,
        description: "Charming heritage hotel offering a cozy British-colonial atmosphere and lush green garden."
      }
    ],
    itinerary: [
      {
        day: 1,
        theme: "Colonial Heritage & Classic Landmarks",
        schedule: [
          {
            time: "09:00 AM",
            activityName: "Victoria Memorial",
            description: "Visit the iconic white marble palace built in memory of Queen Victoria. Stroll through the lush gardens.",
            cost: "5 USD",
            duration: "2 hours",
            location: "Victoria Memorial Hall, 1, Queens Way, Kolkata",
            latitude: 22.5448,
            longitude: 88.3426
          },
          {
            time: "01:00 PM",
            activityName: "Lunch at Peter Cat",
            description: "Savor the famous Chelo Kabab at one of Park Street's legendary legacy restaurants.",
            cost: "15 USD",
            duration: "1.5 hours",
            location: "18A, Park St, Kolkata",
            latitude: 22.5531,
            longitude: 88.3534
          },
          {
            time: "03:00 PM",
            activityName: "Indian Museum",
            description: "Explore the oldest and largest museum in India, featuring rare collections of antiques, armor, and fossils.",
            cost: "4 USD",
            duration: "2.5 hours",
            location: "27, Jawaharlal Nehru Rd, Kolkata",
            latitude: 22.5579,
            longitude: 88.3512
          }
        ]
      },
      {
        day: 2,
        theme: "Cultural Exploration & Spiritual Peace",
        schedule: [
          {
            time: "09:00 AM",
            activityName: "Dakshineswar Kali Temple",
            description: "A famous 19th-century Hindu temple dedicated to Bhavatarini, located on the eastern bank of the Hooghly River.",
            cost: "Free",
            duration: "2 hours",
            location: "Dakshineswar, Kolkata",
            latitude: 22.6550,
            longitude: 88.3582
          },
          {
            time: "12:00 PM",
            activityName: "Belur Math",
            description: "Cross the river by ferry to visit the headquarters of the Ramakrishna Mission, showcasing architectural harmony of temple, mosque, and church.",
            cost: "Free",
            duration: "2 hours",
            location: "Belur, Howrah",
            latitude: 22.6327,
            longitude: 88.3556
          },
          {
            time: "04:30 PM",
            activityName: "Howrah Bridge & Flower Market",
            description: "View the engineering marvel of Howrah Bridge at sunset and walk through the vibrant, bustling Mallick Ghat Flower Market.",
            cost: "Free",
            duration: "1.5 hours",
            location: "Mallick Ghat, Howrah",
            latitude: 22.5854,
            longitude: 88.3478
          }
        ]
      },
      {
        day: 3,
        theme: "Local Flavors & Artisanal Culture",
        schedule: [
          {
            time: "09:30 AM",
            activityName: "Kumartuli Potter's Colony",
            description: "Walk through the traditional potters' quarter in northern Kolkata where clay idols of gods and goddesses are handcrafted.",
            cost: "Free",
            duration: "2 hours",
            location: "Kumartuli, Hatkhola, Kolkata",
            latitude: 22.6014,
            longitude: 88.3619
          },
          {
            time: "12:30 PM",
            activityName: "Coffee & Snacks at Indian Coffee House",
            description: "Visit the legendary meeting place for intellectuals, students, and artists on College Street.",
            cost: "5 USD",
            duration: "1.5 hours",
            location: "15, Bankim Chatterjee St, College Street, Kolkata",
            latitude: 22.5759,
            longitude: 88.3629
          },
          {
            time: "03:00 PM",
            activityName: "Eco Park Shopping & Boating",
            description: "Conclude the trip at New Town's massive urban park, featuring replicas of the Seven Wonders of the World and boating activities.",
            cost: "3 USD",
            duration: "3 hours",
            location: "Major Arterial Road, Action Area II, New Town, Kolkata",
            latitude: 22.6074,
            longitude: 88.4682
          }
        ]
      }
    ]
  },
  delhi: {
    destination: "New Delhi, India",
    noOfDays: 3,
    budget: "Medium",
    traveler: "Couple",
    coordinates: { latitude: 28.6139, longitude: 77.2090 },
    tripOverview: {
      description: "Delhi, India's bustling capital, blends ancient history with dynamic modernity. From Mughal-era red sandstone forts to modern shopping avenues, it is a city of high energy.",
      packingSuggestions: ["Scarf for covering head in religious sites", "Sunglasses & sunscreen", "Comfortable sneakers"],
      bestTimeToVisit: "November to March"
    },
    hotels: [
      {
        hotelName: "The Imperial New Delhi",
        address: "Janpath, Connaught Place, New Delhi",
        price: "200 USD/night",
        rating: 4.9,
        description: "Award-winning heritage hotel combining Victorian and Art Deco styles."
      },
      {
        hotelName: "Bloomrooms @ Janpath",
        address: "10, Janpath Rd, Connaught Place, New Delhi",
        price: "75 USD/night",
        rating: 4.3,
        description: "Bright, minimalist hotel with cheerful yellow design and excellent location."
      }
    ],
    itinerary: [
      {
        day: 1,
        theme: "Imperial Monuments & Modern Heart",
        schedule: [
          {
            time: "09:00 AM",
            activityName: "Qutub Minar",
            description: "Explore the 73-meter tall sandstone tower built in 1193, surrounded by ruins of early Islamic heritage.",
            cost: "7 USD",
            duration: "2 hours",
            location: "Seth Sarai, Mehrauli, New Delhi",
            latitude: 28.5244,
            longitude: 77.1855
          },
          {
            time: "12:00 PM",
            activityName: "Humayun's Tomb",
            description: "Visit the magnificent garden tomb of Mughal Emperor Humayun, which inspired the Taj Mahal.",
            cost: "7 USD",
            duration: "2 hours",
            location: "Mathura Road, Nizamuddin East, New Delhi",
            latitude: 28.5933,
            longitude: 77.2507
          },
          {
            time: "03:30 PM",
            activityName: "India Gate & Kartavya Path",
            description: "Stroll along the grand ceremonial boulevard of India, viewing the monumental war memorial dedicated to soldiers.",
            cost: "Free",
            duration: "1.5 hours",
            location: "Rajpath, India Gate, New Delhi",
            latitude: 28.6129,
            longitude: 77.2295
          }
        ]
      },
      {
        day: 2,
        theme: "Old Delhi Heritage & Spice Markets",
        schedule: [
          {
            time: "09:30 AM",
            activityName: "Red Fort (Lal Qila)",
            description: "Walk inside the grand red sandstone fortress that served as the main residence of Mughal emperors.",
            cost: "8 USD",
            duration: "2.5 hours",
            location: "Netaji Subhash Marg, Chandni Chowk, Delhi",
            latitude: 28.6562,
            longitude: 77.2410
          },
          {
            time: "12:30 PM",
            activityName: "Jama Masjid & Rickshaw Ride",
            description: "Visit India's largest mosque and take a rickshaw ride through the narrow, sensory-rich streets of Chandni Chowk.",
            cost: "5 USD",
            duration: "2 hours",
            location: "Chandni Chowk, Old Delhi",
            latitude: 28.6507,
            longitude: 77.2334
          },
          {
            time: "03:00 PM",
            activityName: "Street Food Tour at Karim's",
            description: "Enjoy historic Mughlai dishes at the legendary culinary spot near Jama Masjid.",
            cost: "12 USD",
            duration: "1.5 hours",
            location: "16, Gali Kababian, Jama Masjid, Delhi",
            latitude: 28.6496,
            longitude: 77.2344
          }
        ]
      },
      {
        day: 3,
        theme: "Spiritual Harmony & Modern Vibe",
        schedule: [
          {
            time: "09:00 AM",
            activityName: "Lotus Temple",
            description: "Admire the Bahai House of Worship shaped like a blooming lotus, open to all religions for silent prayer.",
            cost: "Free",
            duration: "1.5 hours",
            location: "Lotus Temple Rd, Kalkaji, New Delhi",
            latitude: 28.5535,
            longitude: 77.2588
          },
          {
            time: "11:30 AM",
            activityName: "Akshardham Temple",
            description: "Marvel at the monumental temple complex showcasing thousands of years of Indian culture, spirituality, and art.",
            cost: "Free",
            duration: "3 hours",
            location: "Noida Mor, Pandav Nagar, New Delhi",
            latitude: 28.6127,
            longitude: 77.2773
          },
          {
            time: "04:30 PM",
            activityName: "Sunset & Dinner at Hauz Khas Village",
            description: "Stroll the historic lakeside ruins before exploring CP's trendy boutiques, cafes, and rooftop restaurants.",
            cost: "20 USD",
            duration: "4 hours",
            location: "Hauz Khas, New Delhi",
            latitude: 28.5528,
            longitude: 77.1939
          }
        ]
      }
    ]
  },
  mumbai: {
    destination: "Mumbai, Maharashtra, India",
    noOfDays: 3,
    budget: "Medium",
    traveler: "Couple",
    coordinates: { latitude: 19.0760, longitude: 72.8777 },
    tripOverview: {
      description: "Mumbai, the City of Dreams, is India's financial capital, Bollywood home, and a coastal metropolis filled with historical landmarks and legendary street food.",
      packingSuggestions: ["Breathable clothes", "Slip-on shoes for temples", "Umbrella"],
      bestTimeToVisit: "November to February"
    },
    hotels: [
      {
        hotelName: "The Taj Mahal Palace",
        address: "Apollo Bandar, Colaba, Mumbai",
        price: "250 USD/night",
        rating: 4.9,
        description: "Iconic flagship luxury hotel overlooking the Gateway of India."
      },
      {
        hotelName: "Sea Green South Hotel",
        address: "145A, Marine Dr, Churchgate, Mumbai",
        price: "80 USD/night",
        rating: 4.1,
        description: "Comfortable hotel offering stunning sea views of the Queen's Necklace."
      }
    ],
    itinerary: [
      {
        day: 1,
        theme: "Colonial Charm & Coastal Vistas",
        schedule: [
          {
            time: "09:00 AM",
            activityName: "Gateway of India",
            description: "Visit the iconic arch monument built during the British Raj overlooking the Arabian Sea.",
            cost: "Free",
            duration: "1.5 hours",
            location: "Apollo Bandar, Colaba, Mumbai",
            latitude: 18.9220,
            longitude: 72.8347
          },
          {
            time: "11:00 AM",
            activityName: "Chhatrapati Shivaji Maharaj Terminus",
            description: "Marvel at the Gothic revival UNESCO World Heritage railway terminal, a true architectural masterpiece.",
            cost: "Free",
            duration: "1.5 hours",
            location: "Chhatrapati Shivaji Terminus Area, Fort, Mumbai",
            latitude: 18.9402,
            longitude: 72.8355
          },
          {
            time: "01:00 PM",
            activityName: "Lunch at Leopold Cafe",
            description: "Grab a bite at the historic Colaba cafe frequented by travelers since 1871.",
            cost: "15 USD",
            duration: "1.5 hours",
            location: "S.B. Singh Road, Colaba, Mumbai",
            latitude: 18.9227,
            longitude: 72.8322
          },
          {
            time: "05:00 PM",
            activityName: "Marine Drive Sunset Walk",
            description: "Stroll along the curved coastal promenade, watching the lights glow like a Queen's Necklace.",
            cost: "Free",
            duration: "2 hours",
            location: "Netaji Subhash Chandra Bose Road, Mumbai",
            latitude: 18.9433,
            longitude: 72.8230
          }
        ]
      },
      {
        day: 2,
        theme: "Island Caves & Traditional Laundry",
        schedule: [
          {
            time: "09:00 AM",
            activityName: "Elephanta Caves",
            description: "Take a ferry from the Gateway of India to Elephanta Island, home to ancient rock-cut cave temples dedicated to Shiva.",
            cost: "10 USD",
            duration: "4 hours",
            location: "Elephanta Island, Mumbai Harbour",
            latitude: 18.9633,
            longitude: 72.9315
          },
          {
            time: "02:30 PM",
            activityName: "Dhobi Ghat Viewpoint",
            description: "Witness the world's largest open-air laundry where thousands of washers clean garments daily.",
            cost: "Free",
            duration: "1 hour",
            location: "Dr. E. Moses Rd, Mahalaxmi, Mumbai",
            latitude: 18.9827,
            longitude: 72.8251
          },
          {
            time: "04:30 PM",
            activityName: "Haji Ali Dargah",
            description: "Walk down the narrow causeway into the sea to visit the floating mosque and tomb of the Sufi saint.",
            cost: "Free",
            duration: "2 hours",
            location: "Dargah Rd, Haji Ali, Mumbai",
            latitude: 18.9827,
            longitude: 72.8090
          }
        ]
      },
      {
        day: 3,
        theme: "Bazaar Shopping & Trendy Suburbs",
        schedule: [
          {
            time: "10:00 AM",
            activityName: "Crawford Market & Colaba Causeway",
            description: "Shop for exotic fruits, spices, and unique souvenirs at Mumbai's popular shopping markets.",
            cost: "Free",
            duration: "3 hours",
            location: "Dhobi Talao, Fort, Mumbai",
            latitude: 18.9472,
            longitude: 72.8333
          },
          {
            time: "03:00 PM",
            activityName: "Bandstand Promenade & Bandra Fort",
            description: "Explore the upscale Bandra suburb, view Shah Rukh Khan's bungalow, and sit on the ruins of Bandra Fort overlooking the Sea Link bridge.",
            cost: "Free",
            duration: "2.5 hours",
            location: "Bandstand, Bandra West, Mumbai",
            latitude: 19.0416,
            longitude: 72.8185
          }
        ]
      }
    ]
  }
};

// LLM Gen Helper
async function generateTripWithAI(location, noOfDays, budget, traveler) {
  const prompt = `
Generate a highly detailed travel itinerary for the following parameters:
- Destination: ${location}
- Duration: ${noOfDays} days
- Budget Level: ${budget}
- Traveler Type: ${traveler}

You must return the response in strict JSON format. No markdown, no HTML, no explanation, only a single JSON object.
The JSON object must strictly match the following JSON schema:
{
  "destination": "Destination name, region, country",
  "noOfDays": ${noOfDays},
  "budget": "${budget}",
  "traveler": "${traveler}",
  "coordinates": {
    "latitude": number,
    "longitude": number
  },
  "tripOverview": {
    "description": "A compelling, beautifully written overview of the trip and what makes it special.",
    "packingSuggestions": ["packing item 1", "packing item 2", ...],
    "bestTimeToVisit": "Best months and seasons to visit"
  },
  "hotels": [
    {
      "hotelName": "Hotel name",
      "address": "Full street address",
      "price": "Average price per night with currency",
      "rating": number (e.g. 4.5),
      "description": "A descriptive summary of why it's a good choice."
    }
  ],
  "itinerary": [
    {
      "day": number,
      "theme": "Daily theme or focus",
      "schedule": [
        {
          "time": "Estimated start time (e.g. 09:00 AM)",
          "activityName": "Name of the place, activity or attraction",
          "description": "Engaging description of the activity.",
          "cost": "Estimated entry fee or cost (e.g. Free or $10)",
          "duration": "Estimated duration (e.g. 2 hours)",
          "location": "Address of the activity",
          "latitude": number,
          "longitude": number
        }
      ]
    }
  ]
}

Double check that the latitude and longitude fields are numbers (not strings) so they can be plotted on a map. Generate at least 3 distinct activities per day. Make the hotel list contain at least 2 recommended options matching the budget category. Make sure the output is a single clean JSON object, parseable by JSON.parse.
`;

  if (OPENAI_API_KEY) {
    console.log("Using OpenAI (gpt-4o-mini) for itinerary generation...");
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API error: ${errText}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } else if (genAI) {
    console.log("Using Gemini (gemini-1.5-flash) for itinerary generation...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(result.response.text());
  } else {
    throw new Error("No LLM API keys configured.");
  }
}

// Generate Trip Endpoint
app.post('/api/generate-trip', async (req, res) => {
  const { location, noOfDays, budget, traveler } = req.body;
  
  if (!location || !noOfDays || !budget || !traveler) {
    return res.status(400).json({ error: "Missing required query parameters: location, noOfDays, budget, traveler." });
  }

  const daysNum = parseInt(noOfDays, 10);
  
  try {
    let tripData = null;
    
    // Check if we can use LLM
    if (genAI || OPENAI_API_KEY) {
      console.log(`Generating AI trip for ${location.label || location}...`);
      try {
        tripData = await generateTripWithAI(location.label || location, daysNum, budget, traveler);
      } catch (aiError) {
        console.error("AI generation failed, falling back to mock or local generation:", aiError);
      }
    }
    
    // Fallback if AI key is missing or failed
    if (!tripData) {
      const locKey = (location.value || location).toLowerCase().trim();
      if (MOCK_TRIPS[locKey]) {
        console.log(`Using mock trip for ${locKey}`);
        tripData = JSON.parse(JSON.stringify(MOCK_TRIPS[locKey]));
        tripData.noOfDays = daysNum;
        tripData.budget = budget;
        tripData.traveler = traveler;
        
        // Clip or pad itinerary days based on noOfDays requested
        if (tripData.itinerary.length > daysNum) {
          tripData.itinerary = tripData.itinerary.slice(0, daysNum);
        } else if (tripData.itinerary.length < daysNum) {
          // pad it
          const originalLength = tripData.itinerary.length;
          for (let i = originalLength; i < daysNum; i++) {
            const dayTemplate = JSON.parse(JSON.stringify(tripData.itinerary[(i - originalLength) % originalLength]));
            dayTemplate.day = i + 1;
            tripData.itinerary.push(dayTemplate);
          }
        }
      } else {
        // Fallback generator for un-mocked cities
        console.log(`Using custom procedural trip generator for ${location.label || location}`);
        tripData = {
          destination: location.label || location,
          noOfDays: daysNum,
          budget: budget,
          traveler: traveler,
          coordinates: { latitude: 22.5726, longitude: 88.3639 },
          tripOverview: {
            description: `A custom-tailored journey to ${location.label || location} designed for a ${traveler} budget of ${budget}.`,
            packingSuggestions: ["Comfortable outfits", "Sufficient cash", "Local adapter"],
            bestTimeToVisit: "Throughout the year"
          },
          hotels: [
            {
              hotelName: `${location.label || location} Plaza Hotel`,
              address: `1 Main Street, ${location.label || location}`,
              price: budget === 'Low' ? '30 USD/night' : budget === 'Medium' ? '80 USD/night' : '220 USD/night',
              rating: 4.4,
              description: "A highly-rated central hotel with modern amenities."
            },
            {
              hotelName: `${location.label || location} View Inn`,
              address: `15 Coastal Road, ${location.label || location}`,
              price: budget === 'Low' ? '25 USD/night' : budget === 'Medium' ? '70 USD/night' : '180 USD/night',
              rating: 4.1,
              description: "Cozy rooms with great access to public transport."
            }
          ],
          itinerary: []
        };
        
        // procedural schedule
        for (let d = 1; d <= daysNum; d++) {
          tripData.itinerary.push({
            day: d,
            theme: `Exploring the highlights of ${location.label || location}`,
            schedule: [
              {
                time: "09:00 AM",
                activityName: `Historical Center of ${location.label || location}`,
                description: "Explore local cultural landmarks and take photos of historical architecture.",
                cost: "Free",
                duration: "3 hours",
                location: `Downtown ${location.label || location}`,
                latitude: 22.5726 + (Math.random() - 0.5) * 0.05,
                longitude: 88.3639 + (Math.random() - 0.5) * 0.05
              },
              {
                time: "01:00 PM",
                activityName: "Local Foods and Shopping",
                description: "Enjoy regional specialities at a top-rated dining spot and browse the shopping districts.",
                cost: budget === 'Low' ? '5 USD' : budget === 'Medium' ? '15 USD' : '45 USD',
                duration: "2 hours",
                location: `Central Bazaar, ${location.label || location}`,
                latitude: 22.5726 + (Math.random() - 0.5) * 0.05,
                longitude: 88.3639 + (Math.random() - 0.5) * 0.05
              },
              {
                time: "04:30 PM",
                activityName: "Scenic Sunset Point",
                description: "Relax and view a beautiful sunset at the most popular coastal or hilltop spot in the city.",
                cost: "Free",
                duration: "2 hours",
                location: `Coastal Boulevard, ${location.label || location}`,
                latitude: 22.5726 + (Math.random() - 0.5) * 0.05,
                longitude: 88.3639 + (Math.random() - 0.5) * 0.05
              }
            ]
          });
        }
      }
    }

    // Save trip to database
    const savedTrip = saveTrip(tripData);
    res.status(200).json(savedTrip);
  } catch (error) {
    console.error("Endpoint error generating trip:", error);
    res.status(500).json({ error: "Failed to generate travel plan.", details: error.message });
  }
});

// Get Trip by ID
app.get('/api/trips/:id', (req, res) => {
  const trip = getTrip(req.params.id);
  if (!trip) {
    return res.status(404).json({ error: "Trip not found." });
  }
  res.status(200).json(trip);
});

// Get All Trips
app.get('/api/trips', (req, res) => {
  res.status(200).json(getAllTrips());
});

// Chatbot assistant route
app.post('/api/chat', async (req, res) => {
  const { trip, message } = req.body;
  if (!trip || !message) {
    return res.status(400).json({ error: "Missing trip details or message." });
  }

  try {
    const systemInstruction = `
You are an expert AI Travel Assistant helping a traveler on their trip.
Here are the trip details:
- Destination: ${trip.destination}
- Duration: ${trip.noOfDays} days
- Budget Level: ${trip.budget}
- Traveler Type: ${trip.traveler}
- Overview: ${trip.tripOverview?.description}
- Hotel recommendations: ${JSON.stringify(trip.hotels)}
- Detailed Itinerary: ${JSON.stringify(trip.itinerary)}

Help the user with any questions they have. Suggest alternative spots, provide historical details, recommend restaurants near their activities, give packing advice, or help adjust their schedule. Keep your replies concise (under 4 sentences), friendly, and highly actionable.
`;

    if (OPENAI_API_KEY) {
      console.log("Using OpenAI (gpt-4o-mini) for chatbot assistant...");
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: message }
          ]
        })
      });

      if (!response.ok) {
        throw new Error("OpenAI API error during chat.");
      }

      const data = await response.json();
      res.status(200).json({ text: data.choices[0].message.content });
    } else if (genAI) {
      console.log("Using Gemini (gemini-1.5-flash) for chatbot assistant...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: `Here is my trip context:\n${systemInstruction}` }] },
          { role: 'model', parts: [{ text: "Got it! I am ready to assist you. Ask me anything about your trip!" }] }
        ]
      });
      const response = await chat.sendMessage(message);
      res.status(200).json({ text: response.response.text() });
    } else {
      res.status(200).json({
        text: `[Sandbox Companion] That's a great question about your trip to ${trip.destination}! As we are in offline demo mode, I'll happily simulate a travel expert: Make sure you visit the morning sights early, pack according to the checklist, and stay under the budget limit!`
      });
    }
  } catch (error) {
    console.error("Chat assistant error:", error);
    res.status(500).json({ error: "Failed to query chat assistant.", details: error.message });
  }
});

// Serve static assets in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for React Router client-side routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

export default app;
