"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flightai-hxbd.onrender.com";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/login`, {
        identifier,
        password,
        rememberMe,
      });
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Unable to sign in. Please check your credentials and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-sm text-gray-400">Sign in to your SkyIntel account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email or Username</label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
            placeholder="pilot@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded cursor-pointer checked:bg-yellow-500 checked:border-yellow-500 transition-all"
              />
              <svg className="absolute w-3 h-3 text-black opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
          </label>
          
          <Link href="/forgot-password" className="text-sm text-yellow-500 hover:text-yellow-400 transition-colors">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <p className="text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-white font-semibold hover:text-yellow-400 transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
