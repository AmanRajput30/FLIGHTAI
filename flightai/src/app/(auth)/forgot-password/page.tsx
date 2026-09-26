"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { M_PRESETS } from "@/lib/motion/presets";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSuccess(res.data.message || "Reset link sent! Please check your inbox.");
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-aervyn-bg-dark">
      {/* Left Column - Image */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={M_PRESETS.panel}
        className="hidden lg:flex w-1/2 relative overflow-hidden"
      >
        <Image 
          src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1974&auto=format&fit=crop" 
          alt="Aviation mountains"
          fill
          className="object-cover opacity-60 mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07111F] via-[#07111F]/80 to-transparent"></div>
        
        <div className="absolute bottom-16 left-12 max-w-lg z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ...M_PRESETS.panel }}>
            <p className="text-xs text-slate-300 tracking-widest font-bold uppercase mb-4">Real-Time Aviation Intelligence</p>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">See the Sky<br/><span className="text-aervyn-primary">Differently.</span></h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-10 max-w-md">Track. Analyze. Understand. AERVYN provides real-time flight data, powerful insights, and tools for a more connected world.</p>
            
            <div className="flex gap-8">
              <div className="flex flex-col">
                <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center mb-2">
                  <span className="text-white text-xs">🌐</span>
                </div>
                <span className="text-white font-bold text-sm">190+</span>
                <span className="text-aervyn-text-dark-muted text-xs">Countries</span>
              </div>
              <div className="flex flex-col">
                <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center mb-2">
                  <span className="text-white text-xs">✈️</span>
                </div>
                <span className="text-white font-bold text-sm">1M+</span>
                <span className="text-aervyn-text-dark-muted text-xs">Flights Daily</span>
              </div>
              <div className="flex flex-col">
                <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center mb-2">
                  <span className="text-white text-xs">📊</span>
                </div>
                <span className="text-white font-bold text-sm">Real-Time</span>
                <span className="text-aervyn-text-dark-muted text-xs">Global Data</span>
              </div>
            </div>

            <div className="mt-12 text-aervyn-text-dark-muted italic font-serif text-sm">
              "A clearer sky<br/>for a more informed world."
            </div>
            
            <div className="absolute -bottom-8 text-[10px] text-aervyn-text-dark-secondary">
              © {new Date().getFullYear()} AERVYN. All rights reserved.
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Column - Form */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, ...M_PRESETS.panel }}
        className="w-full lg:w-1/2 flex flex-col p-8 sm:p-16 xl:p-24 bg-aervyn-surface-dark justify-center items-center border-l border-aervyn-border-dark relative"
      >
        <Link href="/login" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to sign in
        </Link>
        
        <div className="w-full max-w-sm flex flex-col">
        
        <div className="mb-10 lg:hidden text-center mt-8">
          <span className="font-bold text-xl tracking-wide text-aervyn-text-dark-primary">AERVYN</span>
        </div>

        <div className="mb-8 relative mt-12 lg:mt-0">
          <h1 className="text-3xl font-bold text-aervyn-text-dark-primary mb-2">
            Reset password
          </h1>
          <p className="text-sm text-aervyn-text-dark-secondary">
            Enter your email and we'll send a link to reset it.
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-lg bg-aervyn-status-error/10 border border-aervyn-status-error/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-aervyn-status-error shrink-0 mt-0.5" />
            <p className="text-sm text-aervyn-status-error font-medium">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-6 rounded-lg bg-aervyn-status-success/10 border border-aervyn-status-success/20 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-aervyn-status-success/20 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-aervyn-status-success/80" />
            </div>
            <div>
              <h3 className="text-aervyn-status-success font-medium text-lg mb-1">Link Sent</h3>
              <p className="text-sm text-aervyn-status-success/80">{success}</p>
            </div>
          </motion.div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-aervyn-text-dark-muted mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2.5 text-aervyn-text-dark-primary placeholder:text-aervyn-text-dark-muted focus:outline-none focus:border-aervyn-primary focus:ring-1 focus:ring-aervyn-primary transition-shadow text-sm"
                placeholder="name@company.com"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full mt-2 bg-aervyn-primary hover:bg-aervyn-primary-hover border border-aervyn-primary text-white py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Send reset link &rarr;
            </button>
          </form>
        )}
        
        <div className="absolute bottom-8 right-8 flex gap-4 text-xs text-aervyn-text-dark-muted">
          <Link href="/privacy" className="hover:text-aervyn-text-dark-secondary transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-aervyn-text-dark-secondary transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-aervyn-text-dark-secondary transition-colors">Support</Link>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
