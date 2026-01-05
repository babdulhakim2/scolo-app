'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, Play, Shield, Search, Share2, FileText } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/GlassCard';
import { SquareButton } from '@/app/components/ui/SquareButton';
import { SpaceBackground } from '@/app/components/ui/SpaceBackground';
import { NoiseOverlay } from '@/app/components/ui/NoiseOverlay';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  useMagneticButton,
  useTextReveal,
  useStaggerFadeIn,
  useGlitchHover,
  useParallax,
  useTypewriter
} from '@/app/hooks/useGSAPAnimations';
import gsap from 'gsap';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // GSAP refs
  const heroTitleRef = useTextReveal(0.3);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const featuresRef = useStaggerFadeIn(0.1);
  const magneticBtnRef = useMagneticButton(0.3);
  const glitchLogoRef = useGlitchHover();
  const parallaxRef = useParallax(0.3);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsAuthenticated(true);
      }
    });
  }, [supabase.auth]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/projects/new');
    } else {
      router.push('/login');
    }
  };

  return (
    <>
      <SpaceBackground />
      <NoiseOverlay />


      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div
            ref={glitchLogoRef}
            className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] gradient-text uppercase tracking-widest"
          >
            scolo
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8">
              <Link href="#features" className="text-white/60 hover:text-white transition-colors uppercase text-xs tracking-wider">
                Features
              </Link>
              <Link href="#how" className="text-white/60 hover:text-white transition-colors uppercase text-xs tracking-wider">
                How It Works
              </Link>
            </div>
            <SquareButton
              onClick={handleGetStarted}
              variant="outline"
              size="sm"
            >
              {isAuthenticated ? 'Dashboard' : 'Get Started'}
            </SquareButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 square-glass mb-6">
            <div className="w-2 h-2 bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs uppercase tracking-widest">
              Intelligence Canvas for Due Diligence
            </span>
          </div>

          <h1
            ref={heroTitleRef}
            className="text-5xl lg:text-7xl font-bold font-[family-name:var(--font-space-grotesk)] mb-6 uppercase"
          >
            <span className="gradient-text">See the connections</span>
            <br />
            <span className="text-white">others miss</span>
          </h1>

          <p ref={heroSubtitleRef} className="text-xl text-white/60 max-w-2xl mx-auto mb-10 uppercase tracking-wide">
            Scolo gives you an infinite canvas to search public records, run background checks,
            and visualize relationships — all in one powerful workspace.
          </p>

          <div className="flex gap-4 justify-center">
              <SquareButton
                onClick={handleGetStarted}
                variant="primary"
                size="lg"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
                <ArrowRight className="w-5 h-5" />
              </SquareButton>
            <SquareButton variant="secondary" size="lg">
              <Play className="w-5 h-5" />
              Watch Demo
            </SquareButton>
          </div>

          {/* Canvas Preview */}
          <div ref={parallaxRef} className="mt-20">
            <GlassCard className="p-1">
              <div className="bg-black/60 h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Central Entity Node - Square */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-500/50 flex flex-col items-center justify-center animate-square-rotate">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl">
                        👤
                      </div>
                      <div className="text-sm font-semibold uppercase tracking-wider mt-2">John Doe</div>
                      <div className="text-xs text-white/50 uppercase">Subject</div>
                    </div>

                    {/* Connected Nodes - Squares */}
                    <div className="absolute -top-20 -left-40 w-28 h-28 bg-purple-500/10 border-2 border-purple-500/30 p-3">
                      <div className="text-xl mb-1">🏢</div>
                      <div className="text-xs uppercase">Acme Corp</div>
                    </div>

                    <div className="absolute -top-20 left-40 w-28 h-28 bg-blue-500/10 border-2 border-blue-500/30 p-3">
                      <div className="text-xl mb-1">📄</div>
                      <div className="text-xs uppercase">Records</div>
                    </div>

                    <div className="absolute top-20 -left-36 w-28 h-28 bg-cyan-500/10 border-2 border-cyan-500/30 p-3">
                      <div className="text-xl mb-1">🔗</div>
                      <div className="text-xs uppercase">LinkedIn</div>
                    </div>

                    <div className="absolute top-20 left-36 w-28 h-28 bg-indigo-500/10 border-2 border-indigo-500/30 p-3">
                      <div className="text-xl mb-1">📰</div>
                      <div className="text-xs uppercase">News</div>
                    </div>

                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="50%" y1="50%" x2="20%" y2="30%" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1" />
                      <line x1="50%" y1="50%" x2="80%" y2="30%" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                      <line x1="50%" y1="50%" x2="25%" y2="70%" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="1" />
                      <line x1="50%" y1="50%" x2="75%" y2="70%" stroke="rgba(99, 102, 241, 0.3)" strokeWidth="1" />
                    </svg>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4 uppercase">
              Everything you need for due diligence
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto uppercase tracking-wide">
              From initial search to final report, Scolo gives you the tools to uncover the full picture.
            </p>
          </div>

          <div ref={featuresRef} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Search className="w-6 h-6" />,
                title: 'Web-Wide Search',
                description: 'Search across public records, news, social media, corporate registries, and court databases.',
                gradient: 'from-cyan-500 to-blue-600',
              },
              {
                icon: <Share2 className="w-6 h-6" />,
                title: 'Relationship Mapping',
                description: 'Visualize connections between people, companies, and entities on an infinite canvas.',
                gradient: 'from-purple-500 to-indigo-600',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Real-Time Alerts',
                description: 'Set up monitoring on any entity. Get instant alerts when new records appear.',
                gradient: 'from-blue-500 to-purple-600',
              },
              {
                icon: <FileText className="w-6 h-6" />,
                title: 'Export & Report',
                description: 'Generate professional due diligence reports with one click.',
                gradient: 'from-indigo-500 to-cyan-600',
              },
            ].map((feature, idx) => (
              <GlassCard key={idx} className="p-6 group" hover>
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 uppercase tracking-wide">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4 uppercase">
              How it works
            </h2>
            <p className="text-xl text-white/60 uppercase tracking-wide">
              From search to insight in three simple steps.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {[
              {
                number: '01',
                title: 'Search',
                description: 'Enter a name, company, or keyword. Scolo searches across dozens of public data sources simultaneously.',
              },
              {
                number: '02',
                title: 'Explore',
                description: 'Drag results onto your canvas. Click to expand entities and discover connected people and records.',
              },
              {
                number: '03',
                title: 'Report',
                description: 'Export your findings as a professional due diligence report with full source citations.',
              },
            ].map((step, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2 uppercase tracking-wide">{step.title}</h3>
                <p className="text-white/60 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4 uppercase">
            <span className="gradient-text">Ready to see the full picture?</span>
          </h2>
          <p className="text-xl text-white/60 mb-8 uppercase tracking-wide">
            Join investigators, compliance teams, and researchers who trust Scolo.
          </p>
          <SquareButton
            onClick={handleGetStarted}
            variant="primary"
            size="lg"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight className="w-5 h-5" />
          </SquareButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t-2 border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] uppercase tracking-widest">scolo</div>
          <div className="flex gap-6">
            <Link href="#features" className="text-white/40 hover:text-white/60 transition-colors text-xs uppercase tracking-wider">
              Features
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-xs uppercase tracking-wider">
              Docs
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-xs uppercase tracking-wider">
              Privacy
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-xs uppercase tracking-wider">
              Terms
            </Link>
          </div>
          <div className="text-white/40 text-xs uppercase tracking-wider">© 2025 Scolo. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}