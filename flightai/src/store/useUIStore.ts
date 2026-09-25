import { create } from 'zustand';

interface UIState {
  systemStatus: 'live' | 'stale';
  mapMode: 'satellite' | 'dark';
  performanceMode: boolean;
  uiVisible: boolean;
  
  setSystemStatus: (status: 'live' | 'stale') => void;
  setMapMode: (mode: 'satellite' | 'dark') => void;
  setPerformanceMode: (mode: boolean) => void;
  setUiVisible: (visible: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  systemStatus: 'live',
  mapMode: 'satellite',
  performanceMode: false,
  uiVisible: true,

  setSystemStatus: (status) => set({ systemStatus: status }),
  setMapMode: (mode) => set({ mapMode: mode }),
  setPerformanceMode: (mode) => set({ performanceMode: mode }),
  setUiVisible: (visible) => set({ uiVisible: visible }),
}));
