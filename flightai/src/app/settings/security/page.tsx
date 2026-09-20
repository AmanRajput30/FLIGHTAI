"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Loader2, Key, Monitor, ShieldAlert, Trash2, Smartphone, Laptop, CheckCircle2, AlertCircle, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from '@react-oauth/google';
import AppleSignin from 'react-apple-signin-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aervyn.in";

export default function SecuritySettingsPage() {
  const { user, logout, refreshUser } = useAuth();
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

  const [linkStatus, setLinkStatus] = useState<{ type: "success" | "error", message: string } | null>(null);
  const [loadingLink, setLoadingLink] = useState(false);

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
      return <Smartphone className="w-5 h-5 text-aervyn-text-secondary" />;
    }
    return <Laptop className="w-5 h-5 text-aervyn-text-secondary" />;
  };

  const handleLinkGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoadingLink(true);
        setLinkStatus(null);
        await axios.post(`${API_URL}/api/user/link/google`, { token: tokenResponse.access_token }, { withCredentials: true });
        await refreshUser();
        setLinkStatus({ type: "success", message: "Google account linked successfully." });
      } catch (err: any) {
        setLinkStatus({ type: "error", message: err.response?.data?.error || "Failed to link Google account." });
      } finally {
        setLoadingLink(false);
      }
    },
    onError: () => setLinkStatus({ type: "error", message: "Google account linking cancelled." })
  });

  const handleLinkApple = async (response: any) => {
    try {
      setLoadingLink(true);
      setLinkStatus(null);
      await axios.post(`${API_URL}/api/user/link/apple`, { 
        token: response.authorization.id_token
      }, { withCredentials: true });
      await refreshUser();
      setLinkStatus({ type: "success", message: "Apple account linked successfully." });
    } catch (err: any) {
      setLinkStatus({ type: "error", message: err.response?.data?.error || "Failed to link Apple account." });
    } finally {
      setLoadingLink(false);
    }
  };

  const handleUnlink = async (provider: 'google' | 'apple') => {
    if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) return;
    try {
      setLoadingLink(true);
      setLinkStatus(null);
      await axios.post(`${API_URL}/api/user/unlink/${provider}`, {}, { withCredentials: true });
      await refreshUser();
      setLinkStatus({ type: "success", message: `${provider} account unlinked successfully.` });
    } catch (err: any) {
      setLinkStatus({ type: "error", message: err.response?.data?.error || `Failed to unlink ${provider} account.` });
    } finally {
      setLoadingLink(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col h-full relative gap-12 overflow-y-auto pb-12 font-labels">
      {/* Change Password Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-aervyn-text-primary mb-1 flex items-center gap-2 uppercase tracking-widest">
            <Key className="w-5 h-5 text-aervyn-status-amber" /> Rotate Access Code
          </h2>
          <p className="text-aervyn-text-tertiary text-[10px] uppercase tracking-widest font-bold">Update your passcode to maintain operational security.</p>
        </div>

        {passStatus && (
          <div className={`mb-6 p-4 rounded max-w-xl flex items-start gap-3 border ${passStatus.type === "success" ? "bg-aervyn-status-cyan/10 border-aervyn-status-cyan" : "bg-aervyn-status-red/10 border-aervyn-status-red"}`}>
            {passStatus.type === "success" ? <CheckCircle2 className="w-5 h-5 text-aervyn-status-cyan shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-aervyn-status-red shrink-0 mt-0.5" />}
            <p className={`text-xs font-bold uppercase tracking-wide ${passStatus.type === "success" ? "text-aervyn-status-cyan" : "text-aervyn-status-red"}`}>{passStatus.message}</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-5 max-w-xl">
          <div>
            <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-2 uppercase tracking-widest">Current Code</label>
            <input type="password" required value={passData.currentPassword} onChange={(e) => setPassData({...passData, currentPassword: e.target.value})} className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary focus:border-aervyn-status-cyan focus:outline-none transition-colors text-xs font-bold tracking-wide" placeholder="••••••••" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-2 uppercase tracking-widest">New Code</label>
              <input type="password" required value={passData.newPassword} onChange={(e) => setPassData({...passData, newPassword: e.target.value})} className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary focus:border-aervyn-status-cyan focus:outline-none transition-colors text-xs font-bold tracking-wide" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-2 uppercase tracking-widest">Confirm New</label>
              <input type="password" required value={passData.confirmPassword} onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})} className="w-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-4 py-3 text-aervyn-text-primary focus:border-aervyn-status-cyan focus:outline-none transition-colors text-xs font-bold tracking-wide" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loadingPass} className="mt-1 w-fit bg-aervyn-status-amber/10 border border-aervyn-status-amber text-aervyn-status-amber hover:bg-aervyn-status-amber hover:text-black px-6 py-2.5 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingPass ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "ROTATE CODE"}
          </button>
        </form>
      </section>

      <hr className="border-aervyn-border-subtle" />

      {/* Linked Accounts Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-aervyn-text-primary mb-1 flex items-center gap-2 uppercase tracking-widest">
            <LinkIcon className="w-5 h-5 text-purple-500" /> Authorized Systems
          </h2>
          <p className="text-aervyn-text-tertiary text-[10px] uppercase tracking-widest font-bold">Link external identity providers for rapid access.</p>
        </div>

        {linkStatus && (
          <div className={`mb-6 p-4 rounded max-w-xl flex items-start gap-3 border ${linkStatus.type === "success" ? "bg-aervyn-status-cyan/10 border-aervyn-status-cyan" : "bg-aervyn-status-red/10 border-aervyn-status-red"}`}>
            {linkStatus.type === "success" ? <CheckCircle2 className="w-5 h-5 text-aervyn-status-cyan shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-aervyn-status-red shrink-0 mt-0.5" />}
            <p className={`text-xs font-bold uppercase tracking-wide ${linkStatus.type === "success" ? "text-aervyn-status-cyan" : "text-aervyn-status-red"}`}>{linkStatus.message}</p>
          </div>
        )}

        <div className="flex flex-col gap-4 max-w-xl">
          {/* Google Link */}
          <div className="flex items-center justify-between p-4 rounded border border-aervyn-border-subtle bg-black/40 hover:border-aervyn-text-tertiary transition-colors">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <div>
                <h4 className="text-aervyn-text-primary font-bold text-xs uppercase tracking-widest">Google Auth</h4>
                <p className="text-[10px] text-aervyn-text-tertiary mt-1 font-bold uppercase tracking-widest">{user.googleId ? "LINKED ✓" : "UNLINKED ✗"}</p>
              </div>
            </div>
            {user.googleId ? (
              <button onClick={() => handleUnlink('google')} disabled={loadingLink} className="text-[9px] font-bold uppercase tracking-widest text-aervyn-text-secondary hover:text-aervyn-status-red border border-aervyn-border-subtle hover:border-aervyn-status-red px-4 py-2 rounded transition-colors">
                UNLINK
              </button>
            ) : (
              <button onClick={() => handleLinkGoogle()} disabled={loadingLink} className="text-[9px] font-bold uppercase tracking-widest text-aervyn-text-secondary hover:text-aervyn-status-cyan border border-aervyn-border-subtle hover:border-aervyn-status-cyan px-4 py-2 rounded transition-colors">
                AUTHORIZE
              </button>
            )}
          </div>

          {/* Apple Link */}
          <div className="flex items-center justify-between p-4 rounded border border-aervyn-border-subtle bg-black/40 hover:border-aervyn-text-tertiary transition-colors">
            <div className="flex items-center gap-4">
              <svg viewBox="0 0 384 512" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="#fff" className="opacity-90"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              <div>
                <h4 className="text-aervyn-text-primary font-bold text-xs uppercase tracking-widest">Apple Auth</h4>
                <p className="text-[10px] text-aervyn-text-tertiary mt-1 font-bold uppercase tracking-widest">{user.appleId ? "LINKED ✓" : "UNLINKED ✗"}</p>
              </div>
            </div>
            {user.appleId ? (
              <button onClick={() => handleUnlink('apple')} disabled={loadingLink} className="text-[9px] font-bold uppercase tracking-widest text-aervyn-text-secondary hover:text-aervyn-status-red border border-aervyn-border-subtle hover:border-aervyn-status-red px-4 py-2 rounded transition-colors">
                UNLINK
              </button>
            ) : (
              <AppleSignin
                authOptions={{
                  clientId: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || 'com.example.web',
                  scope: 'email name',
                  redirectURI: 'https://example.com',
                  state: 'state',
                  nonce: 'nonce',
                  usePopup: true,
                }}
                uiType="dark"
                className="w-full"
                onSuccess={(response: any) => handleLinkApple(response)}
                onError={() => setLinkStatus({ type: "error", message: "Apple account linking failed." })}
                render={(props: any) => (
                  <button onClick={props.onClick} disabled={loadingLink} className="text-[9px] font-bold uppercase tracking-widest text-aervyn-text-secondary hover:text-aervyn-status-cyan border border-aervyn-border-subtle hover:border-aervyn-status-cyan px-4 py-2 rounded transition-colors">
                    AUTHORIZE
                  </button>
                )}
              />
            )}
          </div>
        </div>
      </section>

      <hr className="border-aervyn-border-subtle" />

      {/* Active Sessions Section */}
      <section>
        <div className="mb-6 flex items-end justify-between max-w-3xl">
          <div>
            <h2 className="text-xl font-bold text-aervyn-text-primary mb-1 flex items-center gap-2 uppercase tracking-widest">
              <Monitor className="w-5 h-5 text-aervyn-status-cyan" /> Terminal Access
            </h2>
            <p className="text-aervyn-text-tertiary text-[10px] uppercase tracking-widest font-bold">Systems currently authorized to access this account.</p>
          </div>
          {sessions.length > 1 && (
            <button onClick={handleLogoutAll} className="bg-aervyn-status-red/10 border border-aervyn-status-red text-aervyn-status-red hover:bg-aervyn-status-red hover:text-white px-4 py-2 rounded font-bold text-[9px] uppercase tracking-widest transition-colors drop-shadow-[0_0_5px_rgba(239,68,68,0.2)]">
              TERMINATE ALL OTHERS
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 max-w-3xl">
          {loadingSessions ? (
            <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-aervyn-status-cyan" /></div>
          ) : (
            sessions.map((session) => (
              <div key={session._id} className={`flex items-center justify-between p-4 rounded border ${session._id === currentSessionId ? 'bg-aervyn-status-cyan/5 border-aervyn-status-cyan/50 shadow-[0_0_10px_rgba(56,189,248,0.1)]' : 'bg-black/40 border-aervyn-border-subtle'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${session._id === currentSessionId ? 'bg-aervyn-status-cyan/20' : 'bg-white/5'}`}>
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  <div>
                    <h4 className="text-aervyn-text-primary font-bold text-xs flex items-center gap-2 uppercase tracking-widest">
                      {session.deviceInfo.split(' ').slice(0, 3).join(' ')}
                      {session._id === currentSessionId && <span className="text-[8px] bg-aervyn-status-cyan border border-aervyn-status-cyan text-black px-1.5 py-0.5 rounded-sm font-extrabold shadow-[0_0_5px_rgba(56,189,248,0.5)]">THIS TERMINAL</span>}
                    </h4>
                    <p className="text-[10px] text-aervyn-text-tertiary mt-1 font-bold tracking-widest uppercase">IP: {session.ipAddress} | Last Sync: {new Date(session.lastActiveAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {session._id !== currentSessionId && (
                  <button onClick={() => handleRevokeSession(session._id)} className="text-[9px] font-bold uppercase tracking-widest text-aervyn-text-secondary hover:text-aervyn-status-red border border-aervyn-border-subtle hover:border-aervyn-status-red px-4 py-2 rounded transition-colors">
                    REVOKE
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <hr className="border-aervyn-border-subtle" />

      {/* Danger Zone */}
      <section>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-aervyn-status-red mb-1 flex items-center gap-2 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(239,68,68,0.5)]">
            <ShieldAlert className="w-5 h-5" /> Code Red
          </h2>
          <p className="text-aervyn-text-tertiary text-[10px] uppercase tracking-widest font-bold">Permanently erase operator record and all associated intelligence.</p>
        </div>

        <div className="bg-aervyn-status-red/5 border border-aervyn-status-red/30 rounded p-6 max-w-xl">
          <h3 className="text-aervyn-text-primary font-bold mb-2 uppercase tracking-widest text-xs">Self Destruct Protocol</h3>
          <p className="text-[10px] text-aervyn-text-tertiary mb-6 font-bold uppercase tracking-widest leading-relaxed">This action cannot be aborted. All operational data, clearances, and terminal access will be permanently wiped from the grid.</p>
          
          {deleteStatus && (
            <div className="mb-4 p-3 rounded bg-aervyn-status-red/10 border border-aervyn-status-red text-[10px] uppercase tracking-widest font-bold text-aervyn-status-red flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {deleteStatus.message}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-1.5 uppercase tracking-widest">Type "DELETE ACCOUNT" to verify</label>
              <input type="text" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} className="w-full bg-black/40 border border-aervyn-border-subtle rounded px-4 py-2.5 text-aervyn-text-primary focus:border-aervyn-status-red focus:outline-none transition-colors font-mono text-xs" placeholder="DELETE ACCOUNT" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-aervyn-text-tertiary mb-1.5 uppercase tracking-widest">Operator Code</label>
              <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} className="w-full bg-black/40 border border-aervyn-border-subtle rounded px-4 py-2.5 text-aervyn-text-primary focus:border-aervyn-status-red focus:outline-none transition-colors text-xs font-bold tracking-wide" placeholder="••••••••" />
            </div>
            <button onClick={handleDeleteAccount} disabled={loadingDelete || deleteConfirmText !== "DELETE ACCOUNT" || !deletePassword} className="mt-2 bg-aervyn-status-red/20 border border-aervyn-status-red text-aervyn-status-red hover:bg-aervyn-status-red hover:text-white px-6 py-3 rounded font-bold text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2 drop-shadow-[0_0_8px_rgba(239,68,68,0.2)] disabled:opacity-50 disabled:cursor-not-allowed">
              {loadingDelete ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />} INITIATE ERASE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
