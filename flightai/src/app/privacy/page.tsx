import Link from "next/link";
import { Plane, ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#121826] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
        <Link href="/" className="inline-flex items-center text-yellow-500 hover:text-yellow-400 mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/10">
          <Shield className="w-10 h-10 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
        </div>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us when you create an account, such as your name, username, and email address. We also collect usage data (including IP addresses, browser types, and device information) to ensure platform security and optimize our real-time radar mapping.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>
              Your information is used to provide, maintain, and improve SkyIntel. This includes powering personalized settings, authenticating logins, responding to AI chat inquiries, and securing your account against unauthorized access via our active threat monitoring systems.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
            <p>
              We implement industry-standard security measures, including bcrypt password hashing, cryptographic stateful session management, and CSRF protection. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p>
              SkyIntel utilizes third-party APIs (such as OpenSky Network, ADSB.lol, and Groq LLM infrastructure) to deliver real-time data and AI capabilities. When interacting with SkyLord AI, your prompts are processed securely via these partners in accordance with their strict privacy standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies and Tracking</h2>
            <p>
              We use secure, HttpOnly cookies strictly for authentication and session management. We do not use third-party tracking cookies for targeted advertising. You can control cookie preferences through your browser settings, though disabling them will prevent you from logging into the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p>
              You have the right to access, update, or request the deletion of your personal information at any time. If you wish to delete your account and all associated data, you can do so from the Settings dashboard or by contacting our support team.
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
