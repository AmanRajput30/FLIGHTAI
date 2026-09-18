"use client";

import Link from "next/link";
import { Plane, Activity, Shield, Map, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/UserMenu";
import { CockpitButton } from "@/components/ui/CockpitButton";
import { motion } from "framer-motion";
import { M_PRESETS } from "@/lib/motion/presets";

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col relative overflow-hidden font-labels">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-yellow-900/10 blur-[150px]"
        />
      </div>

      {/* Navigation */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={M_PRESETS.panel}
        className="h-20 flex items-center justify-between px-6 md:px-12 z-20 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <Plane className="w-8 h-8 text-yellow-500" />
          <span className="font-bold text-2xl tracking-tight text-white font-sans">Aervyn</span>
        </div>
        
        <div className="flex items-center gap-6">
          {loading ? (
            <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse"></div>
          ) : user ? (
            <>
              <CockpitButton href="/dashboard" variant="action" className="hidden sm:flex bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)] text-white font-bold">
                GO TO DASHBOARD <ArrowRight size={14} strokeWidth={1.5} className="ml-2" />
              </CockpitButton>
              <UserMenu />
            </>
          ) : (
            <>
              <CockpitButton href="/login" variant="selector" className="border-none font-bold">
                SIGN IN
              </CockpitButton>
              <CockpitButton href="/register" variant="action" className="bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)] text-white font-bold">
                CREATE ACCOUNT
              </CockpitButton>
            </>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 pt-16 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Next-Generation Aviation Intelligence is Live
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-tight mb-6 font-sans"
        >
          Global Flight Tracking,<br />Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">AI Analytics</span>.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm md:text-base text-gray-400 max-w-2xl mb-12 uppercase tracking-widest font-bold leading-relaxed"
        >
          Experience real-time ADS-B telemetry, advanced mapping, and instant AI insights with SkyLord—your personal aviation assistant.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <CockpitButton href="/dashboard" variant="action" className="px-8 py-4 bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)] text-white text-xs font-bold tracking-widest">
            {user ? "OPEN DASHBOARD" : "START TRACKING"} <ArrowRight size={18} strokeWidth={2} className="ml-2" />
          </CockpitButton>
          {!user && (
            <CockpitButton href="/login" variant="action" className="px-8 py-4 text-xs font-bold tracking-widest bg-transparent hover:bg-transparent">
              SIGN IN TO ACCOUNT
            </CockpitButton>
          )}
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="bg-[#121826]/80 border-t border-white/5 py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Activity, title: "Live Telemetry", desc: "Stream raw ADS-B data including altitude, speed, vertical rate, and precise geographic coordinates with sub-second latency.", color: "blue" },
            { icon: Map, title: "Global Radar Map", desc: "Visualize thousands of active flights globally with high-performance WebGL mapping and dynamic trajectory rendering.", color: "yellow" },
            { icon: Shield, title: "Secure Sync", desc: "Enterprise-grade authentication with stateful session management ensures your settings and favorite flights are synced securely.", color: "green" }
          ].map((feature, i) => {
            const Icon = feature.icon;
            const colorMap: any = {
              blue: "text-blue-400 bg-blue-500/20",
              yellow: "text-yellow-400 bg-yellow-500/20",
              green: "text-green-400 bg-green-500/20"
            };
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-[4px] bg-black/40 border border-white/5 flex flex-col items-start gap-4 hover:border-white/10 transition-colors"
              >
                <div className={`w-12 h-12 rounded-[2px] ${colorMap[feature.color].split(' ')[1]} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colorMap[feature.color].split(' ')[0]}`} />
                </div>
                <h3 className="text-[14px] font-bold text-white uppercase tracking-widest">{feature.title}</h3>
                <p className="text-gray-400 text-xs font-bold tracking-widest leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center p-6 text-[10px] uppercase font-bold tracking-widest text-gray-500 z-10 border-t border-white/5 bg-black/50">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
          <span>&copy; {new Date().getFullYear()} AERVYN AVIATION. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-yellow-400 transition-colors">TERMS OF SERVICE</Link>
            <Link href="/privacy" className="hover:text-yellow-400 transition-colors">PRIVACY POLICY</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
