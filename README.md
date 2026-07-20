# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# ✈️ Travlr AI: Next-Gen AI Travel Planner

Travlr AI is an advanced, full-stack travel planner designed to transform how users discover, organize, and experience their journeys. By combining dynamic frontend mapping, serverless backend technology, and state-of-the-art AI language models, Travlr AI generates detailed, context-aware itineraries in seconds.

---

## 🤖 The AI Engine: GPT-5.6 & Codex Integration

At the core of Travlr AI's intelligence is a multi-model orchestration powered by OpenAI's advanced AI stack:

### 🌟 GPT-5.6 (Itinerary & Chat Intelligence)
We leverage **GPT-5.6** to act as the primary brain of the application. It processes complex user inputs—including duration, budget levels, destinations, and traveler dynamics—to synthesize logical, high-fidelity day-by-day travel schedules. 
* **Dynamic Decision Making**: GPT-5.6 selects the highest-rated local hotels and maps out chronological daily activities that minimize transit time.
* **Context-Aware Chat Companion**: The model powers our interactive chat assistant, maintaining complete context of the user's specific trip to provide instant recommendations, historical facts, and itinerary adjustments in real-time.

### 💻 OpenAI Codex (Structured Mapping & Translation Layer)
We utilize **OpenAI Codex** as a backend processing engine to ensure seamless translation between raw language generation and database-ready code schemas.
* **Schema Validation & Parsing**: Codex assists in programmatically validating JSON outputs, ensuring that coordinate pairs (latitude and longitude) are correctly formatted for the map rendering component.
* **Adaptive Routing Routines**: Codex-driven routines dynamically optimize routing sequences between activities to minimize physical distance, ensuring the generated plan is mathematically viable.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, Vite, Tailwind CSS v4, Shadcn UI / Base UI
* **Backend**: Node.js, Express.js
* **Database**: Lightweight JSON database adapted for ephemeral and serverless environments
* **Maps & Geo-visuals**: Leaflet Maps & Google Maps API integration (`@vis.gl/react-google-maps`)
* **Deployment**: Pre-configured for serverless platforms like Vercel and web service deployment on Render

---

## 🚀 Key Features

* **Zero-to-Hero Travel Planning**: Generate custom multi-day plans with itineraries, budget estimates, and curated hotel recommendations in under 10 seconds.
* **Visual Map Synchronization**: Live dual-pane view mapping schedule activities to interactive pins alongside written schedules.
* **Interactive AI Chat Companion**: Ask contextual questions directly about your trip and get instant, customized suggestions.
* **Aesthetic & Responsive Design**: Premium user interface with smooth animations, dark-mode styling, and skeleton loading screens.

---

## 🧠 Challenges Overcome

* **Output Schema Consistency**: Prevented parser crashes by training GPT-5.6 prompts to strictly output schema-compliant JSON, filtering out markdown wrappers.
* **Serverless Read-Only Storage**: Overcame Vercel's ephemeral write restrictions by routing the JSON database dynamically to local `/tmp` structures.
* **UX Latency Mitigation**: Designed placeholder skeletons and loading progress states to mask the generation time of complex itineraries.

---

## 🏆 Accomplishments

* Seamless orchestration of GPT-5.6 for multi-variable itinerary generation.
* Robust, highly optimized context compression for the companion chatbot.
* Single-command deployment pipeline configured for cloud services.

