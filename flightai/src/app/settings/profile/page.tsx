"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [formData, setFormData] = useState({ name: "", bio: "", avatar: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              disabled
              value={user.email}
              className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
            />
            {user.isEmailVerified ? (
              <span className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold whitespace-nowrap">Verified</span>
            ) : (
              <span className="px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold whitespace-nowrap">Unverified</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">Email address cannot be changed currently.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Display Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Avatar URL</label>
          <input
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
            placeholder="https://example.com/avatar.jpg"
          />
          <p className="text-xs text-gray-500 mt-2">Link to a public image to use as your avatar.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bio</label>
          <textarea
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all resize-none"
            placeholder="A short bio about your aviation interests..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2 w-fit flex items-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}
