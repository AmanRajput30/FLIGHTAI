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

// Endpoint for Origin and Destination (AviationStack)
app.get('/api/route/:flightNumber', async (req, res) => {
  try {
    const fn = req.params.flightNumber;
    if (!fn || fn === 'Unknown') return res.json(null);
    
    // First attempt: match as ICAO code
    const url = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&flight_icao=${fn}`;
    let response = await axios.get(url);
    
    if(response.data && response.data.data && response.data.data.length > 0) {
      const flight = response.data.data[0];
      if (flight.departure && flight.arrival) {
        return res.json({ 
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
          destinationGate: flight.arrival.gate
        });
      }
    }
    
    // Second attempt: match as IATA code
    const urlIata = `http://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_API_KEY}&flight_iata=${fn}`;
    response = await axios.get(urlIata);
    
    if(response.data && response.data.data && response.data.data.length > 0) {
      const flight = response.data.data[0];
      if (flight.departure && flight.arrival) {
        return res.json({ 
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
          destinationGate: flight.arrival.gate
        });
      }
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

// Endpoint for historical tracks
app.get('/api/flight-track/:icao24', async (req, res) => {
  try {
    const { icao24 } = req.params;
    const response = await axios.get(`https://opensky-network.org/api/tracks/all?icao24=${icao24}&time=0`);
    res.json(response.data);
  } catch (err) {
    // Generate synthetic trajectory fallback when OpenSky limit hits or track not found
    const flight = flightCache.find(f => f.id === req.params.icao24);
    if (!flight) return res.status(404).json({ error: 'Not found' });
    
    // Synthesize 20 points going backward along its heading
    const path = [];
    let curLat = flight.lat;
    let curLng = flight.lng;
    const headingRad = flight.heading * (Math.PI / 180);
    
    for (let i = 0; i < 20; i++) {
        path.push([Date.now()/1000 - (i*60), curLat, curLng]);
        // step back roughly 10km per point
        curLat -= Math.cos(headingRad) * 0.1;
        curLng -= Math.sin(headingRad) * 0.1;
    }
    
    // Reverse so path goes from past to present
    res.json({ icao24: req.params.icao24, path: path.reverse() });
  }
});

let flightCache = [];

let openSkyRateLimited = false;

async function fetchLiveFlights() {
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
        io.emit('flights_update', flightCache);
        return; // Success, skip fallback
      }
    } catch (error) {
      console.error('OpenSky Error:', error.message);
      if (error.response && (error.response.status === 429 || error.response.status === 403 || error.response.status === 401)) {
        console.log("OpenSky block hit! Switching primary feed to ADSB.lol backup.");
        openSkyRateLimited = true;
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
