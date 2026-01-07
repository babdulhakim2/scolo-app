import { SpaceBackground } from '@/app/components/ui/SpaceBackground';
import { NoiseOverlay } from '@/app/components/ui/NoiseOverlay';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <>
      <SpaceBackground />
      <NoiseOverlay />

      <div className="min-h-screen relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6 backdrop-blur-sm bg-black/20">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] gradient-text uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              scolo
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors uppercase text-xs tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </nav>

        {/* Content */}
        <div className="px-6 pt-32 pb-24">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-8 uppercase gradient-text">
              Privacy Policy
            </h1>

            <div className="space-y-8 text-white/80">
              <section>
                <p className="text-sm text-white/60 mb-6">Last updated: January 6, 2025</p>

                <p className="mb-6">
                  Scolo ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our due diligence platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">Information We Collect</h2>
                <ul className="space-y-3 ml-6">
                  <li className="list-disc">Account information (email, name, organization)</li>
                  <li className="list-disc">Search queries and investigation data</li>
                  <li className="list-disc">Usage analytics and performance data</li>
                  <li className="list-disc">Payment information (processed securely through third-party providers)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">How We Use Your Information</h2>
                <ul className="space-y-3 ml-6">
                  <li className="list-disc">Provide and maintain our services</li>
                  <li className="list-disc">Process your searches and generate reports</li>
                  <li className="list-disc">Improve our platform and user experience</li>
                  <li className="list-disc">Communicate with you about your account and services</li>
                  <li className="list-disc">Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">Data Security</h2>
                <p>
                  We implement industry-standard security measures to protect your data:
                </p>
                <ul className="space-y-3 ml-6 mt-4">
                  <li className="list-disc">End-to-end encryption for sensitive data</li>
                  <li className="list-disc">Regular security audits and vulnerability assessments</li>
                  <li className="list-disc">Access controls and authentication requirements</li>
                  <li className="list-disc">Secure data centers with SOC 2 compliance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">Data Retention</h2>
                <p>
                  We retain your data only as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">Third-Party Services</h2>
                <p>
                  We may share data with trusted third-party services that help us operate our platform:
                </p>
                <ul className="space-y-3 ml-6 mt-4">
                  <li className="list-disc">Cloud infrastructure providers (AWS, Google Cloud)</li>
                  <li className="list-disc">Analytics services (for usage statistics)</li>
                  <li className="list-disc">Payment processors (Stripe)</li>
                  <li className="list-disc">Customer support tools</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="space-y-3 ml-6 mt-4">
                  <li className="list-disc">Access your personal data</li>
                  <li className="list-disc">Correct inaccurate data</li>
                  <li className="list-disc">Request deletion of your data</li>
                  <li className="list-disc">Export your data in a portable format</li>
                  <li className="list-disc">Opt-out of marketing communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">Compliance</h2>
                <p>
                  We comply with applicable data protection laws including GDPR, CCPA, and other regional privacy regulations. Our platform is designed with privacy by default principles.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">Contact Us</h2>
                <p>
                  For privacy-related questions or concerns, please contact us at:
                </p>
                <p className="mt-4">
                  Email: privacy@scolo.io<br />
                  Address: Scolo Inc., San Francisco, CA
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">Updates to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}