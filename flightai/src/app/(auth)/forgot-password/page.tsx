"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aervyn.in";

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
    <div className="flex w-full min-h-screen items-center justify-center bg-aervyn-bg-dark font-labels p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
      
      <div className="relative w-full max-w-md bg-aervyn-panel-base border border-aervyn-border-subtle p-8 sm:p-12 flex flex-col shadow-2xl">
        <Link href="/login" className="inline-flex items-center text-[9px] text-aervyn-text-tertiary uppercase tracking-widest hover:text-aervyn-text-primary transition-colors mb-8">
          <ArrowLeft className="w-3 h-3 mr-1" /> Back to login
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold uppercase tracking-[0.3em] mb-2 text-aervyn-text-primary drop-shadow-md">
            AERVYN
          </h1>
          <p className="text-[10px] text-aervyn-text-tertiary uppercase tracking-widest font-bold">
            Recover Operator Clearance
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded bg-aervyn-status-red/10 border border-aervyn-status-red flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-aervyn-status-red shrink-0 mt-0.5" />
            <p className="text-xs text-aervyn-status-red font-bold uppercase tracking-wide">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded bg-aervyn-status-cyan/10 border border-aervyn-status-cyan flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-aervyn-status-cyan shrink-0 mt-0.5" />
            <p className="text-xs text-aervyn-status-cyan font-bold uppercase tracking-wide">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-aervyn-text-tertiary uppercase tracking-widest mb-2">Comms Channel (Email)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors text-xs font-bold tracking-wide"
              placeholder="INPUT EMAIL"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full mt-4 bg-aervyn-status-cyan/20 border border-aervyn-status-cyan hover:bg-aervyn-status-cyan text-aervyn-status-cyan hover:text-white py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {isLoading ? "INITIATING RECOVERY..." : "REQUEST RESET LINK"}
          </button>
        </form>
      </div>
    </div>
  );
}
