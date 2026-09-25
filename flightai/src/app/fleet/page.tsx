"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';
import { Search, Filter, Plane, Activity, AlertTriangle, Settings, Plus, ChevronDown } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';
import { useRouter } from 'next/navigation';

export default function FleetPage() {
  const { flights, setSelectedFlight, setFlights, myFleetIds, setFocusedFlightId, setTargetPos } = useFlightStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterOptions = ['All', 'My Fleet', 'Active', 'Grounded', 'Commercial'];
  
  useEffect(() => {
    const fetchLiveFlights = async () => {
      try {
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
              originCountry: p[2],
              lat: p[6],
              lng: p[5],
              heading: p[10] || 0,
              speed: p[9] ? Math.round(p[9] * 1.94384) : 0, 
              altitude: p[7] ? Math.round(p[7] * 3.28084) : 0, 
              verticalRate: p[11] ? Math.round(p[11] * 196.85) : 0,
              squawk: p[14],
              onGround: p[8],
              geoAltitude: p[13] ? Math.round(p[13] * 3.28084) : undefined,
              timePosition: p[3],
              lastContact: p[4],
              positionSource: p[16],
              spi: p[15],
              sensors: p[12],
              category: 'Commercial',
              status: p[8] ? 'grounded' : 'active'
            }));

          setFlights(newFlights);
        }
      } catch (err) {
        console.error("Failed to fetch live flights:", err);
      }
    };

    if (flights.length === 0) {
      fetchLiveFlights();
    }
    const interval = setInterval(fetchLiveFlights, 10000);
    return () => clearInterval(interval);
  }, [flights.length, setFlights]);
  
  // Generate dynamic fleet data from real API flights (OpenSky)
  // Ensure that flights saved to My Fleet are ALWAYS included, even if outside the top 50
  const myFleetBase = flights.filter(f => myFleetIds.includes(f.id)).concat(
    flights.filter(f => !myFleetIds.includes(f.id)).slice(0, 100) // fetch 100 so we can filter good ones
  );

  // Sort planes so that those with valid country and callsigns appear at the top
  myFleetBase.sort((a, b) => {
    // My Fleet items always at top
    if (myFleetIds.includes(a.id) && !myFleetIds.includes(b.id)) return -1;
    if (!myFleetIds.includes(a.id) && myFleetIds.includes(b.id)) return 1;

    const aHasData = (a.originCountry && a.callsign && a.originCountry !== 'Unknown') ? 1 : 0;
    const bHasData = (b.originCountry && b.callsign && b.originCountry !== 'Unknown') ? 1 : 0;
    
    // Fallback sort by altitude to show actual flying planes
    if (bHasData === aHasData) {
      return (b.altitude || 0) - (a.altitude || 0);
    }
    return bHasData - aHasData;
  });

  const myFleet = myFleetBase.slice(0, 50).map((f) => ({
    id: f.id,
    tailNumber: f.callsign || f.icao24 || 'Unknown',
    type: f.category || 'Commercial',
    status: f.status === 'active' ? 'Active' : 'Grounded',
    country: f.originCountry || 'Unknown',
    altitude: f.altitude ? `${f.altitude.toLocaleString()} ft` : 'Ground',
    speed: f.speed ? `${f.speed} kts` : '0 kts'
  }));

  const filteredFleet = myFleet.filter(ac => {
     if (filterType === 'Active' && ac.status !== 'Active') return false;
     if (filterType === 'Grounded' && ac.status !== 'Grounded') return false;
     if (filterType === 'Commercial' && ac.type !== 'Commercial') return false;
     if (filterType === 'My Fleet' && !myFleetIds.includes(ac.id)) return false;
     if (searchQuery && !(ac.tailNumber || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
     return true;
  });

  const handleTrackLive = (flightId: string) => {
    const flight = flights.find(f => f.id === flightId);
    if (flight) {
        setSelectedFlight(flight);
        setFocusedFlightId(flight.id);
        if (flight.lat && flight.lng) {
          setTargetPos([flight.lat, flight.lng]);
        }
        router.push('/dashboard');
    }
  };

  return (
    <div className="h-screen w-screen bg-aervyn-bg-dark text-aervyn-text-primary overflow-hidden relative flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 lg:mt-[72px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={M_PRESETS.panel}
            className="max-w-7xl mx-auto"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Fleet Management</h1>
                <p className="text-sm text-aervyn-text-dark-secondary">Manage and monitor your registered aircraft.</p>
              </div>
              <div className="flex items-center gap-3 relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="bg-aervyn-surface-dark-elevated hover:bg-aervyn-surface-dark-active border border-aervyn-border-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Filter size={16} />
                  Filter: {filterType}
                  <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-aervyn-surface-dark-elevated border border-aervyn-border-dark rounded-lg shadow-xl z-50 w-40 overflow-hidden flex flex-col">
                    {filterOptions.map(opt => (
                      <button 
                        key={opt}
                        onClick={() => { setFilterType(opt); setIsFilterOpen(false); }}
                        className={`text-left px-4 py-2 text-sm hover:bg-aervyn-primary/20 hover:text-white transition-colors ${filterType === opt ? 'bg-aervyn-primary/10 text-aervyn-primary font-bold' : 'text-aervyn-text-dark-secondary'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark p-5 rounded-xl flex flex-col">
                <span className="text-sm font-medium text-aervyn-text-dark-secondary mb-3 flex items-center gap-2">
                  <Plane size={16} className="text-aervyn-primary" /> Tracked Aircraft
                </span>
                <span className="text-3xl font-bold text-white">{flights.length}</span>
              </div>
              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark p-5 rounded-xl flex flex-col">
                <span className="text-sm font-medium text-aervyn-text-dark-secondary mb-3 flex items-center gap-2">
                  <Activity size={16} className="text-aervyn-status-success" /> Active in Air
                </span>
                <span className="text-3xl font-bold text-white">{flights.filter(f => f.status === 'active').length}</span>
              </div>
              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark p-5 rounded-xl flex flex-col">
                <span className="text-sm font-medium text-aervyn-text-dark-secondary mb-3 flex items-center gap-2">
                  <Settings size={16} className="text-aervyn-status-warning" /> Commercial
                </span>
                <span className="text-3xl font-bold text-white">{flights.filter(f => f.category === 'Commercial').length}</span>
              </div>
              <div className="bg-aervyn-surface-dark border border-aervyn-border-dark p-5 rounded-xl flex flex-col">
                <span className="text-sm font-medium text-aervyn-text-dark-secondary mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-aervyn-status-red" /> Grounded
                </span>
                <span className="text-3xl font-bold text-white">{flights.filter(f => f.status === 'grounded').length}</span>
              </div>
            </div>

            {/* List Section */}
            <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-aervyn-border-dark flex items-center justify-between">
                <div className="relative w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-aervyn-text-dark-muted" />
                  <input 
                    type="text" 
                    placeholder="Search tail number or type..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-aervyn-text-dark-muted focus:outline-none focus:border-aervyn-primary focus:ring-1 focus:ring-aervyn-primary transition-all"
                  />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-aervyn-surface-dark-elevated text-aervyn-text-dark-secondary text-xs uppercase font-medium">
                    <tr>
                      <th className="px-6 py-4">Tail Number</th>
                      <th className="px-6 py-4">Aircraft Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Country</th>
                      <th className="px-6 py-4">Altitude</th>
                      <th className="px-6 py-4">Speed</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aervyn-border-dark text-white">
                    {filteredFleet.map((ac) => (
                      <tr key={ac.id} className="hover:bg-aervyn-surface-dark-active transition-colors group">
                        <td className="px-6 py-4 font-bold">{ac.tailNumber}</td>
                        <td className="px-6 py-4 text-aervyn-text-dark-secondary">{ac.type}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                            ac.status === 'Active' 
                              ? 'bg-aervyn-status-success/10 text-aervyn-status-success border border-aervyn-status-success/20' 
                              : 'bg-aervyn-status-red/10 text-aervyn-status-red border border-aervyn-status-red/20'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${ac.status === 'Active' ? 'bg-aervyn-status-success' : 'bg-aervyn-status-red'}`}></span>
                            {ac.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-aervyn-text-dark-secondary truncate max-w-[150px]" title={ac.country}>{ac.country}</td>
                        <td className="px-6 py-4 text-aervyn-text-dark-secondary font-mono text-xs">{ac.altitude}</td>
                        <td className="px-6 py-4 text-aervyn-text-dark-secondary font-mono text-xs">{ac.speed}</td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleTrackLive(ac.id)}
                            className="text-aervyn-primary hover:text-aervyn-primary-light text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity bg-aervyn-primary/10 px-3 py-1.5 rounded"
                          >
                            Track Live
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
