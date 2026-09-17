"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/"); // Redirect authenticated users away from auth pages
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center"><div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-yellow-900/10 blur-[100px]"></div>
      </div>

      {/* Brand */}
      <Link href="/" className="flex items-center gap-2 mb-8 z-10 hover:scale-105 transition-transform">
        <Plane className="w-8 h-8 text-yellow-400" />
        <span className="font-bold text-3xl tracking-tight text-white">Aervyn</span>
      </Link>

      {/* Content Form */}
      <div className="w-full max-w-md z-10 px-4">
        <div className="bg-[#121826]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {children}
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-gray-500 z-10">
        <span>&copy; {new Date().getFullYear()} Aervyn Aviation. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:text-yellow-400 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-yellow-400 transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  );
}
