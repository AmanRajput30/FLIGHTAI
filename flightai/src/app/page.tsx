"use client";

import Link from "next/link";
import { Plane, Activity, Shield, Map, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/UserMenu";

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-yellow-900/10 blur-[150px]"></div>
      </div>

      {/* Navigation */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 z-20 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Plane className="w-8 h-8 text-yellow-500" />
          <span className="font-bold text-2xl tracking-tight text-white">SkyIntel</span>
        </div>
        
        <div className="flex items-center gap-6">
          {loading ? (
            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse"></div>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hidden sm:flex items-center gap-2 text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-5 py-2.5 rounded-full transition-all">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-5 py-2.5 rounded-full transition-all">
                Create Account
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 pt-16 pb-24">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next-Generation Aviation Intelligence is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-tight mb-6">
          Global Flight Tracking,<br />Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">AI Analytics</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12">
          Experience real-time ADS-B telemetry, advanced mapping, and instant AI insights with SkyLord—your personal aviation assistant.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/dashboard" className="flex items-center justify-center gap-2 text-lg font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-8 py-4 rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            {user ? "Open Dashboard" : "Start Tracking Now"} <ArrowRight className="w-5 h-5" />
          </Link>
          {!user && (
            <Link href="/login" className="flex items-center justify-center gap-2 text-lg font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-full transition-all">
              Sign In to Account
            </Link>
          )}
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-[#121826]/80 border-t border-white/5 py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-black/40 border border-white/5 flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Live Telemetry</h3>
            <p className="text-gray-400 leading-relaxed">Stream raw ADS-B data including altitude, speed, vertical rate, and precise geographic coordinates with sub-second latency.</p>
          </div>

          <div className="p-8 rounded-3xl bg-black/40 border border-white/5 flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <Map className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Global Radar Map</h3>
            <p className="text-gray-400 leading-relaxed">Visualize thousands of active flights globally with high-performance WebGL mapping and dynamic trajectory rendering.</p>
          </div>

          <div className="p-8 rounded-3xl bg-black/40 border border-white/5 flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Secure Sync</h3>
            <p className="text-gray-400 leading-relaxed">Enterprise-grade authentication with stateful session management ensures your settings and favorite flights are synced securely.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center p-6 text-sm text-gray-500 z-10 border-t border-white/5 bg-black/50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
          <span>&copy; {new Date().getFullYear()} SkyIntel Aviation. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-yellow-400 transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
