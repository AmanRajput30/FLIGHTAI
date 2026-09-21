import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AERVYN Features",
  description: "Explore the powerful features of AERVYN, including real-time ADS-B tracking, 3D telemetry, and predictive AI flight paths.",
  openGraph: {
    title: "AERVYN Features",
    description: "Explore the powerful features of AERVYN, including real-time ADS-B tracking, 3D telemetry, and predictive AI flight paths.",
    url: "https://aervyn.in/features",
  },
};

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-aervyn-bg-dark pt-24 pb-12 px-6 font-labels">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-aervyn-text-primary mb-6">Features</h1>
        <p className="text-aervyn-text-secondary leading-relaxed mb-8">
          AERVYN provides unparalleled visibility into global airspace through a suite of advanced features.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-aervyn-panel-dark p-6 rounded border border-aervyn-border-subtle">
            <h2 className="text-xl font-bold text-aervyn-status-cyan mb-3">Live Global Tracking</h2>
            <p className="text-sm text-aervyn-text-tertiary">Track over 15,000 aircraft simultaneously using our redundant ADS-B network architecture.</p>
          </div>
          <div className="bg-aervyn-panel-dark p-6 rounded border border-aervyn-border-subtle">
            <h2 className="text-xl font-bold text-aervyn-status-cyan mb-3">Deep Telemetry</h2>
            <p className="text-sm text-aervyn-text-tertiary">Access granular data including Mach speed, vertical rate, true track, and squawk codes.</p>
          </div>
          <div className="bg-aervyn-panel-dark p-6 rounded border border-aervyn-border-subtle">
            <h2 className="text-xl font-bold text-aervyn-status-cyan mb-3">SkyLord AI Intelligence</h2>
            <p className="text-sm text-aervyn-text-tertiary">Ask complex natural language queries about airspace congestion and flight patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
