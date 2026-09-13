import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, UserPlus, Settings, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const { user, loading, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-9 h-9 rounded-full border-2 overflow-hidden shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all cursor-pointer ${user ? 'border-yellow-500/50 hover:border-yellow-400' : 'border-white/20 hover:border-white/40'}`}
      >
        {user ? (
          <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=eab308&color=000`} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-black/60 flex items-center justify-center">
            <span className="text-gray-400 text-xs font-bold">?</span>
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-[#0a0d14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
          {user ? (
            <>
              <div className="p-4 border-b border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                <p className="font-bold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">@{user.username}</p>
              </div>
              <div className="p-2 flex flex-col gap-1">
                <Link href="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-200 transition-colors">
                  <Settings className="w-4 h-4 text-gray-400" /> Settings & Profile
                </Link>
                <Link href="/settings/security" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-200 transition-colors">
                  <Shield className="w-4 h-4 text-gray-400" /> Security
                </Link>
              </div>
              <div className="p-2 border-t border-white/5">
                <button 
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-sm text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="p-2 flex flex-col gap-1">
              <div className="px-3 pt-2 pb-3 mb-1 border-b border-white/5">
                <p className="text-sm text-gray-300">Sign in to save flights and sync settings across devices.</p>
              </div>
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors mt-2">
                <LogIn className="w-4 h-4" /> Sign In
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl hover:bg-white/5 text-sm text-gray-300 font-medium transition-colors">
                <UserPlus className="w-4 h-4 text-gray-400" /> Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
