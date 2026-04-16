# FlightAI Platform Documentation

## Overview
FlightAI is a deep telemetry, real-time tracking platform. It allows users to track global flights, providing real-time data on location, altitude, and weather conditions. An embedded AI Assistant powered by OpenAI helps users with aviation queries contextually aware of the currently tracked flight.

## Tech Stack
### Frontend
- **Framework**: Next.js 16.2.2
- **Library**: React 19.2.4
- **Language**: TypeScript (TSX)
- **Styling**: Tailwind CSS 4, lucide-react (Icons)
- **Map Visualizations**: Leaflet, react-leaflet
- **State Management**: zustand
- **Animations**: framer-motion
- **Utilities**: clsx, tailwind-merge, socket.io-client, axios

### Backend
- **Environment**: Node.js
- **Server Framework**: Express 5.2.1
- **Language**: JavaScript
- **Real-Time Communication**: Socket.io
- **AI Integration**: OpenAI SDK
- **Utilities**: axios, cors, dotenv

### External Integrations & APIs
- **Real-Time Telemetry**: OpenSky Network (Flights Data)
- **Meteorological Data**: Open-Meteo API
- **Aircraft Imagery**: Planespotters.net API

## Features
- **Real-Time Global Flight Tracking**: Visualizes live global flight data using a dark-themed interactive map with optimized spatial rendering limits.
- **Deep Telemetry Dashboard**: Provides altitude, ground speed, true heading, and vertical rate of selected flights.
- **Dynamic Weather System**: Fetches and displays ground weather below the aircraft (temperature, surface wind, and weather synopsis).
- **Aircraft Photographics**: Dynamically fetches the image of the currently tracked aircraft based on its Hex registration.
- **Route Tracking**: Traces historical pathing and expands on origin and destination terminal/gate information when available.
- **AI Aviation Assistant**: Embedded generative AI (OpenAI) initialized as an aviation expert, contextually aware of the actively tracked flight and local telemetry.
- **Search Capabilities**: Find arbitrary globally indexed flights or airports by name/IATA.

## Workflow Execution
1. Run the `backend` by navigating to the backend folder and executing `node server.js` which initiates the Express API and socket.io stream.
2. Start the Next.js `flightai` app by running `npm run dev` for development mode or building and serving the production build (`npm run build` & `npm start`).
3. Access the dashboard from your browser. Incoming real-time telemetry flows from the backend into the UI map. Users interact with markers to retrieve deeper metrics and interface with the AI assistant.
