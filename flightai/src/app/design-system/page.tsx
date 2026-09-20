import React from 'react';
import { CommandPanel } from '@/components/ui/CommandPanel';
import { PanelHeader } from '@/components/ui/PanelHeader';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { TelemetryValue } from '@/components/ui/TelemetryValue';
import { TelemetryRow } from '@/components/ui/TelemetryRow';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { FlightStatus } from '@/components/ui/FlightStatus';
import { FlightRow } from '@/components/ui/FlightRow';
import { FlightCard } from '@/components/ui/FlightCard';
import { AlertBadge } from '@/components/ui/AlertBadge';
import { DataSourceBadge } from '@/components/ui/DataSourceBadge';
import { IconButton } from '@/components/ui/IconButton';
import { CommandInput } from '@/components/ui/CommandInput';
import { CockpitButton } from '@/components/ui/CockpitButton';
import HorizonDivider from '@/components/ui/HorizonDivider';
import { Settings, RefreshCw, Maximize2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-aervyn-bg-dark text-aervyn-text-primary p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="border-b border-aervyn-border-subtle pb-6 mb-12">
          <h1 className="text-3xl font-bold font-labels tracking-widest uppercase text-aervyn-text-primary mb-2">
            AERVYN Command Center
          </h1>
          <p className="text-aervyn-text-tertiary font-labels text-sm tracking-wider uppercase">
            Design System & UI Primitives Showcase
          </p>
        </header>

        {/* --- PANELS & STATES --- */}
        <section>
          <SectionLabel className="text-lg">Command Panels & States</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
            <CommandPanel state="loaded" className="h-48">
              <PanelHeader title="Standard Panel" subtitle="Loaded State" />
              <div className="p-4 flex-1">
                <p className="text-aervyn-text-secondary text-xs">Normal operational content goes here.</p>
              </div>
            </CommandPanel>

            <CommandPanel state="loading" className="h-48" />
            <CommandPanel state="empty" className="h-48" />
            <CommandPanel state="error" className="h-48" />
          </div>
        </section>

        <HorizonDivider />

        {/* --- TELEMETRY --- */}
        <section>
          <SectionLabel className="text-lg">Telemetry Values</SectionLabel>
          <CommandPanel className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <TelemetryValue label="System Load" value="45" unit="%" state="live" />
              <TelemetryValue label="Network Latency" value="120" unit="MS" state="stale" />
              <TelemetryValue label="Active Nodes" value="1,024" state="live" />
              <TelemetryValue label="Throughput" value={null} unit="MB/S" state="missing" />
            </div>
          </CommandPanel>
        </section>

        <HorizonDivider />

        {/* --- STATUS & ALERTS --- */}
        <section>
          <SectionLabel className="text-lg">Status & Alerts</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <CommandPanel>
              <PanelHeader title="Operational States" />
              <div className="p-6 flex flex-col gap-4">
                <FlightStatus statusText="Normal Operation" state="green" />
                <FlightStatus statusText="Degraded State" state="amber" />
                <FlightStatus statusText="Critical Failure" state="red" />
                <FlightStatus statusText="System Idle" state="cyan" />
                <FlightStatus statusText="Processing" state="blue" />
                <FlightStatus statusText="Offline" state="offline" />
              </div>
            </CommandPanel>

            <CommandPanel>
              <PanelHeader title="Alert Badges" />
              <div className="p-6 flex flex-wrap gap-4 items-start">
                <AlertBadge level="info" message="Update Available" />
                <AlertBadge level="warning" message="High Latency Detected" />
                <AlertBadge level="critical" message="Connection Lost" />
              </div>
            </CommandPanel>
          </div>
        </section>

        <HorizonDivider />

        {/* --- LISTS & CARDS --- */}
        <section>
          <SectionLabel className="text-lg">Data Rows & Cards</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <CommandPanel>
              <PanelHeader title="Data Rows" />
              <div className="flex flex-col">
                <FlightRow callsign="ENTITY-ALPHA" origin="NODE-1" destination="NODE-2" statusText="Active" />
                <FlightRow callsign="ENTITY-BETA" origin="NODE-3" destination="NODE-4" statusText="Selected" isActive />
                <FlightRow callsign="ENTITY-GAMMA" origin="NODE-5" destination="NODE-6" statusText="Idle" />
              </div>
            </CommandPanel>

            <div className="flex flex-col gap-4">
              <FlightCard callsign="ENTITY-DELTA" flightNumber="ID-9932" origin="NODE-A" destination="NODE-B" statusText="Processing" />
              <FlightCard callsign="ENTITY-EPSILON" flightNumber="ID-8841" origin="NODE-C" destination="NODE-D" statusText="Active" isActive />
            </div>
          </div>
        </section>

        <HorizonDivider />

        {/* --- CONTROLS --- */}
        <section>
          <SectionLabel className="text-lg">Controls & Inputs</SectionLabel>
          <CommandPanel className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-4">
                <SectionLabel>Buttons</SectionLabel>
                <div className="flex gap-4">
                  <CockpitButton variant="selector">Execute</CockpitButton>
                  <CockpitButton variant="selector">Abort</CockpitButton>
                </div>
                <div className="flex gap-4">
                  <CockpitButton variant="selector">Unselected</CockpitButton>
                  <CockpitButton variant="selector" isActive>Selected</CockpitButton>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <SectionLabel>Icon Buttons</SectionLabel>
                <div className="flex gap-4">
                  <IconButton icon={Settings} />
                  <IconButton icon={RefreshCw} isActive />
                  <IconButton icon={Maximize2} />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <SectionLabel>Command Input</SectionLabel>
                <CommandInput placeholder="Search system entities..." />
              </div>
            </div>
          </CommandPanel>
        </section>

        <HorizonDivider />

        {/* --- DATA SOURCES --- */}
        <section>
          <SectionLabel className="text-lg">Data Source Badges</SectionLabel>
          <CommandPanel className="p-6 flex flex-wrap gap-4">
            <DataSourceBadge name="Primary System" state="green" statusText="Online" />
            <DataSourceBadge name="Secondary System" state="amber" statusText="Lagging" />
            <DataSourceBadge name="Backup Node" state="offline" statusText="Disconnected" />
          </CommandPanel>
        </section>

      </div>
    </div>
  );
}
