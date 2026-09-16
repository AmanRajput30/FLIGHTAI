"use client";

import React, { useEffect, useState } from 'react';

interface HorizonDividerProps {
  className?: string;
  animateTilt?: boolean; // Whether to trigger the subtle tilt animation
}

export default function HorizonDivider({ className = '', animateTilt = false }: HorizonDividerProps) {
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    if (animateTilt) {
      // Subtle tilt animation like an attitude indicator finding its level
      const initTimer = setTimeout(() => setTilt(Math.random() > 0.5 ? 2 : -2), 0);
      const timer = setTimeout(() => setTilt(0), 150); // settle quickly
      return () => {
        clearTimeout(initTimer);
        clearTimeout(timer);
      };
    }
  }, [animateTilt]);

  return (
    <div 
      className={`h-[2px] w-full flex flex-col overflow-hidden transition-transform duration-300 ease-out ${className}`}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="h-1/2 w-full bg-[var(--color-horizon-blue)]"></div>
      <div className="h-1/2 w-full bg-[var(--color-horizon-brown)]"></div>
    </div>
  );
}
