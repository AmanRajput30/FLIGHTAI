"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { User, Shield, ArrowLeft, Loader2 } from "lucide-react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
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
    <div className="min-h-screen bg-[#0d1117] flex flex-col pt-16">
      {/* Settings Header */}
      <div className="bg-[#121826] border-b border-white/5 py-8 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full border-4 border-white/10 overflow-hidden shadow-xl">
              <img src={user.avatar || "/avatar.png"} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{user.name}</h1>
              <p className="text-gray-400 mt-1">@{user.username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-12 flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-3">Account Settings</h3>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.path;
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive 
                    ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-sm" 
                    : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-yellow-500" : "text-gray-500"}`} />
                {tab.name}
              </Link>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
