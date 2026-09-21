"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { socket } from '@/lib/socket';
import { useFlightStore } from '@/store/useFlightStore';
import { useUIStore } from '@/store/useUIStore';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

import Header from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import FleetPanel from '@/components/telemetry/FleetPanel';
import AlertsPanel from '@/components/telemetry/AlertsPanel';
import TelemetryPanel from '@/components/telemetry/TelemetryPanel';
import ChatPanel from '@/components/chat/ChatPanel';
import { CockpitButton } from '@/components/ui/CockpitButton';
import { Activity, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aervyn.in';

const Map = dynamic(() => import('@/components/map/AERVYNMap'), { 
  ssr: false,
  loading: () => <div className="flex-1 h-full bg-aervyn-bg-dark flex items-center justify-center font-labels text-aervyn-text-primary uppercase tracking-widest text-sm font-bold">Loading map...</div>
});

export default function Dashboard() {
  const { 
    selectedFlight, 
    focusedFlightId, 
    setFlightPhotoUrl, 
    setWeatherData, 
    setFlightRouteData, 
    setAircraftMetadata, 
    setExpandedRoute,
    setSelectedFlight,
    setFocusedFlightId,
    setAirportData,
    targetPos,
    setTargetPos
  } = useFlightStore();

  const {
    setSystemStatus,
    mapMode,
    performanceMode,
    setMapMode,
    setPerformanceMode
  } = useUIStore();

  usePerformanceMonitor();

  const [activeMobilePanel, setActiveMobilePanel] = useState<'telemetry' | 'chat' | 'none'>('none');

  // Automatically open telemetry when a flight is selected on mobile
  useEffect(() => {
    if (selectedFlight || useFlightStore.getState().airportData) {
      if (window.innerWidth < 1024) {
        setActiveMobilePanel('telemetry');
      }
    }
  }, [selectedFlight, useFlightStore.getState().airportData]);

  // Flight Data Fetcher
  useEffect(() => {
    if (selectedFlight?.id) {
      useFlightStore.getState().fetchFlightDetails(selectedFlight, API_URL);
    } else {
      setFlightPhotoUrl(null);
      setWeatherData(null);
      setFlightRouteData(null);
      setAircraftMetadata(null);
      setExpandedRoute(null);
    }
  }, [selectedFlight?.id, setFlightPhotoUrl, setWeatherData, setFlightRouteData, setAircraftMetadata, setExpandedRoute]);
  
  // Socket Connection
  useEffect(() => {
    socket.on('system_status', (status: 'live' | 'stale') => {
      setSystemStatus(status);
    });

    socket.on('flights_update', (payload: any[]) => {
      const flights = payload.map(p => ({
        id: p[0],
        icao24: p[0],
        lat: p[1],
        lng: p[2],
        heading: p[3],
        speed: p[4],
        category: p[5],
        status: 'active' as const
      }));
      useFlightStore.getState().setFlights(flights);
      
      const currentFlight = useFlightStore.getState().selectedFlight;
      if (currentFlight) {
        const updated = flights.find(f => f.id === currentFlight.id);
        if (updated) {
          useFlightStore.getState().setSelectedFlight(updated);
        }
      }
    });

    return () => {
      socket.off('system_status');
      socket.off('flights_update');
    };
  }, [setSystemStatus, setSelectedFlight]);

  const handleUntrack = () => {
    setFocusedFlightId(null);
    setSelectedFlight(null);
    setTargetPos(null);
  };

  return (
    <div className="h-screen w-screen bg-aervyn-bg-dark text-aervyn-text-primary overflow-hidden relative font-labels">
      {/* Background Map - Absolute Full Screen */}
      <div className="absolute inset-0 z-0">
        <Map 
          onFlightSelect={(id) => { 
            const flight = useFlightStore.getState().flights.find(f => f.id === id);
            if (flight) {
              setSelectedFlight(flight); 
              setFocusedFlightId(flight.id); 
              setAirportData(null); 
            }
          }} 
          onFlightDeselect={handleUntrack} 
          selectedFlightId={focusedFlightId} 
          routeData={selectedFlight?.id === focusedFlightId ? useFlightStore.getState().flightRouteData : null} 
          targetPos={targetPos}
          mapMode={mapMode}
          performanceMode={performanceMode}
        />
      </div>

      {/* Floating Header */}
      <div className="absolute top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Header />
        </div>
      </div>

      {/* Floating Sidebar (Left Rail) */}
      <div className="absolute top-14 bottom-0 left-0 z-50 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <Sidebar />
        </div>
      </div>

      {/* Desktop Panels */}
      <div className="hidden lg:flex absolute left-[72px] top-16 bottom-6 z-40 w-[340px] pointer-events-none flex-col gap-4">
        <div className="pointer-events-auto h-full w-full">
          <FleetPanel />
        </div>
      </div>
      
      <div className="hidden lg:flex absolute right-6 top-16 bottom-6 z-40 w-[340px] pointer-events-none flex-col gap-4">
        {/* Top Right: Telemetry (Selected Flight) */}
        <div className="pointer-events-auto flex-[2] w-full min-h-0">
          <TelemetryPanel />
        </div>
        
        {/* Bottom Right: Chat / Command */}
        <div className="pointer-events-auto flex-[1] w-full min-h-[300px]">
          <ChatPanel />
        </div>
      </div>

      {/* Bottom Center: Alerts / Timeline */}
      <div className="hidden lg:flex absolute left-[440px] right-[380px] bottom-6 z-40 h-[140px] pointer-events-none">
        <div className="pointer-events-auto h-full w-full">
          <AlertsPanel />
        </div>
      </div>

      {/* Mobile Panels */}
      <AnimatePresence>
        {activeMobilePanel === 'telemetry' && (
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={M_PRESETS.panel}
            className="lg:hidden absolute bottom-20 left-4 right-4 top-24 z-40 pointer-events-none"
          >
            <div className="pointer-events-auto h-full w-full overflow-hidden rounded-[4px] shadow-2xl">
              <TelemetryPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMobilePanel === 'chat' && (
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={M_PRESETS.panel}
            className="lg:hidden absolute bottom-20 left-4 right-4 top-24 z-40 pointer-events-none"
          >
            <div className="pointer-events-auto h-full w-full overflow-hidden rounded-[4px] shadow-2xl flex flex-col">
              <ChatPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden absolute bottom-4 left-4 right-4 z-50 flex gap-2 justify-center pointer-events-none">
        <div className="bg-aervyn-panel-base/90 backdrop-blur-md p-1.5 rounded-[4px] border border-aervyn-border-subtle flex gap-1 pointer-events-auto shadow-xl">
          <CockpitButton 
            variant="selector" 
            isActive={activeMobilePanel === 'telemetry'}
            onClick={() => setActiveMobilePanel(activeMobilePanel === 'telemetry' ? 'none' : 'telemetry')}
            className="px-6 py-2"
          >
            <Activity size={16} className="mr-2" />
            TELEMETRY
          </CockpitButton>
          <CockpitButton 
            variant="selector" 
            isActive={activeMobilePanel === 'chat'}
            onClick={() => setActiveMobilePanel(activeMobilePanel === 'chat' ? 'none' : 'chat')}
            className="px-6 py-2"
          >
            <MessageSquare size={16} className="mr-2" />
            SKYLORD
          </CockpitButton>
        </div>
      </div>
    </div>
  );
}
