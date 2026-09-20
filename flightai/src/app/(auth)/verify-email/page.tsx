"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aervyn.in";

function VerifyEmailContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification link.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await axios.post(`${API_URL}/api/auth/verify-email`, { token });
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.error || "Verification failed. The link may be expired.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-aervyn-bg-dark font-labels p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-aervyn-status-cyan/5 mix-blend-overlay pointer-events-none"></div>
      
      <div className="relative w-full max-w-md bg-aervyn-panel-base border border-aervyn-border-subtle p-8 sm:p-12 flex flex-col items-center text-center shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold uppercase tracking-[0.3em] mb-2 text-aervyn-text-primary drop-shadow-md">
            AERVYN
          </h1>
          <p className="text-[10px] text-aervyn-text-tertiary uppercase tracking-widest font-bold">
            Clearance Verification
          </p>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-aervyn-status-cyan animate-spin mb-6" />
            <h2 className="text-sm font-bold text-aervyn-status-cyan uppercase tracking-widest mb-2">Verifying Link...</h2>
            <p className="text-xs text-aervyn-text-secondary">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center w-full">
            <div className="w-16 h-16 rounded-full bg-aervyn-status-cyan/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <CheckCircle2 className="w-8 h-8 text-aervyn-status-cyan" />
            </div>
            <h2 className="text-sm font-bold text-aervyn-status-cyan uppercase tracking-widest mb-2">Clearance Approved</h2>
            <p className="text-xs text-aervyn-text-secondary mb-8">{message}</p>
            <Link
              href="/login"
              className="w-full bg-aervyn-status-cyan/20 border border-aervyn-status-cyan hover:bg-aervyn-status-cyan text-aervyn-status-cyan hover:text-white py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]"
            >
              Initialize Session
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center w-full">
            <div className="w-16 h-16 rounded-full bg-aervyn-status-red/20 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <XCircle className="w-8 h-8 text-aervyn-status-red" />
            </div>
            <h2 className="text-sm font-bold text-aervyn-status-red uppercase tracking-widest mb-2">Verification Failed</h2>
            <p className="text-xs text-aervyn-text-secondary mb-8">{message}</p>
            <Link
              href="/login"
              className="w-full bg-aervyn-panel-light border border-aervyn-border-subtle hover:border-aervyn-status-cyan text-aervyn-text-secondary hover:text-aervyn-text-primary py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center"
            >
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex w-full min-h-screen items-center justify-center bg-aervyn-bg-dark"><Loader2 className="w-8 h-8 animate-spin text-aervyn-status-cyan" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
