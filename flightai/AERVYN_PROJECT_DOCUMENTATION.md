# Aervyn - Project Documentation

## 1. Project Overview
**Name**: Aervyn
**Platform**: Web Application (Next.js 16)
**Type**: Advanced Flight Tracking and Intelligence Dashboard
**Objective**: To provide a real-time, highly aesthetic, and functional flight tracking interface modeled after modern Glass Cockpit / Primary Flight Displays (PFD).

## 2. Architecture & Tech Stack
- **Frontend Framework**: Next.js 16.2.2 (React, Turbopack)
- **Styling**: Tailwind CSS with custom CSS variables (Vanilla CSS integration for design tokens).
- **State Management**: Zustand (`useFlightStore.ts`) for global state.
- **Mapping**: `react-leaflet` for rendering interactive maps with custom `divIcon` markers.
- **Animations**: Framer Motion for UI transitions and loaders.
- **Icons**: `lucide-react` for standard UI iconography.
- **Build Tool**: Node.js & npm.

## 3. Design System (Glass Cockpit / PFD)
The application adheres to a strict "Aervyn Glass Cockpit" design philosophy. It shuns modern web trends like glassmorphism (blurs, soft shadows, rounded corners) in favor of functional, high-contrast, hard-edged interfaces.

### Core Principles
- **Hard Edges**: `rounded-none` or `rounded-[2px]` maximum. No `rounded-2xl` or `rounded-3xl`.
- **True Black**: Backgrounds use `#000000` (`var(--color-cockpit-black)`). No soft dark grays or gradients.
- **High Contrast Borders**: Depth is created using borders and insets rather than drop shadows.
- **Monospace & Strict Typography**: Fonts are optimized for legibility at a glance.

### CSS Variables (`globals.css`)
- `--color-cockpit-black`: `#000000` (Main background)
- `--color-instrument-grey`: `#2A2F35` (Borders, secondary backgrounds)
- `--color-instrument-white`: `#F5F6F7` (Primary text, active icons)
- `--color-horizon-blue`: `#00A3FF` (Primary accent, active states)
- `--color-warning-red`: `#FF3333` (Errors, critical alerts)
- `--color-caution-amber`: `#FFB800` (Warnings, highlighted data)
- `--font-numerals`: `'Oswald', sans-serif` (Data, metrics, numbers)
- `--font-labels`: `'Archivo', sans-serif` (UI text, headers, categories)

## 4. Key Components

### 4.1. The Map (`src/components/Map.tsx`)
- Uses `react-leaflet` to render a global map.
- Features custom aircraft icons (`createAircraftIcon`) that dynamically rotate based on heading and change color based on altitude.
- Integrates a radar sweep animation for visual flair.
- Includes a hard-edged warning overlay when zoomed out too far, prompting the user to zoom in for active tracking.
- Popups are styled with true black backgrounds, sharp corners, and monospace fonts to match the PFD aesthetic.

### 4.2. Telemetry Panel (`src/components/telemetry/TelemetryPanel.tsx`)
The primary data readout interface, situated on the right side of the screen.
- **Deep Telemetry**: Displays selected flight information (Callsign, Airline, Registration, Type).
- **Target Acquired**: Shows a highlighted box with aircraft details and an image (if available).
- **Route Information**: Displays origin and destination details, including IATA/ICAO codes, terminals, gates, and timezone information.
- **Metric Grid**: Shows critical flight data using the `MetricCard` component:
  - Altitude (ft)
  - Ground Speed (kts)
  - Heading (degrees)
  - Vertical Rate (fpm)
- **ETA & Distance**: Calculates estimated time of arrival based on current speed and distance to destination.
- **Weather Integration**: Displays ground weather conditions (temp, wind, synopsis) below the aircraft using Open-Meteo data.

### 4.3. Top Navigation Bar (`src/components/TopNav.tsx`)
- Displays the **AERVYN** branding.
- Contains the `GlobalSearch` component for finding specific flights or airports.
- Features navigational links (Dashboard, Analytics, Fleet, Settings).
- Includes status indicators (System Status, Server connection).

### 4.4. UI Elements (`src/components/ui/`)
- **CockpitButton**: A custom button component with specific variants (`action`, `selector`, `icon`, `toggle`) designed to look like physical cockpit switches and buttons.

## 5. API Integrations
The application relies on several external APIs to aggregate flight intelligence:
- **OpenSky Network**: Primary source for real-time ADS-B flight telemetry (latitude, longitude, altitude, speed, heading).
- **AviationStack / FlightAware (Abstracted)**: Route data, origin/destination details, and flight schedules.
- **Planespotters.net**: Used to fetch aircraft photographs based on registration or hex codes.
- **Open-Meteo**: Provides live weather data (temperature, wind speed, weather codes) at the aircraft's current coordinates.

## 6. Project Structure
```
flightai/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router (pages, layouts)
│   │   ├── page.tsx        # Main dashboard view
│   │   ├── globals.css     # Global styles and CSS variables
│   │   └── ...
│   ├── components/         # React components
│   │   ├── Map.tsx         # Leaflet map component
│   │   ├── TopNav.tsx      # Navigation bar
│   │   ├── telemetry/      # Telemetry specific components
│   │   ├── search/         # Search related components
│   │   ├── ui/             # Reusable UI elements (CockpitButton)
│   │   └── ...
│   ├── store/              # Zustand state management
│   │   └── useFlightStore.ts
│   ├── lib/                # Utility functions and API helpers
│   └── ...
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 7. Deployment
The application is configured for deployment on platforms like Vercel or Render.
- **GitHub Repository**: `AmanRajput30/FLIGHTAI`
- **Build Command**: `npm run build`
- **Start Command**: `npm start` (or `npm run dev` for local development)

## 8. Recent Updates (Phase 6)
- **Branding Audit**: Completely removed all references to "SkyIntel" and replaced them with the official product name "Aervyn".
- **Design System Enforcement**: Stripped all glassmorphism, rounded corners, and gradients from the `TelemetryPanel` and `Map` components, strictly enforcing the PFD aesthetic with CSS variables.
- **TypeScript Fixes**: Resolved strict type-checking errors across the application, particularly in API responses and UI component props.
