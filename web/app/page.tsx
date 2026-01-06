'use client';

import { GlassCard } from '@/app/components/ui/GlassCard';
import { NoiseOverlay } from '@/app/components/ui/NoiseOverlay';
import { SpaceBackground } from '@/app/components/ui/SpaceBackground';
import { SquareButton } from '@/app/components/ui/SquareButton';
import {
  useGlitchHover,
  useParallax,
  useStaggerFadeIn,
  useTextReveal
} from '@/app/hooks/useGSAPAnimations';
import { createClient } from '@/lib/supabase/client';
import gsap from 'gsap';
import { ArrowRight, FileText, Play, Search, Share2, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // GSAP refs
  const heroTitleRef = useTextReveal(0.3);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const featuresRef = useStaggerFadeIn(0.1);
  const glitchLogoRef = useGlitchHover<HTMLAnchorElement>();
  const parallaxRef = useParallax(0.3);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsAuthenticated(true);
      }
    });

    // Animate subtitle after title
    if (heroSubtitleRef.current) {
      gsap.fromTo(
        heroSubtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 1.2, ease: 'power3.out' }
      );
    }

    // Animate video on scroll
    if (videoRef.current) {
      gsap.fromTo(
        videoRef.current,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 0.9,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: videoRef.current,
            start: 'top 80%',
            once: true,
          },
        }
      );
    }
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
          <Link
            href="/"
            ref={glitchLogoRef}
            className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] gradient-text uppercase tracking-widest hover:opacity-80 transition-opacity"
          >
            scolo
          </Link>
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
              Intelligence Agents for Due Diligence
            </span>
          </div>

          <h1
            ref={heroTitleRef}
            className="text-5xl lg:text-7xl font-bold font-[family-name:var(--font-space-grotesk)] mb-6 uppercase"
          >
            <span className="gradient-text block">See the connections</span>
            <span className="text-white block">others miss</span>
          </h1>

          <p ref={heroSubtitleRef} className="text-xl text-white/60 max-w-2xl mx-auto mb-10 uppercase tracking-wide relative z-10">
            Search public records, run background checks, Sanction checks 
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

          {/* Canvas Preview - Video Demo */}
          <div ref={parallaxRef} className="mt-20 relative z-0">
            <GlassCard className="p-1">
              <div className="bg-black/60 relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  <source src="/scolo-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4 uppercase relative">
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
      <section id="how" className="py-24 px-6 relative z-10">
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
      <section className="py-24 px-6 text-center relative z-10">
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
      <footer className="py-12 px-6 border-t-2 border-white/10 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Link href="/" className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] uppercase tracking-widest hover:opacity-80 transition-opacity">scolo</Link>
          <div className="flex gap-6">
            <Link href="#features" className="text-white/50 hover:text-white/70 transition-colors text-xs uppercase tracking-wider">
              Features
            </Link>
            <Link href="#" className="text-white/50 hover:text-white/70 transition-colors text-xs uppercase tracking-wider">
              Docs
            </Link>
            <Link href="#" className="text-white/50 hover:text-white/70 transition-colors text-xs uppercase tracking-wider">
              Privacy
            </Link>
            <Link href="#" className="text-white/50 hover:text-white/70 transition-colors text-xs uppercase tracking-wider">
              Terms
            </Link>
          </div>
          <div className="text-white/60 text-xs uppercase tracking-wider">© 2025 Scolo. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}