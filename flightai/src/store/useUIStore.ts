import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      systemStatus: 'live',
      mapMode: 'satellite',
      performanceMode: false,
      uiVisible: true,

      setSystemStatus: (status) => set({ systemStatus: status }),
      setMapMode: (mode) => set({ mapMode: mode }),
      setPerformanceMode: (mode) => set({ performanceMode: mode }),
      setUiVisible: (visible) => set({ uiVisible: visible }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ mapMode: state.mapMode, performanceMode: state.performanceMode }),
    }
  )
);
