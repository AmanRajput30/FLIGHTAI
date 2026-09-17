"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { CockpitButton } from '@/components/ui/CockpitButton';

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
    <div className="flex flex-col min-h-screen bg-[var(--color-cockpit-black)] text-[var(--color-instrument-white)] font-[family-name:var(--font-labels)]">
      <Header variant="full" />
      
      <main className="flex-1 max-w-2xl mx-auto px-6 py-24 w-full">
        <h1 className="text-4xl font-black mb-4 text-[var(--color-instrument-white)] uppercase tracking-widest border-b border-[var(--color-instrument-grey)] pb-6">CONTACT US</h1>
        <p className="text-[10px] text-[var(--color-instrument-grey)] mb-10 uppercase tracking-widest pt-6">
          Have a question about our data, found a bug, or want to partner with us? Send us a message and we'll get back to you as soon as possible. Alternatively, you can email us directly at <a href="mailto:support@averyn.in" className="text-[var(--color-horizon-blue)] hover:text-white transition-colors">support@averyn.in</a>.
        </p>

        {status === 'success' ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-[2px] p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Message Sent!</h2>
            <p className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] uppercase tracking-widest">Thanks for reaching out. We've received your message and will respond shortly.</p>
            <CockpitButton 
              variant="action"
              onClick={() => setStatus('idle')}
              className="mt-6"
            >
              SEND ANOTHER MESSAGE
            </CockpitButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] uppercase tracking-widest">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-sm text-[var(--color-instrument-white)] focus:border-[var(--color-horizon-blue)] outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-sm text-[var(--color-instrument-white)] focus:border-[var(--color-horizon-blue)] outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] uppercase tracking-widest">Category</label>
              <select 
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-sm text-[var(--color-instrument-white)] focus:border-[var(--color-horizon-blue)] outline-none transition-colors"
              >
                <option value="Bug">Report a Bug</option>
                <option value="Data accuracy">Data Accuracy Issue</option>
                <option value="Billing">Billing Inquiry</option>
                <option value="Partnership">Partnership</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-[10px] font-[family-name:var(--font-labels)] text-[var(--color-instrument-grey)] uppercase tracking-widest">Message</label>
              <textarea 
                id="message" 
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] rounded-[2px] px-4 py-3 text-sm text-[var(--color-instrument-white)] focus:border-[var(--color-horizon-blue)] outline-none transition-colors resize-none"
              ></textarea>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-[var(--color-warning-red)] text-[10px] bg-red-500/10 p-3 rounded-[2px] border border-red-500/20 font-[family-name:var(--font-labels)] uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}

            <CockpitButton 
              type="submit"
              variant="action"
              disabled={status === 'loading'}
              className="w-full bg-[var(--color-horizon-blue)] text-white border-[var(--color-horizon-blue)] justify-center"
            >
              {status === 'loading' ? (
                <div className="w-4 h-4 rounded-full border border-white border-t-transparent animate-spin mr-2"></div>
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
            </CockpitButton>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
