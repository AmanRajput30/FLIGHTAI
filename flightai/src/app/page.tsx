"use client";

import Link from "next/link";
import { Plane, Activity, Shield, Map, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/UserMenu";
import { motion } from "framer-motion";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

export default function LandingPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-aervyn-bg-dark text-aervyn-text-dark-primary flex flex-col relative font-inter selection:bg-aervyn-primary/30 selection:text-white">
      {/* Navigation */}
      <header className="h-16 flex items-center justify-between px-6 lg:px-12 z-20 border-b border-aervyn-border-dark-subtle bg-aervyn-bg-dark/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <Plane className="w-6 h-6 text-aervyn-text-dark-primary" />
          <span className="font-bold text-lg tracking-wide text-aervyn-text-dark-primary">AERVYN</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-aervyn-text-dark-secondary">
          <Link href="/products" className="hover:text-aervyn-text-dark-primary transition-colors">Products</Link>
          <Link href="/data-sources" className="hover:text-aervyn-text-dark-primary transition-colors">Data Sources</Link>
          <Link href="/pricing" className="hover:text-aervyn-text-dark-primary transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-aervyn-text-dark-primary transition-colors">About</Link>
        </nav>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse"></div>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hidden sm:flex items-center justify-center bg-aervyn-primary hover:bg-aervyn-primary-hover text-white transition-colors text-sm font-medium px-4 py-2 rounded-md">
                Open Dashboard
              </Link>
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary px-3 py-2 transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="flex items-center justify-center bg-aervyn-primary hover:bg-aervyn-primary-hover text-white transition-colors text-sm font-medium px-4 py-2 rounded-md">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-32 z-10 overflow-hidden min-h-[80vh]">
        
        {/* Globe Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-60">
           <RotatingEarth width={1200} height={1200} className="w-full h-full max-w-[1200px] object-cover mix-blend-screen" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center w-full max-w-5xl mx-auto pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-aervyn-border-dark bg-aervyn-surface-dark/80 backdrop-blur-sm text-aervyn-text-dark-secondary text-xs font-medium mb-8 pointer-events-auto"
          >
          <span className="w-2 h-2 rounded-full bg-aervyn-primary"></span>
          Real-Time Aviation Intelligence
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-aervyn-text-dark-primary tracking-tight max-w-4xl leading-tight mb-6"
        >
          See the Sky<br />Differently.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base md:text-lg text-aervyn-text-dark-muted max-w-2xl mb-10 leading-relaxed"
        >
          AERVYN provides real-time flight data, powerful insights, and tools for a more connected world. Track global fleets with enterprise-grade precision.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto"
        >
          <Link href="/dashboard" className="px-6 py-3 bg-aervyn-primary hover:bg-aervyn-primary-hover text-white transition-colors rounded-md text-sm font-medium flex items-center gap-2">
            {user ? "Open Dashboard" : "Get Started"} <ArrowRight size={16} />
          </Link>
          {!user && (
            <Link href="/login" className="px-6 py-3 text-sm font-medium text-aervyn-text-dark-primary bg-aervyn-surface-dark hover:bg-aervyn-surface-dark-elevated border border-aervyn-border-dark rounded-md transition-colors flex items-center gap-2">
              Watch Demo
            </Link>
          )}
        </motion.div>

        {/* Hero Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-12 mt-20 pt-10 border-t border-aervyn-border-dark-subtle text-left max-w-3xl w-full"
        >
          <div>
            <div className="text-3xl font-bold text-aervyn-text-dark-primary">10K+</div>
            <div className="text-sm text-aervyn-text-dark-muted mt-1">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-aervyn-text-dark-primary">1M+</div>
            <div className="text-sm text-aervyn-text-dark-muted mt-1">Flights Tracked Daily</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-aervyn-text-dark-primary">99.9%</div>
            <div className="text-sm text-aervyn-text-dark-muted mt-1">Uptime SLA</div>
          </div>
          </motion.div>
        </div>
      </main>

      {/* Product Visualization Area (Clean UI mock) */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-24 z-10 relative">
        <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-aervyn-surface-dark rounded-xl border border-aervyn-border-dark shadow-2xl overflow-hidden relative flex flex-col">
          <div className="h-12 border-b border-aervyn-border-dark bg-aervyn-bg-dark flex items-center px-4 gap-4">
             <div className="flex gap-1.5">
               <div className="w-3 h-3 rounded-full bg-aervyn-border-dark"></div>
               <div className="w-3 h-3 rounded-full bg-aervyn-border-dark"></div>
               <div className="w-3 h-3 rounded-full bg-aervyn-border-dark"></div>
             </div>
             <div className="text-xs text-aervyn-text-dark-muted font-medium bg-aervyn-surface-dark px-3 py-1 rounded-md border border-aervyn-border-dark-subtle">
               dashboard.aervyn.com
             </div>
          </div>
          <div className="flex-1 bg-[url('/map-placeholder.jpg')] bg-cover bg-center relative">
            <div className="absolute inset-0 bg-aervyn-bg-dark/80 backdrop-blur-[2px]"></div>
            
            {/* Mock Floating Panels */}
            <div className="absolute left-6 top-6 bottom-6 w-64 bg-aervyn-surface-dark border border-aervyn-border-dark rounded-lg flex flex-col p-4 shadow-xl">
               <div className="h-4 w-24 bg-aervyn-border-dark rounded mb-6"></div>
               <div className="space-y-3">
                 <div className="h-10 w-full bg-aervyn-surface-dark-elevated rounded"></div>
                 <div className="h-10 w-full bg-aervyn-surface-dark-elevated rounded"></div>
                 <div className="h-10 w-full bg-aervyn-surface-dark-elevated rounded"></div>
               </div>
            </div>
            <div className="absolute right-6 top-6 bottom-6 w-64 flex flex-col gap-4">
               <div className="flex-1 bg-aervyn-surface-dark border border-aervyn-border-dark rounded-lg shadow-xl p-4">
                 <div className="h-4 w-32 bg-aervyn-border-dark rounded mb-4"></div>
                 <div className="h-32 w-full bg-aervyn-surface-dark-elevated rounded"></div>
               </div>
               <div className="h-48 bg-aervyn-surface-dark border border-aervyn-border-dark rounded-lg shadow-xl p-4">
                 <div className="h-4 w-20 bg-aervyn-border-dark rounded mb-4"></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="bg-aervyn-surface-dark border-t border-aervyn-border-dark py-24 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-aervyn-text-dark-primary tracking-tight mb-4">Unprecedented data clarity.</h2>
            <p className="text-aervyn-text-dark-secondary text-lg max-w-2xl">Everything you need to monitor, analyze, and manage aviation fleets across the globe in one unified platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Activity, title: "Live Telemetry", desc: "Stream raw ADS-B data including altitude, speed, vertical rate, and precise geographic coordinates with sub-second latency." },
              { icon: Map, title: "Global Radar Map", desc: "Visualize thousands of active flights globally with high-performance WebGL mapping and dynamic trajectory rendering." },
              { icon: Shield, title: "Secure Synchronization", desc: "Enterprise-grade authentication with stateful session management ensures your settings and favorite flights are synced securely." }
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={i}
                  className="p-8 rounded-xl bg-aervyn-bg-dark border border-aervyn-border-dark hover:border-aervyn-border-dark-subtle transition-colors flex flex-col items-start gap-5"
                >
                  <div className="w-10 h-10 rounded-lg bg-aervyn-primary/10 border border-aervyn-primary/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-aervyn-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-aervyn-text-dark-primary mb-2">{feature.title}</h3>
                    <p className="text-aervyn-text-dark-muted text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-12 px-6 text-sm text-aervyn-text-dark-muted border-t border-aervyn-border-dark bg-aervyn-bg-dark z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            <span className="font-semibold text-aervyn-text-dark-secondary">AERVYN</span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-aervyn-text-dark-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-aervyn-text-dark-primary transition-colors">Privacy Policy</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Aervyn, Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
