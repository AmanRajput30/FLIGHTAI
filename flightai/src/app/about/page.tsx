import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About AERVYN",
  description: "Learn about AERVYN, the premier platform for real-time global aviation intelligence and advanced flight tracking telemetry.",
  openGraph: {
    title: "About AERVYN",
    description: "Learn about AERVYN, the premier platform for real-time global aviation intelligence and advanced flight tracking telemetry.",
    url: "https://aervyn.in/about",
  },
};



export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-aervyn-bg-dark] text-foreground">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24">
        <h1 className="text-4xl md:text-5xl font-black mb-8 text-white tracking-tight">
          Democratizing Aviation Intelligence.
        </h1>
        
        <div className="prose prose-invert prose-lg max-w-none text-gray-300">
          <p className="lead text-xl text-gray-400 mb-12">
            Aervyn is an independent aerospace data project built to give enthusiasts, researchers, and professionals access to uncompromised real-time flight telemetry.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">Our Mission</h2>
          <p>
            For too long, deep aviation intelligence has been locked behind expensive enterprise contracts or gated by consumer applications that prioritize ads over accuracy. Aervyn was built to bridge this gap. We combine raw ADS-B data streams from a decentralized network of receivers with cutting-edge artificial intelligence to provide a comprehensive view of the skies.
          </p>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">How We Differ</h2>
          <p>
            Unlike traditional flight trackers that often sanitize, delay, or censor data based on government requests or corporate interests, Aervyn taps into the unfiltered ADS-B exchange network. 
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-400">
            <li><strong className="text-white">Unfiltered Telemetry:</strong> If a transponder is broadcasting and a community receiver hears it, you see it on the map.</li>
            <li><strong className="text-white">AI-Powered Context:</strong> SkyLord, our proprietary AI assistant, analyzes flight paths, weather systems, and historical databases to give you deep context in plain English.</li>
            <li><strong className="text-white">Built for Performance:</strong> Our dynamic viewport rendering allows you to track thousands of simultaneous flights in real-time without freezing your browser.</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-12 mb-4">An Independent Project</h2>
          <p>
            We believe in transparency. Aervyn is an independent, bootstrapped project. We do not operate our own hardware network. Instead, we rely on incredible open-data initiatives like ADSB.lol, open-meteo, and community-driven aircraft databases. 
          </p>
          <p>
            Because we rely on community feeders, our coverage is exceptional in populated areas but may be sparse over oceans or remote regions. We make no claims of being authoritative for operational or navigational use—Aervyn is for situational awareness and research.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
