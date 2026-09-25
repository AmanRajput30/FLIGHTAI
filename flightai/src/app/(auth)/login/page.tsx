"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { M_PRESETS } from "@/lib/motion/presets";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError(null);
        await axios.post(`${API_URL}/api/oauth/google`, { token: tokenResponse.access_token }, { withCredentials: true });
        await refreshUser();
        router.push("/live-tracking");
      } catch (err: any) {
        setError(err.response?.data?.error || "Google Sign-In failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("Google Sign-In was cancelled or failed.")
  });

  const appleLogin = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await axios.post(`${API_URL}/api/oauth/apple`, { 
        token: response.authorization.id_token,
        name: response.user?.name ? `${response.user.name.firstName} ${response.user.name.lastName}` : null
      }, { withCredentials: true });
      await refreshUser();
      router.push("/live-tracking");
    } catch (err: any) {
      setError(err.response?.data?.error || "Apple Sign-In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        identifier,
        password,
        rememberMe
      }, { withCredentials: true });
      
      await refreshUser();
      router.push("/live-tracking");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid operator credentials");
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
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">See the Sky<br/><span className="text-[#155EEF]">Differently.</span></h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-10 max-w-md">Track. Analyze. Understand. AERVYN provides real-time flight data, powerful insights, and tools for a more connected world.</p>
            
            <div className="flex gap-8">
              <div className="flex flex-col">
                <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center mb-2">
                  <span className="text-white text-xs">🌐</span>
                </div>
                <span className="text-white font-bold text-sm">190+</span>
                <span className="text-slate-400 text-xs">Countries</span>
              </div>
              <div className="flex flex-col">
                <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center mb-2">
                  <span className="text-white text-xs">✈️</span>
                </div>
                <span className="text-white font-bold text-sm">1M+</span>
                <span className="text-slate-400 text-xs">Flights Daily</span>
              </div>
              <div className="flex flex-col">
                <div className="w-8 h-8 rounded-full border border-slate-600 flex items-center justify-center mb-2">
                  <span className="text-white text-xs">📊</span>
                </div>
                <span className="text-white font-bold text-sm">Real-Time</span>
                <span className="text-slate-400 text-xs">Global Data</span>
              </div>
            </div>

            <div className="mt-12 text-slate-400 italic font-serif text-sm">
              "A clearer sky<br/>for a more informed world."
            </div>
            
            <div className="absolute -bottom-8 text-[10px] text-slate-500">
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
        className="w-full lg:w-1/2 flex flex-col p-8 sm:p-16 xl:p-24 bg-white justify-center items-center"
      >
        <div className="w-full max-w-sm flex flex-col">
        
        <div className="absolute top-8 right-8 hidden lg:flex items-center gap-4">
          <span className="text-sm text-slate-500">New to AERVYN?</span>
          <Link href="/register" className="text-sm font-medium text-[#155EEF] bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors">
            Create account
          </Link>
        </div>

        <div className="mb-10 lg:hidden text-center">
          <span className="font-bold text-xl tracking-wide text-slate-900">AERVYN</span>
        </div>

        <div className="mb-8 relative">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500">
            Sign in to your AERVYN account
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-lg bg-red-50 border border-red-100 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Username or email</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF] transition-shadow text-sm"
              placeholder="name@company.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#155EEF] focus:ring-1 focus:ring-[#155EEF] transition-shadow pr-12 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#155EEF] focus:ring-[#155EEF]" 
              />
              <span className="text-sm text-slate-600">Keep me signed in</span>
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-[#155EEF] hover:text-[#1D6FFF] transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#155EEF] hover:bg-[#1D6FFF] text-white py-2.5 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            Sign in &rarr;
          </button>
        </form>
        
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">New to AERVYN?</span>
            <Link href="/register" className="text-sm font-medium text-[#155EEF] hover:text-[#1D6FFF] transition-colors">
              Create an account
            </Link>
          </div>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-xs text-slate-400 uppercase tracking-wider font-medium">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <button 
            type="button" 
            onClick={() => googleLogin()}
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
          
          <AppleSignin
            authOptions={{
              clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'com.example.web',
              scope: 'email name',
              redirectURI: 'https://example.com',
              state: 'state',
              nonce: 'nonce',
              usePopup: true,
            }}
            uiType="dark"
            className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-3"
            onSuccess={(response: any) => appleLogin(response)}
            onError={(error: any) => setError("Apple Sign-In failed.")}
            render={(props: any) => (
              <button 
                type="button" 
                onClick={props.onClick}
                className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 384 512" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                Apple
              </button>
            )}
          />
          
          <button 
            type="button" 
            className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 23 23" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M11.4 24V12H0V24h11.4zM24 24V12H12.6v12H24zM11.4 11.4V0H0v11.4h11.4zM24 11.4V0H12.6v11.4H24z" fill="#00a4ef"/></svg>
            Microsoft
          </button>
        </div>
        
        <div className="absolute bottom-8 right-8 flex gap-4 text-xs text-slate-400">
          <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-slate-600 transition-colors">Support</Link>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
