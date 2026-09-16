"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import { CockpitButton } from "@/components/ui/CockpitButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flightai-hxbd.onrender.com";

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
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-16 h-16 rounded-[2px] bg-red-500/20 flex items-center justify-center mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Invalid Link</h2>
        <p className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] uppercase tracking-widest mb-8">This password reset link is invalid or missing.</p>
        <Link href="/forgot-password" className="w-full">
          <CockpitButton variant="action" className="w-full bg-[var(--color-horizon-blue)] text-white border-[var(--color-horizon-blue)] justify-center">
            REQUEST NEW LINK
          </CockpitButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Create New Password</h1>
        <p className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] uppercase tracking-widest">Please enter your new strong password below.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-[2px] bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success ? (
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-[2px] bg-green-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <p className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-white)] uppercase tracking-widest mb-8">{success}</p>
          <Link href="/login" className="w-full">
            <CockpitButton variant="action" className="w-full bg-[var(--color-horizon-blue)] text-white border-[var(--color-horizon-blue)] justify-center">
              CONTINUE TO LOGIN
            </CockpitButton>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all pr-12 font-[family-name:var(--font-labels)] text-sm"
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
            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="mt-2 flex gap-1 h-1.5">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-[2px] ${
                      i <= strength 
                        ? strength <= 1 ? 'bg-[var(--color-warning-red)]' : strength === 2 ? 'bg-[var(--color-caution-amber)]' : 'bg-[var(--color-horizon-blue)]'
                        : 'bg-[#111]'
                    }`}
                  ></div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-[var(--color-cockpit-black)] border ${confirmPassword && password !== confirmPassword ? 'border-[var(--color-warning-red)] focus:border-[var(--color-warning-red)]' : 'border-[var(--color-instrument-grey)] focus:border-[var(--color-horizon-blue)]'} rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:ring-1 transition-all font-[family-name:var(--font-labels)] text-sm`}
              placeholder="••••••••"
            />
          </div>

          <CockpitButton
            type="submit"
            variant="action"
            disabled={isLoading || !password || password !== confirmPassword}
            className="w-full mt-4 justify-center bg-[var(--color-horizon-blue)] text-white border-[var(--color-horizon-blue)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                RESETTING...
              </>
            ) : (
              "RESET PASSWORD"
            )}
          </CockpitButton>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-yellow-500" /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
