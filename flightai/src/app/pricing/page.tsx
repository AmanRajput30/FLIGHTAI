import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Check, Sparkles, Zap, Building } from 'lucide-react';
import { CockpitButton } from '@/components/ui/CockpitButton';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-aervyn-bg-dark] text-aervyn-text-primary] font-labels">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="text-center mb-16 border-b border-aervyn-border-subtle] pb-16">
          <h1 className="text-4xl md:text-6xl font-black mb-6 text-aervyn-text-primary] uppercase tracking-widest">
            SIMPLE, TRANSPARENT PRICING.
          </h1>
          <p className="text-xl text-aervyn-border-subtle] max-w-2xl mx-auto uppercase tracking-widest">
            CHOOSE THE PLAN THAT FITS YOUR INTELLIGENCE NEEDS. CURRENTLY IN BETA — JOIN THE WAITLIST TO LOCK IN EARLY PRICING.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Standard Tier */}
          <div className="bg-aervyn-bg-dark] border border-aervyn-border-subtle] rounded-none p-8 flex flex-col relative group hover:border-aervyn-text-primary] transition-all">
            <div className="mb-8 border-b border-aervyn-border-subtle] pb-6">
              <div className="w-12 h-12 bg-transparent flex items-center justify-center mb-6 border border-aervyn-border-subtle]">
                <Zap className="w-6 h-6 text-aervyn-text-primary]" />
              </div>
              <h3 className="text-2xl font-bold text-aervyn-text-primary] mb-2 uppercase tracking-widest">STANDARD</h3>
              <p className="text-aervyn-border-subtle] text-[10px] h-10 uppercase tracking-widest">FOR AVIATION ENTHUSIASTS TRACKING FLIGHTS CASUALLY.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-aervyn-text-primary] font-mono">$9</span>
                <span className="text-aervyn-border-subtle] font-medium text-sm">/mo</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-[10px] text-aervyn-border-subtle] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> GLOBAL REAL-TIME MAP
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-border-subtle] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> AIRCRAFT METADATA
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-border-subtle] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> STANDARD WEATHER OVERLAYS
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-border-subtle] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> 100 AI QUERIES / MONTH
              </div>
            </div>
            <CockpitButton variant="action" className="w-full mt-8 justify-center">
              JOIN WAITLIST
            </CockpitButton>
          </div>

          {/* Pro Tier */}
          <div className="bg-aervyn-bg-dark] border-2 border-aervyn-status-cyan] rounded-none p-8 flex flex-col relative transform md:-translate-y-4">
            
            <div className="mb-8 border-b border-aervyn-border-subtle] pb-6 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-transparent flex items-center justify-center border border-aervyn-status-cyan]">
                  <Sparkles className="w-6 h-6 text-aervyn-status-cyan]" />
                </div>
                <span className="px-3 py-1 bg-aervyn-status-cyan] text-white text-[10px] font-bold uppercase tracking-widest">MOST POPULAR</span>
              </div>
              <h3 className="text-2xl font-bold text-aervyn-text-primary] mb-2 uppercase tracking-widest">PROFESSIONAL</h3>
              <p className="text-aervyn-border-subtle] text-[10px] h-10 uppercase tracking-widest">DEEP INTELLIGENCE FOR RESEARCHERS AND HARDCORE SPOTTERS.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-aervyn-status-cyan] font-mono">$29</span>
                <span className="text-aervyn-border-subtle] font-medium text-sm">/mo</span>
              </div>
            </div>
            <div className="space-y-4 flex-1 relative z-10">
              <div className="flex items-center gap-3 text-[10px] text-aervyn-text-primary] font-bold uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> EVERYTHING IN STANDARD
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-text-primary] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> PREMIUM SATELLITE IMAGERY
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-text-primary] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> ADVANCED FLIGHT ROUTES
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-text-primary] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> UNLIMITED AI QUERIES
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-text-primary] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> NO API RATE LIMITS
              </div>
            </div>
            <CockpitButton variant="action" className="w-full mt-8 justify-center bg-aervyn-status-cyan] text-white border-aervyn-status-cyan]">
              JOIN WAITLIST
            </CockpitButton>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-aervyn-bg-dark] border border-aervyn-border-subtle] rounded-none p-8 flex flex-col relative group hover:border-aervyn-text-primary] transition-all">
            <div className="mb-8 border-b border-aervyn-border-subtle] pb-6">
              <div className="w-12 h-12 bg-transparent flex items-center justify-center mb-6 border border-aervyn-border-subtle]">
                <Building className="w-6 h-6 text-aervyn-text-primary]" />
              </div>
              <h3 className="text-2xl font-bold text-aervyn-text-primary] mb-2 uppercase tracking-widest">ENTERPRISE</h3>
              <p className="text-aervyn-border-subtle] text-[10px] h-10 uppercase tracking-widest">CUSTOM DATA PIPELINES FOR COMMERCIAL APPLICATIONS.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-aervyn-text-primary] uppercase tracking-widest">CUSTOM</span>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-[10px] text-aervyn-border-subtle] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> EVERYTHING IN PRO
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-border-subtle] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> DEDICATED API ACCESS
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-border-subtle] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> CUSTOM DATA EXPORT
              </div>
              <div className="flex items-center gap-3 text-[10px] text-aervyn-border-subtle] uppercase tracking-widest">
                <Check className="w-4 h-4 text-aervyn-status-cyan] flex-shrink-0" /> SLA GUARANTEE
              </div>
            </div>
            <a href="/contact" className="w-full mt-8">
              <CockpitButton variant="action" className="w-full justify-center">
                CONTACT SALES
              </CockpitButton>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
