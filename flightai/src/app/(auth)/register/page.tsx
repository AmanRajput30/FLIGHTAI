"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from "@/context/AuthContext";
import AppleSignin from 'react-apple-signin-auth';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { M_PRESETS } from "@/lib/motion/presets";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const appleLogin = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await axios.post(`${API_URL}/api/oauth/apple`, { 
        token: response.authorization.id_token,
        name: response.user?.name ? `${response.user.name.firstName} ${response.user.name.lastName}` : null
      }, { withCredentials: true });
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Apple Sign-Up failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError(null);
        await axios.post(`${API_URL}/api/oauth/google`, { token: tokenResponse.access_token }, { withCredentials: true });
        await refreshUser();
        router.push("/dashboard");
      } catch (err: any) {
        setError(err.response?.data?.error || "Google Sign-Up failed.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError("Google Sign-Up was cancelled or failed.")
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (formData.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.username,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };

      const res = await axios.post(`${API_URL}/api/auth/register`, payload);
      setSuccess(res.data.message || "Registration successful! Please check your email.");
      setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen bg-aervyn-bg-dark font-labels">
      {/* Left Column - Image */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={M_PRESETS.panel}
        className="hidden lg:flex w-1/2 relative overflow-hidden border-r border-aervyn-border-subtle"
      >
        <Image 
          src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=1974&auto=format&fit=crop" 
          alt="Aviation mountains"
          fill
          className="object-cover opacity-80 mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-aervyn-bg-dark via-transparent to-aervyn-bg-dark opacity-80"></div>
        <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay"></div>
        
        <div className="absolute bottom-0 left-0 p-10 w-full flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, ...M_PRESETS.panel }} className="bg-aervyn-bg-dark/80 p-4 border-l-2 border-aervyn-status-cyan backdrop-blur-sm">
            <h3 className="text-aervyn-status-cyan font-bold text-xs uppercase tracking-widest mb-1">SECURE CLEARANCE</h3>
            <p className="text-aervyn-text-primary text-xs font-bold tracking-wide">Direct access to the global aviation command center.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, ...M_PRESETS.panel }} className="bg-aervyn-bg-dark/80 p-4 border-l-2 border-aervyn-status-cyan backdrop-blur-sm">
            <h3 className="text-aervyn-status-cyan font-bold text-xs uppercase tracking-widest mb-1">REAL-TIME TELEMETRY</h3>
            <p className="text-aervyn-text-primary text-xs font-bold tracking-wide">Low-latency tracking of thousands of global targets.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, ...M_PRESETS.panel }} className="bg-aervyn-bg-dark/80 p-4 border-l-2 border-aervyn-status-cyan backdrop-blur-sm">
            <h3 className="text-aervyn-status-cyan font-bold text-xs uppercase tracking-widest mb-1">SKYLORD INTEGRATION</h3>
            <p className="text-aervyn-text-primary text-xs font-bold tracking-wide">Advanced AI intelligence for airspace command.</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Column - Form */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, ...M_PRESETS.panel }}
        className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 text-aervyn-text-primary justify-center items-center"
      >
        <div className="w-full max-w-md flex flex-col">
        
        <div className="mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-[0.3em] mb-4 text-aervyn-text-primary drop-shadow-md">
            AERVYN
          </h1>
          <p className="text-xs text-aervyn-text-tertiary uppercase tracking-widest font-bold">
            Request Operator Clearance
          </p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded bg-aervyn-status-red/10 border border-aervyn-status-red flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-aervyn-status-red shrink-0 mt-0.5" />
            <p className="text-xs text-aervyn-status-red font-bold uppercase tracking-wide">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-6 p-6 rounded bg-aervyn-status-cyan/10 border border-aervyn-status-cyan flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-aervyn-status-cyan/20 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <CheckCircle2 className="w-8 h-8 text-aervyn-status-cyan" />
            </div>
            <div>
              <h3 className="text-aervyn-status-cyan font-bold text-lg mb-1 tracking-wide uppercase">Clearance Initiated</h3>
              <p className="text-xs text-aervyn-text-primary font-bold">{success}</p>
            </div>
            <Link href="/login" className="mt-4 w-full text-center py-3 bg-aervyn-status-cyan/20 border border-aervyn-status-cyan text-aervyn-status-cyan hover:bg-aervyn-status-cyan hover:text-white rounded font-bold text-xs uppercase tracking-widest transition-colors drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]">
              Proceed to Login
            </Link>
          </motion.div>
        )}

        {!success && (
          <>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary uppercase tracking-widest mb-2">Operator Identity (Username)</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors text-xs font-bold tracking-wide"
                placeholder="INPUT USERNAME"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary uppercase tracking-widest mb-2">Comms Channel (Email)</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors text-xs font-bold tracking-wide"
                placeholder="INPUT EMAIL"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary uppercase tracking-widest mb-2">Security Passcode</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors pr-12 text-xs font-bold tracking-wide"
                  placeholder="**********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-aervyn-text-tertiary hover:text-aervyn-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary uppercase tracking-widest mb-2">Verify Passcode</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-aervyn-panel-base border ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-aervyn-status-red focus:border-aervyn-status-red' : 'border-aervyn-border-subtle focus:border-aervyn-status-cyan'} rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none transition-colors pr-12 text-xs font-bold tracking-wide`}
                  placeholder="**********"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-aervyn-text-tertiary hover:text-aervyn-text-primary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-2 text-[9px] text-aervyn-text-tertiary font-bold uppercase tracking-widest">
              By proceeding, operator agrees to Aervyn <Link href="/terms" className="text-aervyn-status-cyan hover:text-white transition-colors">Terms of Service</Link> and <Link href="/privacy" className="text-aervyn-status-cyan hover:text-white transition-colors">Privacy Policy</Link>.
            </div>

            <button
              type="submit"
              disabled={isLoading || (formData.password !== formData.confirmPassword && formData.confirmPassword.length > 0)}
              className="w-full mt-4 bg-aervyn-status-cyan/20 border border-aervyn-status-cyan text-aervyn-status-cyan hover:bg-aervyn-status-cyan hover:text-white py-3 rounded font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Submit Clearance Request
            </button>
          </form>
          
          <div className="mt-6 flex justify-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-aervyn-text-tertiary font-bold uppercase tracking-widest">Existing Operator?</span>
              <Link href="/login" className="text-[10px] font-bold text-aervyn-status-cyan hover:text-white uppercase tracking-widest transition-colors">
                Return to Login
              </Link>
            </div>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-aervyn-border-subtle"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-aervyn-bg-dark px-4 text-[10px] text-aervyn-text-tertiary uppercase tracking-widest font-bold">External Auth</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="button" 
              onClick={() => googleLogin()}
              className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle hover:bg-aervyn-panel-light text-aervyn-text-primary py-3 rounded font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-3"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google OAuth
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
            className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-3"
            onSuccess={(response: any) => appleLogin(response)}
            onError={(error: any) => setError("Apple Sign-Up failed.")}
            render={(props: any) => (
              <button 
                type="button" 
                onClick={props.onClick}
                className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 384 512" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                Apple ID Auth
              </button>
            )}
          />
          </div>
          </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
