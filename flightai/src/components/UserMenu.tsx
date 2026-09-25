"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, Settings, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
  const { user, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse border-2 border-white/5"></div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-8 h-8 rounded-full overflow-hidden transition-all cursor-pointer border ${user ? 'border-[#155EEF]' : 'border-slate-800 opacity-50 hover:opacity-100'} p-0`}
      >
        {user ? (
          <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=020617&color=38BDF8`} alt="Profile" className="w-full h-full object-cover grayscale mix-blend-screen opacity-90" />
        ) : (
          <div className="w-full h-full bg-aervyn-bg-dark flex items-center justify-center">
            <span className="text-aervyn-text-tertiary text-xs font-bold font-mono">?</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-10 right-0 w-64 bg-aervyn-bg-dark border border-slate-800 rounded-lg shadow-xl overflow-hidden z-50">
          {user ? (
            <>
              <div className="p-4 border-b border-slate-800 bg-[#0F172A] relative overflow-hidden">
                <p className="font-semibold text-white truncate text-sm relative z-10">{user.name}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5 relative z-10">@{user.username}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors rounded-md">
                  <Settings size={16} className="text-slate-400" /> Settings
                </Link>
              </div>
              <div className="p-2 border-t border-slate-800">
                <button 
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-md"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div className="pb-3 border-b border-slate-800">
                <p className="text-sm text-slate-400">Sign in to sync your telemetry data.</p>
              </div>
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full bg-[#155EEF] hover:bg-[#1D6FFF] text-white transition-colors text-sm font-medium py-2 rounded-lg">
                <LogIn size={16} /> Sign in
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium py-2 rounded-lg">
                <UserPlus size={16} /> Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
