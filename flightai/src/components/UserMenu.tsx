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
    <div className="relative font-labels" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-8 h-8 rounded-full overflow-hidden shadow-none transition-all cursor-pointer border ${user ? 'border-aervyn-status-cyan shadow-[0_0_8px_rgba(56,189,248,0.3)]' : 'border-aervyn-border-subtle opacity-50 hover:opacity-100'} p-0`}
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
        <div className="absolute top-10 right-0 w-64 bg-aervyn-panel-base border border-aervyn-border-subtle rounded shadow-[0_4px_20px_rgba(0,0,0,0.8)] overflow-hidden z-50">
          {user ? (
            <>
              <div className="p-4 border-b border-aervyn-border-subtle bg-aervyn-bg-dark relative overflow-hidden">
                <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
                <p className="font-extrabold text-aervyn-text-primary truncate uppercase tracking-widest text-[10px] drop-shadow-md relative z-10">{user.name}</p>
                <p className="text-[9px] text-aervyn-status-cyan truncate uppercase tracking-widest font-bold mt-1 relative z-10">OP_ID: @{user.username}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[9px] font-bold text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light uppercase tracking-widest transition-colors rounded">
                  <Settings size={12} className="text-aervyn-text-tertiary" /> CONFIGURATION
                </Link>
                <Link href="/settings/security" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[9px] font-bold text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light uppercase tracking-widest transition-colors rounded">
                  <Shield size={12} className="text-aervyn-text-tertiary" /> PROTOCOLS
                </Link>
              </div>
              <div className="p-2 border-t border-aervyn-border-subtle">
                <button 
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[9px] font-bold text-aervyn-status-red hover:text-white hover:bg-aervyn-status-red uppercase tracking-widest transition-colors rounded"
                >
                  <LogOut size={12} /> TERMINATE
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div className="pb-3 border-b border-aervyn-border-subtle">
                <p className="text-[9px] text-aervyn-text-tertiary font-bold uppercase tracking-widest leading-relaxed">Authorize to sync telemetry data.</p>
              </div>
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full bg-aervyn-status-cyan/20 border border-aervyn-status-cyan text-aervyn-status-cyan hover:bg-aervyn-status-cyan hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest py-2 rounded">
                <LogIn size={12} /> AUTHORIZE
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full border border-aervyn-border-subtle border-dashed text-aervyn-text-secondary hover:text-aervyn-text-primary hover:border-aervyn-text-tertiary hover:bg-aervyn-panel-light transition-colors text-[9px] font-bold uppercase tracking-widest py-2 rounded">
                <UserPlus size={12} /> REGISTER
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
