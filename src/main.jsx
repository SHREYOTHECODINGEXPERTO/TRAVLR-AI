import GenerateTrip from "./generate-trip";
import ViewTrip from "./view-trip/ViewTrip";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Hero from "./components/custom/Hero";
import CreateTrip from "./create-trip";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Hero />,
      },
      {
        path: "create-trip",
        element: <CreateTrip />,
      },
      {
  path: "generate-trip",
  element: <GenerateTrip />,
      },
      {
        path: "view-trip/:tripId",
        element: <ViewTrip />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);