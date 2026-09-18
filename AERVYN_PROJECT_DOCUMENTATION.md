# AERVYN — Complete Project Documentation

> **Product Name:** AERVYN  
> **Version:** 2.0  
> **Last Updated:** September 16, 2026  
> **Author:** Aman Rajput  
> **Repository:** https://github.com/AmanRajput-Backend/FLIGHTAI  
> **Live Frontend:** Vercel (skyintel-black.vercel.app)  
> **Live Backend:** Render (flightai-hxbd.onrender.com)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Design System — Glass Cockpit PFD](#4-design-system--glass-cockpit-pfd)
5. [Frontend — Deep Breakdown](#5-frontend--deep-breakdown)
6. [Backend — Deep Breakdown](#6-backend--deep-breakdown)
7. [Database — MongoDB Atlas](#7-database--mongodb-atlas)
8. [External APIs & Data Sources](#8-external-apis--data-sources)
9. [Real-Time System — Socket.IO](#9-real-time-system--socketio)
10. [Authentication & Security](#10-authentication--security)
11. [Performance Engineering](#11-performance-engineering)
12. [Error Handling & Resilience](#12-error-handling--resilience)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Complete File Tree](#14-complete-file-tree)
15. [Environment Variables](#15-environment-variables)
16. [TypeScript Interfaces](#16-typescript-interfaces)
17. [State Management](#17-state-management)
18. [Future Roadmap](#18-future-roadmap)

---

## 1. Product Overview

Aervyn is a **real-time flight tracking command center** that displays live aircraft positions on an interactive map, provides deep telemetry data, route information, aircraft metadata, weather conditions, and an AI-powered aviation chatbot — all in a **Glass Cockpit / Primary Flight Display (PFD)** visual aesthetic.

### Core Capabilities

| Capability | Description |
|------------|-------------|
| **Live Map** | Interactive Leaflet map showing thousands of aircraft in real-time with 8 distinct aircraft SVG silhouettes |
| **Deep Telemetry** | Altitude, speed, heading (with compass graphic), vertical rate, coordinates, signal ping |
| **Route Intelligence** | Origin/destination airports with IATA/ICAO codes, terminals, gates — sourced from a 3-tier API fallback chain |
| **Aircraft Photos** | Real photographs of selected aircraft via Planespotters.net and FlightRadar24 |
| **AI Chatbot** | Aviation-specialized conversational AI (Groq Llama 3.1) with flight context awareness |
| **Weather** | Ground-level weather below the aircraft (Open-Meteo) |
| **Authentication** | Full user system with register, login, email verification, password reset, session management |
| **Search** | Unified search bar that finds flights and airports (AI-powered geocoding) |

---

## 2. Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16 + React 19)             │
│                    Deployed on: Vercel                          │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐         │
│  │ Telemetry│  │   Leaflet    │  │   AI Chatbot      │         │
│  │  Panel   │  │   Map        │  │   Panel           │         │
│  │  420px   │  │  (center)    │  │   400px            │         │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘         │
│       │               │                   │                     │
│  Zustand Stores: useFlightStore, useChatStore, useUIStore       │
│       │               │                   │                     │
│       └───────────────┼───────────────────┘                     │
│                       │ Socket.IO + Axios (REST)                │
└───────────────────────┼─────────────────────────────────────────┘
                        │
┌───────────────────────┼─────────────────────────────────────────┐
│              BACKEND (Node.js + Express 5)                      │
│              Deployed on: Render                                │
│                       │                                         │
│  ┌────────────────────┴────────────────────────────┐            │
│  │            Socket.IO Server                     │            │
│  │  (viewport_update → flights_update per client)  │            │
│  └────────────────────┬────────────────────────────┘            │
│                       │                                         │
│  ┌──────────┐  ┌──────┴──────┐  ┌────────────────────┐         │
│  │/api/auth │  │/api/search  │  │ /api/route          │         │
│  │/api/user │  │/api/chat    │  │ /api/flight-path    │         │
│  │/api/contact│             │  │ /api/aircraft        │         │
│  └────┬─────┘  └──────┬──────┘  └────────┬───────────┘         │
│       │               │                  │                      │
│  MongoDB Atlas   Groq AI (LLM)    AeroDataBox / AviationStack  │
│  (Users/Sessions)                  / ADSB.lol / OpenSky         │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow: Flight Tracking

1. **Client connects** via Socket.IO → server emits `system_status: 'live'`
2. **Map pans/zooms** → client emits `viewport_update` with bounding box
3. **FlightDataService** receives bounds → splits into 5x5 degree buckets
4. **ADSBLOLProvider** fetches each bucket from `api.adsb.lol/v2/point/{lat}/{lon}/{radius}`
5. Raw data is **normalized** to `NormalizedAircraft` schema
6. Results are **cached** in LRU cache (5s TTL), **coalesced** for concurrent requests
7. **Deduplicated** flights are emitted back via `flights_update`
8. **Map renders** up to 1,500 markers with cached SVG icons

### Data Flow: AI Chat

1. User types message → ChatPanel sends via Axios to `/api/chat`
2. Backend builds system prompt with **selected flight telemetry** context
3. Groq API (Llama 3.1 8B) generates response
4. If rate-limited (429) → **local NLP fallback** engine activates (regex-based intents)
5. Response sent back → rendered in chat bubble

---

## 3. Technology Stack

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.2.2 | React framework (App Router, SSR, Turbopack) |
| `react` | 19.2.4 | UI component library |
| `react-dom` | 19.2.4 | React DOM renderer |
| `tailwindcss` | 4.x | Utility-first CSS (v4 with `@theme` blocks) |
| `leaflet` | 1.9.4 | Interactive map engine |
| `react-leaflet` | 5.0.0 | React bindings for Leaflet |
| `@types/leaflet` | 1.9.21 | TypeScript definitions for Leaflet |
| `socket.io-client` | 4.8.3 | WebSocket client for real-time data |
| `axios` | 1.14.0 | HTTP client for REST API calls |
| `zustand` | 5.0.12 | Lightweight state management |
| `framer-motion` | 12.38.0 | Animation library |
| `lucide-react` | 1.7.0 | SVG icon library |
| `clsx` | 2.1.1 | Conditional className utility |
| `tailwind-merge` | 3.5.0 | Intelligent Tailwind class merging |

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | 5.2.1 | Web framework |
| `socket.io` | 4.8.3 | WebSocket server |
| `mongoose` | 9.10.0 | MongoDB ODM |
| `openai` | 6.33.0 | Groq API client (OpenAI-compatible SDK) |
| `axios` | 1.14.0 | External API HTTP client |
| `bcryptjs` | 3.0.3 | Password hashing |
| `cookie-parser` | 1.4.7 | Parse session cookies |
| `cors` | 2.8.6 | Cross-origin resource sharing |
| `dotenv` | 17.4.0 | Environment variable loading |
| `express-rate-limit` | 8.7.0 | API rate limiting |
| `helmet` | 8.3.0 | Security headers |
| `lru-cache` | 11.5.2 | In-memory caching (routes, flights, aircraft) |
| `nodemailer` | 10.0.3 | SMTP email sending (fallback) |
| `resend` | 6.28.0 | Email API (primary email provider) |
| `pino` / `pino-http` / `pino-pretty` | 10.x/11.x/13.x | Structured JSON logging |

### Languages

| Language | Where | Why |
|----------|-------|-----|
| TypeScript | Frontend (`.tsx`, `.ts`) | Type safety for complex flight data objects |
| JavaScript | Backend (`.js`) | Lightweight, no build step needed for server |
| CSS | Styling (`globals.css`) | Tailwind v4 `@theme` + custom PFD utilities |

---

## 4. Design System — Glass Cockpit PFD

Aervyn uses a **Glass Cockpit / Primary Flight Display** visual language inspired by real aircraft instrument panels — not the soft SaaS glassmorphism common in web apps.

### Design Principles

| Principle | Rule |
|-----------|------|
| **No glassmorphism** | No `backdrop-filter: blur()`, no frosted glass, no translucent overlays |
| **True black backgrounds** | `#000000`, not zinc/slate/gray |
| **Hard edges** | `border-radius: 2px` maximum. No `rounded-xl/2xl/3xl` |
| **Depth via borders** | Use inset borders and 1px lines, not drop shadows |
| **Industrial typography** | Condensed numerals (Oswald), tight labels (Archivo) |
| **No decorative color** | Amber/red reserved for warnings/errors only |

### Color Tokens (CSS Variables)

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-cockpit-black` | `#000000` | True black base background |
| `--color-horizon-blue` | `#0088CC` | Sky/above-horizon — primary interactive accent |
| `--color-horizon-brown` | `#5C3D2E` | Ground/below-horizon — secondary accent |
| `--color-instrument-white` | `#E8EDF0` | Primary text, gauge markings |
| `--color-instrument-grey` | `#8A94A0` | Secondary text, inactive states |
| `--color-caution-amber` | `#FFB300` | Warnings only, never decorative |
| `--color-warning-red` | `#E8453C` | Errors/critical only, never decorative |

### Typography Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--font-numerals` | `'Oswald', 'Bebas Neue', sans-serif` | Gauge readouts, flight numbers, numeric data |
| `--font-labels` | `'Archivo', system-ui, sans-serif` | Labels, body text, UI chrome |

### Component Library

| Component | File | Purpose |
|-----------|------|---------|
| `CockpitButton` | `src/components/ui/CockpitButton.tsx` | 4-variant button system (action, selector, icon, toggle) |
| `HorizonDivider` | `src/components/ui/HorizonDivider.tsx` | Blue/brown split line mimicking an attitude indicator |

#### CockpitButton Variants

| Variant | Use Case | Visual |
|---------|----------|--------|
| `action` | Commit actions (Submit, Save, Login) | Rectangular, 2px radius, physical pressed state (`active:scale-[0.98]`) |
| `selector` | Choosing options (nav tabs, filters) | Flat, hard border, fills with horizon-blue when active |
| `icon` | Icon-only buttons (close, settings) | Square hit area, transparent, border on hover |
| `toggle` | Binary switches (Dark/Satellite map) | Rocker switch with inset shadows simulating depth |

---

## 5. Frontend — Deep Breakdown

### Routing (Next.js App Router)

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page / marketing page |
| `/dashboard` | `app/dashboard/page.tsx` | Main 3-panel flight tracking interface (public) |
| `/login` | `app/(auth)/login/page.tsx` | Login form |
| `/register` | `app/(auth)/register/page.tsx` | Registration form |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Password reset request |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Password reset (with token from email) |
| `/verify-email` | `app/(auth)/verify-email/page.tsx` | Email verification (with token from email) |
| `/settings` | `app/settings/layout.tsx` | Settings layout (protected — requires auth) |
| `/settings/profile` | `app/settings/profile/page.tsx` | Profile editing (name, username, bio, avatar) |
| `/settings/security` | `app/settings/security/page.tsx` | Password change, session management, security events log |
| `/pricing` | `app/pricing/page.tsx` | Pricing tiers page |
| `/contact` | `app/contact/page.tsx` | Contact form (sends via Resend API) |
| `/about` | `app/about/page.tsx` | About page |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/terms` | `app/terms/page.tsx` | Terms of service |
| `/data-sources` | `app/data-sources/page.tsx` | Data attribution and third-party sources |
| `/status` | `app/status/page.tsx` | System status page |

### Components

| Component | File | Description |
|-----------|------|-------------|
| **Map** | `src/components/Map.tsx` | Leaflet map with real-time aircraft markers, 8-category SVG icons, flight path polylines, viewport culling, icon caching |
| **TelemetryPanel** | `src/components/telemetry/TelemetryPanel.tsx` | Left sidebar: flight data, aircraft photo, route info, metric cards (altitude/speed/heading/vrate), weather, coordinates |
| **ChatPanel** | `src/components/chat/ChatPanel.tsx` | Right sidebar: AI chat interface with tracking context bar, flight reference badges |
| **Header** | `src/components/layout/Header.tsx` | Top bar: Aervyn logo, navigation, GlobalSearch, map mode toggle, system status indicator, UserMenu |
| **Footer** | `src/components/layout/Footer.tsx` | Site footer with links and copyright |
| **GlobalSearch** | `src/components/search/GlobalSearch.tsx` | Unified search bar (flights + airports) |
| **UserMenu** | `src/components/UserMenu.tsx` | Avatar dropdown with profile info, settings links, logout |
| **CookieConsent** | `src/components/CookieConsent.tsx` | GDPR cookie consent banner |
| **DataAttribution** | `src/components/DataAttribution.tsx` | Map overlay showing data source credits |
| **CockpitButton** | `src/components/ui/CockpitButton.tsx` | Design system button (4 variants) |
| **HorizonDivider** | `src/components/ui/HorizonDivider.tsx` | Blue/brown split line component |

### Map Component — Technical Details

#### Aircraft Classification Engine

The map dynamically classifies each aircraft into 1 of 8 visual categories based on heuristic analysis:

| Category | SVG Shape | Detection Logic |
|----------|-----------|-----------------|
| `COMMERCIAL` | Classic airliner silhouette | Speed >= 400 or altitude >= 20,000 or Boeing/Airbus model |
| `CARGO` | Thicker body, shorter wings | Callsign contains DHL/FDX/UPS/CARGO or model includes CARGO |
| `PRIVATE` | Sleek, swept wings, T-tail | Type code GLF/CL60/C560 or high speed+alt with unknown operator |
| `MILITARY` | Sharp delta wing | Callsign starts MIL/NAVY/AF or type F16/F18/F22/C130 |
| `HELICOPTER` | Cabin + rotor disc | Type starts with H or EC35/R22/R44 or low speed + low altitude |
| `SMALL_PROP` | Straight wings with prop | Type C172/C152/P28A/SR22 or moderate speed + low altitude |
| `GLIDER` | Long thin wings | Model includes GLIDER or very low speed (20-120) |
| `UNKNOWN` | Generic airliner | Fallback when no heuristic matches |

#### Icon Caching Strategy

Icons are cached using a composite key: `{category}-{bucketedHeading}-{isSelected}-{hasSelection}-{zoomBucket}-{performanceMode}`

- Headings bucketed into **15 degree increments** (360/15 = 24 heading variants)
- Zoom bucketed into 3 levels: `low` (<5), `mid` (5-7), `high` (7+)
- This produces ~200-300 cached icons max, preventing DOM thrashing

#### Viewport Culling

- Only aircraft within `map.getBounds().pad(0.2)` are rendered
- Hard cap at **1,500 markers** (browsers crash above ~2,000 complex SVG markers)
- Bounds updates **debounced at 750ms** to prevent render loops

### Context (React Context)

| Context | File | Purpose |
|---------|------|---------|
| `AuthContext` | `src/context/AuthContext.tsx` | User authentication state, CSRF token management, login/logout/refreshUser |

#### AuthContext Details

- On mount: fetches CSRF token → fetches `/api/auth/me` to check session
- CSRF tokens cached as a singleton promise to prevent Strict Mode race conditions
- Global Axios interceptor automatically retries on 403 (CSRF token expired/invalid)
- Route protection: redirects `/settings/*` to `/login` if unauthenticated

### Middleware (Next.js Edge)

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Protects `/settings/*` routes by checking `_session` cookie. Redirects to `/login` if absent. Dashboard left intentionally public (freemium model). |

---

## 6. Backend — Deep Breakdown

### Server Configuration

| Setting | Value |
|---------|-------|
| **Port** | 3001 (dev) / 10000 (Render production) |
| **Trust Proxy** | Level 1 (for Render's load balancer) |
| **CORS Origins** | `localhost:3000`, `localhost:3001`, `skyintel-black.vercel.app`, `FRONTEND_URL` env |
| **Logger** | Pino with pino-pretty (colorized output) |
| **Security** | Helmet (security headers) |

### API Routes

#### Authentication (`/api/auth/*`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/csrf-token` | GET | No | Returns CSRF token |
| `/api/auth/register` | POST | No | Create account (name, username, email, password) |
| `/api/auth/login` | POST | No | Login with email/password → sets `_session` cookie |
| `/api/auth/logout` | POST | Yes | Destroys session, clears cookie |
| `/api/auth/me` | GET | Yes | Returns current user profile |
| `/api/auth/verify-email` | POST | No | Verifies email with token |
| `/api/auth/resend-verification` | POST | Yes | Resends verification email |
| `/api/auth/forgot-password` | POST | No | Sends password reset email |
| `/api/auth/reset-password` | POST | No | Resets password with token |

Rate limited: **50 requests per 15 minutes** per IP.

#### User (`/api/user/*`)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/user/profile` | PATCH | Yes | Update name, username, bio |
| `/api/user/change-password` | POST | Yes+Verified | Change password (requires current password) |
| `/api/user/sessions` | GET | Yes | List all active sessions |
| `/api/user/sessions/:id` | DELETE | Yes | Revoke a specific session |
| `/api/user/security-events` | GET | Yes | List security audit log |
| `/api/user/delete-account` | DELETE | Yes | Permanently delete account and all data |

#### Flight Data

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/search/:query` | GET | Yes | Global unified search — LLM airport geocoding |
| `/api/route/:flightNumber` | GET | Yes | Route lookup (3-tier: AeroDataBox → AviationStack → ADSB.lol → static fallback) |
| `/api/flight-path/:icao24` | GET | No | Flight trajectory (OpenSky tracks → Great Circle synthesis) |
| `/api/aircraft/:hex` | GET | Yes | Aircraft metadata lookup from ADS-B DB |

Rate limits: Search = 100/15min, Route = 150/15min.

#### AI Chat

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat` | POST | Yes+Verified+CSRF | Send message to AI (Groq Llama 3.1) with flight context |

#### Contact

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/contact` | POST | No | Contact form submission (sends via Resend email API) |

Rate limited: **5 requests per hour** per IP.

#### Health

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/healthz` | GET | Health check (returns uptime) |

### Services Layer (Provider Pattern)

```
FlightDataProvider (base class)
    └── ADSBLOLProvider (concrete implementation)
            └── FlightDataService (orchestrator + caching)
```

#### FlightDataProvider (`services/FlightDataProvider.js`)

Abstract base class defining the contract:
- `getAircraftInViewport(minLat, minLng, maxLat, maxLng)` → returns `NormalizedAircraft[]`
- `normalize(rawData)` → converts provider-specific data to standard schema

#### NormalizedAircraft Schema

Every flight from any provider is normalized to these fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | ICAO24 hex (primary key) |
| `flightNumber` | string | Callsign / flight number |
| `airline` | string | Aircraft type code (legacy mapping) |
| `lat` | number | Latitude |
| `lng` | number | Longitude |
| `altitude` | number | Barometric or geometric altitude |
| `speed` | number | Ground speed (km/h) |
| `heading` | number | Magnetic or true heading |
| `verticalRate` | number | Barometric rate (m/s) |
| `lastContact` | number | Signal age (seconds) |
| `isLive` | boolean | Always true for live data |

#### ADSBLOLProvider (`services/ADSBLOLProvider.js`)

- **API:** `https://api.adsb.lol/v2/point/{lat}/{lon}/{radius}`
- **Radius limit:** 250 NM max (API constraint)
- **Circuit breaker:** Trips after 5 consecutive failures → 1 minute backoff
- **Timeout:** 10,000ms default (configurable via `ADSBLOL_TIMEOUT_MS`)
- **User-Agent:** `Aervyn/1.0`

#### FlightDataService (`services/FlightDataService.js`)

- **Spatial bucketing:** Viewport split into 5x5 degree grid cells
- **Hard cap:** Max 50 buckets per request (prevents abuse on zoom-out)
- **LRU Cache:** Max 1,000 buckets, 5s TTL
- **Request coalescing:** If two clients request the same bucket simultaneously, only one API call is made

### Middleware

| File | Function | Purpose |
|------|----------|---------|
| `middleware/auth.js` | `requireAuth` | Validates session cookie → attaches `req.user` |
| `middleware/auth.js` | `requireVerified` | Checks `user.isEmailVerified === true` |
| `middleware/csrf.js` | `csrfProtection` | Validates `x-csrf-token` header on non-GET requests |

### Utilities

| File | Function | Purpose |
|------|----------|---------|
| `utils/crypto.js` | `generateSecureToken` | Creates 32-byte hex tokens for sessions/verification |
| `utils/crypto.js` | `hashToken` | SHA-256 hashes tokens before database storage |
| `utils/emailService.js` | `sendEmail` | Sends transactional emails (Resend primary, SMTP fallback) |

---

## 7. Database — MongoDB Atlas

### Connection

- URI stored in `MONGODB_URI` environment variable
- Mongoose ODM with `serverSelectionTimeoutMS: 5000`
- `bufferCommands: false` — queries fail immediately if connection drops

### Models

#### User (`models/User.js`)

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | Required, trimmed |
| `username` | String | Required, unique, lowercase, 3-30 chars |
| `email` | String | Required, unique, lowercase, regex validated |
| `passwordHash` | String | Required (bcrypt hash, stripped from JSON output) |
| `avatar` | String | Default empty (auto-generated via ui-avatars.com) |
| `bio` | String | Max 500 chars |
| `role` | Enum | `USER` / `ADMIN` / `MODERATOR` (default: `USER`) |
| `isEmailVerified` | Boolean | Default: `false` |
| `twoFactorEnabled` | Boolean | Default: `false` (future-proofed) |
| `twoFactorSecret` | String | Null (future-proofed, stripped from JSON) |
| `twoFactorRecoveryCodes` | [String] | Empty array (future-proofed, stripped from JSON) |
| `createdAt` / `updatedAt` | Date | Auto-managed by Mongoose timestamps |

#### Session (`models/Session.js`)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId (ref: User) | Session owner |
| `sessionTokenHash` | String | SHA-256 hash of session token (not plaintext) |
| `deviceInfo` | String | E.g. "Chrome on Windows" |
| `ipAddress` | String | Client IP |
| `lastActiveAt` | Date | Updated on each authenticated request |
| `expiresAt` | Date | TTL — MongoDB auto-deletes expired sessions |

TTL Index: `{ expiresAt: 1 }, { expireAfterSeconds: 0 }`

#### Token (`models/Token.js`)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId (ref: User) | Token owner |
| `tokenHash` | String | SHA-256 hash of verification/reset token |
| `type` | Enum | `VERIFY_EMAIL` / `RESET_PASSWORD` |
| `expiresAt` | Date | TTL — auto-deleted when expired |

#### SecurityEvent (`models/SecurityEvent.js`)

| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId (ref: User) | Event subject |
| `eventType` | Enum | `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `PASSWORD_CHANGED`, `PASSWORD_RESET`, `EMAIL_VERIFIED`, `ACCOUNT_DELETED`, `SESSION_REVOKED` |
| `ipAddress` | String | Client IP at time of event |
| `deviceInfo` | String | User agent |
| `metadata` | Mixed | Additional context (flexible) |

---

## 8. External APIs & Data Sources

| Service | Purpose | Auth | Rate Limits |
|---------|---------|------|-------------|
| **ADSB.lol** | Primary live flight feed (ADS-B data) | Free (no key) | 250NM radius per request |
| **OpenSky Network** | Flight trajectory tracks | Username/Password | ~100/day free |
| **Groq (Llama 3.1 8B Instant)** | AI chatbot + airport geocoding | API Key | ~14k tokens/min free |
| **AeroDataBox (RapidAPI)** | Premium route data (origin/dest/aircraft/gates) | RapidAPI Key | ~100/day free |
| **AviationStack** | Secondary route data | API Key | ~100/month free |
| **ADS-B DB** | Aircraft metadata (registration, manufacturer, owner) | Free | No hard limit |
| **Open-Meteo** | Ground weather below aircraft | Free (no key) | Generous |
| **OpenWeatherMap** | Weather for chatbot fallback queries | API Key | 1000/day free |
| **Planespotters.net** | Aircraft photos by ICAO24 hex | Free (no key) | Fair use |
| **FlightRadar24 (static)** | Aircraft photos fallback | Free (direct URL) | N/A |
| **Esri World Imagery** | Premium satellite map tiles | Free (no key) | Generous |
| **Esri Dark Gray** | Dark-themed map tiles | Free (no key) | Generous |
| **Resend** | Transactional emails | API Key | 100/day free |
| **ui-avatars.com** | Auto-generated avatar images | Free | No limit |

### Route Lookup Fallback Chain

```
1. AeroDataBox (RapidAPI) — Premium data (origin, destination, aircraft, gates)
       │ fails?
       ▼
2. AviationStack — Secondary source (origin, destination, timezone, terminal)
       │ fails?
       ▼
3. ADSB.lol — Basic route (origin, destination, coordinates)
       │ fails?
       ▼
4. Static Fallback — "Data Unavailable" placeholders
```

### Flight Path Fallback Chain

```
1. OpenSky Network Tracks API — Real historical ADS-B track
       │ fails?
       ▼
2. ADSB.lol Route + Great Circle — Synthesized arc (20-point interpolation)
       │ fails?
       ▼
3. Empty path — No trajectory displayed
```

---

## 9. Real-Time System — Socket.IO

### Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `system_status` | Server → Client | `'live'` | Sent on connection |
| `viewport_update` | Client → Server | `{ minLat, maxLat, minLng, maxLng }` | Client reports visible map area |
| `flights_update` | Server → Client | `NormalizedAircraft[]` | Aircraft positions for requested viewport |
| `command_focus_map` | Server → Client | `{ lat, lng, zoom }` | AI chatbot commands map to fly to location |
| `command_focus_flight` | Server → Client | `{ flightId }` | AI commands frontend to select a flight |

### Connection Management

- **Per-IP limit:** 15 concurrent Socket.IO connections
- Excess connections are immediately disconnected
- Connection counts tracked via `socketConnections` Map
- Counts decremented on disconnect

---

## 10. Authentication & Security

### Session System

1. User logs in with email + password
2. Password verified against bcrypt hash
3. **32-byte hex token** generated via `crypto.randomBytes(32)`
4. Token **SHA-256 hashed** before storage in MongoDB
5. **Plaintext token** set as `_session` HttpOnly cookie
6. On each request: cookie read → hashed → matched against Session collection
7. Sessions expire after a configured period (TTL index auto-deletes)

### CSRF Protection

1. Server generates CSRF token on `GET /api/auth/csrf-token`
2. Frontend stores token → sends as `x-csrf-token` header on all mutations
3. If token is invalid/missing → 403 response
4. Frontend has an Axios interceptor that automatically refreshes the CSRF token on 403

### Password Security

- Hashed with `bcryptjs` (cost factor default)
- Minimum validation enforced on frontend
- Password change requires current password verification
- Password reset tokens expire after a set period

### Security Event Logging

Every security-relevant action is logged to the `SecurityEvent` collection:
- Login success/failure
- Logout
- Password changed/reset
- Email verified
- Account deleted
- Session revoked

### Rate Limiting

| Route | Limit |
|-------|-------|
| `/api/auth/*` | 50 requests / 15 minutes |
| `/api/search/*` | 100 requests / 15 minutes |
| `/api/route/*` | 150 requests / 15 minutes |
| `/api/contact` | 5 requests / 1 hour |

### Security Headers

Helmet middleware adds standard security headers (X-Content-Type-Options, X-Frame-Options, CSP, etc.)

---

## 11. Performance Engineering

| Optimization | Implementation | Impact |
|--------------|---------------|--------|
| **Spatial Bucketing** | FlightDataService splits viewport into 5x5 degree grid cells | Enables granular caching — only dirty buckets refetched |
| **LRU Flight Cache** | Max 1,000 buckets, 5s TTL | Eliminates redundant API calls for same area |
| **Request Coalescing** | Pending requests Map prevents duplicate concurrent fetches | Reduces API load by ~50% under high traffic |
| **Circuit Breaker** | ADSBLOLProvider trips after 5 failures → 1min backoff | Prevents cascading failures when ADSB.lol is down |
| **Icon Caching** | Composite key: category + heading bucket + state + zoom | ~200 cached icons vs. generating per-marker |
| **Heading Buckets** | 15 degree increments (24 heading variants) | 96% reduction in unique icon combinations |
| **Viewport Culling** | Only render aircraft within visible bounds | Prevents off-screen DOM allocation |
| **Marker Cap** | Hard limit at 1,500 markers | Prevents browser crash (>2,000 complex SVGs = OOM) |
| **Bounds Debounce** | 750ms debounce on moveend/zoomend | Prevents render storm during fast pan/zoom |
| **Route Caching** | LRU with 24h TTL, max 500 entries | Route lookups rarely hit external APIs twice |
| **Component Memoization** | `React.memo(MapComponent)` | Prevents full map re-render on parent state changes |
| **Dynamic Import** | Map loaded via `next/dynamic` with `ssr: false` | Avoids Leaflet server-side errors (Leaflet requires `window`) |

---

## 12. Error Handling & Resilience

| Failure Scenario | Handling Strategy |
|------------------|-------------------|
| ADSB.lol down | Circuit breaker trips → returns empty flights → auto-retries after 1min |
| OpenSky rate limited (429) | Logged and skipped — trajectory falls back to Great Circle |
| Groq AI quota exceeded | Falls back to local regex NLP engine (weather, track, greetings) |
| AeroDataBox fails | Falls to AviationStack → ADSB.lol → static placeholders |
| Aircraft photo unavailable | Planespotters → FlightRadar24 → "No Photographic Data" placeholder |
| MongoDB connection fails | Logged, `bufferCommands: false` ensures queries fail fast vs. hanging |
| Unhandled Promise Rejection | Global `process.on('unhandledRejection')` handler — logs, doesn't crash |
| Uncaught Exception | Global `process.on('uncaughtException')` handler — logs, doesn't crash |
| Frontend search fails | Inline red error message below search bar |
| Chat API error | Styled error bubble with AlertCircle icon |
| CSRF token expired | Axios interceptor auto-refreshes and retries the original request |

---

## 13. Deployment & Infrastructure

### Frontend — Vercel

- **Framework:** Next.js 16 (automatically detected)
- **Build Command:** `npm run build` (in `flightai/` directory)
- **Output:** Static + SSR hybrid
- **Domain:** `skyintel-black.vercel.app` (legacy domain, rebrand pending)
- **Environment Variable:** `NEXT_PUBLIC_API_URL` → backend URL

### Backend — Render

- **Type:** Web Service
- **Runtime:** Node.js
- **Build Command:** `cd backend && npm install`
- **Start Command:** `cd backend && npm start`
- **Port:** 10000 (Render default)
- **Health Check:** `GET /healthz`

### Render Configuration (`render.yaml`)

```yaml
services:
  - type: web
    name: skyintel-backend
    env: node
    buildCommand: "cd backend && npm install"
    startCommand: "cd backend && npm start"
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

---

## 14. Complete File Tree

```
AI/
├── .git/
├── .github/
├── .gitignore
├── AERVYN_PROJECT_DOCUMENTATION.md    ← This file
├── FlightAI_Features.md              ← Legacy feature doc
├── TECH_STACK.md                      ← Legacy tech stack doc
├── THIRD_PARTY_DATA.md                ← Third-party data attribution
├── project_documentation.md           ← Legacy project doc
├── render.yaml                        ← Render deployment config
├── railway.json                       ← Railway deployment config
│
├── backend/
│   ├── .env                           ← API keys (NEVER committed)
│   ├── .env.example                   ← Template for .env
│   ├── package.json                   ← Backend dependencies
│   ├── package-lock.json
│   ├── server.js                      ← Main server (Express + Socket.IO + all routes)
│   ├── chatRoute.js                   ← AI chat endpoint + system prompt + NLP fallback
│   ├── backfill_avatars.js            ← One-time script to backfill user avatars
│   ├── test-script.js                 ← Dev test script
│   │
│   ├── config/
│   │   └── constants.js               ← Shared constants (GROQ_MODEL)
│   │
│   ├── middleware/
│   │   ├── auth.js                    ← requireAuth, requireVerified
│   │   └── csrf.js                    ← CSRF token validation
│   │
│   ├── models/
│   │   ├── User.js                    ← User schema + JSON sanitization
│   │   ├── Session.js                 ← Session schema + TTL index
│   │   ├── Token.js                   ← Verification/reset token + TTL index
│   │   └── SecurityEvent.js           ← Security audit log
│   │
│   ├── routes/
│   │   ├── authRoute.js               ← Auth endpoints (register/login/logout/verify/reset)
│   │   └── userRoute.js               ← User endpoints (profile/password/sessions/delete)
│   │
│   ├── services/
│   │   ├── FlightDataProvider.js      ← Base class + NormalizedAircraft schema
│   │   ├── ADSBLOLProvider.js         ← ADSB.lol API integration + circuit breaker
│   │   └── FlightDataService.js       ← Orchestrator: bucketing + caching + coalescing
│   │
│   └── utils/
│       ├── crypto.js                  ← generateSecureToken, hashToken (SHA-256)
│       └── emailService.js            ← Email sending (Resend primary, SMTP fallback)
│
└── flightai/                          ← Next.js 16 Frontend
    ├── package.json                   ← Frontend dependencies
    ├── tsconfig.json
    ├── next.config.ts
    ├── postcss.config.mjs
    │
    └── src/
        ├── middleware.ts              ← Edge middleware (protects /settings/*)
        │
        ├── app/
        │   ├── layout.tsx             ← Root HTML layout (fonts, metadata, AuthProvider)
        │   ├── page.tsx               ← Landing page
        │   ├── globals.css            ← Tailwind @theme + PFD design system
        │   ├── icon.svg               ← Favicon (SVG)
        │   │
        │   ├── dashboard/
        │   │   └── page.tsx           ← Main 3-panel flight tracking dashboard
        │   │
        │   ├── (auth)/
        │   │   ├── layout.tsx         ← Auth pages shared layout
        │   │   ├── login/page.tsx
        │   │   ├── register/page.tsx
        │   │   ├── forgot-password/page.tsx
        │   │   ├── reset-password/page.tsx
        │   │   └── verify-email/page.tsx
        │   │
        │   ├── settings/
        │   │   ├── layout.tsx         ← Settings sidebar layout
        │   │   ├── profile/page.tsx
        │   │   └── security/page.tsx
        │   │
        │   ├── pricing/page.tsx
        │   ├── contact/page.tsx
        │   ├── about/page.tsx
        │   ├── privacy/page.tsx
        │   ├── terms/page.tsx
        │   ├── data-sources/page.tsx
        │   └── status/page.tsx
        │
        ├── components/
        │   ├── Map.tsx                ← Leaflet map (394 lines)
        │   ├── UserMenu.tsx           ← Avatar dropdown
        │   ├── CookieConsent.tsx      ← GDPR banner
        │   ├── DataAttribution.tsx    ← Map data credits
        │   │
        │   ├── ui/
        │   │   ├── CockpitButton.tsx  ← Design system button (4 variants)
        │   │   └── HorizonDivider.tsx ← Blue/brown attitude indicator line
        │   │
        │   ├── layout/
        │   │   ├── Header.tsx         ← Top navigation bar
        │   │   └── Footer.tsx         ← Site footer
        │   │
        │   ├── search/
        │   │   └── GlobalSearch.tsx   ← Unified search bar
        │   │
        │   ├── chat/
        │   │   └── ChatPanel.tsx      ← AI chat sidebar
        │   │
        │   └── telemetry/
        │       └── TelemetryPanel.tsx ← Flight data sidebar
        │
        ├── context/
        │   └── AuthContext.tsx         ← Auth state + CSRF + Axios interceptors
        │
        ├── store/
        │   ├── useFlightStore.ts      ← Flight selection + telemetry state (Zustand)
        │   ├── useChatStore.ts        ← Chat messages + input state (Zustand)
        │   └── useUIStore.ts          ← System status + map mode + performance mode
        │
        ├── lib/
        │   ├── api/
        │   │   └── index.ts          ← API client (flightApi, chatApi, userApi)
        │   ├── socket.ts             ← Socket.IO client instance
        │   └── utils.ts              ← cn() className merge utility
        │
        └── types/
            └── index.ts              ← TypeScript interfaces (Flight, ChatMessage, etc.)
```

---

## 15. Environment Variables

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `GROQ_API_KEY` | Yes | Groq API key for AI chat |
| `AVIATIONSTACK_API_KEY` | Yes | AviationStack route data |
| `OPENWEATHER_API_KEY` | No | OpenWeatherMap (chatbot fallback) |
| `OPENSKY_USERNAME` | No | OpenSky Network credentials |
| `OPENSKY_PASSWORD` | No | OpenSky Network credentials |
| `RAPIDAPI_KEY` | Yes | AeroDataBox route data |
| `RAPIDAPI_HOST` | Yes | `aerodatabox.p.rapidapi.com` |
| `FRONTEND_URL` | Yes | Frontend origin for CORS |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `EMAIL_SERVER_HOST` | No | SMTP host (fallback) |
| `EMAIL_SERVER_PORT` | No | SMTP port (fallback) |
| `EMAIL_SERVER_USER` | No | SMTP username (fallback) |
| `EMAIL_SERVER_PASSWORD` | No | SMTP password (fallback) |
| `EMAIL_FROM` | No | Sender address |
| `ADSBLOL_BASE_URL` | No | ADSB.lol API base (default: `https://api.adsb.lol`) |
| `ADSBLOL_API_KEY` | No | Future-proofed ADSB.lol key |
| `ADSBLOL_TIMEOUT_MS` | No | Request timeout (default: 10000) |
| `ADSBLOL_CACHE_TTL` | No | Cache TTL in ms (default: 5000) |
| `ADSBLOL_ENABLED` | No | Enable/disable provider (default: true) |
| `ADSBLOL_CIRCUIT_BREAKER_THRESHOLD` | No | Failures before circuit trips (default: 5) |

### Frontend (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend URL (e.g. `https://flightai-hxbd.onrender.com`) |

---

## 16. TypeScript Interfaces

```typescript
// Flight (from ADS-B data)
interface Flight {
  id: string;                    // ICAO24 hex
  flightNumber: string;          // Callsign
  callsign?: string;
  aircraftType?: string;
  airline?: string;
  lat: number;
  lng: number;
  alt: number;
  altitude?: number;
  speed: number;
  heading: number;
  verticalRate?: number;
  lastContact?: number;          // Unix timestamp
  status: 'active' | 'scheduled' | 'landed' | 'unknown';
}

// Chat Message
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  referencedFlights?: string[];  // Flight IDs referenced in AI response
}

// Route Information
interface RouteInfo {
  origin: string;
  originIata?: string;
  originIcao?: string;
  originTimezone?: string;
  originTerminal?: string;
  originGate?: string;
  destination: string;
  destinationIata?: string;
  destinationIcao?: string;
  destinationTimezone?: string;
  destinationTerminal?: string;
  destinationGate?: string;
  destLat?: number;
  destLng?: number;
  aircraftModel?: string;
  registration?: string;
  source?: string;
}

// Weather
interface WeatherData {
  temperature_2m?: number;
  wind_speed_10m?: number;
  weather_code?: number;
  wind_direction_10m?: number;
}

// Aircraft Metadata (from ADS-B DB)
interface AircraftMetadata {
  registration?: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  owner?: string;
  registered_owner?: string;
  registered_owner_country_iso_name?: string;
}
```

---

## 17. State Management

Aervyn uses **Zustand** for lightweight, scalable state management with three independent stores:

### useFlightStore

| State | Type | Purpose |
|-------|------|---------|
| `selectedFlight` | `Flight \| null` | Currently selected aircraft |
| `focusedFlightId` | `string \| null` | Flight the map is focused on |
| `flightPhotoUrl` | `string \| null` | Aircraft photo URL |
| `weatherData` | `WeatherData \| null` | Ground weather below aircraft |
| `flightRouteData` | `RouteInfo \| null` | Route information |
| `aircraftMetadata` | `AircraftMetadata \| null` | Registration, manufacturer, owner |
| `expandedRoute` | `'origin' \| 'destination' \| null` | Which route card is expanded |
| `targetPos` | `[number, number] \| null` | Map fly-to target |
| `flights` | `Flight[]` | All visible flights |
| `airportData` | `unknown \| null` | Airport search result |

### useChatStore

| State | Type | Purpose |
|-------|------|---------|
| `messages` | `ChatMessage[]` | Full chat history |
| `inputValue` | `string` | Current input field value |
| `loading` | `boolean` | Chat request in progress |

### useUIStore

| State | Type | Purpose |
|-------|------|---------|
| `systemStatus` | `'live' \| 'stale'` | System health indicator |
| `mapMode` | `'satellite' \| 'dark'` | Map tile layer selection |
| `performanceMode` | `boolean` | FPS Guardian active |

---

## 18. Future Roadmap

| Feature | Status | Notes |
|---------|--------|-------|
| Two-Factor Authentication (2FA) | Schema ready | `twoFactorEnabled`, `twoFactorSecret`, `twoFactorRecoveryCodes` fields exist in User model |
| Phase 6: Dashboard PFD refactor | Planned | TelemetryPanel + Map popup migration to full PFD aesthetic |
| Flight alerts / notifications | Not started | Push notifications when tracked flight changes status |
| Saved flights / favorites | Not started | Requires database collection |
| Historical flight replay | Not started | Play back flight paths over time |
| Multi-provider support | Architecture ready | `FlightDataProvider` base class supports additional providers |
| Premium API tier | Not started | Pricing page exists but no payment integration |

---

> **Built by Aman Rajput** — Aervyn Command Center
