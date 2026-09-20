export interface MapProps {
  onFlightSelect: (flightId: string) => void;
  onFlightDeselect: () => void;
  selectedFlightId: string | null;
  routeData?: any;
  targetPos?: [number, number] | null;
  mapMode?: 'satellite' | 'dark';
  performanceMode?: boolean;
}
