"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flightai-hxbd.onrender.com";

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
    <div className="flex flex-col items-center text-center py-8">
      {status === "loading" && (
        <>
          <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold text-white mb-2">Verifying...</h2>
          <p className="text-gray-400">{message}</p>
        </>
      )}

      {status === "success" && (
        <>
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email Verified</h2>
          <p className="text-gray-400 mb-8">{message}</p>
          <Link
            href="/login"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all"
          >
            Continue to Login
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-gray-400 mb-8">{message}</p>
          <Link
            href="/login"
            className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3.5 rounded-xl transition-all"
          >
            Return to Login
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-yellow-500" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
