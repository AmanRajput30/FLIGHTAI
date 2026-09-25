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
import TelemetryPanel from '@/components/telemetry/TelemetryPanel';
import ChatPanel from '@/components/chat/ChatPanel';
import { CockpitButton } from '@/components/ui/CockpitButton';
import { Activity, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aervyn.in';

const Map = dynamic(() => import('@/components/map/AERVYNMap'), { 
  ssr: false,
  loading: () => <div className="flex-1 h-full bg-aervyn-bg-dark flex items-center justify-center font-labels text-aervyn-text-primary uppercase tracking-widest text-sm font-bold">Loading map...</div>
});

export default function LiveTracking() {
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
  
  // Real Data Fetcher (OpenSky)
  useEffect(() => {
    const fetchLiveFlights = async () => {
      try {
        // Fetch global flights via Next.js proxy to bypass CORS
        const res = await fetch('/api/flights');
        if (!res.ok) return;
        const data = await res.json();
        
        if (data && data.states) {
          const newFlights = data.states
            .filter((p: any) => p[5] != null && p[6] != null) // Ensure valid lat/lng
            .map((p: any) => ({
              id: p[0],
              icao24: p[0],
              callsign: p[1]?.trim() || p[0],
              lat: p[6],
              lng: p[5],
              heading: p[10] || 0,
              speed: p[9] ? Math.round(p[9] * 1.94384) : 0, // m/s to knots
              altitude: p[7] ? Math.round(p[7] * 3.28084) : 0, // meters to ft
              verticalRate: p[11] ? Math.round(p[11] * 196.85) : 0, // m/s to fpm
              category: 'Commercial',
              status: p[8] ? 'grounded' : 'active'
            })); // Removed arbitrary slice limit to allow planes to be visible on user's location

          useFlightStore.getState().setFlights(newFlights);
          setSystemStatus('live');
          
          const currentFlight = useFlightStore.getState().selectedFlight;
          if (currentFlight) {
            const updated = newFlights.find((f: any) => f.id === currentFlight.id);
            if (updated) {
              useFlightStore.getState().setSelectedFlight(updated);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch live flights:", err);
      }
    };

    fetchLiveFlights();
    const interval = setInterval(fetchLiveFlights, 10000); // 10s interval

    return () => clearInterval(interval);
  }, [setSystemStatus, setSelectedFlight]);

  const handleUntrack = () => {
    setFocusedFlightId(null);
    setSelectedFlight(null);
    setTargetPos(null);
  };

  return (
    <div className="h-screen w-screen bg-aervyn-bg-dark text-aervyn-text-primary overflow-hidden relative font-labels">
      {/* Map Box - Sandwiched between panels on Desktop, full screen on Mobile */}
      <div className="absolute top-14 bottom-0 left-0 right-0 lg:top-[72px] lg:bottom-6 lg:left-[436px] lg:right-[364px] z-0 lg:rounded-[4px] overflow-hidden lg:border border-aervyn-border-subtle shadow-2xl">
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
      <div className="hidden lg:flex absolute left-[80px] top-16 bottom-6 z-40 w-[340px] pointer-events-none flex-col gap-4">
        {/* Left Side: Fleet List */}
        <div className="pointer-events-auto h-full w-full shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
          <FleetPanel />
        </div>
      </div>
      
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="hidden lg:flex absolute right-6 top-16 bottom-6 z-40 w-[340px] pointer-events-none flex-col gap-4"
        >
          {/* Right Side: Telemetry / Selected Flight Details */}
          <div className="pointer-events-auto flex-[2] w-full min-h-0 shadow-[-4px_0_24px_rgba(0,0,0,0.5)]">
            <TelemetryPanel />
          </div>
          
          {/* Optional Chat for specific flight tracking */}
          <div className="pointer-events-auto flex-[1] w-full min-h-[300px] shadow-[-4px_0_24px_rgba(0,0,0,0.5)]">
            <ChatPanel />
          </div>
        </motion.div>
      </AnimatePresence>

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
