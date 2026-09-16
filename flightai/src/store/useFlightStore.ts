import { create } from 'zustand';
import { Flight, WeatherData, RouteInfo, AircraftMetadata, AircraftPhoto } from '../types';

interface FlightState {
  selectedFlight: Flight | null;
  focusedFlightId: string | null;
  flightPhotoUrl: string | null;
  weatherData: WeatherData | null;
  flightRouteData: RouteInfo | null;
  aircraftMetadata: AircraftMetadata | null;
  expandedRoute: 'origin' | 'destination' | null;
  targetPos: [number, number] | null;
  flights: Flight[];
  airportData: any | null;

  setSelectedFlight: (flight: Flight | null) => void;
  setFocusedFlightId: (id: string | null) => void;
  setFlightPhotoUrl: (url: string | null) => void;
  setWeatherData: (data: WeatherData | null) => void;
  setFlightRouteData: (data: RouteInfo | null) => void;
  setAircraftMetadata: (data: AircraftMetadata | null) => void;
  setExpandedRoute: (route: 'origin' | 'destination' | null) => void;
  setTargetPos: (pos: [number, number] | null) => void;
  setFlights: (flights: Flight[]) => void;
  setAirportData: (data: any | null) => void;
}

export const useFlightStore = create<FlightState>((set) => ({
  selectedFlight: null,
  focusedFlightId: null,
  flightPhotoUrl: null,
  weatherData: null,
  flightRouteData: null,
  aircraftMetadata: null,
  expandedRoute: null,
  targetPos: null,
  flights: [],
  airportData: null,

  setSelectedFlight: (flight) => set({ selectedFlight: flight }),
  setFocusedFlightId: (id) => set({ focusedFlightId: id }),
  setFlightPhotoUrl: (url) => set({ flightPhotoUrl: url }),
  setWeatherData: (data) => set({ weatherData: data }),
  setFlightRouteData: (data) => set({ flightRouteData: data }),
  setAircraftMetadata: (data) => set({ aircraftMetadata: data }),
  setExpandedRoute: (route) => set({ expandedRoute: route }),
  setTargetPos: (pos) => set({ targetPos: pos }),
  setFlights: (flights) => set({ flights: flights }),
  setAirportData: (data) => set({ airportData: data }),
}));
