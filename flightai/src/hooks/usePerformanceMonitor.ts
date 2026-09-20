import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/useUIStore';

export function usePerformanceMonitor() {
  const fpsRef = useRef<number[]>([]);
  const { performanceMode, setPerformanceMode, setMapMode } = useUIStore();

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      frameCount++;
      const now = performance.now();
      
      // Calculate FPS every 1000ms
      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        fpsRef.current.push(fps);
        
        // Keep only the last 5 readings
        if (fpsRef.current.length > 5) {
          fpsRef.current.shift();
        }
        
        // Calculate average FPS over the last few seconds
        const avgFps = fpsRef.current.reduce((a, b) => a + b, 0) / fpsRef.current.length;
        
        // If FPS drops below 20 consistently over 3 seconds, enable performance mode
        if (avgFps < 20 && fpsRef.current.length >= 3) {
          if (!performanceMode) {
            setPerformanceMode(true);
            setMapMode('dark');
            console.log("Performance mode automatically enabled due to low framerate.");
          }
        }
        
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);
    
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [performanceMode, setPerformanceMode, setMapMode]);
}
