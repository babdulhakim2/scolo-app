'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SpaceBackground } from '@/app/components/ui/SpaceBackground';
import { NoiseOverlay } from '@/app/components/ui/NoiseOverlay';
import { GlassCard } from '@/app/components/ui/GlassCard';
import { SquareButton } from '@/app/components/ui/SquareButton';
import Link from 'next/link';

type Step = 'email' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setStep('otp');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push('/projects');
    router.refresh();
  };

  return (
    <>
      <SpaceBackground />
      <NoiseOverlay />

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors uppercase text-xs tracking-wider">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-cyan-500/20 border border-cyan-400/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)] gradient-text mb-2 uppercase tracking-wider">
              Welcome to Scolo
            </h1>
            <p className="text-white/60 uppercase text-xs tracking-widest">Intelligence Agents for Due Diligence</p>
          </div>

          {/* Login Form */}
          <GlassCard className="p-8">
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-medium text-white/80 mb-2 uppercase tracking-wider">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <SquareButton
                  type="submit"
                  disabled={loading || !email.trim()}
                  variant="primary"
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continue with Email
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </SquareButton>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white/40 uppercase text-xs tracking-wider">or</span>
                  </div>
                </div>

                <p className="text-center text-white/40 text-xs uppercase tracking-wider">
                  By continuing, you agree to our{' '}
                  <Link href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Terms
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <p className="text-white/80 mb-4 text-sm">
                    We sent a verification code to{' '}
                    <span className="font-semibold text-white">{email}</span>
                  </p>
                  <label htmlFor="otp" className="block text-xs font-medium text-white/80 mb-2 uppercase tracking-wider">
                    Verification code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full px-4 py-3 bg-black/20 border border-white/10 text-white text-center text-xl tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
                    autoFocus
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <SquareButton
                  type="submit"
                  disabled={loading || !otp.trim()}
                  variant="primary"
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Verify & Continue'
                  )}
                </SquareButton>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                    setError('');
                  }}
                  className="w-full text-xs text-white/40 hover:text-white/60 transition-colors uppercase tracking-wider"
                >
                  Use a different email
                </button>
              </form>
            )}
          </GlassCard>
        </div>
      </div>
    </>
  );
}