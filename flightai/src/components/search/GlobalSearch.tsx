"use client";

import { useState, useEffect, useRef } from 'react';
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

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // If query is too short, reset state
    if (searchQuery.trim().length < 3) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const timerId = setTimeout(async () => {
      // Cancel previous pending request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsSearching(true);
      setSearchError(null);

      try {
        const res: any = await flightApi.getSearch(searchQuery, { signal: abortControllerRef.current.signal });
        
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
        } else if (res && res.type === 'not_found') {
            setSearchError(`No flights or airports match '${searchQuery}'`);
        } else {
            setSearchError("No results found.");
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          setSearchError("Search failed.");
        }
      } finally {
        setIsSearching(false);
      }
    }, 600); // 600ms debounce

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const executeSearch = () => {
    // Manual trigger is unnecessary due to auto-search, but we can leave it as a no-op 
    // or trigger a fresh search if we really want to.
  };

  return (
    <div className="relative group flex items-center h-8 w-full font-labels">
      <div className="relative flex-1 h-full">
        <Search size={12} strokeWidth={2} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-aervyn-text-tertiary group-focus-within:text-aervyn-status-cyan transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={!user ? "Authentication Required" : isSearching ? "Scanning Airspace..." : "Enter Callsign, Hex, or Route..."}
          disabled={!user || isSearching}
          className={`w-full h-full bg-aervyn-panel-base border-y border-l ${searchError ? 'border-aervyn-status-red focus:border-aervyn-status-red text-aervyn-status-red' : 'border-aervyn-border-subtle focus:border-aervyn-status-cyan text-aervyn-text-primary'} rounded-l pl-8 pr-3 text-[10px] uppercase tracking-widest outline-none focus:ring-0 transition-all placeholder:text-aervyn-text-tertiary disabled:opacity-50 ${!user ? 'cursor-not-allowed' : ''}`}
        />
      </div>
      <button 
        onClick={executeSearch} 
        disabled={!user || isSearching || !searchQuery.trim()}
        className="h-full px-4 border border-aervyn-border-subtle border-l-0 rounded-r bg-aervyn-panel-light text-aervyn-text-secondary text-[10px] uppercase tracking-widest font-bold hover:bg-aervyn-status-cyan hover:text-white hover:border-aervyn-status-cyan transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-aervyn-panel-light disabled:hover:text-aervyn-text-secondary disabled:hover:border-aervyn-border-subtle"
      >
        Search
      </button>
      {searchError && <span className="absolute -bottom-5 left-0 text-[9px] uppercase tracking-widest text-aervyn-status-red font-bold">{searchError}</span>}
    </div>
  );
}
