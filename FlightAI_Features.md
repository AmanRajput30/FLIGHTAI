# ✈️ FlightAI — Complete Feature Documentation

> **Version:** 1.0.0  
> **Last Updated:** April 23, 2026  
> **Stack:** Next.js 16 (Frontend) + Node.js/Express (Backend) + Socket.IO (Real-Time)

---

## 1. 🗺️ Real-Time Global Flight Map

The centerpiece of the application — a live, interactive world map showing thousands of aircraft in real-time.

| Feature | Details |
|---------|---------|
| **Map Provider** | Leaflet + React-Leaflet with CartoDB Dark tile layer |
| **Live Aircraft Icons** | Custom SVG plane icons rotated to match each aircraft's true heading |
| **Selected Aircraft Highlight** | Clicked aircraft turns red and scales up (1.3×) for visual distinction |
| **Icon Caching** | Icons are cached by heading + selection state for performance |
| **Viewport Culling** | Only aircraft within the visible map bounds (with padding) are rendered — maximum 1,500 markers to prevent browser crashes |
| **Flight Trajectory Lines** | Dashed yellow polyline showing the flight path of the selected aircraft |
| **Click-to-Select** | Click any plane on the map to lock onto it and view full telemetry in the left panel |
| **Popup on Click** | Glass-styled popup showing flight number and airline on aircraft click |
| **Smooth Fly-To Animations** | Map smoothly animates to searched locations or AI-commanded coordinates |
| **Dark Theme Styling** | Custom dark background (`#0d1117`) with glassmorphism popups |
| **No Zoom Controls** | Native zoom controls hidden for cleaner UI (scroll/pinch still works) |

---

## 2. 📡 Live Flight Data Feed (ADS-B)

Real-time aircraft positions sourced from live ADS-B transponder networks.

| Feature | Details |
|---------|---------|
| **Primary Source** | OpenSky Network API — provides ~5,000–15,000 live flights globally |
| **Automatic Fallback** | If OpenSky is rate-limited (429/403/401), automatically switches to ADSB.lol API |
| **Data Refresh** | Full data refresh every 60 seconds from the live API |
| **Position Interpolation** | Between API refreshes, aircraft positions are interpolated every 2 seconds using speed + heading for smooth movement |
| **Socket.IO Broadcasting** | All connected clients receive `flights_update` events in real-time via WebSocket |
| **Initial Load** | New clients immediately receive the full flight cache on connection |
| **Authentication** | OpenSky API uses authenticated requests (username/password) for higher rate limits |

### Data Fields Per Aircraft
- ICAO24 hex identifier
- Flight number / callsign
- Airline / operator
- Latitude & longitude
- Altitude (feet, converted from meters)
- Ground speed (km/h, converted from m/s)
- True heading (degrees)
- Vertical rate (m/s)
- Last contact timestamp (Unix)

---

## 3. 🔍 Global Unified Search

A single search bar in the header that can find both flights and airports.

| Feature | Details |
|---------|---------|
| **Flight Search** | Searches the live flight cache by flight number, ICAO24 hex, or airline name |
| **Airport Search (AI-Powered)** | If no live flight matches, uses Groq LLM (Llama 3.1) to geocode the query as an airport, returning name, IATA, ICAO, city, country, coordinates, timezone, and elevation |
| **Map Auto-Focus** | Search results automatically fly the map to the matched location |
| **Panel Switching** | Selecting a flight clears airport data (and vice versa) so the left panel always shows the correct context |
| **Loading State** | Search bar shows "Searching Global Database..." while processing |
| **Error Handling** | Shows inline red error message if search fails or no results found |

---

## 4. 📊 Deep Telemetry Panel (Left Sidebar)

A rich, real-time data panel that displays detailed information about the selected aircraft or airport.

### Flight Telemetry View
When an aircraft is selected:

| Section | Data Shown |
|---------|------------|
| **Primary Identifier** | Flight number, "Target Acquired" label, Airborne status badge |
| **Aircraft Photo** | Fetched from Planespotters.net API (with FlightRadar24 fallback) |
| **Callsign / Operator** | Flight number, airline name |
| **Aircraft Type** | Model name and registration number (from AeroDataBox) |
| **Route Info** | Origin and destination airports with IATA/ICAO codes, clickable to expand |
| **Expanded Route Details** | City/region, airport full name, terminal, gate (when available) |
| **Data Source Label** | Shows which API provided the route data (AeroDataBox, AviationStack, ADSB.lol) |
| **Metric Cards** | Altitude, ground speed, true heading, vertical rate — in a 2×2 grid |
| **Geographic Info** | Live latitude, live longitude, signal ping (time since last contact) |
| **Ground Weather** | Temperature, wind speed, weather synopsis below the aircraft (from Open-Meteo) |
| **Real-Time Updates** | All telemetry values update live via Socket.IO as new data arrives |

### Airport View
When an airport is searched:

| Section | Data Shown |
|---------|------------|
| **Airport Name** | Full name, city, and country |
| **IATA / ICAO Codes** | Airport identifier codes |
| **Elevation** | Airport elevation in meters |
| **Timezone** | IANA timezone string |
| **Global Coordinates** | Latitude and longitude to 4 decimal places |

### Empty State
When nothing is selected:
- Shows a dashed border card with "No Target Selected" message
- Instructs the user to tap an aircraft on the map

---

## 5. 🤖 AI Chatbot (Right Sidebar)

A conversational AI assistant specialized in aviation, powered by Groq's Llama 3.1 model.

| Feature | Details |
|---------|---------|
| **AI Model** | Llama 3.1 8B Instant via Groq API |
| **Personality** | Friendly, warm, conversational — talks like a human tutor, not a robot |
| **Context Awareness** | Receives full telemetry of the currently selected aircraft (airline, flight number, altitude, speed, heading, coordinates, route data) |
| **Aviation-Only Scope** | Only answers aviation and flight-related questions; politely redirects off-topic queries |
| **Natural Language Style** | Weaves data into conversational sentences — no bullet points, no raw numbers, no bold labels |
| **Error Handling** | Displays styled error messages for API failures with AlertCircle icon |
| **Quota Exhaustion Detection** | Specifically detects 429 (rate limit) errors and shows a clear system alert |
| **Chat History** | Maintains full conversation history within the session |
| **Auto-Scroll** | Chat panel automatically scrolls to the latest message |
| **Send via Enter or Button** | Both keyboard Enter and click on Send button work |

### Local NLP Fallback Engine
When the AI API is unavailable (401/429 errors), a local regex-based engine activates:

| Intent | Trigger Words | Action |
|--------|--------------|--------|
| **Weather** | "weather", "weather at/in/for [code]" | Fetches live weather from OpenWeatherMap API |
| **Flight Tracking** | "track", "find", "locate", "focus" | Emits Socket.IO commands to focus the map on a target |
| **Greetings** | "hello", "hi" | Friendly welcome message with usage instructions |
| **Fallback** | Any other message | Explains backup mode and suggests available commands |

---

## 6. 🛣️ Route Information System

Multi-source route lookup with automatic fallback chain.

| Priority | Source | Data Provided |
|----------|--------|---------------|
| **1st** | AeroDataBox (RapidAPI) | Origin/destination airports (name, IATA, ICAO, coordinates), aircraft registration, model, terminal, gate |
| **2nd** | AviationStack | Origin/destination airports (name, IATA, ICAO), timezone, terminal, gate |
| **3rd** | ADSB.lol | Origin/destination airports (name, IATA, ICAO, coordinates) |
| **Fallback** | Static | "Data Unavailable" placeholders |

### Additional Route Features
- **Route Caching** — Successfully fetched routes are cached in-memory to avoid redundant API calls
- **ICAO24 Hex Lookup** — If the identifier is a 6-character hex code, queries AeroDataBox aircraft info endpoint instead
- **Date-Specific Lookup** — First tries today's date, then falls back to nearest flight if no match

---

## 7. ✈️ Flight Path / Trajectory System

Shows the path an aircraft has traveled or is planned to travel.

| Priority | Source | Type |
|----------|--------|------|
| **1st** | OpenSky Network Tracks API | Real historical ADS-B track |
| **2nd** | ADSB.lol Route + Great Circle | Synthesized arc between origin and destination airports |
| **3rd** | Local Synthetic | Backward-projected path using current heading and speed |

- Path is displayed as a **dashed yellow polyline** on the map
- Automatically fetched when an aircraft is selected

---

## 8. 🌦️ Weather Integration

Two separate weather integrations for different purposes.

| Integration | API | Used For |
|-------------|-----|----------|
| **Ground Weather Below Aircraft** | Open-Meteo (free, no key) | Displays temperature, wind speed, and weather synopsis on the telemetry panel when a flight is selected |
| **Airport/City Weather (Chatbot)** | OpenWeatherMap | Used by the local NLP fallback engine when users ask weather-related questions |

### Weather Synopsis Codes
The system translates WMO weather codes into human-readable descriptions:
- Code 0: Clear sky
- Code 1–3: Partly cloudy
- Code 4–49: Fog / Haze
- Code 50–69: Rain / Drizzle
- Code 70–79: Snow
- Code 80+: Thunderstorm

---

## 9. 📸 Aircraft Photo Lookup

Attempts to show a real photo of the selected aircraft.

| Priority | Source | Method |
|----------|--------|--------|
| **1st** | Planespotters.net API | Looks up by ICAO24 hex, returns thumbnail_large |
| **2nd** | FlightRadar24 Static URL | Direct image URL by hex code |

- Falls back gracefully — shows a "No Photographic Data" placeholder with a faded plane icon if both sources fail
- Error handler hides broken images via `onError`

---

## 10. 🔌 Real-Time Communication (Socket.IO)

WebSocket-based real-time event system connecting backend to all frontend clients.

| Event | Direction | Purpose |
|-------|-----------|---------|
| `flights_update` | Server → Client | Broadcasts updated flight positions to all connected clients |
| `command_focus_map` | Server → Client | Commands the map to fly to specific coordinates (triggered by AI chatbot) |
| `command_focus_flight` | Server → Client | Commands the frontend to focus on a specific flight number |

---

## 11. 🎨 UI / Design System

| Feature | Details |
|---------|---------|
| **Theme** | Full dark mode with zinc/slate color palette |
| **Typography** | Inter font (Google Fonts) |
| **Glassmorphism** | Frosted glass panels with `backdrop-filter: blur()` |
| **CSS Framework** | Tailwind CSS v4 with custom theme tokens |
| **Icon Library** | Lucide React (17 icons used) |
| **Layout** | Three-panel design: Left (telemetry) + Center (map) + Right (AI chat) |
| **Header** | Logo, search bar, LIVE indicator with animated ping, real-time clock, avatar |
| **Animations** | Pulsing live indicators, smooth fly-to map animations, hover transitions |
| **Responsive Elements** | Scrollable panels, overflow handling, text truncation |

---

## 12. 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Telemetry│  │   Leaflet    │  │   AI Chatbot      │  │
│  │  Panel   │  │   Map        │  │   Panel           │  │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘  │
│       │               │                   │              │
│       └───────────────┼───────────────────┘              │
│                       │ Socket.IO + REST                 │
└───────────────────────┼─────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────┐
│                 BACKEND (Node.js + Express)              │
│                       │                                  │
│  ┌────────────────────┴────────────────────────────┐     │
│  │              Socket.IO Server                   │     │
│  └────────────────────┬────────────────────────────┘     │
│                       │                                  │
│  ┌──────────┐  ┌──────┴──────┐  ┌───────────────────┐   │
│  │ /api/chat│  │/api/search  │  │ /api/route        │   │
│  │          │  │             │  │ /api/flight-path   │   │
│  └────┬─────┘  └──────┬──────┘  └────────┬──────────┘   │
│       │               │                  │               │
└───────┼───────────────┼──────────────────┼───────────────┘
        │               │                  │
   ┌────┴────┐   ┌──────┴──────┐   ┌──────┴──────────┐
   │ Groq AI │   │ OpenSky /   │   │ AeroDataBox /   │
   │ (LLM)   │   │ ADSB.lol    │   │ AviationStack / │
   └─────────┘   └─────────────┘   │ ADSB.lol        │
                                    └─────────────────┘
```

---

## 13. 🔑 External APIs & Services

| Service | Purpose | Auth Type |
|---------|---------|-----------|
| **OpenSky Network** | Primary live flight feed (ADS-B) | Username/Password |
| **ADSB.lol** | Backup flight feed + route lookup | No auth (free) |
| **Groq (Llama 3.1 8B)** | AI chatbot + airport geocoding search | API Key |
| **AeroDataBox (RapidAPI)** | Premium route data, aircraft info, registration | RapidAPI Key |
| **AviationStack** | Secondary route data source | API Key |
| **Open-Meteo** | Ground weather below aircraft | No auth (free) |
| **OpenWeatherMap** | Weather for chatbot fallback queries | API Key |
| **Planespotters.net** | Aircraft photos by ICAO24 hex | No auth (free) |
| **CartoDB** | Dark map tiles | No auth (free) |

---

## 14. ⚡ Performance Optimizations

| Optimization | Details |
|--------------|---------|
| **Marker Viewport Culling** | Only renders aircraft within visible map bounds — caps at 1,500 markers |
| **Icon Caching** | Plane SVG icons cached by heading + selection state to avoid DOM recreation |
| **Debounced Bounds Updates** | Map bound recalculations debounced at 150ms to prevent render loops |
| **Route Caching** | In-memory `Map()` cache for fetched routes — avoids duplicate API calls |
| **Component Memoization** | Map component wrapped in `React.memo()` to prevent unnecessary re-renders |
| **Dynamic Import (SSR Disabled)** | Map loaded via `next/dynamic` with `ssr: false` to avoid Leaflet server-side errors |
| **Position Interpolation** | Client-smooth movement every 2s instead of waiting for 60s API refresh |

---

## 15. 🛡️ Error Handling & Resilience

| Scenario | Handling |
|----------|---------|
| **OpenSky rate limited** | Automatic fallback to ADSB.lol |
| **Groq AI key expired/quota** | Falls back to local regex NLP engine |
| **Route lookup fails** | 3-tier fallback chain (AeroDataBox → AviationStack → ADSB.lol → static) |
| **Flight path unavailable** | 3-tier fallback (OpenSky track → Great Circle synthesis → Local synthetic) |
| **Aircraft photo unavailable** | Planespotters → FlightRadar24 → "No Photographic Data" placeholder |
| **Search finds nothing** | Inline error message below search bar |
| **Chat API error** | Styled error bubble with AlertCircle icon |
| **Unhandled rejections** | Global `process.on('unhandledRejection')` handler prevents backend crashes |
| **Uncaught exceptions** | Global `process.on('uncaughtException')` handler logs and continues |

---

## 16. 📁 Project File Structure

```
AI/
├── backend/
│   ├── .env                  # API keys and credentials
│   ├── server.js             # Main backend: Express + Socket.IO + all API routes
│   ├── chatRoute.js          # AI chat endpoint with system prompt + local NLP fallback
│   ├── package.json          # Backend dependencies
│   └── node_modules/
│
├── flightai/                 # Next.js 16 frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx    # Root layout with Inter font + metadata
│   │   │   ├── page.tsx      # Main page: 3-panel layout (telemetry + map + chat)
│   │   │   ├── globals.css   # Tailwind theme + glassmorphism utilities
│   │   │   └── favicon.ico
│   │   ├── components/
│   │   │   └── Map.tsx       # Leaflet map with real-time markers + flight paths
│   │   └── lib/
│   │       └── utils.ts      # cn() utility for className merging
│   ├── package.json          # Frontend dependencies
│   ├── tsconfig.json
│   └── next.config.ts
│
├── .gitignore
└── project_documentation.md
```

---

> **Built by Aman and Natasha** — SkyIntel Command Center 🛩️
