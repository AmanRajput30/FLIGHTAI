const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const axios = require('axios');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// Powerful local Regex NLP engine to mock AI function calling if the API key fails
async function localNLPEngine(messages, io) {
  const lastMsg = messages[messages.length - 1].content.toLowerCase();
  let finalContent = "";
  
  // Rule 1: Weather Intent
  const weatherMatch = lastMsg.match(/weather\s+(?:in|at|for)?\s*([a-z]{3})/i);
  if (weatherMatch || lastMsg.includes('weather')) {
    const code = weatherMatch ? weatherMatch[1].toUpperCase() : 'DXB';
    try {
      if (process.env.OPENWEATHER_API_KEY && process.env.OPENWEATHER_API_KEY.length > 5) {
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${code}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`);
        const w = weatherResponse.data;
        finalContent += `Live weather at ${code}: ${w.weather[0].description}, ${Math.round(w.main.temp)}°C, winds at ${w.wind.speed}m/s.\n`;
      } else {
        finalContent += `Weather service is currently unavailable for ${code} (No API Key).\n`;
      }
    } catch(e) {
      finalContent += `Could not fetch live meteorological data for ${code}. Make sure it is a valid city or airport code.\n`;
    }
  } 
  // Rule 2: Tracking / Map Focus Intent
  else if (lastMsg.includes('track') || lastMsg.includes('find') || lastMsg.includes('locate') || lastMsg.includes('focus')) {
    const flightMatch = lastMsg.match(/[a-z0-9]{4,7}/i); // e.g. EK521, AXB939
    const target = flightMatch ? flightMatch[0].toUpperCase() : 'the target';
    
    // Command the map to zoom in randomly or specifically if we had logic
    finalContent += `Affirmative. I am commanding the map to focus on ${target} and highlighting its flight details.\n`;
    
    // Command frontend to focus map
    io.emit('command_focus_flight', { flightNumber: target });
    // Random coordinates just to prove it works
    io.emit('command_focus_map', { lat: 25.2532, lng: 55.3657, zoom: 6, target: target });
  } 
  // Rule 3: Greetings / Help
  else if (/\b(hello|hi)\b/i.test(lastMsg)) {
    finalContent += "Hello Captain! I am FlightAI. I can track flights (e.g., 'Track EK521') or check airport weather (e.g., 'Weather at DXB').\n";
  }
  // Fallback
  else {
    finalContent += "I am currently running on Local Backup NLP because the OpenAI API key ran out of credits. Try asking me to 'Track EK521' or 'Weather for LHR'!\n";
  }
  
  return finalContent;
}

router.post('/', async (req, res) => {
  try {
    const { messages, context } = req.body;
    const io = req.app.get('io');
    
    // Inject real-time aircraft telemetry into the system parameter so the AI knows exactly what is selected
    const systemContext = `You are FlightAI, an elite aviation assistant.
RULES for answering:
1. Speak concisely in 1-2 short sentences. Use line breaks for readability.
2. The user is actively clicking on DIFFERENT planes on a live map. NEVER apologize for "mix-ups" or changing subjects. Treat each inquiry as focused totally on the CURRENTLY targeted plane.
3. Be professional and direct.

${context ? `CURRENTLY TARGETED AIRCRAFT: Flight ${context.flightNumber} (${context.airline}, Hex: ${context.id}). Altitude: ${context.altitude} ft, Speed: ${context.speed} km/h. ${context.routeData ? `Route Data: Flying from ${context.routeData.origin} (${context.routeData.originIata}) to ${context.routeData.destination} (${context.routeData.destinationIata}).` : `No Route Data Available (Raw ADS-B Only).`}` : `No aircraft selected.`}`;

    try {
      const response = await openai.chat.completions.create({
        model: "llama-3.1-8b-instant", // Using updated Groq model
        messages: [
          { role: "system", content: systemContext },
          ...messages.map(m => ({ role: m.role, content: m.content }))
        ]
      });

      return res.json({ role: 'assistant', content: response.choices[0].message.content });
    } catch (openAiError) {
      // 429 QUOTA EXCEEDED - Fallback to Local Engine!
      if (openAiError.status === 429 || openAiError.status === 401) {
        console.log("OpenAI limit reached, falling back to Local NLP Engine.");
        const localResponse = await localNLPEngine(messages, io);
        return res.json({ role: 'assistant', content: localResponse });
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
