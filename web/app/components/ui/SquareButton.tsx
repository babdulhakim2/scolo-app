'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SquareButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const SquareButton = forwardRef<HTMLButtonElement, SquareButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    ...props
  }, ref) => {
    const baseStyles = 'relative font-semibold uppercase tracking-wider transition-all duration-300 overflow-hidden group';

    const variants = {
      primary: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border border-cyan-400/30 hover:from-cyan-600 hover:to-blue-700 hover:border-cyan-400/50',
      secondary: 'bg-black/30 text-white border border-white/20 hover:bg-black/50 hover:border-white/30',
      ghost: 'bg-transparent text-white border border-transparent hover:bg-white/10 hover:border-white/10',
      outline: 'bg-transparent text-cyan-400 border border-cyan-400/30 hover:bg-cyan-400/10 hover:border-cyan-400/50',
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          'hover:scale-[1.02]',
          className
        )}
        {...props}
      >
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

SquareButton.displayName = 'SquareButton';