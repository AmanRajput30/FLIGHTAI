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
  callsign, flightNumber, origin = '???', destination = '???', statusText, isActive, onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`p-3 border rounded cursor-pointer transition-colors ${isActive ? 'border-aervyn-status-blue bg-aervyn-panel-light' : 'border-aervyn-border-subtle bg-aervyn-panel-base hover:border-aervyn-border-active'}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-labels font-bold text-sm text-aervyn-text-primary">{callsign}</div>
          {flightNumber && <div className="font-labels text-[10px] text-aervyn-text-tertiary tracking-widest">{flightNumber}</div>}
        </div>
        <div className="font-labels text-[9px] font-bold tracking-wider text-aervyn-status-green uppercase">{statusText}</div>
      </div>
      <div className="flex items-center text-aervyn-text-secondary font-labels text-xs tracking-widest">
        <span>{origin}</span>
        <span className="mx-2 text-aervyn-border-active">─────────</span>
        <span>{destination}</span>
      </div>
    </div>
  );
};
