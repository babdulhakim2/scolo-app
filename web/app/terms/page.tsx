import { SpaceBackground } from '@/app/components/ui/SpaceBackground';
import { NoiseOverlay } from '@/app/components/ui/NoiseOverlay';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
              Terms of Service
            </h1>

            <div className="space-y-8 text-white/80">
              <section>
                <p className="text-sm text-white/60 mb-6">Effective Date: January 6, 2025</p>

                <p className="mb-6">
                  These Terms of Service ("Terms") govern your use of the Scolo platform and services. By accessing or using Scolo, you agree to be bound by these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">1. Acceptance of Terms</h2>
                <p>
                  By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">2. Description of Service</h2>
                <p>
                  Scolo provides a due diligence and compliance investigation platform that enables users to search public records, analyze relationships, and generate reports. Our services include:
                </p>
                <ul className="space-y-3 ml-6 mt-4">
                  <li className="list-disc">Public record searches across multiple databases</li>
                  <li className="list-disc">Entity relationship mapping and visualization</li>
                  <li className="list-disc">Sanctions and PEP screening</li>
                  <li className="list-disc">Report generation and export capabilities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">3. Account Registration</h2>
                <p>To use our services, you must:</p>
                <ul className="space-y-3 ml-6 mt-4">
                  <li className="list-disc">Provide accurate and complete registration information</li>
                  <li className="list-disc">Maintain the security of your account credentials</li>
                  <li className="list-disc">Promptly notify us of any unauthorized use</li>
                  <li className="list-disc">Be at least 18 years old or have legal capacity to enter into contracts</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">4. Acceptable Use</h2>
                <p>You agree to use Scolo only for lawful purposes. You must not:</p>
                <ul className="space-y-3 ml-6 mt-4">
                  <li className="list-disc">Use the service for illegal or unauthorized purposes</li>
                  <li className="list-disc">Violate any applicable laws or regulations</li>
                  <li className="list-disc">Harass, abuse, or harm individuals through your use of the service</li>
                  <li className="list-disc">Attempt to gain unauthorized access to our systems</li>
                  <li className="list-disc">Use automated systems or software to extract data without permission</li>
                  <li className="list-disc">Resell or redistribute our services without authorization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">5. Data and Content</h2>
                <p className="mb-4">
                  <strong>Your Data:</strong> You retain ownership of any data you input into Scolo. You grant us a license to process and display this data as necessary to provide our services.
                </p>
                <p className="mb-4">
                  <strong>Public Records:</strong> Information retrieved through our platform comes from publicly available sources. We do not guarantee the accuracy, completeness, or timeliness of this information.
                </p>
                <p>
                  <strong>Compliance:</strong> You are responsible for ensuring your use of our services complies with applicable laws, including data protection and privacy regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">6. Intellectual Property</h2>
                <p>
                  All intellectual property rights in the Scolo platform, including software, designs, and content, remain our property or that of our licensors. You may not copy, modify, or reverse engineer any part of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">7. Fees and Payment</h2>
                <ul className="space-y-3 ml-6">
                  <li className="list-disc">Subscription fees are billed in advance on a monthly or annual basis</li>
                  <li className="list-disc">All fees are non-refundable unless otherwise stated</li>
                  <li className="list-disc">We reserve the right to change pricing with 30 days notice</li>
                  <li className="list-disc">You are responsible for all applicable taxes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">8. Limitation of Liability</h2>
                <p className="mb-4">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, SCOLO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
                </p>
                <p>
                  Our total liability for any claim arising out of or relating to these Terms or our services shall not exceed the amount paid by you to us in the twelve months preceding the claim.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">9. Disclaimer of Warranties</h2>
                <p>
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">10. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless Scolo, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our services or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">11. Termination</h2>
                <p>
                  Either party may terminate these Terms at any time. We may suspend or terminate your access immediately for violations of these Terms. Upon termination, your right to use our services will cease immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">12. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of San Francisco County, California.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">13. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. Material changes will be notified to you via email or through the platform. Continued use after changes constitutes acceptance of the modified Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 uppercase tracking-wide">14. Contact Information</h2>
                <p>
                  For questions about these Terms, please contact us at:
                </p>
                <p className="mt-4">
                  Email: legal@scolo.io<br />
                  Address: Scolo Inc., San Francisco, CA
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}