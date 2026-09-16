"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { CockpitButton } from "@/components/ui/CockpitButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flightai-hxbd.onrender.com";

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
      setSuccess(res.data.message || "Reset link sent!");
      setEmail("");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Link href="/login" className="inline-flex items-center text-[10px] text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] uppercase tracking-widest hover:text-[var(--color-instrument-white)] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-[10px] text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] uppercase tracking-widest">Enter your email address and we'll send you a link to reset your password.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-[2px] bg-red-500/10 border border-red-500/20 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-[2px] bg-green-500/10 border border-green-500/20 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <p className="text-sm text-green-400">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all font-[family-name:var(--font-labels)]"
            placeholder="pilot@example.com"
          />
        </div>

        <CockpitButton
          type="submit"
          variant="action"
          disabled={isLoading || !email}
          className="w-full mt-4 justify-center bg-[var(--color-horizon-blue)] text-white border-[var(--color-horizon-blue)]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              SENDING LINK...
            </>
          ) : (
            "SEND RESET LINK"
          )}
        </CockpitButton>
      </form>
    </div>
  );
}
