"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return <div className="min-h-screen bg-[var(--color-cockpit-black)] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--color-horizon-blue)] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-white w-full flex font-[family-name:var(--font-labels)]">
      {children}
    </div>
  );
}


