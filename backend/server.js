require('dotenv').config();
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const OpenAI = require('openai');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { requireAuth, requireVerified } = require('./middleware/auth');
const { LRUCache } = require('lru-cache');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { csrfProtection } = require('./middleware/csrf');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
const chatRoute = require('./chatRoute');

const routeCache = new LRUCache({
  max: 500,
  ttl: 1000 * 60 * 60 * 24 // 24 hours
}); // Cache for flight routes to improve robustness

const app = express();
app.set('trust proxy', 1); // Trust the first proxy (Render's load balancer) for rate limiting
const server = http.createServer(app);

const frontendOrigin = process.env.FRONTEND_URL || 'https://skyintel-black.vercel.app';
const allowedOrigins = [
  frontendOrigin,
  'http://localhost:3000',
  'http://localhost:3001',
  'https://skyintel-black.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow configured origins dynamically
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

const io = new Server(server, { 
  cors: corsOptions
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.set('io', io);

// Database Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
  })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => {
      console.error('❌ MongoDB connection error (Check IP Whitelist in Atlas):', err.message);
    });
    
  // Disable buffering so queries fail immediately if connection is down
  mongoose.set('bufferCommands', false);
} else {
  console.warn('⚠️ MONGODB_URI not provided. Authentication features will not work.');
}

// Authentication Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Apply CSRF to all non-GET requests (handled inside csrfProtection)
// Mount auth routes (with rate limiter)
app.use('/api/auth', authLimiter, csrfProtection, authRoute);
app.use('/api/user', csrfProtection, userRoute);

// Rate Limiters
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many search requests, please try again later.' }
});

const routeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { error: 'Too many route requests, please try again later.' }
});

const { GROQ_MODEL } = require('./config/constants');

// Global Unified Search
app.get('/api/search/:query', searchLimiter, requireAuth, async (req, res) => {
  try {
    let rawQuery = req.params.query;
    if (!rawQuery || rawQuery.length > 100) return res.status(400).json({ error: "Invalid search query." });
    const query = rawQuery.toLowerCase().trim();
    if (!query) return res.json(null);
    
    // Pass 1: Scan live flights cache
    if (flightCache && flightCache.length > 0) {
      const match = flightCache.find(f => 
        (f.flightNumber && f.flightNumber.toLowerCase().includes(query)) ||
        (f.id && f.id.toLowerCase() === query) ||
        (f.airline && f.airline.toLowerCase().includes(query))
      );
      if (match) return res.json({ type: 'flight', data: match });
    }
    
    // Pass 2: Fallback to LLM Airport Geocoding
    const response = await openai.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an API that returns ONLY valid JSON for airport searches. Return keys: name, iata, icao, city, country, lat (number), lng (number), timezone, elevation. If the query does not appear to be a real airport or major city anywhere in the world, return {\"error\":\"not found\"}." },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" }
    });
    
    const airportData = JSON.parse(response.choices[0].message.content);
    if (airportData.error || !airportData.lat || !airportData.lng) {
      return res.json({ type: 'not_found' });
    }
    
    return res.json({ type: 'airport', data: airportData });
  } catch (error) {
    console.error('Search Error:', error.message);
    res.status(500).json({ error: "Failed to perform search." });
  }
});

// Protected Routes
app.use('/api/chat', requireAuth, requireVerified, csrfProtection, chatRoute);

// Endpoint for Origin and Destination (AviationStack + ADSB.lol fallback)
app.get('/api/route/:flightNumber', routeLimiter, requireAuth, async (req, res) => {
  try {
    let fn = req.params.flightNumber;
    if (!fn || fn === 'Unknown') return res.json(null);
    fn = fn.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,10}$/.test(fn)) return res.status(400).json({ error: 'Invalid flight number format' });

    // Check Cache first
    if (routeCache.has(fn)) {
      return res.json(routeCache.get(fn));
    }
    
    // First attempt: AeroDataBox (RapidAPI) - Premium Data
    try {
      const isIcao24 = /^[0-9A-F]{6}$/.test(fn);
      const today = new Date().toISOString().split('T')[0];
      const url = isIcao24 
        ? `https://aerodatabox.p.rapidapi.com/aircrafts/icao24/${fn}`
        : `https://aerodatabox.p.rapidapi.com/flights/number/${fn}/${today}?withLocation=true&withFlightPlan=true`;
      
      console.log(`[ROUTE] Attempting AeroDataBox with identifier: ${fn}, URL: ${url}`);
      
      let aeroRes = await axios.get(url, {
        headers: {
          'x-rapidapi-key': process.env.RAPIDAPI_KEY,
          'x-rapidapi-host': process.env.RAPIDAPI_HOST
        }
      });
      
      // Secondary fallback for flights/number if date-specific lookup gave nothing
      if (!isIcao24 && (!aeroRes.data || (Array.isArray(aeroRes.data) && aeroRes.data.length === 0))) {
        console.log(`[ROUTE] Date-specific lookup failed for ${fn}, trying nearest...`);
        const fallbackUrl = `https://aerodatabox.p.rapidapi.com/flights/number/${fn}?withLocation=true`;
        aeroRes = await axios.get(fallbackUrl, {
          headers: {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': process.env.RAPIDAPI_HOST
          }
        });
      }

      console.log(`[AeroDataBox] Response received for ${fn}, Status: ${aeroRes.status}`);

      // If result is an array (flights/number)
      if (Array.isArray(aeroRes.data) && aeroRes.data.length > 0) {
        console.log(`[AeroDataBox] Found flight data for ${fn}`);
        const f = aeroRes.data[0];
        const route = {
          origin: f.departure?.airport?.name || f.departure?.airport?.iata,
          originIata: f.departure?.airport?.iata,
          originIcao: f.departure?.airport?.icao,
          originLat: f.departure?.airport?.location?.lat,
          originLng: f.departure?.airport?.location?.lon,
          destination: f.arrival?.airport?.name || f.arrival?.airport?.iata,
          destinationIata: f.arrival?.airport?.iata,
          destinationIcao: f.arrival?.airport?.icao,
          destLat: f.arrival?.airport?.location?.lat,
          destLng: f.arrival?.airport?.location?.lon,
          registration: f.aircraft?.registration || f.aircraft?.reg,
          aircraftModel: f.aircraft?.model || f.aircraft?.modelCode || f.aircraft?.typeName,
          source: 'AeroDataBox'
        };
        routeCache.set(fn, route);
        return res.json(route);
      } 
      // If result is an object (aircrafts/icao24)
      else if (aeroRes.data && (aeroRes.data.registration || aeroRes.data.reg || aeroRes.data.model)) {
        console.log(`[AeroDataBox] Found aircraft info for ${fn}`);
        const f = aeroRes.data;
        const route = {
          registration: f.registration || f.reg,
          aircraftModel: f.model || f.modelCode || f.typeName,
          productionLine: f.productionLine,
          source: 'AeroDataBox (Aircraft Info)'
        };
        routeCache.set(fn, route);
        return res.json(route);
      } else {
        console.log(`[AeroDataBox] No usable data returned for ${fn}`);
      }
    } catch (e) {
      console.error(`[AeroDataBox ERROR] for ${fn}:`, e.response ? e.response.status : e.message);
      if (e.response && e.response.data) console.error(`[AeroDataBox ERROR DATA]:`, JSON.stringify(e.response.data));
    }
    
    // Second attempt: match as IATA code (AviationStack)
    const urlIata = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&flight_iata=${fn}`;
    response = await axios.get(urlIata);
    
    if(response.data && response.data.data && response.data.data.length > 0) {
      const flight = response.data.data[0];
      if (flight.departure && flight.arrival) {
        const route = { 
          origin: flight.departure.airport || flight.departure.iata,
          originIata: flight.departure.iata,
          originIcao: flight.departure.icao,
          originTimezone: flight.departure.timezone,
          originTerminal: flight.departure.terminal,
          originGate: flight.departure.gate,
          destination: flight.arrival.airport || flight.arrival.iata,
          destinationIata: flight.arrival.iata,
          destinationIcao: flight.arrival.icao,
          destinationTimezone: flight.arrival.timezone,
          destinationTerminal: flight.arrival.terminal,
          destinationGate: flight.arrival.gate,
          source: 'AviationStack'
        };
        routeCache.set(fn, route);
        return res.json(route);
      }
    }

    // Third attempt: ADSB.lol Fallback
    try {
      const adsbRes = await axios.get(`https://api.adsb.lol/api/route/${fn}`);
      if (adsbRes.data && adsbRes.data.route) {
        const route = {
          origin: adsbRes.data.route.origin.name || adsbRes.data.route.origin.iata,
          originIata: adsbRes.data.route.origin.iata,
          originIcao: adsbRes.data.route.origin.icao,
          originLat: adsbRes.data.route.origin.lat,
          originLng: adsbRes.data.route.origin.lon,
          destination: adsbRes.data.route.destination.name || adsbRes.data.route.destination.iata,
          destinationIata: adsbRes.data.route.destination.iata,
          destinationIcao: adsbRes.data.route.destination.icao,
          destLat: adsbRes.data.route.destination.lat,
          destLng: adsbRes.data.route.destination.lon,
          source: 'ADSB.lol'
        };
        routeCache.set(fn, route);
        return res.json(route);
      }
    } catch (e) {
      console.log("ADSB.lol route lookup failed for", fn);
    }
    
    const fallbackRoute = {
      origin: 'Data Unavailable',
      originIata: 'N/A',
      originIcao: 'N/A',
      originTimezone: 'Unknown',
      destination: 'Data Unavailable',
      destinationIata: 'N/A',
      destinationIcao: 'N/A',
      destinationTimezone: 'Unknown'
    };
    
    res.json(fallbackRoute);
  } catch (error) {
    console.error('AviationStack Error:', error.message);
    res.json({
      origin: 'Data Unavailable',
      originIata: 'N/A',
      originIcao: 'N/A',
      originTimezone: 'Unknown',
      destination: 'Data Unavailable',
      destinationIata: 'N/A',
      destinationIcao: 'N/A',
      destinationTimezone: 'Unknown'
    });
  }
});

// Endpoint for Flight Paths (Robust combines OpenSky tracks + Planned Route)
app.get('/api/flight-path/:icao24', async (req, res) => {
  try {
    const { icao24 } = req.params;
    const flight = flightCache.find(f => f.id === icao24);
    
    let path = [];
    let isSynthetic = false;

    // 1. Try OpenSky for live track
    try {
      const response = await axios.get(`https://opensky-network.org/api/tracks/all?icao24=${icao24}&time=0`);
      if (response.data && response.data.path) {
        path = response.data.path;
      }
    } catch (e) {
      console.log(`OpenSky track failed for ${icao24}, using fallback.`);
    }

    // 2. If no track, and we have a flight number, try to get route and synthesize a planned path
    if (path.length === 0 && flight && flight.flightNumber !== 'Unknown') {
      const fn = flight.flightNumber.trim().toUpperCase();
      let route = routeCache.get(fn);
      
      // If not in cache, try to fetch it quickly (or wait)
      if (!route) {
        try {
          // Internal call to route endpoint or logic
          const adsbRes = await axios.get(`https://api.adsb.lol/api/route/${fn}`);
          if (adsbRes.data && adsbRes.data.route) {
            route = {
              originLat: adsbRes.data.route.origin.lat,
              originLng: adsbRes.data.route.origin.lon,
              destLat: adsbRes.data.route.destination.lat,
              destLng: adsbRes.data.route.destination.lon
            };
          }
        } catch (err) {}
      }

      if (route && route.originLat && route.destLat) {
        // Synthesize a Great-Circle arc between origin and destination
        isSynthetic = true;
        const points = 20;
        for (let i = 0; i <= points; i++) {
          const f = i / points;
          const lat = route.originLat + (route.destLat - route.originLat) * f;
          const lng = route.originLng + (route.destLng - route.originLng) * f;
          path.push([Date.now()/1000, lat, lng]);
        }
      }
    }

    // 3. Last fallback: local synthetic trajectory (what was there before)
    if (path.length === 0 && flight) {
        isSynthetic = true;
        const headingRad = flight.heading * (Math.PI / 180);
        let curLat = flight.lat;
        let curLng = flight.lng;
        for (let i = 0; i < 20; i++) {
            path.push([Date.now()/1000 - (i*60), curLat, curLng]);
            curLat -= Math.cos(headingRad) * 0.1;
            curLng -= Math.sin(headingRad) * 0.1;
        }
        path = path.reverse();
    }

    res.json({ icao24, path, isSynthetic });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate flight path' });
  }
});

// Deprecated endpoint for historical tracks (kept for compatibility)
app.get('/api/flight-track/:icao24', async (req, res) => {
  res.redirect(`/api/flight-path/${req.params.icao24}`);
});

let flightCache = [];
let lastUpdatedAt = 0;

let openSkyRateLimited = false;
let openSkyLimitedAt = 0;

async function fetchFromOpenSky() {
  try {
    const config = (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) 
        ? { auth: { username: process.env.OPENSKY_USERNAME, password: process.env.OPENSKY_PASSWORD } } 
        : {};
    config.headers = { 'User-Agent': 'SkyIntel/1.0', 'Accept': 'application/json' };
    config.timeout = 15000;

    const res = await axios.get('https://opensky-network.org/api/states/all', config);
    if (res.data && res.data.states) {
      const flights = res.data.states
        .filter(s => s[5] !== null && s[6] !== null)
        .map(s => ({
          id: s[0],
          flightNumber: s[1] ? s[1].trim() : 'Unknown',
          airline: s[2] || 'Private/Unknown',
          origin: 'N/A', destination: 'N/A',
          lat: s[6], lng: s[5],
          altitude: s[7] != null ? Math.round(s[7] * 3.28084) : null,
          speed: s[9] != null ? Math.round(s[9] * 3.6) : null,
          heading: s[10] || 0,
          verticalRate: s[11] || 0,
          lastContact: s[4],
          isLive: true,
          source: 'opensky'
        }));
      console.log(`[OpenSky] Fetched ${flights.length} flights`);
      return flights;
    }
  } catch (err) {
    console.error('[OpenSky] Error:', err.message);
  }
  return [];
}

async function fetchFromADSBLol() {
  try {
    const res = await axios.get('https://api.adsb.lol/v2/point/0/0/25000', { timeout: 20000 });
    if (res.data && res.data.ac) {
      const flights = res.data.ac
        .filter(s => s.lat !== undefined && s.lon !== undefined)
        .map(s => ({
          id: s.hex || 'Unknown',
          flightNumber: s.flight ? s.flight.trim() : 'Unknown',
          airline: s.t || 'Private/Unknown',
          origin: 'N/A', destination: 'N/A',
          lat: s.lat, lng: s.lon,
          altitude: s.alt_baro != null ? s.alt_baro : null,
          speed: s.gs != null ? Math.round(s.gs * 1.852) : null,
          heading: s.track || 0,
          verticalRate: s.baro_rate ? Math.round(s.baro_rate * 0.00508) : 0,
          lastContact: s.seen ? Math.floor(Date.now()/1000) - Math.round(s.seen) : Math.floor(Date.now()/1000),
          isLive: true,
          source: 'adsblol'
        }));
      console.log(`[ADSB.lol] Fetched ${flights.length} flights`);
      return flights;
    }
  } catch (err) {
    console.error('[ADSB.lol] Error:', err.message);
  }
  return [];
}

function mergeFlightData(sources) {
  const merged = new Map();
  // Add all flights, deduplicating by ICAO24 hex (id). Later sources fill gaps.
  for (const flights of sources) {
    for (const f of flights) {
      if (!merged.has(f.id)) {
        merged.set(f.id, f);
      }
    }
  }
  return Array.from(merged.values());
}

async function fetchLiveFlights() {
  // Fetch from all available sources in parallel
  const [openSkyFlights, adsbLolFlights] = await Promise.all([
    fetchFromOpenSky(),
    fetchFromADSBLol()
  ]);

  // Merge: OpenSky first (higher quality data), ADSB.lol fills gaps
  const merged = mergeFlightData([openSkyFlights, adsbLolFlights]);

  if (merged.length > 0) {
    flightCache = merged;
    lastUpdatedAt = Date.now();
    console.log(`[Fusion] Total unique flights: ${merged.length} (OpenSky: ${openSkyFlights.length}, ADSB.lol: ${adsbLolFlights.length})`);
    io.emit('flights_update', flightCache);
  } else {
    console.warn('[Fusion] No flights from any source!');
  }
}

// Endpoint for Hex (Registration) lookup
app.get('/api/aircraft/:hex', requireAuth, async (req, res) => {
  const hex = req.params.hex;
  if (!hex || hex === 'Unknown') return res.status(400).json({ error: 'Invalid hex' });
  
  const cacheKey = `aircraft_${hex}`;
  const cached = routeCache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get(`https://api.adsbdb.com/v0/aircraft/${hex}`, {
      timeout: 5000,
      headers: { 'User-Agent': 'SkyIntel/1.0' }
    });
    
    if (response.data && response.data.response && response.data.response.aircraft) {
      const metadata = response.data.response.aircraft;
      routeCache.set(cacheKey, metadata);
      return res.json(metadata);
    }
    return res.status(404).json({ error: 'Not found in ADS-B DB' });
  } catch (error) {
    return res.status(error.response?.status || 500).json({ error: 'Failed to fetch aircraft details' });
  }
});

async function fetchLiveFlightsLoop() {
  await fetchLiveFlights();
  setTimeout(fetchLiveFlightsLoop, 60000);
}


setInterval(() => {
  if (flightCache.length === 0) return;

  const isStale = (Date.now() - lastUpdatedAt) > 120000;
  
  if (isStale) {
    io.emit('system_status', 'stale');
    return; // Freeze interpolation to prevent zombie planes flying off the map
  }

  io.emit('system_status', 'live');

  flightCache = flightCache.map(flight => {
    if (flight.speed > 0) {
      const headingRad = flight.heading * (Math.PI / 180);
      const distanceDeltaKm = (flight.speed / 3600);
      let newLat = flight.lat + (Math.cos(headingRad) * (distanceDeltaKm / 111) * 2);
      let newLng = flight.lng + (Math.sin(headingRad) * (distanceDeltaKm / (111 * Math.cos(flight.lat * Math.PI/180))) * 2);
      return { ...flight, lat: newLat, lng: newLng };
    }
    return flight;
  });
  io.emit('flights_update', flightCache);
}, 2000);

const socketConnections = new Map();

io.on('connection', (socket) => {
  const ip = socket.handshake.address;
  const currentCount = socketConnections.get(ip) || 0;
  
  if (currentCount >= 15) {
    console.warn(`[Socket.IO] Disconnecting IP ${ip} - connection limit reached.`);
    socket.disconnect(true);
    return;
  }
  
  socketConnections.set(ip, currentCount + 1);

  socket.emit('system_status', (Date.now() - lastUpdatedAt) > 120000 ? 'stale' : 'live');
  socket.emit('flights_update', flightCache);

  socket.on('disconnect', () => {
    const count = socketConnections.get(ip) || 0;
    if (count > 0) socketConnections.set(ip, count - 1);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  // Start the polling loop
  fetchLiveFlightsLoop();
});
