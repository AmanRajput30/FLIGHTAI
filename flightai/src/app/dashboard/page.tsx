"use client";

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { socket } from '@/lib/socket';
import { useFlightStore } from '@/store/useFlightStore';
import { useUIStore } from '@/store/useUIStore';

import Header from '@/components/layout/Header';
import TelemetryPanel from '@/components/telemetry/TelemetryPanel';
import ChatPanel from '@/components/chat/ChatPanel';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flightai-hxbd.onrender.com';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center">Loading Real-Time Map...</div>
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
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <Header variant="compact" />

      <main className="flex-1 flex overflow-hidden relative">
        <TelemetryPanel />

        <div className="flex-1 h-full relative border-l border-r border-white/5 flex flex-col">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-red-500/80 backdrop-blur text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg border border-red-400">
            NOT FOR OPERATIONAL USE
          </div>
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

        <ChatPanel />
      </main>
    </div>
  );
}
