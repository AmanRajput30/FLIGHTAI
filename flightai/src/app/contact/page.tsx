"use client";

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { CockpitButton } from '@/components/ui/CockpitButton';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://aervyn.in';

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
    <div className="flex flex-col min-h-screen bg-aervyn-bg-dark text-aervyn-text-primary font-inter">
      <Header />
      
      <main className="flex-1 max-w-2xl mx-auto px-6 py-24 w-full">
        <h1 className="text-4xl font-black mb-4 text-aervyn-text-dark-primary uppercase tracking-widest border-b border-aervyn-border-dark pb-6">CONTACT US</h1>
        <p className="text-xs text-aervyn-text-dark-secondary mb-10 uppercase tracking-widest pt-6 font-medium">
          Have a question about our data, found a bug, or want to partner with us? Send us a message and we'll get back to you as soon as possible. Alternatively, you can email us directly at <a href="mailto:support@aervyn.in" className="text-aervyn-primary hover:text-aervyn-primary-hover transition-colors">support@aervyn.in</a>.
        </p>

        {status === 'success' ? (
          <div className="bg-aervyn-status-success/10 border border-aervyn-status-success/30 rounded-lg p-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-aervyn-status-success mb-4" />
            <h2 className="text-2xl font-bold text-aervyn-text-dark-primary mb-2">Message Sent!</h2>
            <p className="text-xs font-inter text-aervyn-text-dark-muted font-medium uppercase tracking-widest">Thanks for reaching out. We've received your message and will respond shortly.</p>
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
                <label htmlFor="name" className="text-xs font-inter font-medium text-aervyn-text-dark-muted uppercase tracking-widest">Name</label>
                <input 
                  type="text" 
                  id="name" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-aervyn-surface-dark border border-aervyn-border-dark rounded-lg px-4 py-3 text-sm text-aervyn-text-dark-primary focus:border-aervyn-primary outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-inter font-medium text-aervyn-text-dark-muted uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-aervyn-surface-dark border border-aervyn-border-dark rounded-lg px-4 py-3 text-sm text-aervyn-text-dark-primary focus:border-aervyn-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="category" className="text-xs font-inter font-medium text-aervyn-text-dark-muted uppercase tracking-widest">Category</label>
              <select 
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-aervyn-surface-dark border border-aervyn-border-dark rounded-lg px-4 py-3 text-sm text-aervyn-text-dark-primary focus:border-aervyn-primary outline-none transition-colors"
              >
                <option value="Bug">Report a Bug</option>
                <option value="Data accuracy">Data Accuracy Issue</option>
                <option value="Billing">Billing Inquiry</option>
                <option value="Partnership">Partnership</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-xs font-inter font-medium text-aervyn-text-dark-muted uppercase tracking-widest">Message</label>
              <textarea 
                id="message" 
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-aervyn-surface-dark border border-aervyn-border-dark rounded-lg px-4 py-3 text-sm text-aervyn-text-dark-primary focus:border-aervyn-primary outline-none transition-colors resize-none"
              ></textarea>
            </div>

            {status === 'error' && (
              <div className="flex items-center gap-2 text-aervyn-status-error text-xs bg-aervyn-status-error/10 p-3 rounded-lg border border-aervyn-status-error/20 font-inter font-medium uppercase tracking-widest">
                <AlertCircle className="w-4 h-4" />
                {errorMessage}
              </div>
            )}

            <CockpitButton 
              type="submit"
              variant="action"
              disabled={status === 'loading'}
              className="w-full bg-aervyn-primary hover:bg-aervyn-primary-hover text-white border-aervyn-primary justify-center font-bold"
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
