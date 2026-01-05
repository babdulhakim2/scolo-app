'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Play, Shield, Search, Share2, FileText, Check } from 'lucide-react';
import { GlassCard } from '@/app/components/ui/GlassCard';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

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
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)] gradient-text">
            scolo
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8">
              <Link href="#features" className="text-white/60 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#how" className="text-white/60 hover:text-white transition-colors">
                How It Works
              </Link>
            </div>
            <button
              onClick={handleGetStarted}
              className="px-5 py-2.5 bg-black/30 hover:bg-black/40 border border-white/15 hover:border-white/25 rounded-xl text-white font-medium transition-all"
            >
              {isAuthenticated ? 'Dashboard' : 'Get Started'}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/15 border border-cyan-500/25 rounded-full text-cyan-400 text-sm mb-6">
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            Intelligence Canvas for Due Diligence
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold font-[family-name:var(--font-space-grotesk)] mb-6">
            <span className="gradient-text">See the connections</span>
            <br />
            <span className="text-white">others miss</span>
          </h1>

          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Scolo gives you an infinite canvas to search public records, run background checks,
            and visualize relationships — all in one powerful workspace.
          </p>

          <div className="flex gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-black/20 hover:bg-black/30 border border-white/15 hover:border-white/25 text-white font-medium rounded-xl flex items-center gap-2 transition-all">
              <Play className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* Canvas Preview */}
          <div className="mt-20">
            <GlassCard className="p-4">
              <div className="bg-black/40 rounded-lg h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* Central Entity Node */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-2xl mb-2">
                        👤
                      </div>
                      <div className="text-sm font-semibold">John Doe</div>
                      <div className="text-xs text-white/50">Subject</div>
                    </div>

                    {/* Connected Nodes */}
                    <div className="absolute -top-20 -left-40 w-28 h-20 bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                      <div className="text-xl mb-1">🏢</div>
                      <div className="text-xs">Acme Corp</div>
                    </div>

                    <div className="absolute -top-20 left-40 w-28 h-20 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                      <div className="text-xl mb-1">📄</div>
                      <div className="text-xs">Court Records</div>
                    </div>

                    <div className="absolute top-20 -left-36 w-28 h-20 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3">
                      <div className="text-xl mb-1">🔗</div>
                      <div className="text-xs">LinkedIn</div>
                    </div>

                    <div className="absolute top-20 left-36 w-28 h-20 bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3">
                      <div className="text-xl mb-1">📰</div>
                      <div className="text-xs">News Articles</div>
                    </div>
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
            <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4">
              Everything you need for due diligence
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              From initial search to final report, Scolo gives you the tools to uncover the full picture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <GlassCard key={idx} className="p-6 group">
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
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
            <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4">
              How it works
            </h2>
            <p className="text-xl text-white/60">
              From search to insight in three simple steps.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {[
              {
                number: '1',
                title: 'Search',
                description: 'Enter a name, company, or keyword. Scolo searches across dozens of public data sources simultaneously.',
              },
              {
                number: '2',
                title: 'Explore',
                description: 'Drag results onto your canvas. Click to expand entities and discover connected people and records.',
              },
              {
                number: '3',
                title: 'Report',
                description: 'Export your findings as a professional due diligence report with full source citations.',
              },
            ].map((step, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-white/60 text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold font-[family-name:var(--font-space-grotesk)] mb-4">
            <span className="gradient-text">Ready to see the full picture?</span>
          </h2>
          <p className="text-xl text-white/60 mb-8">
            Join investigators, compliance teams, and researchers who trust Scolo for their due diligence workflow.
          </p>
          <button
            onClick={handleGetStarted}
            className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-xl inline-flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-bold font-[family-name:var(--font-space-grotesk)]">scolo</div>
          <div className="flex gap-6">
            <Link href="#features" className="text-white/40 hover:text-white/60 transition-colors text-sm">
              Features
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
              Docs
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
              Privacy
            </Link>
            <Link href="#" className="text-white/40 hover:text-white/60 transition-colors text-sm">
              Terms
            </Link>
          </div>
          <div className="text-white/40 text-sm">© 2025 Scolo. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
}