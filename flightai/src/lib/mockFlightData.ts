export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
}

const airlines = ['Emirates', 'Lufthansa', 'Air India', 'Delta', 'United Airlines', 'British Airways', 'Qatar Airways', 'Singapore Airlines'];
const airports = ['DEL', 'DXB', 'LHR', 'JFK', 'FRA', 'SFO', 'SIN', 'BOM', 'SYD', 'NRT'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function generateMockFlights(count: number): Flight[] {
  const flights: Flight[] = [];
  
  for (let i = 0; i < count; i++) {
    const origin = randomElement(airports);
    let dest = randomElement(airports);
    while (dest === origin) dest = randomElement(airports);
    
    flights.push({
      id: `FL-${1000 + i}`,
      flightNumber: `${origin.substring(0, 2)}${Math.floor(Math.random() * 9000) + 1000}`,
      airline: randomElement(airlines),
      origin,
      destination: dest,
      lat: randomInRange(-60, 60),
      lng: randomInRange(-120, 120),
      altitude: Math.floor(randomInRange(25000, 40000)),
      speed: Math.floor(randomInRange(750, 950)),
      heading: Math.floor(randomInRange(0, 360)),
    });
  }
  
  return flights;
}

export function updateFlightPositions(flights: Flight[]): Flight[] {
  return flights.map(flight => {
    // Advance position slightly based on heading
    const headingRad = flight.heading * (Math.PI / 180);
    const distanceDelta = flight.speed / 3600; // Simulated distance roughly per second scale
    
    // Simple 2D increment for fake movement
    let newLat = flight.lat + (Math.cos(headingRad) * distanceDelta * 0.1);
    let newLng = flight.lng + (Math.sin(headingRad) * distanceDelta * 0.1);
    
    // Wrap around world
    if (newLng > 180) newLng -= 360;
    if (newLng < -180) newLng += 360;
    if (newLat > 90) { newLat = 180 - newLat; flight.heading = (flight.heading + 180) % 360; }
    if (newLat < -90) { newLat = -180 - newLat; flight.heading = (flight.heading + 180) % 360; }
    
    // Randomly slightly adjust heading
    const newHeading = (flight.heading + randomInRange(-2, 2)) % 360;

    return {
      ...flight,
      lat: newLat,
      lng: newLng,
      heading: newHeading,
    };
  });
}
