"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aervyn.in";

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
    <div className="flex flex-col h-full relative font-labels">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-aervyn-text-primary uppercase tracking-widest mb-1">Clearance Ident</h2>
        <p className="text-aervyn-text-tertiary text-[10px] uppercase tracking-widest font-bold">Manage how your profile appears to other operators.</p>
      </div>

      {status && (
        <div className={`mb-6 p-4 rounded flex items-start gap-3 border ${status.type === "success" ? "bg-aervyn-status-cyan/10 border-aervyn-status-cyan" : "bg-aervyn-status-red/10 border-aervyn-status-red"}`}>
          {status.type === "success" ? (
            <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 text-aervyn-status-cyan`} />
          ) : (
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 text-aervyn-status-red`} />
          )}
          <p className={`text-xs font-bold uppercase tracking-wide ${status.type === "success" ? "text-aervyn-status-cyan" : "text-aervyn-status-red"}`}>{status.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-xl pb-10">
        <div>
          <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-2 uppercase tracking-widest">Comms Channel (Email)</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              disabled
              value={user.email}
              className="flex-1 bg-black/40 border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-tertiary cursor-not-allowed text-xs font-bold tracking-wide"
            />
            {user.isEmailVerified ? (
              <span className="px-3 py-3 border border-aervyn-status-cyan bg-aervyn-status-cyan/10 text-aervyn-status-cyan rounded text-[10px] font-bold whitespace-nowrap uppercase tracking-widest flex items-center justify-center">Verified</span>
            ) : (
              <button 
                type="button"
                onClick={handleResendVerification}
                disabled={isResending || resendSuccess}
                className="px-3 py-3 border border-aervyn-status-amber bg-aervyn-status-amber/10 hover:bg-aervyn-status-amber hover:text-black text-aervyn-status-amber rounded text-[10px] font-bold whitespace-nowrap uppercase tracking-widest transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'TRANSMITTING...' : resendSuccess ? 'TRANSMITTED!' : 'UNVERIFIED (RESEND)'}
              </button>
            )}
          </div>
          {resendError && <p className="text-[10px] font-bold text-aervyn-status-red uppercase tracking-widest mt-2">{resendError}</p>}
          <p className="text-[10px] text-aervyn-text-tertiary mt-2 uppercase tracking-widest font-bold">Email address cannot be modified once set.</p>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-2 uppercase tracking-widest">Operator Designation (Name)</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors text-xs font-bold tracking-wide"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-2 uppercase tracking-widest">Ident Visual (Avatar URL)</label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors text-xs font-bold tracking-wide"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-[10px] text-aervyn-text-tertiary mt-2 uppercase tracking-widest font-bold">Link to a public image resource to override default ident.</p>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-2 uppercase tracking-widest">Operational Bio</label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary placeholder:text-aervyn-text-tertiary focus:outline-none focus:border-aervyn-status-cyan transition-colors resize-none text-xs font-bold tracking-wide leading-relaxed"
            placeholder="Operational background..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-fit bg-aervyn-status-cyan/20 border border-aervyn-status-cyan hover:bg-aervyn-status-cyan text-aervyn-status-cyan hover:text-white px-8 py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(56,189,248,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {isLoading ? "UPDATING IDENT..." : "SAVE CONFIGURATION"}
        </button>
      </form>
    </div>
  );
}
