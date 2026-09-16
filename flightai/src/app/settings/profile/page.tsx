"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { CockpitButton } from "@/components/ui/CockpitButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flightai-hxbd.onrender.com";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({ name: "", bio: "", avatar: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);

    try {
      await axios.patch(`${API_URL}/api/user/profile`, formData);
      await refreshUser(); // Update global state
      setStatus({ type: "success", message: "Profile updated successfully." });
    } catch (error: any) {
      setStatus({ type: "error", message: error.response?.data?.error || "Failed to update profile." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (isResending) return;
    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);
    try {
      await axios.post(`${API_URL}/api/auth/resend-verification`);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setResendError(err.response?.data?.error || "Failed to resend.");
      setTimeout(() => setResendError(null), 5000);
    } finally {
      setIsResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">Public Profile</h2>
        <p className="text-gray-400 text-sm">Manage how your profile appears to other users.</p>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${status.type === "success" ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
          {status.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${status.type === "success" ? "text-green-400" : "text-red-400"}`}>{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl pb-10">
        <div>
          <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-2 uppercase tracking-widest">Email Address</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              disabled
              value={user.email}
              className="flex-1 bg-black/20 border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-grey)] cursor-not-allowed font-[family-name:var(--font-labels)] text-sm"
            />
            {user.isEmailVerified ? (
              <span className="px-3 py-1.5 border border-green-500 bg-green-500/10 text-green-400 text-[10px] font-bold whitespace-nowrap uppercase tracking-widest font-[family-name:var(--font-labels)]">Verified</span>
            ) : (
              <CockpitButton 
                type="button"
                variant="action"
                onClick={handleResendVerification}
                disabled={isResending || resendSuccess}
                className="whitespace-nowrap"
              >
                {isResending ? 'SENDING...' : resendSuccess ? 'SENT!' : 'UNVERIFIED (RESEND)'}
              </CockpitButton>
            )}
          </div>
          {resendError && <p className="text-xs text-[var(--color-warning-red)] mt-2 font-[family-name:var(--font-labels)]">{resendError}</p>}
          <p className="text-[10px] text-[var(--color-instrument-grey)] mt-2 font-[family-name:var(--font-labels)] uppercase tracking-widest">Email address cannot be changed currently.</p>
        </div>

        <div>
          <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-2 uppercase tracking-widest">Display Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all font-[family-name:var(--font-labels)] text-sm"
          />
        </div>

        <div>
          <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-2 uppercase tracking-widest">Avatar URL</label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all font-[family-name:var(--font-labels)] text-sm"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-[10px] text-[var(--color-instrument-grey)] mt-2 font-[family-name:var(--font-labels)] uppercase tracking-widest">Link to a public image to use as your avatar.</p>
        </div>

        <div>
          <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-2 uppercase tracking-widest">Bio</label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] placeholder-[var(--color-instrument-grey)] focus:outline-none focus:border-[var(--color-horizon-blue)] transition-all resize-none font-[family-name:var(--font-labels)] text-sm"
            placeholder="A short bio about your aviation interests..."
          />
        </div>

        <CockpitButton
          type="submit"
          variant="action"
          disabled={isLoading}
          className="mt-2 w-fit"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              SAVING...
            </>
          ) : (
            "SAVE CHANGES"
          )}
        </CockpitButton>
      </form>
    </div>
  );
}
