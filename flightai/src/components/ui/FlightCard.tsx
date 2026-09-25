import React from 'react';

export interface FlightCardProps {
  callsign: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  statusText: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({
  callsign, flightNumber, origin = 'UNK', destination = 'UNK', statusText, isActive, onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`p-4 border rounded-xl cursor-pointer transition-colors ${isActive ? 'border-aervyn-primary bg-aervyn-primary/10' : 'border-aervyn-border-dark bg-aervyn-surface-dark hover:border-aervyn-border-dark-subtle'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-semibold text-sm text-aervyn-text-dark-primary">{callsign}</div>
          {flightNumber && <div className="text-xs font-medium text-aervyn-text-dark-muted mt-0.5">{flightNumber}</div>}
        </div>
        <div className="text-xs font-semibold text-aervyn-status-success">{statusText}</div>
      </div>
      <div className="flex items-center text-aervyn-text-dark-secondary font-medium text-sm">
        <span className="flex-1 min-w-0 truncate" title={origin}>{origin}</span>
        <span className="mx-3 shrink-0 text-aervyn-border-dark-subtle">──────</span>
        <span className="flex-1 min-w-0 truncate text-right" title={destination}>{destination}</span>
      </div>
    </div>
  );
};
