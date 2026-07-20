import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

function GenerateTrip() {
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const paramsStr = localStorage.getItem('tripParams');
    if (!paramsStr) {
      setError("No trip parameters found. Please start from the home page.");
      return;
    }

    const params = JSON.parse(paramsStr);
    
    // Simulate steps sequentially for visual feedback
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    // Call API
    fetch('/api/generate-trip', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to generate trip. Server responded with an error.");
        }
        return res.json();
      })
      .then((data) => {
        clearInterval(stepInterval);
        // Clean params
        localStorage.removeItem('tripParams');
        // Navigate to view trip
        navigate(`/view-trip/${data.id}`);
      })
      .catch((err) => {
        clearInterval(stepInterval);
        console.error(err);
        setError(err.message || "An unexpected error occurred during trip generation.");
      });

    return () => clearInterval(stepInterval);
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-950 via-[#020617] to-black text-white px-6">
        <div className="max-w-lg w-full bg-slate-900/80 border border-red-500/30 rounded-3xl p-10 text-center backdrop-blur-md">
          <h1 className="text-4xl font-bold text-red-400">Oops! Something went wrong</h1>
          <p className="text-gray-300 mt-6 text-lg leading-8">{error}</p>
          <button
            onClick={() => navigate('/create-trip')}
            className="mt-10 rounded-full bg-red-600 hover:bg-red-700 px-8 py-3 text-lg font-semibold transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0b1329] to-black px-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/10 blur-[180px] rounded-full -top-20 -left-20"></div>
      <div className="absolute w-[450px] h-[450px] bg-blue-600/10 blur-[170px] rounded-full bottom-0 right-0"></div>

      <div className="max-w-lg w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-10 text-center backdrop-blur-md relative z-10">
        <Loader2 className="mx-auto animate-spin text-cyan-400" size={70} />

        <h1 className="text-4xl font-extrabold text-white mt-8 tracking-tight">
          Generating Your Dream Trip
        </h1>

        <p className="text-gray-400 mt-4 text-lg leading-8">
          Our AI is preparing the best itinerary based on your destination, budget, and travel preferences.
        </p>

        <div className="mt-10 space-y-5 text-left max-w-sm mx-auto">
          <div className="flex items-center gap-3">
            <Loader2 className={`animate-spin text-cyan-400 ${loadingStep >= 0 ? "opacity-100" : "opacity-30"}`} size={20} />
            <p className={loadingStep >= 0 ? "text-cyan-200" : "text-gray-500"}>Finding beautiful destinations...</p>
          </div>

          <div className="flex items-center gap-3">
            <Loader2 className={`animate-spin text-cyan-400 ${loadingStep >= 1 ? "opacity-100" : "opacity-30"}`} size={20} />
            <p className={loadingStep >= 1 ? "text-cyan-200" : "text-gray-500"}>Selecting top-rated hotels...</p>
          </div>

          <div className="flex items-center gap-3">
            <Loader2 className={`animate-spin text-cyan-400 ${loadingStep >= 2 ? "opacity-100" : "opacity-30"}`} size={20} />
            <p className={loadingStep >= 2 ? "text-cyan-200" : "text-gray-500"}>Planning daily itinerary...</p>
          </div>

          <div className="flex items-center gap-3">
            <Loader2 className={`animate-spin text-cyan-400 ${loadingStep >= 3 ? "opacity-100" : "opacity-30"}`} size={20} />
            <p className={loadingStep >= 3 ? "text-cyan-200" : "text-gray-500"}>Optimizing travel routes...</p>
          </div>
        </div>

        <p className="text-gray-500 mt-10 text-sm">
          This usually takes a few seconds...
        </p>
      </div>
    </div>
  );
}

export default GenerateTrip;