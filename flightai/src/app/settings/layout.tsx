"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, Shield, ArrowLeft, Loader2, LogOut } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-aervyn-bg-dark flex items-center justify-center font-labels">
        <Loader2 className="w-8 h-8 text-aervyn-status-cyan animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // The AuthContext will automatically redirect to login
  }

  const tabs = [
    { name: "Profile Clearance", path: "/settings/profile", icon: User },
    { name: "Security Protocols", path: "/settings/security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-aervyn-bg-dark flex flex-col pt-[50px] font-labels relative">
      {/* Settings Header */}
      <div className="bg-aervyn-panel-base border-b border-aervyn-border-subtle py-8 px-6 sm:px-12 relative overflow-hidden pointer-events-auto">
        <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-5xl mx-auto flex flex-col gap-4 relative z-10">
          <Link href="/dashboard" className="inline-flex items-center text-[9px] text-aervyn-text-tertiary font-bold uppercase tracking-widest hover:text-aervyn-text-primary transition-colors w-fit">
            <ArrowLeft className="w-3 h-3 mr-1" /> Return to Command
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-none border border-aervyn-status-cyan overflow-hidden shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=020617&color=38BDF8`} alt="Profile" className="w-full h-full object-cover grayscale mix-blend-screen opacity-90" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-aervyn-text-primary uppercase tracking-[0.2em] drop-shadow-md">{user.name}</h1>
              <p className="text-aervyn-status-cyan mt-1 text-[10px] uppercase tracking-widest font-bold drop-shadow-[0_0_5px_rgba(56,189,248,0.3)]">OP_ID: @{user.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-12 flex flex-col md:flex-row gap-8 pointer-events-auto">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <h3 className="text-[9px] font-bold text-aervyn-text-tertiary uppercase tracking-[0.2em] mb-2 px-3 border-b border-aervyn-border-subtle pb-2">System Config</h3>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex items-center gap-3 px-4 py-3 rounded transition-all text-[10px] font-bold uppercase tracking-widest ${
                  isActive 
                    ? "bg-aervyn-status-cyan/20 text-aervyn-status-cyan border border-aervyn-status-cyan shadow-[0_0_8px_rgba(56,189,248,0.2)]" 
                    : "text-aervyn-text-secondary border border-transparent hover:border-aervyn-border-subtle hover:text-aervyn-text-primary hover:bg-aervyn-panel-light"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-aervyn-status-cyan" : "text-aervyn-text-tertiary"}`} />
                {tab.name}
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-3 justify-start px-4 py-3 border border-transparent hover:border-aervyn-status-red hover:bg-aervyn-status-red/10 text-aervyn-status-red rounded transition-all text-[10px] font-bold uppercase tracking-widest mt-4 group"
          >
            <LogOut className="w-4 h-4 group-hover:drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
            TERMINATE SESSION
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-aervyn-panel-base border border-aervyn-border-subtle rounded p-6 sm:p-10 relative overflow-hidden shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}
