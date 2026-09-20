"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aervyn.in";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return 0;
    let score = 0;
    if (pass.length > 7) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 4);
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      return setError("Invalid or missing reset token.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, { token, newPassword: password });
      setSuccess(res.data.message || "Password reset successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password. The link may be expired.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex w-full min-h-screen items-center justify-center bg-aervyn-bg-dark font-labels p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
        <div className="relative w-full max-w-md bg-aervyn-panel-base border border-aervyn-border-subtle p-8 sm:p-12 flex flex-col items-center text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-aervyn-status-red/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <AlertCircle className="w-8 h-8 text-aervyn-status-red" />
          </div>
          <h2 className="text-sm font-bold text-aervyn-status-red uppercase tracking-widest mb-2">Invalid Link</h2>
          <p className="text-xs text-aervyn-text-secondary mb-8">This password reset link is invalid or missing.</p>
          <Link href="/forgot-password" className="w-full">
            <button className="w-full bg-aervyn-panel-light border border-aervyn-border-subtle hover:border-aervyn-status-cyan text-aervyn-text-secondary hover:text-aervyn-text-primary py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center">
              REQUEST NEW LINK
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-aervyn-bg-dark font-labels p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
      
      <div className="relative w-full max-w-md bg-aervyn-panel-base border border-aervyn-border-subtle p-8 sm:p-12 flex flex-col shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold uppercase tracking-[0.3em] mb-2 text-aervyn-text-primary drop-shadow-md text-center">
            AERVYN
          </h1>
          <p className="text-[10px] text-aervyn-text-tertiary uppercase tracking-widest font-bold text-center">
            Set New Passcode
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-aervyn-status-red/10 border border-aervyn-status-red flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-aervyn-status-red shrink-0 mt-0.5" />
            <p className="text-xs text-aervyn-status-red font-bold uppercase tracking-wide">{error}</p>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-aervyn-status-cyan/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <CheckCircle2 className="w-8 h-8 text-aervyn-status-cyan" />
            </div>
            <p className="text-xs font-bold text-aervyn-text-primary uppercase tracking-widest mb-8">{success}</p>
            <Link href="/login" className="w-full">
              <button className="w-full bg-aervyn-status-cyan/20 border border-aervyn-status-cyan hover:bg-aervyn-status-cyan text-aervyn-status-cyan hover:text-white py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]">
                CONTINUE TO LOGIN
              </button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-1.5 uppercase tracking-widest">New Passcode</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors pr-12 font-labels text-xs tracking-wide"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-aervyn-text-tertiary hover:text-aervyn-text-primary transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-2 flex gap-1 h-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className={`flex-1 rounded-sm transition-colors ${
                        i <= strength 
                          ? strength <= 1 ? 'bg-aervyn-status-red' : strength === 2 ? 'bg-amber-500' : 'bg-aervyn-status-cyan'
                          : 'bg-aervyn-panel-light'
                      }`}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-1.5 uppercase tracking-widest">Confirm New Passcode</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-aervyn-panel-base border ${confirmPassword && password !== confirmPassword ? 'border-aervyn-status-red focus:border-aervyn-status-red' : 'border-aervyn-border-subtle focus:border-aervyn-status-cyan'} rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:ring-1 transition-colors font-labels text-xs tracking-wide`}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || password !== confirmPassword}
              className="w-full mt-4 bg-aervyn-status-cyan/20 border border-aervyn-status-cyan text-aervyn-status-cyan hover:bg-aervyn-status-cyan hover:text-white py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isLoading ? "RESETTING..." : "RESET PASSCODE"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex w-full min-h-screen items-center justify-center bg-aervyn-bg-dark"><Loader2 className="w-8 h-8 animate-spin text-aervyn-status-cyan" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
