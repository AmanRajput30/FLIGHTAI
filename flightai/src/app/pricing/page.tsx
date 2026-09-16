import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Check, Sparkles, Zap, Building } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0c10] text-foreground">
      <Header variant="full" />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tight">
            Simple, Transparent Pricing.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that fits your intelligence needs. Currently in beta — join the waitlist to lock in early pricing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Standard Tier */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Standard</h3>
              <p className="text-gray-400 text-sm h-10">For aviation enthusiasts tracking flights casually.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$9</span>
                <span className="text-gray-500 font-medium">/mo</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> Global Real-time Map
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> Aircraft Metadata
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> Standard Weather Overlays
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-blue-400 flex-shrink-0" /> 100 AI Queries / month
              </div>
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors">
              Join Waitlist
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-[#1a1f2e] to-[#0a0c10] border border-yellow-500/30 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-2xl transform md:-translate-y-4">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="mb-8 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-yellow-500/20">Most Popular</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-gray-400 text-sm h-10">Deep intelligence for researchers and hardcore spotters.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$29</span>
                <span className="text-gray-500 font-medium">/mo</span>
              </div>
            </div>
            <div className="space-y-4 flex-1 relative z-10">
              <div className="flex items-center gap-3 text-sm text-gray-200 font-medium">
                <Check className="w-4 h-4 text-yellow-400 flex-shrink-0" /> Everything in Standard
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-yellow-400 flex-shrink-0" /> Premium Satellite Imagery
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-yellow-400 flex-shrink-0" /> Advanced Flight Routes
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-yellow-400 flex-shrink-0" /> Unlimited AI Queries
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-yellow-400 flex-shrink-0" /> No API Rate Limits
              </div>
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold transition-colors relative z-10 shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)]">
              Join Waitlist
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-8 flex flex-col relative overflow-hidden group hover:border-white/20 transition-all">
            <div className="mb-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 border border-purple-500/20">
                <Building className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 text-sm h-10">Custom data pipelines for commercial applications.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">Custom</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" /> Everything in Pro
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" /> Dedicated API Access
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" /> Custom Data Export
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" /> SLA Guarantee
              </div>
            </div>
            <a href="/contact" className="w-full mt-8 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors text-center block">
              Contact Sales
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
