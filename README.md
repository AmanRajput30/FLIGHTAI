# AERVYN

**Real-Time Aviation Intelligence & Telemetry Platform**

Aervyn is an ultra-modern, high-performance flight tracking and aviation intelligence platform designed to emulate advanced command-center interfaces. It leverages real-time flight data, aircraft telemetry, weather integrations, and AI-driven insights to provide a seamless "skylord" operator experience.

## System Architecture

The platform operates on a modernized tech stack separated into a robust backend and a highly responsive frontend.

### Frontend
*   **Framework**: Next.js (React)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Vanilla CSS
*   **Animations**: Framer Motion
*   **State Management**: Zustand
*   **Maps**: Leaflet (via React-Leaflet)
*   **Real-time Comms**: Socket.IO-client

### Backend
*   **Framework**: Node.js / Express
*   **Database**: MongoDB
*   **Authentication**: Custom session-based JWT + Google OAuth + Apple OAuth
*   **Security**: Helmet, Rate Limiting, bcrypt
*   **Data Pipelines**: Axios (integration with Open-Meteo, FlightRadar24, etc.)
*   **Real-time Comms**: Socket.IO

## Key Features

1.  **Live Map & Telemetry Dashboard**: A high-fidelity, interactive map tracking global airspace targets in real time. Features distinct visual modes (Dark / Premium Satellite) and a performance guardian for optimal FPS.
2.  **Cockpit UI Design Language**: Strict adherence to a dark, contrast-heavy aesthetic. Utilizes specific typography (`Archivo` for labels, `Oswald` for numerals), raw borders, and data-dense UI elements.
3.  **Comprehensive Aircraft Intelligence**: Integrates multiple APIs to retrieve aircraft origin/destination, real-time telemetry (altitude, speed, heading, vertical rate), weather at coordinates, and aircraft photographic data.
4.  **SkyLord AI Integration**: Built-in chat/command interface for operators to query AI for advanced airspace intelligence.
5.  **Secure Operator Clearance (Auth)**: Custom session-based authentication with OAuth support. Enforces strict password requirements and secure session management.
6.  **Responsive & Accessible**: Fully responsive dashboard supporting desktop, tablet, and mobile layouts. Respects OS-level reduced motion preferences via global `MotionConfig`.

## Installation & Setup

1.  **Clone the Repository**

2.  **Backend Setup**
    *   Navigate to `/backend`
    *   Install dependencies: `npm install`
    *   Configure environment variables in `.env` (Port, Database URI, Secrets)
    *   Start the server: `npm start`

3.  **Frontend Setup**
    *   Navigate to `/flightai`
    *   Install dependencies: `npm install`
    *   Configure environment variables in `.env`
    *   Start the development server: `npm run dev`

## Deployment

The application is built for production readiness.
*   **Frontend**: Use `npm run build` in the `flightai` directory to generate an optimized static build or SSR-ready Node server.
*   **Backend**: Ensure environment variables are configured for production (e.g., CORS domains, secure cookies). Run using PM2 or Docker.

## License

Proprietary Software. All Rights Reserved.
