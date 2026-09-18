"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { socket } from '@/lib/socket';
import { useFlightStore } from '@/store/useFlightStore';
import { useUIStore } from '@/store/useUIStore';

import Header from '@/components/layout/Header';
import TelemetryPanel from '@/components/telemetry/TelemetryPanel';
import ChatPanel from '@/components/chat/ChatPanel';
import { CockpitButton } from '@/components/ui/CockpitButton';
import { Activity, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flightai-hxbd.onrender.com';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center font-labels text-instrument-white uppercase tracking-widest text-sm font-bold">Initializing Radar...</div>
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

  const [activeMobilePanel, setActiveMobilePanel] = useState<'telemetry' | 'chat' | 'none'>('none');

  // Automatically open telemetry when a flight is selected on mobile
  useEffect(() => {
    if (selectedFlight || useFlightStore.getState().airportData) {
      if (window.innerWidth < 1024) {
        setActiveMobilePanel('telemetry');
      }
    }
  }, [selectedFlight, useFlightStore.getState().airportData]);

  const fpsRef = useRef<number[]>([]);

  // Performance Monitor
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        fpsRef.current.push(fps);
        if (fpsRef.current.length > 5) fpsRef.current.shift();
        
        const avgFps = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
        if (avgFps < 20 && fpsRef.current.length >= 3) {
           if (!performanceMode) {
              setPerformanceMode(true);
              setMapMode('dark');
           }
        }
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationFrameId);
  }, [performanceMode, setPerformanceMode, setMapMode]);

  // Flight Data Fetcher
  useEffect(() => {
    if (selectedFlight?.id) {
      const hex = selectedFlight.id.toLowerCase();
      setFlightPhotoUrl(null);
      
      const sources = [
        `https://api.planespotters.net/pub/photos/hex/${hex}`,
        `https://www.flightradar24.com/static/images/data/aircraft/lib/hex/${hex.toUpperCase()}.jpg`
      ];

      const fetchPhoto = async () => {
        try {
          const res = await axios.get(sources[0]);
          if (res.data && res.data.photos && res.data.photos.length > 0) {
            setFlightPhotoUrl(res.data.photos[0].thumbnail_large.src);
            return;
          }
        } catch (err) {}
        setFlightPhotoUrl(sources[1]);
      };
      fetchPhoto();

      setWeatherData(null);
      axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${selectedFlight.lat}&longitude=${selectedFlight.lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code`)
        .then(res => {
           if (res.data && res.data.current) setWeatherData(res.data.current);
        })
        .catch(() => {});
        
      setFlightRouteData(null);
      const lookupId = (selectedFlight.flightNumber && selectedFlight.flightNumber !== 'Unknown') 
        ? selectedFlight.flightNumber 
        : selectedFlight.id;

      if (lookupId) {
        axios.get(`${API_URL}/api/route/${lookupId}`)
          .then(res => {
             if (res.data) setFlightRouteData(res.data);
             else setFlightRouteData({ origin: "Data Unavailable", originIata: "N/A", originIcao: "---", destination: "Data Unavailable", destinationIata: "N/A", destinationIcao: "---" } as any);
          })
          .catch(() => {
             setFlightRouteData({ origin: "Data Unavailable", originIata: "N/A", originIcao: "---", destination: "Data Unavailable", destinationIata: "N/A", destinationIcao: "---" } as any);
          });
      }
      
      setAircraftMetadata(null);
      axios.get(`${API_URL}/api/aircraft/${hex}`)
        .then(res => {
           if (res.data) setAircraftMetadata(res.data);
        })
        .catch(() => {});

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

    socket.on('flights_update', (flights: any[]) => {
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
    <div className="h-screen w-screen bg-cockpit-black text-instrument-white overflow-hidden relative font-labels">
      {/* Background Map - Absolute Full Screen */}
      <div className="absolute inset-0 z-0">
        <Map 
          onFlightSelect={(flight) => { setSelectedFlight(flight); setFocusedFlightId(flight.id); setAirportData(null); }} 
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
          <Header variant="compact" />
        </div>
      </div>

      {/* Desktop Panels */}
      <div className="hidden lg:block absolute left-6 top-24 bottom-6 z-40 w-[340px] pointer-events-none">
        <div className="pointer-events-auto h-full w-full">
          <TelemetryPanel />
        </div>
      </div>
      <div className="hidden lg:flex absolute right-6 top-24 bottom-6 z-40 w-[380px] pointer-events-none flex-col justify-end">
        <div className="pointer-events-auto h-full w-full flex flex-col justify-end">
          <ChatPanel />
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
        <div className="bg-cockpit-black/90 backdrop-blur-md p-1.5 rounded-[4px] border border-border-subtle flex gap-1 pointer-events-auto shadow-xl">
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
