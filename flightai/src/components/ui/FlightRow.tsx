import React from 'react';
import { Plane } from 'lucide-react';

export interface FlightRowProps {
  callsign: string;
  origin?: string;
  destination?: string;
  statusText: string;
  isActive?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
}

export const FlightRow: React.FC<FlightRowProps> = ({
  callsign, origin = '???', destination = '???', statusText, isActive, onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-aervyn-border-dark transition-colors ${isActive ? 'bg-aervyn-primary/10 border-l-2 border-l-aervyn-primary' : 'hover:bg-aervyn-surface-dark border-l-2 border-l-transparent bg-aervyn-bg-dark'}`}
    >
      <div className="flex items-center gap-4">
        <Plane size={14} className={`shrink-0 ${isActive ? 'text-aervyn-primary' : 'text-aervyn-text-dark-muted'}`} />
        <div className="flex flex-col">
          <span className={`font-semibold text-sm ${isActive ? 'text-aervyn-primary' : 'text-aervyn-text-dark-primary'}`}>{callsign}</span>
          <span className="text-[10px] font-medium text-aervyn-text-dark-secondary">{origin} <span className="text-aervyn-text-dark-muted mx-0.5">→</span> {destination}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-aervyn-text-dark-muted">{statusText}</span>
    </div>
  );
};
