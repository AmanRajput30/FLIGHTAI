const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ─── Flight Reference Extractor ─── Pulls callsigns from AI text
function extractFlightReferences(text, contextFlight) {
  const refs = new Set();
  // Match typical flight callsigns: 2-3 letter airline code + 1-4 digit number (e.g. EK521, BRQ001, AI202)
  const callsignPattern = /\b([A-Z]{2,3}\d{1,4})\b/gi;
  let match;
  while ((match = callsignPattern.exec(text)) !== null) {
    refs.add(match[1].toUpperCase());
  }
  // Also match ICAO24 hex codes if referenced (6-char hex)
  const hexPattern = /\b([0-9a-fA-F]{6})\b/g;
  while ((match = hexPattern.exec(text)) !== null) {
    // Only include if it looks intentional (not random hex in URLs etc.)
    if (contextFlight && match[1].toLowerCase() === contextFlight.toLowerCase()) {
      refs.add(match[1].toLowerCase());
    }
  }
  // Always include the context flight if one exists
  if (contextFlight && contextFlight !== 'Unknown') {
    refs.add(contextFlight.toUpperCase());
  }
  return [...refs];
}

// ─── Action Detector ─── Determines what map action the AI response implies
function detectResponseAction(userMessage, contextFlight) {
  const msg = userMessage.toLowerCase();
  if (msg.includes("track") || msg.includes("focus") || msg.includes("show me") || msg.includes("locate") || msg.includes("find")) {
    return "focus_map";
  }
  if (msg.includes("zoom") || msg.includes("go to") || msg.includes("fly to")) {
    return "focus_map";
  }
  // If user is asking about a tracked flight, keep focus
  if (contextFlight && contextFlight !== 'Unknown') {
    return "maintain_tracking";
  }
  return null;
}

// ─── Intelligence Layer ─── Compute insights from raw telemetry
function analyzeFlight(context) {
  if (!context || !context.altitude) return null;

  let phase = "cruising";
  if (context.verticalRate > 5) phase = "climbing";
  else if (context.verticalRate < -5) phase = "descending";

  let speedCategory =
    context.speed < 300 ? "slow (possibly on approach or taxiing)" :
    context.speed < 700 ? "normal cruise" : "high-speed cruise";

  const heading = context.heading || 0;
  const directions = ["north", "northeast", "east", "southeast", "south", "southwest", "west", "northwest"];
  const direction = directions[Math.round(heading / 45) % 8];

  let altitudeContext = "";
  if (context.altitude < 10000) altitudeContext = "low altitude (approach or departure phase)";
  else if (context.altitude < 25000) altitudeContext = "mid altitude (transitioning)";
  else altitudeContext = "high altitude (cruising level)";

  // ETA calculation if we have destination coordinates and speed
  let eta = null;
  if (context.routeData?.destLat && context.routeData?.destLng && context.speed > 0) {
    const R = 6371;
    const dLat = (context.routeData.destLat - context.lat) * Math.PI / 180;
    const dLon = (context.routeData.destLng - context.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(context.lat * Math.PI/180) * Math.cos(context.routeData.destLat * Math.PI/180) * Math.sin(dLon/2)**2;
    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const hours = distance / context.speed;
    eta = { distanceKm: Math.round(distance), hours: hours.toFixed(1), minutes: Math.round(hours * 60) };
  }

  return { phase, speedCategory, direction, altitudeContext, eta };
}

// ─── Local NLP Fallback Engine ───
async function localNLPEngine(messages, io, contextFlight) {
  const lastMsg = messages[messages.length - 1].content.toLowerCase();
  let finalContent = "";
  let action = null;
  
  const weatherMatch = lastMsg.match(/weather\s+(?:in|at|for)?\s*([a-z]{3})/i);
  if (weatherMatch || lastMsg.includes('weather')) {
    const code = weatherMatch ? weatherMatch[1].toUpperCase() : 'DXB';
    try {
      if (process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY.length > 5) {
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${code}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
        const w = weatherResponse.data;
        finalContent += `Here's what the weather looks like at ${code} right now — it's ${w.weather[0].description} with a temperature of around ${Math.round(w.main.temp)}°C, and winds blowing at ${w.wind.speed} m/s. Pretty standard conditions for that region!\n`;
      } else {
        finalContent += `I'd love to pull up the weather for ${code}, but the weather service isn't connected at the moment. You might want to check back in a bit!\n`;
      }
    } catch(e) {
      finalContent += `Hmm, I wasn't able to grab the weather data for ${code}. Double-check that it's a valid city or airport code, and I'll try again!\n`;
    }
  } 
  else if (lastMsg.includes('track') || lastMsg.includes('find') || lastMsg.includes('locate') || lastMsg.includes('focus')) {
    const flightMatch = lastMsg.match(/[a-z]{2,3}\d{1,4}/i);
    const target = flightMatch ? flightMatch[0].toUpperCase() : (contextFlight || 'the target');
    finalContent += `Got it — I'm zooming the map over to ${target} right now so you can get a better look. Check the radar! ✈️\n`;
    action = "focus_map";
    io.emit('command_focus_flight', { flightNumber: target });
    io.emit('command_focus_map', { lat: 25.2532, lng: 55.3657, zoom: 6, target: target });
  } 
  else if (/\b(hello|hi)\b/i.test(lastMsg)) {
    finalContent += "Hey there! Welcome to SkyIntel 👋 I'm SkyLord, your aviation intelligence assistant. I can help you track flights, check weather at airports, and explore what's happening in the skies. Just say something like 'Track EK521' or 'Weather at LHR' and I'll jump right on it. What are you curious about?\n";
  }
  else {
    finalContent += "I'm running on my backup systems right now since the main AI engine is taking a breather, but I can still help you out! Try asking me to track a specific flight like 'Track EK521' or check the weather at a hub like 'Weather for LHR' — I've got you covered on those. 😊\n";
  }
  
  return { content: finalContent, action };
}

// ─── Main Chat Route ───
router.post('/', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const io = req.app.get('io');
    
    const contextFlight = context?.flightNumber || null;
    console.log(`[CHAT] Intelligence_v6 | Tracked: ${contextFlight || 'None'}`);
    
    // ── Compute flight intelligence ──
    const analysis = analyzeFlight(context);
    
    // ── Detect action from last user message ──
    const lastUserMsg = messages[messages.length - 1]?.content || "";
    const action = detectResponseAction(lastUserMsg, contextFlight);
    
    if (action === "focus_map" && context?.lat) {
      io.emit('command_focus_map', { lat: context.lat, lng: context.lng, zoom: 8 });
    }

    // ── System Prompt ──
    const systemPrompt = `You are SkyLord — the AI assistant powering SkyIntel, an advanced aviation intelligence platform. You speak like a confident, modern aviation analyst who is also friendly and approachable.

CRITICAL RULES:
1. ONLY use the provided flight data. NEVER guess or fabricate information.
2. If origin or destination is unknown, say so clearly — do not make up airports.
3. NEVER use bullet points, bold labels (**), dashes, or raw JSON.
4. SILENTLY OMIT any field that is "Unknown", "N/A", or missing — unless the user specifically asks about it.
5. You ONLY answer aviation and flight-related questions. Politely redirect off-topic queries.
6. NEVER say "I'll check for more info" or "Let me find out." Share what you know and stop.
7. When referencing a flight, always use its callsign/flight number naturally in your response.

RESPONSE STYLE:
1. Start with a natural opener that shows you understood the question.
2. Weave telemetry into natural, insightful sentences — not raw numbers.
3. End with a helpful insight or follow-up suggestion when appropriate.

INTELLIGENCE RULES (turn data into insights):
- Altitude → describe as climbing, cruising, or descending
- Speed → describe as slow (approach), normal cruise, or high-speed
- Heading → describe as compass direction (north, southeast, etc.)
- Vertical rate → explain if gaining or losing altitude, or flying level
- Location → mention what general region the aircraft is flying over
- If you have ETA data, mention estimated arrival time naturally

EXAMPLES:
BAD: "Altitude: 36,000 ft. Speed: 856 km/h. Origin: Unknown."
GOOD: "This bird is cruising up at 36,000 feet heading northeast at around 856 km/h — that's a solid high-speed cruise typical for long-haul flights. I don't have confirmed origin data right now, but based on its trajectory it's moving over the Arabian Sea region. Anything else you want to know?"`;

    // ── Flight Context (separate system message for clarity) ──
    let flightContext = "No aircraft is currently selected on the map.";
    if (context) {
      flightContext = `CURRENT FLIGHT DATA:
Flight: ${context.flightNumber || "Unknown"}
Airline: ${context.airline || "Unknown"}
Latitude: ${context.lat}
Longitude: ${context.lng}
Altitude: ${context.altitude} ft
Speed: ${context.speed} km/h
Heading: ${context.heading}°
Vertical Rate: ${context.verticalRate || 0} m/s
${context.routeData ? `Origin: ${context.routeData.origin || "Unknown"}
Destination: ${context.routeData.destination || "Unknown"}` : "Origin: Unknown\nDestination: Unknown"}`;

      if (analysis) {
        flightContext += `\n\nFLIGHT ANALYSIS:
Phase: Aircraft is currently ${analysis.phase} at ${analysis.speedCategory} speed
Altitude Context: ${analysis.altitudeContext}
Direction: Heading ${analysis.direction}
${analysis.eta ? `ETA: Approximately ${analysis.eta.hours} hours (${analysis.eta.distanceKm} km remaining)` : "ETA: Not calculable (destination coordinates unavailable)"}`;
      }
    }

    try {
      const response = await openai.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "system", content: flightContext },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ]
      });

      const aiContent = response.choices[0].message.content;
      const referencedFlights = extractFlightReferences(aiContent, contextFlight);
      const trackedFlight = contextFlight && contextFlight !== 'Unknown' ? contextFlight : (referencedFlights.length > 0 ? referencedFlights[0] : null);

      return res.json({ 
        role: 'assistant', 
        content: aiContent,
        trackedFlight,
        referencedFlights,
        action
      });
    } catch (openAiError) {
      if (openAiError.status === 429 || openAiError.status === 401) {
         console.log("Groq limit reached, falling back to Local NLP Engine.");
         const localResult = await localNLPEngine(messages, io, contextFlight);
         const referencedFlights = extractFlightReferences(localResult.content, contextFlight);
         return res.json({ 
           role: 'assistant', 
           content: localResult.content,
           trackedFlight: contextFlight || null,
           referencedFlights,
           action: localResult.action
         });
      } else {
         throw openAiError;
      }
    }
    
  } catch (error) {
    const status = error.status || 500;
    console.error('Chat error:', error.message);
    res.status(status).json({ error: 'Failed to process chat response.', details: error.message });
  }
});

module.exports = router;
