"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';
import { useAuth } from '@/context/AuthContext';
import { flightApi } from '@/lib/api';

export default function GlobalSearch() {
  const { user } = useAuth();
  const { setSelectedFlight, setFocusedFlightId, setAirportData, setTargetPos } = useFlightStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await flightApi.getSearch(searchQuery);
        if (res && res.type === 'flight') {
            setSelectedFlight(res.data);
            setFocusedFlightId(res.data.id);
            setAirportData(null);
            setTargetPos([res.data.lat, res.data.lng]);
        } else if (res && res.type === 'airport') {
            setAirportData(res.data);
            setSelectedFlight(null);
            setFocusedFlightId(null);
            setTargetPos([res.data.lat, res.data.lng]);
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

  return (
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-yellow-400 transition-colors" />
      <input 
        type="text" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleSearch}
        placeholder={!user ? "Sign in to search flights" : isSearching ? "Searching Global Database..." : "Search flight, route, airport..."}
        disabled={!user || isSearching}
        className={`w-full h-10 bg-black/40 border ${searchError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-white/10 focus:border-yellow-400/50 focus:ring-yellow-400/50'} rounded-full pl-10 pr-4 text-sm outline-none focus:ring-1 transition-all placeholder:text-muted-foreground/70 text-white disabled:opacity-50 ${!user ? 'cursor-not-allowed' : ''}`}
      />
      {searchError && <span className="absolute -bottom-5 left-4 text-[10px] text-red-400 font-medium">{searchError}</span>}
    </div>
  );
}
