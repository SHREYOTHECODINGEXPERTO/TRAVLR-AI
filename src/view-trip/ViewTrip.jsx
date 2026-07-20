import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  DollarSign,
  Users,
  Calendar,
  CloudSun,
  CheckSquare,
  MessageSquare,
  Plus,
  ArrowRight,
  Play,
  Compass,
  Trash2,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  Navigation,
  Loader2
} from "lucide-react";
import L from "leaflet";

function ViewTrip() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live Mode States
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [simulatedHour, setSimulatedHour] = useState(9); // 9 AM to 10 PM (9 to 22)
  const [activeActivity, setActiveActivity] = useState(null);

  // AI Assistant Chat States
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Expense Tracker States
  const [expenses, setExpenses] = useState([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Food");

  // Packing checklist states
  const [packedItems, setPackedItems] = useState({});

  // Map Ref
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylineRef = useRef(null);

  // Load trip details
  useEffect(() => {
    setLoading(true);
    fetch(`/api/trips/${tripId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not find the requested travel plan.");
        }
        return res.json();
      })
      .then((data) => {
        setTrip(data);
        setLoading(false);
        // Set initial chat message from assistant
        setChatMessages([
          {
            role: "assistant",
            text: `Hi there! I am your AI Travel Companion for your trip to ${data.destination}. Ask me anything about your itinerary, hotels, restaurants, or packing suggestions!`
          }
        ]);
        
        // Initialize packed items checklist
        if (data.tripOverview?.packingSuggestions) {
          const checklist = {};
          data.tripOverview.packingSuggestions.forEach((item, idx) => {
            checklist[idx] = false;
          });
          setPackedItems(checklist);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [tripId]);

  // Determine active activity based on day and simulated hour
  useEffect(() => {
    if (!trip || !trip.itinerary) return;

    const dayPlan = trip.itinerary.find((d) => d.day === activeDay);
    if (!dayPlan || !dayPlan.schedule || dayPlan.schedule.length === 0) {
      setActiveActivity(null);
      return;
    }

    // Parse hour from activity time (e.g. "09:00 AM" or "01:00 PM")
    const getHour24 = (timeStr) => {
      try {
        const parts = timeStr.trim().split(" ");
        const timePart = parts[0];
        const ampm = parts[1]?.toUpperCase();
        let [hours, minutes] = timePart.split(":").map(Number);
        
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;
        
        return hours;
      } catch (e) {
        return 9; // Fallback
      }
    };

    // Sort activities by hour
    const sortedActivities = [...dayPlan.schedule].sort(
      (a, b) => getHour24(a.time) - getHour24(b.time)
    );

    // Find the activity closest to (but before or equal to) the simulated hour
    let selected = sortedActivities[0];
    for (let i = 0; i < sortedActivities.length; i++) {
      const actHour = getHour24(sortedActivities[i].time);
      if (simulatedHour >= actHour) {
        selected = sortedActivities[i];
      }
    }

    setActiveActivity(selected);
  }, [trip, activeDay, simulatedHour]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Initialize and Update Map
  useEffect(() => {
    if (!isLiveMode || !trip || !mapContainerRef.current) {
      // Clean up map when leaving live mode
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      return;
    }

    // Create map instance if it doesn't exist
    if (!mapRef.current) {
      const centerLat = trip.coordinates?.latitude || 22.5726;
      const centerLng = trip.coordinates?.longitude || 88.3639;

      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([centerLat, centerLng], 12);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 20
      }).addTo(mapRef.current);
    }

    // Refresh markers and lines when day changes
    const dayPlan = trip.itinerary.find((d) => d.day === activeDay);
    if (!dayPlan || !dayPlan.schedule) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Clear existing polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const latlngs = [];

    // Add markers for current day's schedule
    dayPlan.schedule.forEach((activity, index) => {
      const lat = activity.latitude || (trip.coordinates?.latitude + (Math.random() - 0.5) * 0.05);
      const lng = activity.longitude || (trip.coordinates?.longitude + (Math.random() - 0.5) * 0.05);
      latlngs.push([lat, lng]);

      // Check if this is the active activity based on simulated hour
      const isCurrent = activeActivity && activeActivity.activityName === activity.activityName;

      const markerHtml = `
        <div class="flex flex-col items-center">
          <div class="w-8 h-8 rounded-full ${
            isCurrent
              ? "bg-cyan-400 ring-4 ring-cyan-400/50 scale-125"
              : "bg-slate-700 hover:bg-slate-600 border border-slate-500"
          } flex items-center justify-center text-white text-xs font-black shadow-xl transition-all duration-300">
            ${index + 1}
          </div>
          <div class="mt-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] text-white whitespace-nowrap font-medium shadow-md">
            ${activity.activityName}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-icon",
        iconSize: [40, 50],
        iconAnchor: [20, 25]
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current);
      
      const popupHtml = `
        <div class="p-2 text-slate-200 bg-slate-950 rounded-lg border border-slate-800 font-sans min-w-[200px]">
          <h4 class="font-extrabold text-cyan-400 text-sm mb-1">${activity.activityName}</h4>
          <p class="text-xs text-slate-400 mb-2">🕒 ${activity.time} (${activity.duration})</p>
          <p class="text-[11px] leading-relaxed text-slate-300">${activity.description}</p>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        closeButton: false,
        className: "custom-leaflet-popup"
      });

      markersRef.current.push(marker);
    });

    // Draw route connecting activities
    if (latlngs.length > 1) {
      polylineRef.current = L.polyline(latlngs, {
        color: "#22d3ee", // cyan-400
        weight: 3,
        dashArray: "6, 8",
        opacity: 0.8
      }).addTo(mapRef.current);

      // Fit map to bounds of markers
      mapRef.current.fitBounds(L.featureGroup(markersRef.current).getBounds(), {
        padding: [50, 50]
      });
    }

  }, [isLiveMode, trip, activeDay, activeActivity]);

  // Handle Assistant Chat Submit
  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim() || chatLoading) return;

    const userMsg = userInput.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setUserInput("");
    setChatLoading(true);

    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        trip: trip,
        message: userMsg
      })
    })
      .then((res) => res.json())
      .then((data) => {
        setChatMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
        setChatLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", text: "Sorry, I had trouble connecting. Let me try again." }
        ]);
        setChatLoading(false);
      });
  };

  // Add Custom Expense
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseName.trim() || !expenseAmount || isNaN(expenseAmount)) return;

    const newExpense = {
      id: Date.now(),
      name: expenseName.trim(),
      amount: parseFloat(expenseAmount),
      category: expenseCategory
    };

    setExpenses((prev) => [...prev, newExpense]);
    setExpenseName("");
    setExpenseAmount("");
  };

  // Toggle Packed Item
  const togglePackedItem = (index) => {
    setPackedItems((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Format hour number to display string
  const formatHour = (h) => {
    if (h === 12) return "12:00 PM";
    if (h > 12) return `${h - 12}:00 PM`;
    return `${h}:00 AM`;
  };

  // Simulated Weather based on hour
  const getWeatherForHour = (h) => {
    if (h < 12) return { temp: "26°C", condition: "Sunny & Mild", icon: "☀️" };
    if (h < 17) return { temp: "32°C", condition: "Sunny & Warm", icon: "🌤️" };
    if (h < 20) return { temp: "29°C", condition: "Partly Cloudy", icon: "⛅" };
    return { temp: "25°C", condition: "Clear Night Sky", icon: "🌙" };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin text-cyan-400 mb-4" size={50} />
        <p className="text-gray-400 text-lg">Fetching trip details...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white px-6">
        <div className="max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
          <h1 className="text-3xl font-bold text-red-400">Error Loading Trip</h1>
          <p className="text-gray-400 mt-4 leading-relaxed">{error || "The itinerary could not be loaded."}</p>
          <button
            onClick={() => navigate("/create-trip")}
            className="mt-8 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full font-semibold transition"
          >
            Create New Trip
          </button>
        </div>
      </div>
    );
  }

  // Calculate budget statistics
  const totalBudgetLimit = trip.budget === "Low" ? 1000 : trip.budget === "Medium" ? 2500 : 5000;
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budgetPercentage = Math.min((totalSpent / totalBudgetLimit) * 100, 100);

  return (
    <div className="min-h-screen bg-[#020617] text-white relative">
      {/* Background Grids */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 blur-[150px] rounded-full -top-10 left-10 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-600/5 blur-[150px] rounded-full bottom-10 right-10 pointer-events-none" />

      {/* Navigation Header */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-[#020617]/85 border-b border-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/create-trip")}
            className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">{trip.destination}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <span>📅 {trip.noOfDays} Days</span>
              <span>•</span>
              <span>💵 Budget: {trip.budget}</span>
              <span>•</span>
              <span>👥 Traveler: {trip.traveler}</span>
            </p>
          </div>
        </div>

        {/* Live Mode Toggle Button */}
        <button
          onClick={() => setIsLiveMode(!isLiveMode)}
          className={`flex items-center gap-2 rounded-full px-6 py-2.5 font-bold text-sm tracking-wide transition-all shadow-md ${
            isLiveMode
              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white animate-pulse"
              : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 text-white"
          }`}
        >
          {isLiveMode ? (
            <>
              <Clock size={16} /> Exit Live Mode
            </>
          ) : (
            <>
              <Play size={16} /> Launch Live Mode
            </>
          )}
        </button>
      </div>

      {/* MAIN CONTAINER */}
      {!isLiveMode ? (
        /* ==================== STANDARD VIEW MODE ==================== */
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
          {/* Trip Overview */}
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md">
            <h3 className="text-2xl font-black text-white flex items-center gap-2">
              <Compass className="text-cyan-400" size={24} /> Journey Overview
            </h3>
            <p className="text-gray-400 mt-4 leading-8 text-lg">{trip.tripOverview?.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-slate-800/60 pt-8">
              <div>
                <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Recommended Packing</h4>
                <ul className="mt-4 grid grid-cols-2 gap-2 text-gray-300">
                  {trip.tripOverview?.packingSuggestions?.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm bg-slate-950/40 rounded-xl px-4 py-2 border border-slate-800/50">
                      🧳 {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Best Season to Visit</h4>
                <p className="mt-4 text-gray-300 text-sm bg-slate-950/40 rounded-xl px-4 py-3 border border-slate-800/50 leading-relaxed">
                  ☀️ {trip.tripOverview?.bestTimeToVisit || "Varies by local season conditions."}
                </p>
              </div>
            </div>
          </section>

          {/* Hotels recommendations */}
          <section>
            <h3 className="text-2xl font-black text-white mb-6">🏨 Suggested Stays</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {trip.hotels?.map((hotel, index) => (
                <div
                  key={index}
                  className="bg-slate-900/30 border border-slate-800 hover:border-cyan-500/30 rounded-3xl p-6 transition group hover:-translate-y-1 duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="text-xl font-bold text-white group-hover:text-cyan-400 transition">
                        {hotel.hotelName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin size={12} /> {hotel.address}
                      </p>
                    </div>
                    <span className="text-yellow-400 font-bold flex items-center gap-1 text-sm bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
                      ★ {hotel.rating}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mt-4">
                    {hotel.description}
                  </p>

                  <div className="mt-6 border-t border-slate-800 pt-4 flex justify-between items-center">
                    <span className="text-xs text-slate-500">Est. Pricing</span>
                    <span className="text-cyan-300 font-extrabold text-lg">{hotel.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Daily Schedule Itinerary */}
          <section className="space-y-6">
            <h3 className="text-2xl font-black text-white mb-6">📅 Daily Itinerary</h3>
            {trip.itinerary?.map((dayPlan) => (
              <div
                key={dayPlan.day}
                className="bg-slate-900/20 border border-slate-900 rounded-3xl p-8 space-y-6 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-cyan-400 uppercase tracking-widest font-black">Day {dayPlan.day}</span>
                    <h4 className="text-2xl font-extrabold text-white mt-1">{dayPlan.theme}</h4>
                  </div>
                </div>

                <div className="space-y-6">
                  {dayPlan.schedule?.map((activity, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-6 p-5 bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800/50 rounded-2xl transition duration-200"
                    >
                      <div className="md:w-32 flex flex-row md:flex-col justify-between items-start md:border-r border-slate-800 pr-4 gap-2">
                        <span className="text-cyan-400 font-bold text-lg">{activity.time}</span>
                        <span className="text-xs text-slate-500">⏱️ {activity.duration}</span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start gap-4">
                          <h5 className="text-lg font-bold text-white flex items-center gap-1.5">
                            {activity.activityName}
                          </h5>
                          <span className="text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-400 px-3 py-1 rounded-full">
                            💰 {activity.cost}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">{activity.description}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                          <MapPin size={12} /> {activity.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : (
        /* ==================== LIVE DEMO MODE (SHOWCASE) ==================== */
        <div className="h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden">
          {/* LEFT SIDEBAR: Live Maps, Timeline Controls & Slider */}
          <div className="flex-1 flex flex-col h-full bg-[#020617]">
            {/* Live Day Controls & Simulated Time Slider */}
            <div className="p-5 border-b border-slate-900 bg-slate-950/40 space-y-4">
              {/* Day selection */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Select Day:</span>
                <div className="flex gap-2">
                  {trip.itinerary?.map((d) => (
                    <button
                      key={d.day}
                      onClick={() => setActiveDay(d.day)}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                        activeDay === d.day
                          ? "bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                          : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
                      }`}
                    >
                      Day {d.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slider */}
              <div className="space-y-2 border-t border-slate-900 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} /> Simulated Time:
                  </span>
                  <span className="text-cyan-400 font-extrabold text-sm bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                    {formatHour(simulatedHour)}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-slate-500">9 AM</span>
                  <input
                    type="range"
                    min="9"
                    max="22"
                    step="1"
                    value={simulatedHour}
                    onChange={(e) => setSimulatedHour(parseInt(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                  <span className="text-[10px] text-slate-500">10 PM</span>
                </div>
              </div>
            </div>

            {/* Live Leaflet Map Container */}
            <div className="flex-1 relative min-h-[250px] md:min-h-0 bg-[#0f172a]">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              
              {/* Overlay: Current Weather & Current simulated status */}
              <div className="absolute top-4 left-4 z-[1000] bg-slate-950/90 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md max-w-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">Destination Stats</span>
                  <span className="text-xs bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-bold border border-slate-800">Live</span>
                </div>
                
                {/* Weather */}
                {(() => {
                  const weather = getWeatherForHour(simulatedHour);
                  return (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{weather.icon}</span>
                      <div>
                        <p className="text-base font-extrabold text-white">{weather.temp}</p>
                        <p className="text-[11px] text-slate-500">{weather.condition}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Simulated Location info */}
                <div className="border-t border-slate-900 pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Navigation size={12} className="text-cyan-400 animate-pulse" />
                  <span>GPS Tracking Active</span>
                </div>
              </div>
            </div>

            {/* Current Activity Banner / Status */}
            {activeActivity ? (
              <div className="bg-slate-950/90 border-t border-slate-900 p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Happening Now ({activeActivity.time})
                  </span>
                  <h4 className="text-lg font-black text-white">{activeActivity.activityName}</h4>
                  <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{activeActivity.description}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center gap-3 sm:gap-1 text-center min-w-[120px]">
                  <span className="text-[10px] text-slate-500 font-black uppercase">Cost / Entry</span>
                  <span className="text-cyan-300 font-bold text-sm">{activeActivity.cost}</span>
                  <span className="text-[10px] text-slate-500 block sm:mt-1 font-black uppercase">Duration</span>
                  <span className="text-white text-xs">{activeActivity.duration}</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950/90 border-t border-slate-900 p-5 text-center text-slate-500 text-sm font-medium">
                🛏️ No scheduled activities at this time. Relax or consult your Companion!
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR: Live AI Assistant Chat, Weather, Expense Tracker */}
          <div className="w-full md:w-[420px] border-t md:border-t-0 md:border-l border-slate-900 bg-slate-950 flex flex-col h-full overflow-hidden">
            {/* Tab selection for features */}
            <div className="flex border-b border-slate-900 bg-slate-900/30">
              <button
                onClick={() => document.getElementById("chat-panel").scrollIntoView({ behavior: "smooth" })}
                className="flex-1 py-3 text-xs font-black uppercase tracking-wider border-r border-slate-900 hover:text-cyan-400 transition"
              >
                💬 Chatbot
              </button>
              <button
                onClick={() => document.getElementById("expense-panel").scrollIntoView({ behavior: "smooth" })}
                className="flex-1 py-3 text-xs font-black uppercase tracking-wider border-r border-slate-900 hover:text-cyan-400 transition"
              >
                💵 Spent
              </button>
              <button
                onClick={() => document.getElementById("packing-panel").scrollIntoView({ behavior: "smooth" })}
                className="flex-1 py-3 text-xs font-black uppercase tracking-wider hover:text-cyan-400 transition"
              >
                🧳 Checklist
              </button>
            </div>

            {/* Scrollable Panel Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-900 scroll-smooth">
              
              {/* CHATBOT COMPLETED WORKPLACE */}
              <div id="chat-panel" className="h-[350px] flex flex-col p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                    <MessageSquare size={12} /> AI Travel Assistant
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Online
                  </span>
                </div>
                
                {/* Chat Feed */}
                <div className="flex-1 overflow-y-auto space-y-3 bg-slate-900/30 border border-slate-900 rounded-2xl p-3 text-xs mb-3">
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "bg-cyan-500 text-black ml-auto rounded-tr-none"
                          : "bg-slate-900 text-slate-200 mr-auto rounded-tl-none border border-slate-800"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-slate-500 mr-auto bg-slate-900 border border-slate-800 rounded-2xl p-3 max-w-[85%]">
                      <Loader2 className="animate-spin text-cyan-400" size={14} />
                      <span>Thinking...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Form */}
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about restaurants, sights, or packing..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold px-4 py-2 rounded-xl text-xs transition"
                  >
                    Send
                  </button>
                </form>
              </div>

              {/* EXPENSE TRACKER */}
              <div id="expense-panel" className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                    <DollarSign size={12} /> Live Expense Tracker
                  </h4>
                  <span className="text-[10px] text-slate-500 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Budget: {trip.budget}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="bg-slate-900/50 border border-slate-900 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-400">Total Spent</span>
                    <span className={totalSpent > totalBudgetLimit ? "text-red-400 font-black" : "text-cyan-300 font-bold"}>
                      ${totalSpent.toFixed(2)} / ${totalBudgetLimit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        totalSpent > totalBudgetLimit ? "bg-red-500" : "bg-cyan-400"
                      }`}
                      style={{ width: `${budgetPercentage}%` }}
                    />
                  </div>
                  {totalSpent > totalBudgetLimit && (
                    <p className="text-[10px] text-red-400 text-center font-bold">⚠️ Warning: You have exceeded the budget limit!</p>
                  )}
                </div>

                {/* Add Expense Form */}
                <form onSubmit={handleAddExpense} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Expense Name (e.g. Taxi)"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    required
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    required
                    className="w-20 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-500 hover:bg-cyan-600 text-black font-black p-2.5 rounded-xl transition"
                  >
                    <Plus size={16} />
                  </button>
                </form>

                {/* Expense List */}
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                  {expenses.length === 0 ? (
                    <p className="text-[11px] text-slate-500 italic text-center py-4">No expenses logged yet. Add your first cost above!</p>
                  ) : (
                    expenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex justify-between items-center p-2.5 bg-slate-900/30 border border-slate-900 rounded-xl text-[11px]"
                      >
                        <span className="text-slate-300 font-medium">{exp.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">${exp.amount.toFixed(2)}</span>
                          <button
                            onClick={() => setExpenses(expenses.filter((e) => e.id !== exp.id))}
                            className="text-slate-600 hover:text-red-400 transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* CHECKLIST PANEL */}
              <div id="packing-panel" className="p-4 space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <CheckSquare size={12} /> Packing Checklist
                </h4>

                <div className="space-y-2">
                  {trip.tripOverview?.packingSuggestions?.map((item, index) => {
                    const isPacked = packedItems[index] || false;
                    return (
                      <div
                        key={index}
                        onClick={() => togglePackedItem(index)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                          isPacked
                            ? "bg-cyan-500/10 border-cyan-500/30 text-slate-400 line-through"
                            : "bg-slate-900/30 border-slate-900 text-slate-200 hover:border-slate-800"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                            isPacked ? "bg-cyan-500 text-black" : "border border-slate-700 bg-slate-950"
                          }`}
                        >
                          {isPacked && "✓"}
                        </div>
                        <span className="text-xs font-medium">{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewTrip;
