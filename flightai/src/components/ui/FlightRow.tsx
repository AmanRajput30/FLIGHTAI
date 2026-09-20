import React from 'react';

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
      className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-aervyn-border-subtle transition-colors ${isActive ? 'bg-aervyn-border-active/30 border-l-2 border-l-aervyn-status-blue' : 'hover:bg-aervyn-panel-light border-l-2 border-l-transparent'}`}
    >
      <div className="flex items-center gap-4">
        <span className={`font-labels font-bold tracking-wider text-xs ${isActive ? 'text-aervyn-status-cyan' : 'text-aervyn-text-primary'}`}>{callsign}</span>
        <span className="font-labels text-[10px] text-aervyn-text-secondary tracking-widest">{origin} <span className="text-aervyn-text-tertiary mx-1">→</span> {destination}</span>
      </div>
      <span className="font-labels text-[9px] tracking-widest uppercase text-aervyn-text-tertiary">{statusText}</span>
    </div>
  );
};
