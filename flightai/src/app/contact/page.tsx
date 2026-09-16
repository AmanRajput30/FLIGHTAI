"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flightai-hxbd.onrender.com';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Bug',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await axios.post(`${API_URL}/api/contact`, formData);
      setStatus('success');
      setFormData({ name: '', email: '', category: 'Bug', message: '' });
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || "Failed to send message. Please try again later.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0c10] text-foreground">
      <Header variant="full" />
      
      <main className="flex-1 max-w-2xl mx-auto px-6 py-24 w-full">
        <h1 className="text-4xl font-black mb-4 text-white tracking-tight">Contact Us</h1>
        <p className="text-gray-400 mb-10">
          Have a question about our data, found a bug, or want to partner with us? Send us a message and we'll get back to you as soon as possible. Alternatively, you can email us directly at <a href="mailto:support@averyn.in" className="text-yellow-400 hover:underline">support@averyn.in</a>.
        </p>

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
            <p className="text-gray-400">Thanks for reaching out. We've received your message and will respond shortly.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-300">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-400/50 outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-300">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-400/50 outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium text-gray-300">Category</label>
              <select 
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-400/50 outline-none transition-colors appearance-none"
              >
                <option value="Bug">Report a Bug</option>
                <option value="Data accuracy">Data Accuracy Issue</option>
                <option value="Billing">Billing Inquiry</option>
                <option value="Partnership">Partnership</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-300">Message</label>
              <textarea 
                id="message" 
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-400/50 outline-none transition-colors resize-none"
              ></textarea>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}

            <button 
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === 'loading' ? (
                <div className="w-5 h-5 rounded-full border-2 border-black/20 border-t-black animate-spin"></div>
              ) : (
                <>Send Message <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
