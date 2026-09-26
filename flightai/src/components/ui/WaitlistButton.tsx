"use client";

import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface WaitlistButtonProps {
  className?: string;
}

export default function WaitlistButton({ className = '' }: WaitlistButtonProps) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    setAdded(true);
    // In a real app, this would hit an API
    setTimeout(() => {
      setAdded(false);
    }, 3000);
  };

  return (
    <button 
      onClick={handleClick}
      disabled={added}
      className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
        added 
          ? 'bg-aervyn-status-success/20 text-aervyn-status-success border border-aervyn-status-success/50' 
          : className
      }`}
    >
      {added ? (
        <>
          <Check className="w-4 h-4" /> Added to Waitlist
        </>
      ) : (
        "Join Waitlist"
      )}
    </button>
  );
}
