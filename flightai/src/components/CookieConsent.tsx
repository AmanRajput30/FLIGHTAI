"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { CockpitButton } from './ui/CockpitButton';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('averyn_cookie_consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('averyn_cookie_consent', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pb-6 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-black/90 border border-white/20 rounded-2xl shadow-2xl p-6 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none"></div>
        <div className="flex-1 relative z-10">
          <h3 className="text-white font-bold mb-2">We respect your privacy</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Averyn uses cookies to ensure basic platform functionality (like authentication and sessions). We do not use third-party advertising cookies or track you across the web. 
            By continuing to use our site, you agree to our <Link href="/privacy" className="text-yellow-400 hover:underline">Privacy Policy</Link> and <Link href="/terms" className="text-yellow-400 hover:underline">Terms of Service</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <CockpitButton 
            onClick={handleAccept}
            variant="action"
            className="w-full md:w-auto"
          >
            Accept & Continue
          </CockpitButton>
          <CockpitButton 
            onClick={handleAccept}
            variant="icon"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.5} />
          </CockpitButton>
        </div>
      </div>
    </div>
  );
}
