import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0c10] text-foreground">
      <Header variant="full" />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full">
        <h1 className="text-4xl font-black mb-8 text-white tracking-tight">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
          <p>Last Updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">1. Data We Collect</h2>
          <p>We collect minimal data necessary to operate the Averyn platform:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> If you create an account, we store your email address and an encrypted password.</li>
            <li><strong>Chat History:</strong> Interactions with SkyLord are temporarily processed by Groq's API but are not permanently logged by Averyn for training.</li>
            <li><strong>Usage Telemetry:</strong> We collect anonymous metrics (page loads, API latency) to ensure platform stability.</li>
          </ul>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">2. Cookies</h2>
          <p>We use essential cookies to maintain user sessions and authentication state. We do NOT use third-party tracking or advertising cookies.</p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-4">3. Data Sharing</h2>
          <p>We do not sell your personal data. We only share data with service providers necessary to operate the platform (e.g., MongoDB Atlas for database hosting, Resend for transactional emails, Groq for AI processing).</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
