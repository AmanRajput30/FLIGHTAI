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
    <div className="flex flex-col min-h-screen bg-[#07111F] text-white">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="text-center mb-16 border-b border-slate-800 pb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            Simple, transparent pricing.
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your intelligence needs. Currently in beta — join the waitlist to lock in early pricing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Standard Tier */}
          <div className="bg-[#07111F] border border-slate-800 rounded-xl p-8 flex flex-col relative group hover:border-slate-600 transition-all">
            <div className="mb-8 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-6 border border-slate-800">
                <Zap className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Standard</h3>
              <p className="text-slate-400 text-sm h-10">For aviation enthusiasts tracking flights casually.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$9</span>
                <span className="text-slate-400 font-medium text-sm">/mo</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Global real-time map
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Aircraft metadata
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Standard weather overlays
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> 100 AI queries / month
              </div>
            </div>
            <button className="w-full mt-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors">
              Join Waitlist
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-[#07111F] border-2 border-[#155EEF] rounded-xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-xl shadow-blue-900/20">
            
            <div className="mb-8 border-b border-slate-800 pb-6 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center border border-blue-800/50">
                  <Sparkles className="w-6 h-6 text-[#155EEF]" />
                </div>
                <span className="px-3 py-1 bg-[#155EEF] text-white text-xs font-semibold rounded-full">Most Popular</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
              <p className="text-slate-400 text-sm h-10">Deep intelligence for researchers and hardcore spotters.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">$29</span>
                <span className="text-slate-400 font-medium text-sm">/mo</span>
              </div>
            </div>
            <div className="space-y-4 flex-1 relative z-10">
              <div className="flex items-center gap-3 text-sm text-white font-medium">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Everything in Standard
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Premium satellite imagery
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Advanced flight routes
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Unlimited AI queries
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> No API rate limits
              </div>
            </div>
            <button className="w-full mt-8 py-2.5 bg-[#155EEF] hover:bg-[#1D6FFF] text-white rounded-lg font-medium text-sm transition-colors">
              Join Waitlist
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-[#07111F] border border-slate-800 rounded-xl p-8 flex flex-col relative group hover:border-slate-600 transition-all">
            <div className="mb-8 border-b border-slate-800 pb-6">
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center mb-6 border border-slate-800">
                <Building className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <p className="text-slate-400 text-sm h-10">Custom data pipelines for commercial applications.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Everything in Pro
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Dedicated API access
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> Custom data export
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Check className="w-4 h-4 text-[#155EEF] flex-shrink-0" /> SLA guarantee
              </div>
            </div>
            <a href="/contact" className="w-full mt-8 block">
              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors">
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
