export interface Flight {
  id: string;
  flightNumber?: string;
  callsign?: string;
  aircraftType?: string;
  airline?: string;
  origin?: string;
  destination?: string;
  lat: number;
  lng: number;
  alt?: number;
  altitude?: number; // Aliased/injected sometimes
  speed: number;
  heading: number;
  verticalRate?: number;
  lastContact?: number;
  status: 'active' | 'scheduled' | 'landed' | 'unknown';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  referencedFlights?: string[];
}

export interface RouteInfo {
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
  
  originLat?: number;
  originLng?: number;
  destLat?: number;
  destLng?: number;
  
  aircraftModel?: string;
  registration?: string;
  source?: string;
}

export interface WeatherData {
  temperature_2m?: number;
  wind_speed_10m?: number;
  weather_code?: number;
  wind_direction_10m?: number;
}

export interface AircraftPhoto {
  url: string;
  photographer: string;
  source: string;
}

export interface AircraftMetadata {
  registration?: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  age?: number;
  owner?: string;
  registered_owner?: string;
  registered_owner_country_iso_name?: string;
}

export interface NormalizedFlightDetails {
  flight: Flight;
  route: RouteInfo | null;
  weather: WeatherData | null;
  aircraft: AircraftMetadata | null;
  photo: AircraftPhoto | null;
  provenance: {
    route?: string;
    weather?: string;
    aircraft?: string;
    photo?: string;
  };
  fetchedAt: string;
}
