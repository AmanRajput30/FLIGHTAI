import { create } from 'zustand';

interface UIState {
  systemStatus: 'live' | 'stale';
  mapMode: 'satellite' | 'dark';
  performanceMode: boolean;
  
  setSystemStatus: (status: 'live' | 'stale') => void;
  setMapMode: (mode: 'satellite' | 'dark') => void;
  setPerformanceMode: (mode: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  systemStatus: 'live',
  mapMode: 'dark',
  performanceMode: false,

  setSystemStatus: (status) => set({ systemStatus: status }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setPerformanceMode: (mode) => set({ performanceMode: mode }),
}));
