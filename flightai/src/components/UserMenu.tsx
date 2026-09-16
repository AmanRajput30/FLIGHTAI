import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, Settings, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { CockpitButton } from './ui/CockpitButton';

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
      <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse border-2 border-white/5"></div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <CockpitButton 
        onClick={() => setIsOpen(!isOpen)} 
        variant="icon"
        className={`w-9 h-9 !p-0 overflow-hidden shadow-none transition-all cursor-pointer ${user ? 'border-[var(--color-horizon-blue)]' : ''}`}
      >
        {user ? (
          <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0088CC&color=fff`} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center">
            <span className="text-[var(--color-instrument-grey)] text-xs font-bold font-[family-name:var(--font-numerals)]">?</span>
          </div>
        )}
      </CockpitButton>

      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.8)] overflow-hidden z-50">
          {user ? (
            <>
              <div className="p-4 border-b border-[var(--color-instrument-grey)] bg-[#050505]">
                <p className="font-bold text-white truncate font-[family-name:var(--font-labels)]">{user.name}</p>
                <p className="text-xs text-[var(--color-horizon-blue)] truncate font-[family-name:var(--font-numerals)]">@{user.username}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <CockpitButton as={Link} href="/settings" onClick={() => setIsOpen(false)} variant="selector" className="justify-start border-none h-10 hover:bg-[#111]">
                  <Settings size={14} strokeWidth={1.5} className="mr-2" /> Settings & Profile
                </CockpitButton>
                <CockpitButton as={Link} href="/settings/security" onClick={() => setIsOpen(false)} variant="selector" className="justify-start border-none h-10 hover:bg-[#111]">
                  <Shield size={14} strokeWidth={1.5} className="mr-2" /> Security
                </CockpitButton>
              </div>
              <div className="p-2 border-t border-[var(--color-instrument-grey)]">
                <CockpitButton 
                  onClick={() => { setIsOpen(false); logout(); }}
                  variant="selector"
                  className="w-full justify-start border-none h-10 hover:bg-[#111] text-[var(--color-warning-red)] hover:text-[var(--color-warning-red)]"
                >
                  <LogOut size={14} strokeWidth={1.5} className="mr-2" /> Sign Out
                </CockpitButton>
              </div>
            </>
          ) : (
            <div className="p-4 flex flex-col gap-3">
              <div className="pb-3 border-b border-[var(--color-instrument-grey)]">
                <p className="text-xs text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] leading-relaxed">Sign in to save flights and sync settings.</p>
              </div>
              <CockpitButton as={Link} href="/login" onClick={() => setIsOpen(false)} variant="action" className="w-full">
                <LogIn size={14} strokeWidth={1.5} className="mr-2" /> Sign In
              </CockpitButton>
              <CockpitButton as={Link} href="/register" onClick={() => setIsOpen(false)} variant="selector" className="w-full border-dashed">
                <UserPlus size={14} strokeWidth={1.5} className="mr-2" /> Create Account
              </CockpitButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
