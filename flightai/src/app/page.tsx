"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Settings, Bell, Mic, Send, Plane, Navigation, Activity, AlertCircle, Compass, ArrowUp, Zap, Cloud, Wind, Thermometer, MapPin, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="flex-1 h-full bg-[#0d1117] flex items-center justify-center">Loading Real-Time Map...</div>
});

interface ChatMessage { role: 'user' | 'assistant'; content: string; isError?: boolean; }

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Welcome to FlightAI Command Center. I'm connected to live worldwide telemetry. What would you like to track?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [flightPhotoUrl, setFlightPhotoUrl] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [flightRouteData, setFlightRouteData] = useState<any>(null);
  const [expandedRoute, setExpandedRoute] = useState<'origin' | 'destination' | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [airportData, setAirportData] = useState<any>(null);
  const [targetPos, setTargetPos] = useState<[number, number] | null>(null);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await axios.get(`${API_URL}/api/search/${encodeURIComponent(searchQuery)}`);
        if (res.data) {
          if (res.data.type === 'flight') {
             setSelectedFlight(res.data.data);
             setAirportData(null);
             setTargetPos([res.data.data.lat, res.data.data.lng]);
          } else if (res.data.type === 'airport') {
             setAirportData(res.data.data);
             setSelectedFlight(null);
             setTargetPos([res.data.data.lat, res.data.data.lng]);
          } else {
             setSearchError("No results found.");
          }
        } else {
          setSearchError("No results found.");
        }
      } catch (err: any) {
        setSearchError("Search failed.");
      } finally {
        setIsSearching(false);
      }
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFlight?.id) {
      setFlightPhotoUrl(null);
      axios.get(`https://api.planespotters.net/pub/photos/hex/${selectedFlight.id.toLowerCase()}`)
        .then(res => {
           if (res.data && res.data.photos && res.data.photos.length > 0) {
              setFlightPhotoUrl(res.data.photos[0].thumbnail_large.src);
           }
        })
        .catch(() => {});

      // Fetch Weather
      setWeatherData(null);
      axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${selectedFlight.lat}&longitude=${selectedFlight.lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code`)
        .then(res => {
           if (res.data && res.data.current) setWeatherData(res.data.current);
        })
        .catch(() => {});
        
      // Fetch Route
      setFlightRouteData(null);
      if (selectedFlight.flightNumber && selectedFlight.flightNumber !== 'Unknown') {
        axios.get(`${API_URL}/api/route/${selectedFlight.flightNumber}`)
          .then(res => {
             if (res.data) setFlightRouteData(res.data);
          })
          .catch(() => {});
      }
    } else {
      setFlightPhotoUrl(null);
      setWeatherData(null);
      setFlightRouteData(null);
      setExpandedRoute(null);
    }
  }, [selectedFlight?.id]);
  

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    setMounted(true);
    const int = setInterval(() => setCurrentTime(new Date()), 1000); 
    return () => clearInterval(int); 
  }, []);

  useEffect(() => {
    const socket = io(API_URL);
    socket.on('flights_update', (flights: any[]) => {
      setSelectedFlight((prev: any) => {
        if (!prev) return prev;
        const updated = flights.find(f => f.id === prev.id);
        return updated ? updated : prev;
      });
    });
    return () => { socket.disconnect(); };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: inputValue } as ChatMessage];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/chat`, { 
        messages: newMessages,
        context: { ...selectedFlight, routeData: flightRouteData } 
      });
      if (res.data && res.data.content) setMessages([...newMessages, { role: 'assistant', content: res.data.content }]);
    } catch (e: any) {
      if (e.response && e.response.status === 429) {
         setMessages([...newMessages, { role: 'assistant', content: "SYSTEM ALERT: The OpenAI API Key provided has exhausted its credits/quota. Please supply a funded API key to restore AI features.", isError: true }]);
      } else {
         setMessages([...newMessages, { role: 'assistant', content: "An error occurred handling the AI API API error or missing backend parameters.", isError: true }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (unixTimestamp: number) => {
    if (!unixTimestamp) return 'Just now';
    const seconds = Math.floor(Date.now()/1000 - unixTimestamp);
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds/60)}m ago`;
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-6 glass-panel border-b-0 z-10">
        <div className="flex items-center gap-2">
          <Plane className="w-6 h-6 text-yellow-400" />
          <span className="font-bold text-xl tracking-tight">FlightAI</span>
        </div>
        
        <div className="flex-1 max-w-xl mx-8">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-yellow-400 transition-colors" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={isSearching ? "Searching Global Database..." : "Search flight, route, airport..."}
              disabled={isSearching}
              className={`w-full h-10 bg-black/40 border ${searchError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/50'} rounded-full pl-10 pr-4 text-sm outline-none focus:ring-1 transition-all placeholder:text-muted-foreground/70 text-white disabled:opacity-50`}
            />
            {searchError && <span className="absolute -bottom-5 left-4 text-[10px] text-red-400 font-medium">{searchError}</span>}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
            LIVE
          </div>
          <div className="text-muted-foreground border-r border-white/10 pr-5 text-sm font-mono">{mounted ? currentTime.toLocaleTimeString() : '\u00A0'}</div>
          <div className="w-8 h-8 rounded-full border border-white/10 bg-gradient-to-tr from-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.3)]"></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL - ACTIVE TRACKING DETAILS */}
        <div className="w-[420px] h-full flex flex-col glass-panel border-r border-t-0 p-5 gap-4 overflow-y-auto z-10">
          <div className="flex items-center justify-between mb-2">
             <h2 className="font-semibold text-lg flex items-center gap-2 text-white">
               <Activity className="w-5 h-5 text-yellow-500" /> Deep Telemetry
             </h2>
             <span className="text-xs text-muted-foreground uppercase tracking-widest">ADS-B Stream</span>
          </div>

          {airportData ? (
            <div className="flex flex-col gap-4">
              <div className="bg-gradient-to-br from-[#121826] to-[#0A0D15] rounded-3xl p-5 border border-white/10 relative shadow-2xl overflow-hidden flex flex-col gap-4">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full"></div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border border-white/20">
                     <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="z-10 relative text-right">
                     <div className="text-[10px] text-blue-400 uppercase tracking-widest font-bold mb-1">Airport Geocoded</div>
                     <h3 className="font-black text-3xl leading-none">{airportData.iata || 'N/A'}</h3>
                  </div>
                </div>
                <div className="z-10 relative">
                  <h4 className="text-xl font-bold text-white mb-1">{airportData.name}</h4>
                  <div className="text-sm font-medium text-gray-400">{airportData.city}, {airportData.country}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">ICAO Code</span>
                    <span className="font-mono text-white text-lg">{airportData.icao || 'None'}</span>
                 </div>
                 <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Elevation</span>
                    <span className="font-mono text-white text-lg">{airportData.elevation ? `${airportData.elevation}m` : 'N/A'}</span>
                 </div>
                 <div className="col-span-2 bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Timezone</span>
                    <span className="font-mono text-white text-lg">{airportData.timezone || 'Unknown'}</span>
                 </div>
                 <div className="col-span-2 bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-1 hover:border-white/10 transition-colors">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Global Coordinates</span>
                    <span className="font-mono text-green-400 text-sm tracking-widest">{airportData.lat.toFixed(4)}°, {airportData.lng.toFixed(4)}°</span>
                 </div>
              </div>
            </div>
          ) : selectedFlight ? (
            <div className="flex flex-col gap-4">
               {/* Primary Identifier */}
               <div className="bg-gradient-to-br from-[#121826] to-[#0A0D15] rounded-3xl p-5 border border-white/10 relative shadow-2xl overflow-hidden flex flex-col gap-4">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 blur-[50px] rounded-full"></div>
                  
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-lg transform -rotate-12 z-10 relative">
                           <Plane className="w-7 h-7 text-yellow-500 transform rotate-12" />
                        </div>
                        <div className="z-10 relative">
                           <div className="text-[10px] text-yellow-500 uppercase tracking-widest font-bold mb-1">Target Acquired</div>
                           <h3 className="font-black text-3xl leading-none">{selectedFlight.flightNumber || 'Unknown'}</h3>
                        </div>
                     </div>
                     <span className="px-3 py-1.5 rounded-lg bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-widest z-10 relative">Airborne</span>
                  </div>

                  {/* Aircraft Image */}
                  <div className="w-full h-40 rounded-xl overflow-hidden relative border border-white/5 bg-black/40 z-10 flex items-center justify-center group">
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground z-0">
                      <Plane className="w-8 h-8 mb-2 opacity-30" />
                      <span className="text-[10px] uppercase tracking-widest opacity-50">No Photographic Data</span>
                    </div>
                    {flightPhotoUrl && (
                      <img 
                        key={flightPhotoUrl}
                        src={flightPhotoUrl} 
                        alt={`Aircraft ${selectedFlight.id}`} 
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity relative z-10 block"
                        onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                      />
                    )}
                  </div>

                  <div className="text-sm font-medium text-gray-300 z-10 relative">
                     <span className="text-gray-500">Origin / Registration: </span> 
                     <span className="font-bold text-white">{selectedFlight.airline}</span>
                  </div>
               </div>

               {/* Route Information */}
               {flightRouteData && (
                 <div className="flex flex-col gap-2">
                   <div className="flex gap-2">
                      <div 
                        onClick={() => setExpandedRoute(expandedRoute === 'origin' ? null : 'origin')}
                        className={`flex-1 bg-black/40 rounded-2xl p-4 border flex flex-col gap-1 relative overflow-hidden group border-l-4 border-l-yellow-500 cursor-pointer hover:bg-white/5 transition-colors ${expandedRoute === 'origin' ? 'border-white/20' : 'border-white/5'}`}>
                         <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><MapPin className="w-3 h-3 text-yellow-500"/> Origin</span>
                         <span className="font-bold text-white leading-tight mt-1 truncate">{flightRouteData.origin}</span>
                         <span className="font-mono text-xs text-yellow-500/80">{flightRouteData.originIata} / {flightRouteData.originIcao}</span>
                      </div>
                      <div 
                        onClick={() => setExpandedRoute(expandedRoute === 'destination' ? null : 'destination')}
                        className={`flex-1 bg-black/40 rounded-2xl p-4 border flex flex-col gap-1 relative overflow-hidden group border-l-4 border-l-green-500 cursor-pointer hover:bg-white/5 transition-colors ${expandedRoute === 'destination' ? 'border-white/20' : 'border-white/5'}`}>
                         <span className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1"><Flag className="w-3 h-3 text-green-500"/> Destination</span>
                         <span className="font-bold text-white leading-tight mt-1 truncate">{flightRouteData.destination}</span>
                         <span className="font-mono text-xs text-green-500/80">{flightRouteData.destinationIata} / {flightRouteData.destinationIcao}</span>
                      </div>
                   </div>
                   
                   {/* Expanded Route Details */}
                   {expandedRoute && (
                     <div className={`p-4 rounded-2xl border bg-black/60 shadow-inner flex flex-col gap-3 relative ${expandedRoute === 'origin' ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                           {expandedRoute === 'origin' ? <MapPin className="w-20 h-20" /> : <Flag className="w-20 h-20" />}
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/10 pb-2 flex items-center gap-2">
                          {expandedRoute === 'origin' ? <span className="text-yellow-500">Origin Details</span> : <span className="text-green-500">Destination Details</span>}
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm z-10 w-full relative">
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase text-gray-500 tracking-wider">City / Region</span>
                              <span className="font-semibold text-gray-200">
                                {flightRouteData[`${expandedRoute}Timezone`] ? flightRouteData[`${expandedRoute}Timezone`].split('/').pop().replace(/_/g, ' ') : 'Unknown'}
                              </span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase text-gray-500 tracking-wider">Airport Full Name</span>
                              <span className="font-semibold text-gray-200 truncate pr-2" title={flightRouteData[expandedRoute]}>{flightRouteData[expandedRoute]}</span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase text-gray-500 tracking-wider">Terminal</span>
                              <span className="font-mono text-white">{flightRouteData[`${expandedRoute}Terminal`] || 'TBD'}</span>
                           </div>
                           <div className="flex flex-col gap-1">
                              <span className="text-[10px] uppercase text-gray-500 tracking-wider">Gate</span>
                              <span className="font-mono text-white">{flightRouteData[`${expandedRoute}Gate`] || 'TBD'}</span>
                           </div>
                        </div>
                     </div>
                   )}
                 </div>
               )}

               {/* Metric Grid */}
               <div className="grid grid-cols-2 gap-3">
                  <MetricCard icon={<ArrowUp className="w-4 h-4 text-primary" />} label="Altitude" value={`${selectedFlight.altitude.toLocaleString()} ft`} />
                  <MetricCard icon={<Activity className="w-4 h-4 text-green-400" />} label="Ground Speed" value={`${selectedFlight.speed} km/h`} />
                  <MetricCard icon={<Compass className="w-4 h-4 text-purple-400" />} label="True Heading" value={`${Math.round(selectedFlight.heading)}°`} />
                  <MetricCard icon={<Zap className="w-4 h-4 text-yellow-400" />} label="Vertical Rate" value={selectedFlight.verticalRate ? `${selectedFlight.verticalRate} m/s` : 'Level'} />
               </div>

               {/* Additional Geographic Info */}
               <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-400">Live Latitude</span>
                     <span className="font-mono text-sm">{selectedFlight.lat.toFixed(4)}°</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-400">Live Longitude</span>
                     <span className="font-mono text-sm">{selectedFlight.lng.toFixed(4)}°</span>
                  </div>
                  <div className="h-[1px] w-full bg-white/10"></div>
                  <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-400">Signal Ping</span>
                     <span className="text-sm font-medium flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                       {timeAgo(selectedFlight.lastContact)}
                     </span>
                  </div>
               </div>

                {/* Meteorological Data */}
                {weatherData && (
                  <div className="bg-gradient-to-br from-[#121826]/80 to-[#0A0D15]/80 rounded-2xl p-5 border border-blue-500/10 space-y-4">
                     <h3 className="text-xs text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
                       <Cloud className="w-4 h-4" /> Ground Weather Below Aircraft
                     </h3>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                           <span className="text-xs text-gray-500 flex items-center gap-1"><Thermometer className="w-3 h-3"/> Ground Temp</span>
                           <span className="font-mono text-lg">{weatherData.temperature_2m}°C</span>
                        </div>
                        <div className="flex flex-col gap-1">
                           <span className="text-xs text-gray-500 flex items-center gap-1"><Wind className="w-3 h-3"/> Surface Wind</span>
                           <span className="font-mono text-lg">{weatherData.wind_speed_10m} km/h</span>
                        </div>
                     </div>
                     <div className="flex flex-col gap-1 mt-2">
                        <span className="text-xs text-gray-500">Weather Synopsis</span>
                        <span className="text-sm font-medium text-white">{
                          weatherData.weather_code === 0 ? 'Clear sky' : 
                          weatherData.weather_code <= 3 ? 'Partly cloudy' : 
                          weatherData.weather_code < 50 ? 'Fog / Haze' : 
                          weatherData.weather_code < 70 ? 'Rain / Drizzle' : 
                          weatherData.weather_code < 80 ? 'Snow' : 'Thunderstorm'
                        }</span>
                     </div>
                  </div>
                )}

               {/* Trajectory message */}
               <p className="text-xs text-center text-muted-foreground mt-2">
                 Map shows flight trajectory. Data provided by OpenSky Network.
               </p>
            </div>
          ) : (
            <div className="flex-1 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-black/20">
               <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                 <Navigation className="w-6 h-6 opacity-60" />
               </div>
               <h3 className="font-semibold text-white mb-2">No Target Selected</h3>
               <p className="text-sm px-8 text-center text-gray-500">Tap an aircraft on the radar map to lock onto its transponder and view trajectory details.</p>
            </div>
          )}
        </div>

        {/* CENTER PANEL - MAP */}
        <div className="flex-1 h-full relative border-l border-r border-white/5">
           <Map onFlightSelect={setSelectedFlight} selectedFlightId={selectedFlight?.id} targetPos={targetPos} />
        </div>

        {/* RIGHT PANEL - AI */}
        <div className="w-[400px] h-full flex flex-col glass-panel border-l border-t-0 z-10 shadow-[-2px_0_20px_rgba(0,0,0,0.5)] bg-card/95">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold text-xl">Hello, <span className="text-yellow-400">Aman</span></h2>
            <p className="text-sm text-muted-foreground mt-1">Ready to assist with flight data.</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin">
             {messages.map((msg, idx) => (
               <div key={idx} className={cn("flex flex-col gap-1 w-[85%]", msg.role === 'user' ? "self-end items-end" : "self-start")}>
                 <div className={cn("text-sm p-4 rounded-2xl leading-relaxed shadow-sm", 
                   msg.role === 'user' 
                     ? "bg-yellow-500/20 border border-yellow-500/30 rounded-tr-sm text-yellow-50" 
                     : msg.isError 
                        ? "bg-red-500/10 border border-red-500/30 text-red-200 rounded-tl-sm flex gap-2 items-start"
                        : "bg-white/5 border border-white/10 rounded-tl-sm text-gray-200"
                 )}>
                   {msg.isError && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                   <div>{msg.content}</div>
                 </div>
               </div>
             ))}
             {loading && (
               <div className="self-start text-sm p-3.5 bg-white/5 rounded-2xl rounded-tl-sm border border-white/5 w-16 flex justify-center"><span className="animate-pulse">...</span></div>
             )}
             <div ref={messagesEndRef} />
          </div>

          <div className="p-5 mt-auto bg-black/20">
            <div className="relative group flex items-center">
              <input 
                type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI an aviation question..."
                className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all placeholder:text-muted-foreground/50 text-white"
              />
              <div className="absolute right-2 flex items-center">
                <button onClick={handleSendMessage} className="w-8 h-8 rounded-lg bg-yellow-500 text-black flex items-center justify-center hover:bg-yellow-400 transition-colors">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-black/30 rounded-2xl p-4 border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center mb-1">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{label}</p>
        <p className="font-bold text-lg text-white">{value}</p>
      </div>
    </div>
  )
}
