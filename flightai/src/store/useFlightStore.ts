import { create } from 'zustand';
import axios from 'axios';
import { Flight, WeatherData, RouteInfo, AircraftMetadata } from '../types';

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
  airportData: unknown | null;

  setSelectedFlight: (flight: Flight | null) => void;
  setFocusedFlightId: (id: string | null) => void;
  setFlightPhotoUrl: (url: string | null) => void;
  setWeatherData: (data: WeatherData | null) => void;
  setFlightRouteData: (data: RouteInfo | null) => void;
  setAircraftMetadata: (data: AircraftMetadata | null) => void;
  setExpandedRoute: (route: 'origin' | 'destination' | null) => void;
  setTargetPos: (pos: [number, number] | null) => void;
  setFlights: (flights: Flight[]) => void;
  setAirportData: (data: unknown | null) => void;
  fetchFlightDetails: (flight: Flight, apiUrl: string) => Promise<void>;
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
  
  fetchFlightDetails: async (flight, apiUrl) => {
    // Reset previous flight data immediately to prevent stale data
    set({
      flightPhotoUrl: null,
      weatherData: null,
      flightRouteData: null,
      aircraftMetadata: null
    });

    const isCurrent = () => useFlightStore.getState().selectedFlight?.id === flight.id;

    try {
      // 1. Fetch complete normalized details from backend
      const res = await axios.get(`${apiUrl}/api/flight/details/${flight.id}`);
      
      if (!isCurrent()) return; // Abort if user clicked another flight

      // 2. Hydrate the store safely using the partial merge pattern
      if (res.data) {
        set((state) => ({
          flightPhotoUrl: res.data.photo?.url || null,
          weatherData: res.data.weather || null,
          flightRouteData: res.data.route || { 
            origin: "Data Unavailable", originIata: "N/A", originIcao: "---", 
            destination: "Data Unavailable", destinationIata: "N/A", destinationIcao: "---" 
          },
          aircraftMetadata: res.data.aircraft || null
        }));
      }
    } catch (err) {
      if (isCurrent()) {
        set({
          flightRouteData: { 
            origin: "Data Unavailable", originIata: "N/A", originIcao: "---", 
            destination: "Data Unavailable", destinationIata: "N/A", destinationIcao: "---" 
          }
        });
      }
    }
  }
}));
