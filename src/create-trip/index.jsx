import { Button } from "../components/ui/button";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  SelectBudgetOptions,
  SelectTravelList,
} from "../constants/options";

function CreateTrip() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});

  const options = [
    { value: "kolkata", label: "Kolkata, West Bengal, India" },
    { value: "delhi", label: "New Delhi, India" },
    { value: "mumbai", label: "Mumbai, Maharashtra, India" },
  ];

return (
 <div className="relative min-h-screen overflow-hidden">
  {/* Background Video */}

{/* Background Video */}

<video
  autoPlay
  muted
  loop
  playsInline
  playbackRate={0.6}
  className="absolute inset-0 w-full h-full object-cover"
>
  <source src="/trip-bg.mp4" type="video/mp4" />
</video>

{/* Dark Overlay */}

<div className="absolute inset-0 bg-gradient-to-br from-[#020617]/85 via-[#020617]/75 to-black/90"></div>

{/* Dark Overlay */}

<div className="absolute inset-0 bg-gradient-to-br from-[#020617]/85 via-[#020617]/75 to-black/90"></div>

    {/* Background Glow */}
    <div className="absolute w-[500px] h-[500px] bg-cyan-500/20 blur-[180px] rounded-full -top-20 -left-20"></div>

    <div className="absolute w-[450px] h-[450px] bg-blue-600/20 blur-[170px] rounded-full top-1/2 right-0"></div>

    <div className="absolute w-[450px] h-[450px] bg-indigo-600/20 blur-[170px] rounded-full bottom-0 left-1/3"></div>

    {/* Background Grid */}

    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          "linear-gradient(to right,#ffffff 1px,transparent 1px),linear-gradient(to bottom,#ffffff 1px,transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />

    <div className="relative z-10 w-full px-8 md:px-20 py-20">

      {/* Heading */}

      <div className="text-center">

        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-5 py-2 text-cyan-300">

          ✈ AI Powered Trip Planner

        </div>

        <h1 className="mt-8 text-6xl font-black text-white">

          Plan Your Dream Journey

        </h1>

        <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">

          Tell our AI where you're going and it will create a beautiful
          personalized travel itinerary within seconds.

        </p>

      </div>

      {/* Destination */}

      <section className="mt-24">

        <h2 className="text-3xl font-bold text-white mb-8">

           Choose Destination

        </h2>

        <Select
          options={options}
          placeholder="Search destination..."
          className="text-black"
          onChange={(value) => {
            setFormData({
              ...formData,
              location: value,
            });
          }}
        />

      </section>

      {/* Days */}

      <section className="mt-20">

        <h2 className="text-3xl font-bold text-white mb-8">

           Number of Days

        </h2>

        <input
          type="number"
          placeholder="Example : 3"
          className="w-full rounded-2xl bg-slate-900/70 border border-slate-700 p-5 text-white text-lg outline-none focus:border-cyan-400"
          onChange={(e) => {
            setFormData({
              ...formData,
              noOfDays: e.target.value,
            });
          }}
        />

      </section>


        {/* Budget */}
         

           <section className="mt-20">

        <h2 className="text-3xl font-bold text-white mb-3">
           Choose Your Budget
        </h2>

        <p className="text-gray-400 mb-10 text-lg">
          Select the budget that best fits your trip.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {SelectBudgetOptions.map((item) => (

            <div
              key={item.id}
              onClick={() =>
                setFormData({
                  ...formData,
                  budget: item.title,
                })
              }
              className={`cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:scale-105
              ${
                formData?.budget === item.title
                  ? "text-cyan-400"
                  : "text-white"
              }`}
            >

              <div className="text-6xl mb-5">
                {item.icon}
              </div>

              <h3 className="text-2xl font-bold">
                {item.title}
              </h3>

              <p className="text-gray-400 mt-4">
                {item.desc}
              </p>

              <p className="mt-5 text-cyan-300 font-semibold">
                {item.people}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Traveller */}

      <section className="mt-24">

        <h2 className="text-3xl font-bold text-white mb-3">
          👨‍👩‍👧‍👦 Who's Traveling?
        </h2>

        <p className="text-gray-400 mb-10 text-lg">
          Tell AI who is joining your adventure.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {SelectTravelList.map((item) => (

            <div
              key={item.id}
              onClick={() =>
                setFormData({
                  ...formData,
                  traveler: item.title,
                })
              }
              className={`cursor-pointer transition-all duration-300 hover:-translate-y-3 hover:scale-105
              ${
                formData?.traveler === item.title
                  ? "text-cyan-400"
                  : "text-white"
              }`}
            >

              <div className="text-6xl mb-5">
                {item.icon}
              </div>

              <h3 className="text-xl font-bold">
                {item.title}
              </h3>

              <p className="text-gray-400 mt-4 text-sm">
                {item.desc}
              </p>

              <p className="mt-5 text-cyan-300 font-semibold">
                {item.people}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Generate Button */}

      <div className="flex justify-center mt-28">

        <Button
          onClick={() => {
            if (!formData.location || !formData.noOfDays || !formData.budget || !formData.traveler) {
              alert("Please select a destination, number of days, budget, and travel party configuration.");
              return;
            }
            if (parseInt(formData.noOfDays, 10) <= 0 || parseInt(formData.noOfDays, 10) > 10) {
              alert("Please enter a valid number of days between 1 and 10.");
              return;
            }
            console.log(formData);
            localStorage.setItem('tripParams', JSON.stringify(formData));
            navigate("/generate-trip");
          }}
          className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-14 py-8 text-xl font-semibold shadow-[0_0_60px_rgba(56,189,248,.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_0_90px_rgba(56,189,248,.7)]"
        >
          ✨ Generate AI Trip
        </Button>

      </div>

    </div>

  </div>
);

}

export default CreateTrip;