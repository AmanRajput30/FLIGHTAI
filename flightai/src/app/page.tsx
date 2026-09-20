"use client";

import Link from "next/link";
import { Plane, Activity, Shield, Map, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/UserMenu";
import { motion } from "framer-motion";
import { M_PRESETS } from "@/lib/motion/presets";

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-aervyn-bg-dark flex flex-col relative overflow-hidden font-labels">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-aervyn-status-cyan/5 blur-[150px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute top-[20%] -right-[10%] w-[50%] h-[70%] rounded-full bg-aervyn-status-amber/5 blur-[150px]"
        />
      </div>

      {/* Navigation */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={M_PRESETS.panel}
        className="h-20 flex items-center justify-between px-6 md:px-12 z-20 border-b border-aervyn-border-subtle bg-aervyn-panel-base/80 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2">
          <Plane className="w-8 h-8 text-aervyn-status-cyan" />
          <span className="font-extrabold text-2xl tracking-widest text-aervyn-text-primary uppercase drop-shadow-md">Aervyn</span>
        </div>
        
        <div className="flex items-center gap-6">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hidden sm:flex items-center justify-center bg-aervyn-status-cyan/20 border border-aervyn-status-cyan text-aervyn-status-cyan hover:bg-aervyn-status-cyan hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded gap-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                ENTER TERMINAL <ArrowRight size={14} />
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login" className="text-[10px] font-bold text-aervyn-text-secondary hover:text-aervyn-text-primary uppercase tracking-widest px-4 py-2 transition-colors border border-transparent hover:border-aervyn-border-subtle rounded hover:bg-aervyn-panel-light">
                AUTHORIZE
              </Link>
              <Link href="/register" className="flex items-center justify-center bg-aervyn-status-cyan/20 border border-aervyn-status-cyan text-aervyn-status-cyan hover:bg-aervyn-status-cyan hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                CREATE CLEARANCE
              </Link>
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded border border-aervyn-status-cyan/30 bg-aervyn-status-cyan/10 text-aervyn-status-cyan text-[10px] font-bold tracking-widest uppercase mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aervyn-status-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-aervyn-status-cyan"></span>
          </span>
          Next-Generation Aviation Intelligence is Live
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold text-aervyn-text-primary uppercase tracking-widest max-w-4xl leading-tight mb-6 drop-shadow-md"
        >
          Global Flight Tracking,<br />Powered by <span className="text-aervyn-status-cyan drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">AI Analytics</span>.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xs md:text-sm text-aervyn-text-tertiary max-w-2xl mb-12 uppercase tracking-[0.2em] font-bold leading-relaxed"
        >
          Experience real-time ADS-B telemetry, advanced mapping, and instant AI insights with SkyLord—your personal aviation assistant.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link href="/dashboard" className="px-8 py-4 bg-aervyn-status-cyan/20 border border-aervyn-status-cyan text-aervyn-status-cyan hover:bg-aervyn-status-cyan hover:text-white transition-colors rounded text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]">
            {user ? "OPEN TERMINAL" : "START TRACKING"} <ArrowRight size={14} />
          </Link>
          {!user && (
            <Link href="/login" className="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light border border-transparent hover:border-aervyn-border-subtle rounded transition-colors">
              AUTHORIZE ACCOUNT
            </Link>
          )}
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="bg-aervyn-panel-base/50 border-t border-aervyn-border-subtle py-20 px-6 z-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {[
            { icon: Activity, title: "Live Telemetry", desc: "Stream raw ADS-B data including altitude, speed, vertical rate, and precise geographic coordinates with sub-second latency.", color: "cyan" },
            { icon: Map, title: "Global Radar Map", desc: "Visualize thousands of active flights globally with high-performance WebGL mapping and dynamic trajectory rendering.", color: "amber" },
            { icon: Shield, title: "Secure Sync", desc: "Enterprise-grade authentication with stateful session management ensures your settings and favorite flights are synced securely.", color: "emerald" }
          ].map((feature, i) => {
            const Icon = feature.icon;
            const colorMap: any = {
              cyan: "text-aervyn-status-cyan bg-aervyn-status-cyan/10 border-aervyn-status-cyan/30",
              amber: "text-aervyn-status-amber bg-aervyn-status-amber/10 border-aervyn-status-amber/30",
              emerald: "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30"
            };
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded bg-aervyn-bg-dark border border-aervyn-border-subtle flex flex-col items-start gap-4 hover:border-aervyn-status-cyan/50 transition-colors group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className={`w-12 h-12 rounded border ${colorMap[feature.color].split(' ').slice(1).join(' ')} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${colorMap[feature.color].split(' ')[0]}`} />
                </div>
                <h3 className="text-xs font-bold text-aervyn-text-primary uppercase tracking-widest">{feature.title}</h3>
                <p className="text-aervyn-text-tertiary text-[10px] font-bold tracking-widest leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center p-6 text-[10px] uppercase font-bold tracking-widest text-aervyn-text-tertiary z-10 border-t border-aervyn-border-subtle bg-aervyn-bg-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <span>&copy; {new Date().getFullYear()} AERVYN AVIATION. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-aervyn-status-cyan transition-colors">TERMS OF SERVICE</Link>
            <Link href="/privacy" className="hover:text-aervyn-status-cyan transition-colors">PRIVACY POLICY</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
