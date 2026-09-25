"use client";

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { motion } from 'framer-motion';
import { M_PRESETS } from '@/lib/motion/presets';
import { User, Shield, CreditCard, Users, Bell, Zap, Link as LinkIcon, HelpCircle, UploadCloud, Monitor, Map as MapIcon } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useUIStore } from '@/store/useUIStore';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('details');
  const { user } = useAuth();
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

                    <form className="space-y-6 max-w-2xl">
                      {/* Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start">
                        <label className="sm:col-span-2 block text-sm font-medium text-white pt-2">Name</label>
                        <div className="sm:col-span-4 grid grid-cols-2 gap-4">
                          <input type="text" defaultValue={firstName} className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors" />
                          <input type="text" defaultValue={lastName} className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors" />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start">
                        <label className="sm:col-span-2 block text-sm font-medium text-white pt-2">Email address</label>
                        <div className="sm:col-span-4 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-aervyn-text-dark-muted text-sm">@</span>
                          </div>
                          <input type="email" defaultValue={user?.email || "loading..."} className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors" />
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
                          <input type="text" defaultValue="Product Designer" className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-2 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors" />
                        </div>
                      </div>

                      {/* Bio */}
                      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-start border-t border-aervyn-border-dark pt-6">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-white">Bio</label>
                          <p className="text-xs text-aervyn-text-dark-secondary mt-1">Write a short introduction.</p>
                        </div>
                        <div className="sm:col-span-4">
                          <textarea rows={4} defaultValue="I'm a Product Designer based in Melbourne, Australia. I specialize in UX/UI design, brand strategy, and Webflow development." className="w-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-lg px-4 py-3 text-sm text-white focus:border-aervyn-primary focus:outline-none transition-colors resize-none" />
                          <p className="text-xs text-aervyn-text-dark-secondary mt-2">275 characters left</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-3 pt-6 border-t border-aervyn-border-dark">
                        <button type="button" className="bg-transparent hover:bg-aervyn-surface-dark border border-aervyn-border-dark text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                          Cancel
                        </button>
                        <button type="button" className="bg-aervyn-primary hover:bg-aervyn-primary-light text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
                          Save
                        </button>
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
                            onClick={() => setMapMode('light')}
                            className={`flex flex-col items-start p-4 rounded-xl border transition-all ${mapMode === 'light' ? 'border-aervyn-primary bg-aervyn-primary/5' : 'border-aervyn-border-dark hover:border-aervyn-border-dark-subtle bg-aervyn-surface-dark'}`}
                          >
                            <MapIcon size={24} className={mapMode === 'light' ? 'text-aervyn-primary mb-3' : 'text-aervyn-text-dark-muted mb-3'} />
                            <span className="font-medium text-white">Light Mode</span>
                            <span className="text-xs text-aervyn-text-dark-secondary mt-1 text-left">Clean, bright interface optimized for daylight conditions.</span>
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
                            onClick={() => setPerformanceMode(performanceMode === 'standard' ? 'low' : 'standard')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${performanceMode === 'low' ? 'bg-aervyn-primary' : 'bg-slate-700'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${performanceMode === 'low' ? 'translate-x-6' : 'translate-x-1'}`} />
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
                
                {activeTab !== 'details' && activeTab !== 'preferences' && activeTab !== 'notifications' && (
                  <div className="flex flex-col items-center justify-center h-64 text-aervyn-text-dark-muted border border-dashed border-aervyn-border-dark rounded-xl">
                    <HelpCircle size={32} className="mb-4 opacity-50" />
                    <p>Settings for {tabs.find(t => t.id === activeTab)?.label} will appear here.</p>
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
