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
    <div className="relative group flex items-center h-10 w-full max-w-sm">
      <div className="relative flex-1 h-full">
        <Search size={16} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-aervyn-text-dark-muted group-focus-within:text-aervyn-primary transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={!user ? "Authentication Required" : isSearching ? "Scanning Airspace..." : "Search flights or airports..."}
          disabled={!user || isSearching}
          className={`w-full h-full bg-aervyn-bg-dark/50 border ${searchError ? 'border-red-500/50 focus:border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-aervyn-border-dark focus:border-aervyn-primary/50 hover:border-aervyn-border-dark-subtle text-white focus:bg-aervyn-surface-dark shadow-inner'} rounded-xl pl-11 pr-12 text-sm outline-none focus:ring-4 focus:ring-aervyn-primary/10 transition-all placeholder:text-aervyn-text-dark-muted disabled:opacity-50 ${!user ? 'cursor-not-allowed' : ''}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium text-aervyn-text-dark-muted bg-aervyn-surface-dark border border-aervyn-border-dark rounded opacity-70">⌘</kbd>
          <kbd className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium text-aervyn-text-dark-muted bg-aervyn-surface-dark border border-aervyn-border-dark rounded opacity-70">K</kbd>
        </div>
      </div>
      {searchError && <span className="absolute -bottom-5 left-3 text-[10px] text-red-500 font-medium">{searchError}</span>}
    </div>
  );
}
