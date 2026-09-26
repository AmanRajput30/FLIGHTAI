import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Check, Sparkles, Zap, Building } from 'lucide-react';
import { CockpitButton } from '@/components/ui/CockpitButton';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for AERVYN. Access global flight data, advanced telemetry, and AI-powered aviation insights.",
  openGraph: {
    title: "Pricing",
    description: "Simple, transparent pricing for AERVYN. Access global flight data, advanced telemetry, and AI-powered aviation insights.",
    url: "https://aervyn.in/pricing",
  },
};



export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-aervyn-bg-dark text-aervyn-text-primary font-inter">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="text-center mb-16 border-b border-aervyn-border-dark pb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-aervyn-text-dark-primary tracking-tight">
            Simple, transparent pricing.
          </h1>
          <p className="text-lg text-aervyn-text-dark-secondary max-w-2xl mx-auto">
            Choose the plan that fits your intelligence needs. Currently in beta — join the waitlist to lock in early pricing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Standard Tier */}
          <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-8 flex flex-col relative group hover:border-aervyn-border-dark-subtle transition-all">
            <div className="mb-8 border-b border-aervyn-border-dark pb-6">
              <div className="w-12 h-12 rounded-lg bg-aervyn-surface-dark-elevated flex items-center justify-center mb-6 border border-aervyn-border-dark">
                <Zap className="w-6 h-6 text-aervyn-text-dark-muted" />
              </div>
              <h3 className="text-xl font-semibold text-aervyn-text-dark-primary mb-2">Standard</h3>
              <p className="text-aervyn-text-dark-secondary text-sm h-10">For aviation enthusiasts tracking flights casually.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-aervyn-text-dark-primary">$9</span>
                <span className="text-aervyn-text-dark-muted font-medium text-sm">/mo</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Global real-time map
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Aircraft metadata
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Standard weather overlays
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> 100 AI queries / month
              </div>
            </div>
            <button className="w-full mt-8 py-2.5 bg-aervyn-surface-dark-elevated hover:bg-aervyn-border-dark text-aervyn-text-dark-primary rounded-lg font-medium text-sm transition-colors border border-aervyn-border-dark">
              Join Waitlist
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-aervyn-surface-dark border-2 border-aervyn-primary rounded-xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-aervyn-primary/10">
            
            <div className="mb-8 border-b border-aervyn-border-dark pb-6 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-aervyn-primary/20 flex items-center justify-center border border-aervyn-primary/40">
                  <Sparkles className="w-6 h-6 text-aervyn-primary" />
                </div>
                <span className="px-3 py-1 bg-aervyn-primary text-white text-xs font-semibold rounded-full">Most Popular</span>
              </div>
              <h3 className="text-xl font-semibold text-aervyn-text-dark-primary mb-2">Professional</h3>
              <p className="text-aervyn-text-dark-secondary text-sm h-10">Deep intelligence for researchers and hardcore spotters.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-aervyn-text-dark-primary">$29</span>
                <span className="text-aervyn-text-dark-muted font-medium text-sm">/mo</span>
              </div>
            </div>
            <div className="space-y-4 flex-1 relative z-10">
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-primary font-medium">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Everything in Standard
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Premium satellite imagery
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Advanced flight routes
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Unlimited AI queries
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> No API rate limits
              </div>
            </div>
            <button className="w-full mt-8 py-2.5 bg-aervyn-primary hover:bg-aervyn-primary-hover text-white rounded-lg font-medium text-sm transition-colors">
              Join Waitlist
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-aervyn-surface-dark border border-aervyn-border-dark rounded-xl p-8 flex flex-col relative group hover:border-aervyn-border-dark-subtle transition-all">
            <div className="mb-8 border-b border-aervyn-border-dark pb-6">
              <div className="w-12 h-12 rounded-lg bg-aervyn-surface-dark-elevated flex items-center justify-center mb-6 border border-aervyn-border-dark">
                <Building className="w-6 h-6 text-aervyn-text-dark-muted" />
              </div>
              <h3 className="text-xl font-semibold text-aervyn-text-dark-primary mb-2">Enterprise</h3>
              <p className="text-aervyn-text-dark-secondary text-sm h-10">Custom data pipelines for commercial applications.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-aervyn-text-dark-primary">Custom</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Everything in Pro
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Dedicated API access
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> Custom data export
              </div>
              <div className="flex items-center gap-3 text-sm text-aervyn-text-dark-secondary">
                <Check className="w-4 h-4 text-aervyn-primary flex-shrink-0" /> SLA guarantee
              </div>
            </div>
            <a href="/contact" className="w-full mt-8 block">
              <button className="w-full py-2.5 bg-aervyn-surface-dark-elevated hover:bg-aervyn-border-dark text-aervyn-text-dark-primary border border-aervyn-border-dark rounded-lg font-medium text-sm transition-colors">
                Contact Sales
              </button>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
