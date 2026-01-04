'use client';

import { useEffect, useRef } from 'react';

export function SpaceBackground() {
  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!starsRef.current) return;

    // Generate random stars
    const starCount = 50;
    const stars: HTMLDivElement[] = [];

    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 4}s`;
      star.style.animationDuration = `${3 + Math.random() * 2}s`;
      starsRef.current.appendChild(star);
      stars.push(star);
    }

    return () => {
      stars.forEach(star => star.remove());
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Stars */}
      <div ref={starsRef} className="absolute inset-0 overflow-hidden">
        <style jsx>{`
          .star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: white;
            border-radius: 50%;
            opacity: 0.4;
            animation: twinkle 4s infinite;
          }
        `}</style>
      </div>

      {/* Floating Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="orb absolute w-[500px] h-[500px] rounded-full animate-float"
          style={{
            background: 'rgba(6, 182, 212, 0.25)',
            top: '5%',
            left: '5%',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="orb absolute w-[400px] h-[400px] rounded-full animate-float"
          style={{
            background: 'rgba(139, 92, 246, 0.3)',
            bottom: '10%',
            right: '5%',
            animationDelay: '-4s',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="orb absolute w-[300px] h-[300px] rounded-full animate-float"
          style={{
            background: 'rgba(59, 130, 246, 0.25)',
            top: '40%',
            right: '25%',
            animationDelay: '-8s',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 space-background opacity-80" />
    </div>
  );
}