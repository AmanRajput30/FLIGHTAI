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

const pinoHttp = require('pino-http');
const logger = require('pino')({
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

const io = new Server(server, { 
  cors: corsOptions
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(pinoHttp({ logger }));
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

// Health check endpoint for keep-alive cron
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

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
    
    // Global Unified Search
    // Since we no longer cache all live flights, search relies purely on LLM Airport Geocoding
    // (A real global flight search would require a provider global API or database)
    
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

// Contact Route
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many contact requests. Please try again later.' }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, category, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set. Mocking contact email.');
      return res.json({ success: true, mocked: true });
    }

    await resend.emails.send({
      from: 'Averyn Contact <onboarding@resend.dev>',
      to: 'support@averyn.in', // User's email
      replyTo: email,
      subject: `[Averyn] New Contact: ${category} from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${message}`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Contact Form Error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
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

    // 2. If no track, we could synthesize a route (removed legacy logic that relied on flightCache)
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
    // Legacy fallback removed because flightCache is no longer available

    res.json({ icao24, path, isSynthetic });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate flight path' });
  }
});

// Deprecated endpoint for historical tracks (kept for compatibility)
app.get('/api/flight-track/:icao24', async (req, res) => {
  res.redirect(`/api/flight-path/${req.params.icao24}`);
});

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
      headers: { 'User-Agent': 'Averyn/1.0' }
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

const flightDataService = require('./services/FlightDataService');

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

  socket.emit('system_status', 'live');
  
  // Listen for viewport updates from clients
  socket.on('viewport_update', async (bounds) => {
    if (!bounds || !bounds.minLat) return;
    try {
      const flights = await flightDataService.getFlightsInViewport(
        bounds.minLat,
        bounds.minLng,
        bounds.maxLat,
        bounds.maxLng
      );
      socket.emit('flights_update', flights);
    } catch (e) {
      console.error('Failed to get flights for viewport:', e.message);
    }
  });

  socket.on('disconnect', () => {
    const count = socketConnections.get(ip) || 0;
    if (count > 0) socketConnections.set(ip, count - 1);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
});
