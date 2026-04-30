# FlightAI — Tech Stack & Architecture

A simple breakdown of every technology, language, and tool used in FlightAI and what each one does.

---

## Languages Used

| Language | Where It's Used | Why |
|----------|----------------|-----|
| **TypeScript** | Frontend (all `.tsx` and `.ts` files) | Adds type safety to JavaScript — catches bugs before they happen |
| **JavaScript** | Backend (`server.js`, `chatRoute.js`) | Runs the server-side logic, fast and lightweight |
| **CSS** | Styling (`globals.css`) | Controls how everything looks — colors, layouts, animations |
| **HTML** | Inside React components (JSX) | The structure of every UI element on screen |

---

## Frontend Stack

| Technology | Version | What It Does |
|-----------|---------|-------------|
| **Next.js** | 16.2.2 | The React framework that runs the whole frontend. Handles routing, server-side rendering, and builds the production app |
| **React** | 19.2.4 | The UI library. Every panel, button, and card is a React component that updates in real-time |
| **Tailwind CSS** | 4.x | Utility-first CSS framework. Instead of writing CSS files, we style directly in the HTML with classes like `bg-black text-white rounded-xl` |
| **Leaflet** | 1.9.4 | The map engine. Renders the interactive world map, places aircraft markers, draws flight paths |
| **React-Leaflet** | 5.0.0 | Connects Leaflet to React so the map reacts to state changes (selecting flights, updating positions) |
| **Framer Motion** | 12.38.0 | Animation library. Handles smooth transitions and micro-animations throughout the UI |
| **Lucide React** | 1.7.0 | Icon library. All the icons you see (plane, search, compass, zap, etc.) come from here |
| **Socket.IO Client** | 4.8.3 | Real-time connection to the backend. Receives live flight position updates without refreshing the page |
| **Axios** | 1.14.0 | HTTP client. Sends requests to the backend (search, chat, route lookup) |
| **Zustand** | 5.0.12 | State management library (available for complex state if needed) |
| **clsx + tailwind-merge** | — | Utilities for merging CSS class names cleanly without conflicts |

### Frontend File Breakdown

```
flightai/src/
├── app/
│   ├── page.tsx        → The entire main page (3-panel layout, telemetry, chat)
│   ├── layout.tsx      → Root HTML wrapper (font loading, metadata, dark theme)
│   └── globals.css     → Theme colors, glassmorphism effects, radar pulse animation
├── components/
│   └── Map.tsx         → Leaflet map with live aircraft markers and flight paths
└── lib/
    └── utils.ts        → cn() helper for merging Tailwind classes
```

---

## Backend Stack

| Technology | Version | What It Does |
|-----------|---------|-------------|
| **Node.js** | — | JavaScript runtime that powers the entire backend server |
| **Express** | 5.2.1 | Web framework. Creates the API endpoints (`/api/chat`, `/api/search`, `/api/route`, etc.) |
| **Socket.IO** | 4.8.3 | WebSocket server. Pushes live flight data to all connected browsers every 2 seconds |
| **OpenAI SDK** | 6.33.0 | Used to connect to Groq's API (which is OpenAI-compatible). Sends prompts, receives AI responses |
| **Axios** | 1.14.0 | Makes HTTP requests to external flight data APIs |
| **dotenv** | 17.4.0 | Loads API keys from the `.env` file so secrets stay out of the code |
| **CORS** | 2.8.6 | Allows the frontend (port 3000) to talk to the backend (port 3001) without browser security blocks |

### Backend File Breakdown

```
backend/
├── server.js      → Main server: Express setup, Socket.IO, flight data fetching,
│                     route lookup, search, weather, aircraft photos
├── chatRoute.js   → AI chat endpoint: system prompt, intelligence layer,
│                     command detection, local NLP fallback
└── .env           → API keys (Groq, OpenSky, AeroDataBox, AviationStack, OpenWeather)
```

---

## External APIs — Where The Data Comes From

| API | What It Provides | Auth |
|-----|-----------------|------|
| **OpenSky Network** | Live positions of ~5,000+ aircraft worldwide (ADS-B transponder data) | Username + Password |
| **ADSB.lol** | Backup flight feed when OpenSky is rate-limited. Also provides route data | Free, no key |
| **Groq (Llama 3.1 8B)** | AI chatbot brain. Processes natural language questions about flights. Also used for airport geocoding search | API Key |
| **AeroDataBox** (RapidAPI) | Premium flight route data — origin, destination, aircraft type, registration, gates | RapidAPI Key |
| **AviationStack** | Secondary route data source when AeroDataBox fails | API Key |
| **Open-Meteo** | Weather below the aircraft (temperature, wind, conditions) | Free, no key |
| **OpenWeatherMap** | Weather for cities/airports (used by chatbot fallback) | API Key |
| **Planespotters.net** | Real aircraft photos by ICAO24 hex code | Free, no key |
| **CartoDB** | Dark-themed map tiles that render the world map | Free, no key |

---

## How They All Connect

```
USER'S BROWSER (localhost:3000)
    │
    ├── Next.js serves the React app
    │     ├── page.tsx renders the 3-panel layout
    │     ├── Map.tsx renders the Leaflet map with aircraft
    │     └── globals.css styles everything dark + glassmorphism
    │
    ├── Socket.IO Client ←──── receives live flights every 2s
    │
    └── Axios ─── sends requests to ───┐
                                        │
                                        ▼
                              BACKEND (localhost:3001)
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
              /api/chat           /api/search         /api/route
                    │                   │                   │
                    ▼                   ▼                   ▼
                Groq AI            OpenSky /           AeroDataBox /
              (Llama 3.1)         ADSB.lol            AviationStack
                                                      / ADSB.lol
```

---

## Why These Specific Choices?

| Choice | Why |
|--------|-----|
| **Next.js over plain React** | Built-in routing, SSR support, and Turbopack for instant hot reloads during development |
| **TypeScript over JavaScript (frontend)** | Catches type errors at compile time — essential for complex flight data objects |
| **JavaScript (backend)** | Keeps the backend simple and fast to iterate. No compilation step needed |
| **Leaflet over Google Maps** | Free, open-source, highly customizable. No API key or billing needed for the map itself |
| **Tailwind over vanilla CSS** | Build UIs 5x faster by styling inline. Dark mode, responsiveness, and spacing all built-in |
| **Socket.IO over polling** | Real-time push updates. Aircraft move smoothly instead of jumping every 60 seconds |
| **Groq over OpenAI** | Groq runs Llama 3.1 at insane speed (~500 tokens/sec). Free tier available. OpenAI-compatible SDK |
| **Express over Fastify** | Most widely-used Node.js framework. Simple, well-documented, massive ecosystem |
| **Multiple flight APIs** | No single API is 100% reliable. Fallback chains ensure the app never breaks |

---

## Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend (Next.js) | 3000 | http://localhost:3000 |
| Backend (Express) | 3001 | http://localhost:3001 |

---

## Key Design Patterns

| Pattern | Where | What It Does |
|---------|-------|-------------|
| **Fallback Chains** | Flight feed, routes, photos | If API #1 fails → try #2 → try #3 → show placeholder |
| **In-Memory Caching** | Routes, flight positions | Avoids hitting APIs repeatedly for the same data |
| **Position Interpolation** | Map markers | Smoothly moves planes between 60-second API refreshes |
| **Viewport Culling** | Map rendering | Only draws planes visible on screen (max 1,500) to prevent lag |
| **Intelligence Layer** | Chat AI | Raw telemetry → computed insights (climbing/cruising/descending, ETA, speed category) |
| **Command Detection** | Chat AI | Parses user messages for map commands ("track", "zoom", "focus") and controls the map via Socket.IO |

---

> **Built by Aman and Natasha** — FlightAI Command Center ✈️
