import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  grain?: boolean;
}

export function GlassCard({ children, className = '', hover = true, grain = true }: GlassCardProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-black/20 backdrop-blur-md
        border border-white/10
        transition-all duration-300
        ${hover ? 'hover:bg-black/30 hover:border-white/15 hover:transform hover:scale-[1.02]' : ''}
        ${grain ? 'grain' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}