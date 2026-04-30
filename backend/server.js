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

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
const chatRoute = require('./chatRoute');

const routeCache = new Map(); // Cache for flight routes to improve robustness

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] }});

app.use(cors());
app.use(express.json());
app.set('io', io);

// Global Unified Search
app.get('/api/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase().trim();
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
      model: "llama-3.1-8b-instant",
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
app.set('io', io);
app.use('/api/chat', chatRoute);

// Endpoint for Origin and Destination (AviationStack + ADSB.lol fallback)
app.get('/api/route/:flightNumber', async (req, res) => {
  try {
    let fn = req.params.flightNumber;
    if (!fn || fn === 'Unknown') return res.json(null);
    fn = fn.trim().toUpperCase();

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

let openSkyRateLimited = false;
let openSkyLimitedAt = 0;

async function fetchLiveFlights() {
  // Auto-recover: retry OpenSky every 5 minutes after a rate limit
  if (openSkyRateLimited && (Date.now() - openSkyLimitedAt > 5 * 60 * 1000)) {
    console.log("[OpenSky] Cooldown expired — retrying OpenSky...");
    openSkyRateLimited = false;
  }

  if (!openSkyRateLimited) {
    try {
      const openSkyConfig = (process.env.OPENSKY_USERNAME && process.env.OPENSKY_PASSWORD) 
          ? { auth: { username: process.env.OPENSKY_USERNAME, password: process.env.OPENSKY_PASSWORD } } 
          : {};
      const res = await axios.get('https://opensky-network.org/api/states/all', openSkyConfig);
      if (res.data && res.data.states) {
        // OpenSky provides ~12,000 to 15,000 flights. We grab all valid ones globally (both airborne and grounded).
        const validStates = res.data.states.filter(s => s[5] !== null && s[6] !== null);
        
        flightCache = validStates.map(s => {
          const altFt = s[7] ? Math.round(s[7] * 3.28084) : 35000;
          const spdKmh = s[9] ? Math.round(s[9] * 3.6) : 800;
          return {
            id: s[0], // icao24
            flightNumber: s[1] ? s[1].trim() : 'Unknown',
            airline: s[2] || 'Private/Unknown',
            origin:  'N/A',
            destination: 'N/A',
            lat: s[6],
            lng: s[5],
            altitude: altFt,
            speed: spdKmh,
            heading: s[10] || 0,
            verticalRate: s[11] || 0, // m/s
            lastContact: s[4], // unix timestamp
            isLive: true
          };
        });
        console.log(`[OpenSky] Successfully fetched ${flightCache.length} flights`);
        io.emit('flights_update', flightCache);
        return; // Success, skip fallback
      }
    } catch (error) {
      console.error('OpenSky Error:', error.message);
      if (error.response && (error.response.status === 429 || error.response.status === 403 || error.response.status === 401)) {
        console.log("OpenSky block hit! Switching to ADSB.lol backup. Will retry in 5 minutes.");
        openSkyRateLimited = true;
        openSkyLimitedAt = Date.now();
      }
    }
  }

  // Backup/Fallback Protocol: ADSB.lol
  if (openSkyRateLimited) {
    try {
      const res = await axios.get('https://api.adsb.lol/v2/ladd');
      if (res.data && res.data.ac) {
        const validStates = res.data.ac.filter(s => s.lat !== undefined && s.lon !== undefined);
        
        flightCache = validStates.map(s => {
          const altFt = s.alt_baro ? s.alt_baro : 35000;
          const spdKmh = s.gs ? Math.round(s.gs * 1.852) : 800;
          return {
            id: s.hex || 'Unknown',
            flightNumber: s.flight ? s.flight.trim() : 'Unknown',
            airline: s.t || 'Private/Unknown',
            origin:  'N/A',
            destination: 'N/A',
            lat: s.lat,
            lng: s.lon,
            altitude: altFt,
            speed: spdKmh,
            heading: s.track || 0,
            verticalRate: s.baro_rate ? Math.round(s.baro_rate * 0.00508) : 0,
            lastContact: s.seen ? Math.floor(Date.now()/1000) - Math.round(s.seen) : Math.floor(Date.now()/1000),
            isLive: true
          };
        });
        io.emit('flights_update', flightCache);
      }
    } catch (error) {
      console.error('ADSB Backup Error:', error.message);
    }
  }
}


setInterval(() => {
  if (flightCache.length === 0) return;
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

setInterval(fetchLiveFlights, 60000);

io.on('connection', (socket) => {
  socket.emit('flights_update', flightCache);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log(`Backend server running on port ${PORT}`);
  try {
    await fetchLiveFlights();
    console.log(`Initial flight fetch complete. Cache size: ${flightCache.length}`);
  } catch (err) {
    console.error('Initial fetch failed:', err.message);
  }
});
