const fs = require('fs');
const path = require('path');

const UI_DIR = path.join(__dirname, 'flightai', 'src', 'components', 'ui');

if (!fs.existsSync(UI_DIR)) {
  fs.mkdirSync(UI_DIR, { recursive: true });
}

const primitives = {
  'CommandPanel.tsx': `import React from 'react';
import { motion } from 'framer-motion';

export interface CommandPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'base' | 'dark' | 'light';
  state?: 'loaded' | 'loading' | 'empty' | 'error';
  children: React.ReactNode;
}

export const CommandPanel: React.FC<CommandPanelProps> = ({ 
  variant = 'base', 
  state = 'loaded', 
  className = '', 
  children, 
  ...props 
}) => {
  const bgColors = {
    base: 'bg-aervyn-panel-base',
    dark: 'bg-aervyn-panel-dark',
    light: 'bg-aervyn-panel-light'
  };

  return (
    <div 
      className={\`border border-aervyn-border-subtle rounded flex flex-col overflow-hidden \${bgColors[variant]} \${className}\`}
      {...props}
    >
      {state === 'loading' && (
        <div className="flex-1 flex items-center justify-center p-8 text-aervyn-text-tertiary text-xs tracking-widest uppercase font-labels">
          <span className="animate-pulse">Loading Data...</span>
        </div>
      )}
      {state === 'error' && (
        <div className="flex-1 flex items-center justify-center p-8 text-aervyn-status-red text-xs tracking-widest uppercase font-labels">
          Data Unavailable
        </div>
      )}
      {state === 'empty' && (
        <div className="flex-1 flex items-center justify-center p-8 text-aervyn-text-tertiary text-xs tracking-widest uppercase font-labels">
          No Data Available
        </div>
      )}
      {state === 'loaded' && children}
    </div>
  );
};
`,
  
  'PanelHeader.tsx': `import React from 'react';

export interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export const PanelHeader: React.FC<PanelHeaderProps> = ({ title, subtitle, rightElement, className = '' }) => {
  return (
    <div className={\`px-4 py-2 border-b border-aervyn-border-subtle bg-aervyn-panel-dark flex items-center justify-between \${className}\`}>
      <div className="flex items-baseline gap-2">
        <h2 className="text-xs font-bold tracking-widest uppercase text-aervyn-text-primary font-labels">{title}</h2>
        {subtitle && <span className="text-[10px] tracking-wider uppercase text-aervyn-text-tertiary font-labels">{subtitle}</span>}
      </div>
      {rightElement && <div>{rightElement}</div>}
    </div>
  );
};
`,
  
  'SectionLabel.tsx': `import React from 'react';

export const SectionLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={\`text-[10px] font-bold tracking-[0.15em] uppercase text-aervyn-text-secondary font-labels mb-2 \${className}\`}>
    {children}
  </h3>
);
`,
  
  'TelemetryValue.tsx': `import React from 'react';

export interface TelemetryValueProps {
  label: string;
  value: string | number | null;
  unit?: string;
  state?: 'live' | 'stale' | 'missing';
  className?: string;
}

export const TelemetryValue: React.FC<TelemetryValueProps> = ({ label, value, unit, state = 'live', className = '' }) => {
  const isMissing = value === null || value === undefined || state === 'missing';
  
  return (
    <div className={\`flex flex-col \${className}\`}>
      <span className="text-[9px] tracking-widest uppercase text-aervyn-text-tertiary font-labels mb-0.5">{label}</span>
      <div className={\`flex items-baseline gap-1 font-telemetry \${state === 'stale' ? 'text-aervyn-status-amber' : 'text-aervyn-text-primary'}\`}>
        {isMissing ? (
          <span className="text-lg leading-none opacity-50">--</span>
        ) : (
          <>
            <span className="text-lg leading-none tracking-wide">{value}</span>
            {unit && <span className="text-[10px] leading-none text-aervyn-text-secondary font-labels ml-0.5">{unit}</span>}
          </>
        )}
      </div>
    </div>
  );
};
`,
  
  'TelemetryRow.tsx': `import React from 'react';

export const TelemetryRow: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={\`grid grid-cols-2 gap-4 \${className}\`}>
    {children}
  </div>
);
`,
  
  'StatusIndicator.tsx': `import React from 'react';

export type OperationalState = 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'offline';

export const StatusIndicator: React.FC<{ state: OperationalState; ping?: boolean; className?: string }> = ({ state, ping = false, className = '' }) => {
  const colorMap = {
    blue: 'bg-aervyn-status-blue',
    cyan: 'bg-aervyn-status-cyan',
    green: 'bg-aervyn-status-green',
    amber: 'bg-aervyn-status-amber',
    red: 'bg-aervyn-status-red',
    offline: 'bg-aervyn-text-tertiary'
  };
  
  const color = colorMap[state];

  return (
    <span className={\`relative flex h-2 w-2 \${className}\`}>
      {ping && <span className={\`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 \${color}\`}></span>}
      <span className={\`relative inline-flex rounded-full h-2 w-2 \${color}\`}></span>
    </span>
  );
};
`,
  
  'FlightStatus.tsx': `import React from 'react';
import { StatusIndicator, OperationalState } from './StatusIndicator';

export interface FlightStatusProps {
  statusText: string;
  state: OperationalState;
  className?: string;
}

export const FlightStatus: React.FC<FlightStatusProps> = ({ statusText, state, className = '' }) => {
  const textColorMap = {
    blue: 'text-aervyn-status-blue',
    cyan: 'text-aervyn-status-cyan',
    green: 'text-aervyn-status-green',
    amber: 'text-aervyn-status-amber',
    red: 'text-aervyn-status-red',
    offline: 'text-aervyn-text-tertiary'
  };

  return (
    <div className={\`flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase font-labels \${textColorMap[state]} \${className}\`}>
      <StatusIndicator state={state} ping={state === 'green' || state === 'blue'} />
      {statusText}
    </div>
  );
};
`,

  'FlightRow.tsx': `import React from 'react';

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
      className={\`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-aervyn-border-subtle transition-colors \${isActive ? 'bg-aervyn-border-active/30 border-l-2 border-l-aervyn-status-blue' : 'hover:bg-aervyn-panel-light border-l-2 border-l-transparent'}\`}
    >
      <div className="flex items-center gap-4">
        <span className={\`font-labels font-bold tracking-wider text-xs \${isActive ? 'text-aervyn-status-cyan' : 'text-aervyn-text-primary'}\`}>{callsign}</span>
        <span className="font-labels text-[10px] text-aervyn-text-secondary tracking-widest">{origin} <span className="text-aervyn-text-tertiary mx-1">→</span> {destination}</span>
      </div>
      <span className="font-labels text-[9px] tracking-widest uppercase text-aervyn-text-tertiary">{statusText}</span>
    </div>
  );
};
`,

  'FlightCard.tsx': `import React from 'react';

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
      className={\`p-3 border rounded cursor-pointer transition-colors \${isActive ? 'border-aervyn-status-blue bg-aervyn-panel-light' : 'border-aervyn-border-subtle bg-aervyn-panel-base hover:border-aervyn-border-active'}\`}
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
`,

  'AlertBadge.tsx': `import React from 'react';

export type AlertLevel = 'critical' | 'warning' | 'info';

export const AlertBadge: React.FC<{ level: AlertLevel; message: string; className?: string }> = ({ level, message, className = '' }) => {
  const styles = {
    critical: 'bg-aervyn-status-red/10 border-aervyn-status-red text-aervyn-status-red',
    warning: 'bg-aervyn-status-amber/10 border-aervyn-status-amber text-aervyn-status-amber',
    info: 'bg-aervyn-status-blue/10 border-aervyn-status-blue text-aervyn-status-blue'
  };

  return (
    <div className={\`px-2 py-1 border rounded text-[9px] font-bold tracking-widest uppercase font-labels \${styles[level]} \${className}\`}>
      {message}
    </div>
  );
};
`,

  'DataSourceBadge.tsx': `import React from 'react';
import { StatusIndicator, OperationalState } from './StatusIndicator';

export const DataSourceBadge: React.FC<{ name: string; state: OperationalState; statusText?: string }> = ({ name, state, statusText }) => {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 border border-aervyn-border-subtle rounded bg-aervyn-panel-dark">
      <span className="font-labels text-[10px] font-bold tracking-wider text-aervyn-text-secondary">{name}</span>
      <div className="flex items-center gap-2">
        {statusText && <span className="font-labels text-[9px] tracking-widest uppercase text-aervyn-text-tertiary">{statusText}</span>}
        <StatusIndicator state={state} />
      </div>
    </div>
  );
};
`,

  'IconButton.tsx': `import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  isActive?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon: Icon, isActive, className = '', ...props }) => {
  return (
    <button 
      className={\`p-1.5 rounded transition-colors flex items-center justify-center \${isActive ? 'bg-aervyn-border-active text-aervyn-text-primary' : 'text-aervyn-text-tertiary hover:bg-aervyn-border-subtle hover:text-aervyn-text-secondary'} \${className}\`}
      {...props}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
};
`,

  'CommandInput.tsx': `import React from 'react';
import { Search } from 'lucide-react';

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CommandInput: React.FC<CommandInputProps> = ({ className = '', ...props }) => {
  return (
    <div className={\`relative flex items-center \${className}\`}>
      <Search size={14} className="absolute left-3 text-aervyn-text-tertiary" />
      <input 
        className="w-full bg-aervyn-panel-dark border border-aervyn-border-subtle rounded py-1.5 pl-9 pr-3 text-xs font-labels text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors"
        {...props}
      />
    </div>
  );
};
`
};

for (const [filename, content] of Object.entries(primitives)) {
  fs.writeFileSync(path.join(UI_DIR, filename), content);
  console.log('Created ' + filename);
}
