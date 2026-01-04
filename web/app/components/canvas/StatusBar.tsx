'use client';

import { memo } from 'react';
import { Loader2, Shield, FileSearch, Newspaper, TrendingUp, CheckCircle, Sparkles, Terminal, Zap } from 'lucide-react';
import type { StatusInfo } from '@/app/store/canvas-store';

interface StatusBarProps {
  status: StatusInfo | null;
  isProcessing: boolean;
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  sanctions: <Shield className="w-4 h-4" />,
  pep_check: <FileSearch className="w-4 h-4" />,
  adverse_media: <Newspaper className="w-4 h-4" />,
  geo_risk: <TrendingUp className="w-4 h-4" />,
  business_registry: <FileSearch className="w-4 h-4" />,
};

const TOOL_COLORS: Record<string, string> = {
  sanctions: 'text-red-400 bg-red-500/20 border-red-500/50',
  pep_check: 'text-amber-400 bg-amber-500/20 border-amber-500/50',
  adverse_media: 'text-violet-400 bg-violet-500/20 border-violet-500/50',
  geo_risk: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50',
  business_registry: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50',
};

export const StatusBar = memo(({ status, isProcessing }: StatusBarProps) => {
  if (!isProcessing || !status) return null;

  const getStatusDisplay = () => {
    switch (status.type) {
      case 'thinking':
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <span className="text-white/80">{status.message}</span>
          </div>
        );

      case 'tool_call': {
        const tool = status.tool || '';
        const iconColor = TOOL_COLORS[tool] || 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50';
        const icon = TOOL_ICONS[tool] || <Terminal className="w-4 h-4" />;

        return (
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg border ${iconColor}`}>
              {icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white/60 font-medium">Running Tool</span>
              <span className="text-sm text-white/80">{status.description || status.message}</span>
            </div>
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin ml-auto" />
          </div>
        );
      }

      case 'tool_result':
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/20">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-white/80">{status.message}</span>
          </div>
        );

      case 'complete':
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/20">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-white/80">Analysis complete</span>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-white/80">{status.message || 'Processing...'}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-black/20 backdrop-blur-md border border-white/10 rounded-xl shadow-lg shadow-cyan-500/10 min-w-[280px] max-w-[500px] grain">
      {getStatusDisplay()}
    </div>
  );
});

StatusBar.displayName = 'StatusBar';
