import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviation Intelligence Blog",
  description: "Guides, tutorials, and insights into global flight tracking, ADS-B networks, and aviation data analysis.",
  openGraph: {
    title: "Aviation Intelligence Blog",
    description: "Guides, tutorials, and insights into global flight tracking, ADS-B networks, and aviation data analysis.",
    url: "https://aervyn.in/blog",
  },
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-aervyn-bg-dark pt-24 pb-12 px-6 font-labels">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-aervyn-text-primary mb-6">Aviation Intelligence Blog</h1>
        <p className="text-aervyn-text-secondary leading-relaxed mb-8">
          Deep dives into flight tracking technology, ADS-B networks, and aviation data analysis.
        </p>
        <div className="border border-aervyn-border-subtle bg-aervyn-panel-dark rounded p-8 text-center text-aervyn-text-tertiary">
          Articles coming soon.
        </div>
      </div>
    </div>
  );
}
