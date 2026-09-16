"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, Shield, ArrowLeft, Loader2, LogOut } from "lucide-react";
import { CockpitButton } from "@/components/ui/CockpitButton";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cockpit-black)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-horizon-blue)] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null; // The AuthContext will automatically redirect to login
  }

  const tabs = [
    { name: "Profile", path: "/settings/profile", icon: User },
    { name: "Security", path: "/settings/security", icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cockpit-black)] flex flex-col pt-16 font-[family-name:var(--font-labels)]">
      {/* Settings Header */}
      <div className="bg-[#050505] border-b border-[var(--color-instrument-grey)] py-8 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <Link href="/dashboard" className="inline-flex items-center text-[10px] text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] uppercase tracking-widest hover:text-[var(--color-instrument-white)] transition-colors w-fit">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-none border border-[var(--color-instrument-grey)] overflow-hidden">
              <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0088CC&color=FFF`} alt="Profile" className="w-full h-full object-cover grayscale opacity-80" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white uppercase tracking-widest">{user.name}</h1>
              <p className="text-[var(--color-instrument-grey)] mt-1 uppercase tracking-widest">@{user.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-12 flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <h3 className="text-[10px] font-bold text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] uppercase tracking-widest mb-2 px-3 border-b border-[var(--color-instrument-grey)] pb-2">Account Settings</h3>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all text-sm uppercase tracking-widest ${
                  isActive 
                    ? "bg-[var(--color-horizon-blue)] text-white border border-[var(--color-horizon-blue)]" 
                    : "text-[var(--color-instrument-grey)] border border-transparent hover:border-[var(--color-instrument-grey)]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[var(--color-instrument-grey)]"}`} />
                {tab.name}
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <CockpitButton
            variant="selector"
            onClick={logout}
            className="flex items-center gap-3 justify-start px-4 py-3 border border-transparent hover:border-[var(--color-warning-red)] text-[var(--color-warning-red)] hover:text-white mt-4"
          >
            <LogOut className="w-4 h-4" />
            LOG OUT
          </CockpitButton>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] p-6 sm:p-10 relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
