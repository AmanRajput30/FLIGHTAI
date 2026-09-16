"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Loader2, Key, Monitor, ShieldAlert, Trash2, Smartphone, Laptop, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { CockpitButton } from "@/components/ui/CockpitButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://flightai-hxbd.onrender.com";

export default function SecuritySettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  
  // States
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  
  const [passData, setPassData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passStatus, setPassStatus] = useState<{ type: "success" | "error", message: string } | null>(null);
  const [loadingPass, setLoadingPass] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<{ type: "error", message: string } | null>(null);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/user/sessions`);
      setSessions(res.data.sessions);
      setCurrentSessionId(res.data.currentSessionId);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassStatus(null);
    if (passData.newPassword !== passData.confirmPassword) {
      return setPassStatus({ type: "error", message: "Passwords do not match." });
    }
    if (passData.newPassword.length < 8) {
      return setPassStatus({ type: "error", message: "New password must be at least 8 characters." });
    }

    setLoadingPass(true);
    try {
      const res = await axios.patch(`${API_URL}/api/user/password`, {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      setPassStatus({ type: "success", message: res.data.message });
      setPassData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      fetchSessions(); // Password change invalidates other sessions
    } catch (err: any) {
      setPassStatus({ type: "error", message: err.response?.data?.error || "Failed to change password." });
    } finally {
      setLoadingPass(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/api/user/sessions/${id}`);
      setSessions(sessions.filter(s => s._id !== id));
    } catch (err) {
      console.error("Failed to revoke session", err);
    }
  };

  const handleLogoutAll = async () => {
    try {
      await axios.post(`${API_URL}/api/user/logout-all`);
      fetchSessions();
    } catch (err) {
      console.error("Failed to logout all", err);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE ACCOUNT") {
      return setDeleteStatus({ type: "error", message: "Please type DELETE ACCOUNT to confirm." });
    }
    if (!deletePassword) {
      return setDeleteStatus({ type: "error", message: "Password is required." });
    }

    setLoadingDelete(true);
    try {
      await axios.delete(`${API_URL}/api/user/account`, { data: { password: deletePassword } });
      window.location.href = "/login"; // Force full reload to clear state
    } catch (err: any) {
      setDeleteStatus({ type: "error", message: err.response?.data?.error || "Failed to delete account." });
      setLoadingDelete(false);
    }
  };

  const getDeviceIcon = (ua: string) => {
    if (ua.toLowerCase().includes("mobile") || ua.toLowerCase().includes("android") || ua.toLowerCase().includes("iphone")) {
      return <Smartphone className="w-5 h-5 text-gray-400" />;
    }
    return <Laptop className="w-5 h-5 text-gray-400" />;
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full relative gap-12 overflow-y-auto pb-12">
      {/* Change Password Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Key className="w-5 h-5 text-yellow-500" /> Change Password
          </h2>
          <p className="text-gray-400 text-sm">Update your password to keep your account secure.</p>
        </div>

        {passStatus && (
          <div className={`mb-6 p-4 rounded-xl max-w-xl flex items-start gap-3 border ${passStatus.type === "success" ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            {passStatus.type === "success" ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
            <p className={`text-sm ${passStatus.type === "success" ? "text-green-400" : "text-red-400"}`}>{passStatus.message}</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 max-w-xl">
          <div>
            <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-2 uppercase tracking-widest">Current Password</label>
            <input type="password" required value={passData.currentPassword} onChange={(e) => setPassData({...passData, currentPassword: e.target.value})} className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] focus:border-[var(--color-horizon-blue)] focus:outline-none transition-all font-[family-name:var(--font-labels)] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-2 uppercase tracking-widest">New Password</label>
              <input type="password" required value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] focus:border-[var(--color-horizon-blue)] focus:outline-none transition-all font-[family-name:var(--font-labels)] text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-2 uppercase tracking-widest">Confirm New</label>
              <input type="password" required value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-[var(--color-instrument-white)] focus:border-[var(--color-horizon-blue)] focus:outline-none transition-all font-[family-name:var(--font-labels)] text-sm" />
            </div>
          </div>
          <CockpitButton type="submit" variant="action" disabled={loadingPass} className="mt-1 w-fit">
            {loadingPass ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "UPDATE PASSWORD"}
          </CockpitButton>
        </form>
      </section>

      <hr className="border-white/5" />

      {/* Active Sessions Section */}
      <section>
        <div className="mb-6 flex items-end justify-between max-w-3xl">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-500" /> Active Sessions
            </h2>
            <p className="text-gray-400 text-sm">Devices currently logged into your account.</p>
          </div>
          {sessions.length > 1 && (
            <CockpitButton variant="selector" onClick={handleLogoutAll} className="text-[var(--color-warning-red)] hover:text-white border-[var(--color-warning-red)]">
              LOG OUT OF ALL OTHER DEVICES
            </CockpitButton>
          )}
        </div>

        <div className="flex flex-col gap-3 max-w-3xl">
          {loadingSessions ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
          ) : (
            sessions.map((session) => (
              <div key={session._id} className={`flex items-center justify-between p-4 rounded-xl border ${session._id === currentSessionId ? 'bg-blue-500/5 border-blue-500/20' : 'bg-black/40 border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm flex items-center gap-2">
                      {session.deviceInfo.split(' ').slice(0, 3).join(' ')}
                      {session._id === currentSessionId && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">CURRENT</span>}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">IP: {session.ipAddress} • Last active: {new Date(session.lastActiveAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {session._id !== currentSessionId && (
                  <CockpitButton variant="selector" onClick={() => handleRevokeSession(session._id)}>
                    REVOKE
                  </CockpitButton>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <hr className="border-white/5" />

      {/* Danger Zone */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-red-500 mb-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" /> Danger Zone
          </h2>
          <p className="text-gray-400 text-sm">Permanently delete your account and all associated data.</p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 max-w-xl">
          <h3 className="text-white font-bold mb-2">Delete Account</h3>
          <p className="text-sm text-gray-400 mb-6">This action cannot be undone. All your saved flights, preferences, and session data will be permanently wiped.</p>
          
          {deleteStatus && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {deleteStatus.message}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Type "DELETE ACCOUNT" to confirm</label>
              <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-2.5 text-[var(--color-instrument-white)] focus:border-[var(--color-warning-red)] focus:outline-none transition-all font-mono text-sm" placeholder="DELETE ACCOUNT" />
            </div>
            <div>
              <label className="block text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] mb-1.5 uppercase tracking-widest">Enter Password</label>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-2.5 text-[var(--color-instrument-white)] focus:border-[var(--color-warning-red)] focus:outline-none transition-all" placeholder="••••••••" />
            </div>
            <CockpitButton variant="action" onClick={handleDeleteAccount} disabled={loadingDelete || deleteConfirmText !== "DELETE ACCOUNT" || !deletePassword} className="mt-2 bg-[var(--color-warning-red)] text-white border-[var(--color-warning-red)]">
              {loadingDelete ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} DELETE MY ACCOUNT
            </CockpitButton>
          </div>
        </div>
      </section>
    </div>
  );
}
