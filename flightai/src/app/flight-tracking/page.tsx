import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Flight Tracking",
  description: "Track commercial and private flights globally in real-time. View detailed aircraft data, interactive maps, and live radar.",
  openGraph: {
    title: "Live Flight Tracking",
    description: "Track commercial and private flights globally in real-time. View detailed aircraft data, interactive maps, and live radar.",
    url: "https://aervyn.in/flight-tracking",
  },
};

export default function FlightTrackingPage() {
  return (
    <div className="min-h-screen bg-aervyn-bg-dark pt-24 pb-12 px-6 font-labels">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-aervyn-text-primary mb-6">Live Flight Tracking</h1>
        <p className="text-aervyn-text-secondary leading-relaxed mb-8">
          Monitor the world's airspace in real-time with our low-latency flight tracking map.
        </p>
      </div>
    </div>
  );
}
