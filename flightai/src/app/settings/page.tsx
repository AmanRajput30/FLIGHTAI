"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';
import { User, Shield, CreditCard, Users, Bell, Zap, Link as LinkIcon, HelpCircle, UploadCloud, Monitor, Map as MapIcon } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useUIStore } from '@/store/useUIStore';
import { userApi } from '@/lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('details');
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passSaved, setPassSaved] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  
  const [apiKey, setApiKey] = useState('loading...');
  const [copied, setCopied] = useState(false);

  const { user, refreshUser } = useAuth();

  useEffect(() => {
    // Generate or retrieve a persistent mock API key for the user
    if (typeof window !== 'undefined' && user?._id) {
       const storedKey = localStorage.getItem(`aervyn_api_key_${user._id}`);
       if (storedKey) {
         setApiKey(storedKey);
       } else {
         const newKey = `ak_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
         localStorage.setItem(`aervyn_api_key_${user._id}`, newKey);
         setApiKey(newKey);
       }
    }
  }, [user?._id]);
  const { mapMode, setMapMode, performanceMode, setPerformanceMode } = useUIStore();
  
  const nameParts = user?.name ? user.name.split(' ') : ['Commander', 'Sky'];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'C';

  const tabs = [
    { id: 'details', label: 'My details', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Monitor },
    { id: 'password', label: 'Password', icon: Shield },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'api', label: 'API', icon: Zap },
  ];

  return (
    <div className="h-screen w-screen bg-aervyn-bg-dark text-aervyn-text-primary overflow-hidden relative flex">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 mt-14 lg:mt-[72px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={M_PRESETS.panel}
            className="max-w-5xl mx-auto"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
              <p className="text-sm text-aervyn-text-dark-secondary">Manage your account settings and preferences.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Settings Sidebar */}
              <div className="w-full md:w-64 shrink-0">
                <nav className="flex flex-col space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                          isActive 
                            ? 'bg-aervyn-surface-dark-elevated text-white' 
                            : 'text-aervyn-text-dark-secondary hover:bg-aervyn-surface-dark hover:text-white'
                        }`}
                      >
                        <Icon size={18} className={isActive ? 'text-white' : 'text-aervyn-text-dark-muted'} />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1 min-w-0">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="pb-5 border-b border-aervyn-border-dark">
                      <h2 className="text-lg font-semibold text-white">Personal info</h2>
                      <p className="text-sm text-aervyn-text-dark-secondary mt-1">Update your photo and personal details here.</p>
                    </div>

                    <form 
                      className="space-y-6 max-w-2xl"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setSaveError(null);
                        const formData = new FormData(e.currentTarget);
                        const fName = formData.get('firstName') as string;
                        const lName = formData.get('lastName') as string;
                        const fullName = `${fName} ${lName}`.trim();
                        const role = formData.get('role') as string;
                        const bio = formData.get('bio') as string;
                        
                        try {
                          await userApi.updateProfile({ name: fullName, role, bio });
                          await refreshUser();
                          setIsSaved(true);
                          setTimeout(() => setIsSaved(false), 2000);
                        } catch (err: any) {
                          setSaveError(err.response?.data?.error || 'Failed to save changes.');
                        }
                      }}
                    >
                      {/* Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start">
                        <label className="sm:col-span-2 block text-sm font-medium text-white pt-2">Name</label>
                        <div className="sm:col-span-4 grid grid-cols-2 gap-4">
                          <input type="text" name="firstName" defaultValue={firstName} className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors" />
                          <input type="text" name="lastName" defaultValue={lastName} className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start">
                        <label className="sm:col-span-2 block text-sm font-medium text-white pt-2">Email address</label>
                        <div className="sm:col-span-4 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-aervyn-text-dark-muted text-sm">@</span>
                          </div>
                          <input type="email" disabled defaultValue={user?.email || "loading..."} className="w-full bg-aervyn-bg-dark/50 border border-aervyn-border-dark rounded-lg pl-9 pr-4 py-2 text-sm text-white/50 cursor-not-allowed outline-none transition-colors" title="Email cannot be changed here." />
                        </div>
                      </div>

                      {/* Photo */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start border-t border-aervyn-border-dark pt-6">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-white">Your photo</label>
                          <p className="text-xs text-aervyn-text-dark-secondary mt-1">This will be displayed on your profile.</p>
                        </div>
                        <div className="sm:col-span-4 flex items-center gap-6">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-aervyn-surface-dark-elevated shrink-0 border border-aervyn-border-dark flex items-center justify-center font-bold text-xl text-aervyn-text-dark-secondary">
                            {user?.avatar ? (
                               <Image src={user.avatar} alt="Profile" width={64} height={64} className="w-full h-full object-cover" />
                            ) : (
                               initial
                            )}
                          </div>
                          <div className="flex-1 border border-dashed border-aervyn-border-dark rounded-xl p-6 flex flex-col items-center justify-center hover:bg-aervyn-surface-dark transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-aervyn-surface-dark-elevated rounded-full flex items-center justify-center mb-3">
                              <UploadCloud size={20} className="text-white" />
                            </div>
                            <p className="text-sm text-white mb-1"><span className="text-aervyn-primary font-medium">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-aervyn-text-dark-secondary">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                          </div>
                        </div>
                      </div>

                      {/* Role */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start border-t border-aervyn-border-dark pt-6">
                        <label className="sm:col-span-2 block text-sm font-medium text-white pt-2">Role</label>
                        <div className="sm:col-span-4">
                          <input type="text" name="role" defaultValue={user?.role || "Mission Commander"} className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors" />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start border-t border-aervyn-border-dark pt-6">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-white">Bio</label>
                          <p className="text-xs text-aervyn-text-dark-secondary mt-1">Write a short introduction.</p>
                        </div>
                        <div className="sm:col-span-4">
                          <textarea name="bio" rows={4} defaultValue={user?.bio || "Aviation enthusiast and telemetry analyst."} className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-3 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors resize-none" />
                          <p className="text-xs text-aervyn-text-dark-secondary mt-2">275 characters left</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-between gap-3 pt-6 border-t border-aervyn-border-dark items-center">
                        <div>
                           {saveError && <span className="text-red-500 text-sm">{saveError}</span>}
                        </div>
                        <div className="flex gap-3">
                          <button type="button" className="bg-transparent hover:bg-aervyn-surface-dark border border-aervyn-border-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                            Cancel
                          </button>
                          <button type="submit" disabled={isSaved} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isSaved ? 'bg-green-600' : 'bg-aervyn-primary hover:bg-aervyn-primary-light'} text-white disabled:opacity-80`}>
                            {isSaved ? 'Saved!' : 'Save changes'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
                
                {activeTab === 'preferences' && (
                  <div className="space-y-6">
                    <div className="pb-5 border-b border-aervyn-border-dark">
                      <h2 className="text-lg font-semibold text-white">Application Preferences</h2>
                      <p className="text-sm text-aervyn-text-dark-secondary mt-1">Customize how AERVYN looks and performs.</p>
                    </div>

                    <div className="space-y-8 max-w-2xl">
                      {/* Map Mode */}
                      <div>
                        <h3 className="text-sm font-medium text-white mb-4">Map Appearance</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <button 
                            onClick={() => setMapMode('dark')}
                            className={`flex flex-col items-start p-4 rounded-xl border transition-all ${mapMode === 'dark' ? 'border-aervyn-primary bg-aervyn-primary/5' : 'border-aervyn-border-dark hover:border-aervyn-border-dark-subtle bg-aervyn-surface-dark'}`}
                          >
                            <MapIcon size={24} className={mapMode === 'dark' ? 'text-aervyn-primary mb-3' : 'text-aervyn-text-dark-muted mb-3'} />
                            <span className="font-medium text-white">Dark Mode</span>
                            <span className="text-xs text-aervyn-text-dark-secondary mt-1 text-left">High contrast tactical interface optimized for dark environments.</span>
                          </button>
                          <button 
                            onClick={() => setMapMode('satellite')}
                            className={`flex flex-col items-start p-4 rounded-xl border transition-all ${mapMode === 'satellite' ? 'border-aervyn-primary bg-aervyn-primary/5' : 'border-aervyn-border-dark hover:border-aervyn-border-dark-subtle bg-aervyn-surface-dark'}`}
                          >
                            <MapIcon size={24} className={mapMode === 'satellite' ? 'text-aervyn-primary mb-3' : 'text-aervyn-text-dark-muted mb-3'} />
                            <span className="font-medium text-white">Satellite Mode</span>
                            <span className="text-xs text-aervyn-text-dark-secondary mt-1 text-left">High resolution satellite imagery overlay.</span>
                          </button>
                        </div>
                      </div>

                      {/* Performance Mode */}
                      <div className="pt-6 border-t border-aervyn-border-dark">
                        <h3 className="text-sm font-medium text-white mb-4">Performance Profile</h3>
                        <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Low Latency Mode</p>
                            <p className="text-xs text-aervyn-text-dark-secondary mt-1 max-w-md">Disables animations and visual effects to prioritize rendering speed and battery life.</p>
                          </div>
                          <button 
                            onClick={() => setPerformanceMode(!performanceMode)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${performanceMode ? 'bg-aervyn-primary' : 'bg-slate-700'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${performanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div className="pb-5 border-b border-aervyn-border-dark">
                      <h2 className="text-lg font-semibold text-white">Notification Settings</h2>
                      <p className="text-sm text-aervyn-text-dark-secondary mt-1">Control when and how you receive alerts.</p>
                    </div>

                    <div className="space-y-6 max-w-2xl">
                      {[
                        { title: 'Critical System Alerts', desc: 'Receive immediate notifications for core system outages.', active: true },
                        { title: 'Fleet Anomalies', desc: 'Alerts when aircraft in your fleet experience rapid descent or squawk 7700.', active: true },
                        { title: 'Weather Advisories', desc: 'Daily digests of severe weather affecting your tracked regions.', active: false },
                        { title: 'New Features', desc: 'Occasional emails about new AERVYN updates.', active: false }
                      ].map((pref, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-aervyn-border-dark/50 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-white">{pref.title}</p>
                            <p className="text-xs text-aervyn-text-dark-secondary mt-1">{pref.desc}</p>
                          </div>
                          <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pref.active ? 'bg-aervyn-primary' : 'bg-slate-700'} opacity-70 cursor-not-allowed`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pref.active ? 'translate-x-6' : 'translate-x-1'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'password' && (
                  <div className="space-y-6">
                    <div className="pb-5 border-b border-aervyn-border-dark">
                      <h2 className="text-lg font-semibold text-white">Password</h2>
                      <p className="text-sm text-aervyn-text-dark-secondary mt-1">Manage your account security.</p>
                    </div>
                    <form 
                      className="space-y-6 max-w-xl"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setPassError(null);
                        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                           setPassError("Passwords do not match.");
                           return;
                        }
                        if (passwordForm.newPassword.length < 6) {
                           setPassError("Password must be at least 6 characters.");
                           return;
                        }
                        try {
                          await userApi.updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
                          setPassSaved(true);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                          setTimeout(() => setPassSaved(false), 2000);
                        } catch (err: any) {
                          setPassError(err.response?.data?.error || 'Failed to update password.');
                        }
                      }}
                    >
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Current Password</label>
                        <input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} placeholder="Enter current password" required className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">New Password</label>
                        <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} placeholder="Create new password" required className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                        <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="Confirm new password" required className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary outline-none" />
                      </div>
                      <div className="flex justify-between items-center">
                         {passError && <span className="text-red-500 text-sm">{passError}</span>}
                         <button type="submit" disabled={passSaved} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${passSaved ? 'bg-green-600 text-white' : 'bg-aervyn-primary hover:bg-aervyn-primary-light text-white'} ${passError ? 'ml-auto' : ''}`}>
                           {passSaved ? 'Updated!' : 'Update Password'}
                         </button>
                      </div>
                    </form>
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="space-y-6">
                    <div className="pb-5 border-b border-aervyn-border-dark flex justify-between items-end">
                      <div>
                        <h2 className="text-lg font-semibold text-white">Team Members</h2>
                        <p className="text-sm text-aervyn-text-dark-secondary mt-1">Manage who has access to your operational dashboard.</p>
                      </div>
                      <button className="bg-aervyn-primary hover:bg-aervyn-primary-light text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Invite Member</button>
                    </div>
                    <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl overflow-hidden max-w-3xl">
                      <div className="grid grid-cols-12 gap-4 p-4 border-b border-aervyn-border-dark bg-aervyn-surface-dark-elevated text-xs font-medium text-aervyn-text-dark-secondary uppercase">
                        <div className="col-span-5">Name</div>
                        <div className="col-span-4">Role</div>
                        <div className="col-span-3 text-right">Status</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 p-4 items-center">
                        <div className="col-span-5 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-aervyn-surface-dark-elevated text-aervyn-text-dark-secondary flex items-center justify-center font-bold text-xs border border-aervyn-border-dark">
                             {user?.avatar ? <Image src={user.avatar} alt="Profile" width={32} height={32} className="w-full h-full object-cover" /> : initial}
                          </div>
                          <span className="text-sm font-medium text-white">{user?.name || 'You'} (You)</span>
                        </div>
                        <div className="col-span-4 text-sm text-aervyn-text-dark-muted">{user?.role || 'Owner'}</div>
                        <div className="col-span-3 text-right"><span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">Active</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <div className="pb-5 border-b border-aervyn-border-dark">
                      <h2 className="text-lg font-semibold text-white">Billing & Plan</h2>
                      <p className="text-sm text-aervyn-text-dark-secondary mt-1">Manage your subscription and payment methods.</p>
                    </div>
                    <div className="bg-gradient-to-br from-aervyn-primary/10 to-aervyn-bg-dark border border-aervyn-primary/30 rounded-xl p-6 max-w-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6">
                         <span className="px-3 py-1 bg-aervyn-primary text-white text-xs font-bold uppercase tracking-wider rounded-full">Pro Tier</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">AERVYN Professional</h3>
                      <p className="text-aervyn-text-dark-secondary mb-6 max-w-md">You have unlimited access to live telemetry, predictive modeling, and fleet tracking.</p>
                      <div className="flex gap-4">
                        <button className="bg-white text-black hover:bg-slate-200 px-5 py-2 rounded-lg text-sm font-medium transition-colors">Manage Plan</button>
                        <button className="bg-transparent hover:bg-aervyn-surface-dark border border-aervyn-border-dark text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">View Invoices</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="space-y-6">
                    <div className="pb-5 border-b border-aervyn-border-dark">
                      <h2 className="text-lg font-semibold text-white">API Access</h2>
                      <p className="text-sm text-aervyn-text-dark-secondary mt-1">Generate and manage developer API keys.</p>
                    </div>
                    <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-6 max-w-2xl">
                      <h3 className="text-sm font-medium text-white mb-4">Production API Key</h3>
                      <div className="flex gap-3">
                        <div className="flex-1 bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2.5 text-sm font-mono text-aervyn-text-dark-muted flex items-center select-all overflow-x-auto whitespace-nowrap">
                          {apiKey}
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="bg-aervyn-surface-dark-elevated hover:bg-aervyn-surface-dark-active border border-aervyn-border-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="mt-4 pt-4 border-t border-aervyn-border-dark flex justify-between items-center">
                        <span className="text-xs text-aervyn-text-dark-secondary">Last used: Never</span>
                        <button 
                          onClick={() => {
                            if (user?._id) {
                              const newKey = `ak_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
                              localStorage.setItem(`aervyn_api_key_${user._id}`, newKey);
                              setApiKey(newKey);
                            }
                          }}
                          className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                          Revoke & Regenerate Key
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    <div className="pb-5 border-b border-aervyn-border-dark">
                      <h2 className="text-lg font-semibold text-white">Integrations</h2>
                      <p className="text-sm text-aervyn-text-dark-secondary mt-1">Connect AERVYN to your external tools.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                      {['Slack', 'Discord', 'Microsoft Teams', 'Custom Webhooks'].map(app => (
                        <div key={app} className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-aervyn-surface-dark-elevated flex items-center justify-center">
                               <LinkIcon size={18} className="text-aervyn-text-dark-muted" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{app}</p>
                              <p className="text-xs text-aervyn-text-dark-secondary">Not connected</p>
                            </div>
                          </div>
                          <button className="text-xs font-medium bg-aervyn-bg-dark border border-aervyn-border-dark hover:border-aervyn-primary text-white px-3 py-1.5 rounded transition-colors">Connect</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
