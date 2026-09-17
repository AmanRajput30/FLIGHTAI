"use client";

import { useState } from 'react';
import { Search } from 'lucide-react';
import { useFlightStore } from '@/store/useFlightStore';
import { useAuth } from '@/context/AuthContext';
import { flightApi } from '@/lib/api';
import { CockpitButton } from '../ui/CockpitButton';

export default function GlobalSearch() {
  const { user } = useAuth();
  const { setSelectedFlight, setFocusedFlightId, setAirportData, setTargetPos } = useFlightStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const executeSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res: any = await flightApi.getSearch(searchQuery);
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
    } catch {
      setSearchError("Search failed.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeSearch();
    }
  };

  return (
    <div className="relative group flex items-center h-10 w-full">
      <div className="relative flex-1 h-full">
        <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-instrument-grey)] group-focus-within:text-[var(--color-instrument-white)] transition-colors" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder={!user ? "Sign in to search" : isSearching ? "Searching..." : "Search flight, route..."}
          disabled={!user || isSearching}
          className={`w-full h-full bg-[var(--color-cockpit-black)] border-y border-l ${searchError ? 'border-[var(--color-warning-red)] focus:border-[var(--color-warning-red)]' : 'border-[var(--color-instrument-grey)] focus:border-[var(--color-horizon-blue)]'} rounded-none pl-9 pr-4 text-sm outline-none focus:ring-0 transition-all placeholder:text-[var(--color-instrument-grey)] text-[var(--color-instrument-white)] disabled:opacity-50 ${!user ? 'cursor-not-allowed' : ''}`}
        />
      </div>
      <CockpitButton 
        variant="action" 
        onClick={executeSearch} 
        disabled={!user || isSearching || !searchQuery.trim()}
        className="h-full rounded-l-none border-l-0 px-3"
      >
        Search
      </CockpitButton>
      {searchError && <span className="absolute -bottom-5 left-0 text-[10px] text-[var(--color-warning-red)] font-bold">{searchError}</span>}
    </div>
  );
}
