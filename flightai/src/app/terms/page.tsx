import Link from "next/link";
import { Plane, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#121826] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
        <Link href="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-400 mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
          <Plane className="w-10 h-10 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Terms of Service</h1>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using SkyIntel ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. These terms constitute a legally binding agreement between you and SkyIntel Aviation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service & Third-Party Data</h2>
            <p className="mb-2">
              SkyIntel provides real-time aviation tracking, flight path analysis, and AI-assisted data intelligence. Certain aviation data comes from third-party and open-data providers.
            </p>
            <p className="mb-2">
              <strong>ADSB.lol:</strong> SkyIntel uses live aircraft information obtained from ADSB.lol.
            </p>
            <p>
              <strong>Licensing:</strong> Applicable third-party and open-data components remain subject to their respective licenses. ADSB.lol's public database and API data is made available under the Open Database License (ODbL) 1.0. 
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Accuracy & Availability</h2>
            <p className="mb-2">
              <strong>Accuracy:</strong> Aircraft information can be delayed, incomplete, unavailable, or inaccurate. SkyIntel does not guarantee the accuracy, completeness, or timeliness of flight data, radar positions, or AI-generated insights.
            </p>
            <p>
              <strong>Availability:</strong> We do not guarantee continuous third-party data availability. The Service is provided "AS IS" and "AS AVAILABLE".
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-rose-500 mb-3">4. No Safety-Critical Use</h2>
            <p className="text-rose-400 font-medium">
              You are strictly prohibited from relying on SkyIntel for navigation, air traffic control, collision avoidance, flight operations, emergency operations, or any other safety-critical decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
            <p>
              SkyIntel software, branding, and proprietary functionality (including the SkyLord AI Assistant) remain the exclusive property of SkyIntel. This is clearly distinguished from third-party and open data, which remain subject to their respective licenses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. API and Fair Use</h2>
            <p>
              Usage of the SkyLord AI Assistant and mapping tools is subject to fair use limits. Automated scraping, bulk data extraction, or bypassing rate limits is strictly prohibited and will result in immediate account termination.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <p className="text-xs text-gray-500 mt-12 pt-6 border-t border-white/10">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
