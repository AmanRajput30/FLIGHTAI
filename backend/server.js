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
const { requireAuth, requireVerified, optionalAuth } = require('./middleware/auth');
const { LRUCache } = require('lru-cache');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { csrfProtection } = require('./middleware/csrf');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const cookie = require('cookie');
const Session = require('./models/Session');
const cryptoUtils = require('./utils/crypto');

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

// Health check endpoint for keep-alive cron
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.set('trust proxy', 1); // Trust the first proxy (Render's load balancer) for rate limiting
const server = http.createServer(app);

const frontendOrigin = process.env.FRONTEND_URL || 'https://aervyn.in';
const allowedOrigins = [
  'https://aervyn.in',
  'https://www.aervyn.in',
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:3000', 'http://localhost:3001']
    : [])
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
  redact: {
    paths: ['req.headers.cookie', 'req.headers["x-csrf-token"]', 'req.body.password', 'req.body.currentPassword', 'req.body.newPassword', 'res.headers["set-cookie"]'],
    censor: '[REDACTED]'
  },
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

const io = new Server(server, { 
  cors: corsOptions
});

app.disable('x-powered-by');

// Force HTTPS in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://aervyn.in",
        "wss://aervyn.in",
        "wss://flightai-hxbd.onrender.com", 
        "https://api.adsb.lol",
        "https://api.open-meteo.com",
      ],
      imgSrc: [
        "'self'", 
        "data:", 
        "https://*.planespotters.net", 
        "https://images.flightradar24.com", 
        "https://*.tile.openstreetmap.org", 
        "https://server.arcgisonline.com",
        "https://ui-avatars.com",
        "https://images.unsplash.com"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'same-site' },
  hsts: {
    maxAge: 63072000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  }
}));

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

app.use(cors(corsOptions));
app.use(pinoHttp({ logger }));
app.use(express.json({ limit: '100kb' }));
// Custom mongo-sanitize for Express 5 compatibility (avoids req.query reassignment throw)
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});
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

// Global fallback rate limiter (Section 7)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', globalLimiter);

// Apply CSRF to all non-GET requests (handled inside csrfProtection)
// Mount auth routes (with rate limiter)
const oauthRoute = require('./routes/oauthRoute');
const flightRoute = require('./routes/flightRoute');
app.use('/api/auth', authLimiter, csrfProtection, authRoute);
app.use('/api/oauth', authLimiter, csrfProtection, oauthRoute);
app.use('/api/user', csrfProtection, userRoute);
app.use('/api/flight', flightRoute);

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
    
    // Normalize query
    const query = rawQuery.trim().toUpperCase();
    if (!query || query.length < 3) return res.json(null);
    
    // 1. Is it a flight candidate? (3-10 alphanumeric)
    const isFlightCandidate = /^[A-Z0-9]{3,10}$/i.test(query);

    if (isFlightCandidate) {
      // 1a. Check local live cache first (instant)
      const liveFlight = flightDataService.searchFlight(query);
      if (liveFlight) {
        return res.json({ type: 'flight', data: liveFlight });
      }

      // 1b. Check provider directly (ADSB.lol callsign lookup)
      try {
        const adsbRes = await axios.get(`https://api.adsb.lol/v2/callsign/${query}`, { timeout: 3000 });
        if (adsbRes.data && adsbRes.data.ac && adsbRes.data.ac.length > 0) {
           const ac = adsbRes.data.ac[0];
           // Normalize to our frontend format
           const flight = {
             id: ac.hex,
             callsign: ac.flight ? ac.flight.trim() : null,
             flightNumber: ac.flight ? ac.flight.trim() : null,
             registration: ac.r,
             aircraftModel: ac.t,
             lat: ac.lat,
             lng: ac.lon,
             alt: ac.alt_baro,
             speed: ac.gs != null ? Math.round(ac.gs * 1.852) : null,
             heading: ac.track,
             airline: null,
           };
           if (flight.lat && flight.lng) {
             return res.json({ type: 'flight', data: flight });
           }
        }
      } catch (err) {
        console.warn('[Search] Legacy ADSB.lol callsign lookup failed', {
          message: err.message,
          query: query
        });
      }

      // If it's a flight candidate but not found, we don't send to Groq. 
      // (Unless it's an airport code like DEL, but airport codes are usually handled if flight search fails, 
      // as requested by the user: "never send flight-number candidates to Groq until the live-flight lookup has failed... return not_found")
      // Wait, the user specifically said: "Found? → flight, Not found? → not_found. That's better than trying to make the regex perfectly identify flight numbers."
      // So if it's a candidate, it ONLY checks flights, and returns not_found if missing.
      return res.json({ type: 'not_found' });
    }

    // 2. If it's NOT a flight candidate (e.g., contains spaces, longer than 10 chars), use Groq
    const response = await openai.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: "You are an API that returns ONLY valid JSON for airport searches. Return keys: name, iata, icao, city, country, lat (number), lng (number), timezone, elevation. If the query does not appear to be a real airport or major city anywhere in the world, return {\"error\":\"not found\"}." },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" }
    }, { timeout: 5000 });
    
    const airportData = JSON.parse(response.choices[0].message.content);
    if (airportData.error || !airportData.lat || !airportData.lng) {
      return res.json({ type: 'not_found' });
    }
    
    return res.json({ type: 'airport', data: airportData });
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.name === 'AbortError') {
      return res.status(504).json({ error: "Search timed out." });
    }
    console.error('Search Error:', error.message);
    res.status(500).json({ error: "Failed to perform search." });
  }
});

// Contact Route
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_to_prevent_crash');

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many contact requests. Please try again later.' }
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, category, message, website } = req.body;
    
    // Honeypot check: If the hidden 'website' field is filled out, silently drop it.
    if (website) {
      return res.json({ success: true });
    }

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set. Mocking contact email.');
      return res.json({ success: true, mocked: true });
    }

    await resend.emails.send({
      from: 'Aervyn Contact <onboarding@resend.dev>',
      to: 'support@aervyn.in', // User's email
      replyTo: email,
      subject: `[Aervyn] New Contact: ${category} from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${message}`,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Contact Form Error:', error);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});

// Protected Routes
app.use('/api/chat', optionalAuth, (req, res, next) => {
  if (req.user && !req.user.isEmailVerified) {
    return res.status(403).json({ error: 'EMAIL_NOT_VERIFIED', message: 'Please verify your email address to access this feature.' });
  }
  if (req.user) {
    return csrfProtection(req, res, next);
  }
  next();
}, chatRoute);


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

    // 2. If no track, we can try to synthesize a route using routeCache or ADSB metadata
    if (path.length === 0) {
      let route = null;
      let callsign = null;

      // Try to find the callsign from aircraft metadata if possible
      const aircraftMetadata = routeCache.get(`aircraft_${icao24}`);
      if (aircraftMetadata && aircraftMetadata.registration) {
         // Sometimes route is keyed by registration
         route = routeCache.get(aircraftMetadata.registration);
      }

      // If we don't have the route, see if we can find it by scanning routeCache (not ideal but it's small)
      if (!route) {
        for (const [key, value] of routeCache.entries()) {
          // If we cached a route that has this ICAO (though we don't always store icao in the route itself)
          if (value.registration === aircraftMetadata?.registration || value.aircraftModel === aircraftMetadata?.type) {
            route = value;
            break;
          }
        }
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

    res.json({ icao24, path, isSynthetic });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate flight path' });
  }
});

// Deprecated endpoint for historical tracks (kept for compatibility)
app.get('/api/flight-track/:icao24', async (req, res) => {
  res.redirect(`/api/flight-path/${req.params.icao24}`);
});


const flightDataService = require('./services/FlightDataService');

const socketConnections = new Map();
const socketEventRates = new Map(); // For viewport_update rate limiting

io.use(async (socket, next) => {
  try {
    if (socket.handshake.headers.cookie) {
      const cookies = cookie.parse(socket.handshake.headers.cookie);
      if (cookies._session) {
        const sessionTokenHash = cryptoUtils.hashToken(cookies._session);
        const session = await Session.findOne({ sessionTokenHash }).populate('userId');
        
        if (session && session.expiresAt >= new Date()) {
          socket.user = session.userId;
        }
      }
    }
  } catch (err) {
    console.error('Socket auth error:', err);
  }
  next(); // Anonymous sockets are allowed
});

io.on('connection', (socket) => {
  const ip = socket.handshake.address;
  const currentCount = socketConnections.get(ip) || 0;
  
  if (currentCount >= 15) {
    console.warn(`[Socket.IO] Disconnecting IP ${ip} - connection limit reached.`);
    socket.disconnect(true);
    return;
  }
  
  socketConnections.set(ip, currentCount + 1);
  socket.isPaused = false;

  socket.emit('system_status', 'live');
  
  socket.on('pause_updates', () => {
    socket.isPaused = true;
  });

  socket.on('resume_updates', () => {
    socket.isPaused = false;
  });
  
  // Listen for viewport updates from clients
  socket.on('viewport_update', async (bounds) => {
    if (socket.isPaused) return;

    // 1. Rate Limiting
    const now = Date.now();
    const lastUpdate = socketEventRates.get(socket.id) || 0;
    const rateLimitMs = socket.user ? 500 : 2000; // 500ms authenticated, 2000ms anonymous
    
    if (now - lastUpdate < rateLimitMs) {
      return; // Ignore updates that are too frequent
    }
    socketEventRates.set(socket.id, now);

    // 2. Payload Validation
    if (!bounds || typeof bounds.minLat !== 'number' || typeof bounds.minLng !== 'number' || 
        typeof bounds.maxLat !== 'number' || typeof bounds.maxLng !== 'number' ||
        Number.isNaN(bounds.minLat) || Number.isNaN(bounds.maxLat)) {
      return;
    }
    
    // Bounds sanity check
    if (bounds.minLat > bounds.maxLat || bounds.minLat < -90 || bounds.maxLat > 90 || 
        bounds.minLng < -180 || bounds.maxLng > 180) {
      return;
    }
    
    // Area check (prevent full planet fetch)
    const MAX_VIEWPORT_AREA = 150 * 150; // Degrees squared
    const area = (bounds.maxLat - bounds.minLat) * (bounds.maxLng - bounds.minLng);
    if (area > MAX_VIEWPORT_AREA) {
      socket.emit('viewport_error', { reason: 'zoom_too_wide' });
      return;
    }

    try {
      const flights = await flightDataService.getFlightsInViewport(
        bounds.minLat,
        bounds.minLng,
        bounds.maxLat,
        bounds.maxLng
      );
      
      if (flights.__isOutage) {
        socket.emit('data_outage', { active: true });
      } else {
        socket.emit('data_outage', { active: false });
      }
      
      socket.emit('flights_update', flights);
    } catch (e) {
      console.error('Failed to get flights for viewport:', e.message);
    }
  });

  socket.on('disconnect', () => {
    const count = socketConnections.get(ip) || 0;
    if (count > 0) socketConnections.set(ip, count - 1);
    socketEventRates.delete(socket.id);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }
  
  console.error('[Global Error]', err);
  
  // Never serialize err.stack in production
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
});
