"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { CockpitButton } from "@/components/ui/CockpitButton";

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
        <p className="text-sm text-gray-400">Sign in to your Averyn account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Email or Username</label>
          <input
            type="text"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all font-[family-name:var(--font-labels)]"
            placeholder="pilot@example.com"
          />
        </div>

        <div>
          <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all pr-12 font-[family-name:var(--font-labels)]"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-instrument-grey)] hover:text-[var(--color-instrument-white)] transition-colors p-1"
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
                className="peer appearance-none w-5 h-5 border border-[var(--color-instrument-grey)] rounded-[2px] cursor-pointer checked:bg-[var(--color-horizon-blue)] checked:border-[var(--color-horizon-blue)] transition-all"
              />
              <svg className="absolute w-3 h-3 text-[var(--color-cockpit-black)] opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none">
                <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[10px] text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] group-hover:text-[var(--color-instrument-white)] transition-colors uppercase tracking-widest">Remember me</span>
          </label>
          
          <Link href="/forgot-password" className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-horizon-blue)] hover:text-white transition-colors uppercase tracking-widest">
            Forgot password?
          </Link>
        </div>

        <CockpitButton
          type="submit"
          variant="action"
          disabled={isLoading}
          className="w-full mt-4 justify-center bg-[var(--color-horizon-blue)] text-white border-[var(--color-horizon-blue)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              AUTHENTICATING...
            </>
          ) : (
            "SIGN IN"
          )}
        </CockpitButton>
      </form>

      <div className="mt-8 pt-6 border-t border-[var(--color-instrument-grey)] text-center">
        <p className="text-[var(--color-instrument-grey)] text-[10px] font-[family-name:var(--font-labels)] uppercase tracking-widest">
          No active clearance?{" "}
          <Link href="/register" className="text-[var(--color-instrument-white)] font-bold hover:text-[var(--color-horizon-blue)] transition-colors ml-1">
            REQUEST ACCESS
          </Link>
        </p>
      </div>
    </div>
  );
}
