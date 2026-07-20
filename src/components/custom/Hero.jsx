import React from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="relative h-screen w-full overflow-hidden">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/55"></div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-sm mb-8 backdrop-blur-sm">
          ✈️ AI Powered Smart Travel Planner
        </div>

        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white max-w-5xl">
          Discover Your Next
          <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 bg-clip-text text-transparent">
            Adventure with AI
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-8 text-lg md:text-xl text-gray-200 max-w-3xl leading-8">
          Your intelligent travel companion that creates personalized
          itineraries, recommends hotels, attractions, restaurants,
          and unforgettable experiences based on your destination,
          budget, and travel style.
        </p>

        {/* Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-6">

          <Link to="/create-trip">
            <Button className="bg-blue-600 hover:bg-blue-700 px-10 py-7 rounded-full text-lg shadow-xl hover:scale-105 transition">
               Get Started
            </Button>
          </Link>

        

        </div>

      </div>
    </div>
  );
}

export default Hero;