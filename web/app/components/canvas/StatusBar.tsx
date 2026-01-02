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
  sanctions: 'text-red-500 bg-red-50 border-red-200',
  pep_check: 'text-amber-500 bg-amber-50 border-amber-200',
  adverse_media: 'text-violet-500 bg-violet-50 border-violet-200',
  geo_risk: 'text-cyan-500 bg-cyan-50 border-cyan-200',
  business_registry: 'text-emerald-500 bg-emerald-50 border-emerald-200',
};

export const StatusBar = memo(({ status, isProcessing }: StatusBarProps) => {
  if (!isProcessing || !status) return null;

  const getStatusDisplay = () => {
    switch (status.type) {
      case 'thinking':
        return (
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            </div>
            <span className="text-slate-700">{status.message}</span>
          </div>
        );

      case 'tool_call': {
        const tool = status.tool || '';
        const iconColor = TOOL_COLORS[tool] || 'text-cyan-500 bg-cyan-50 border-cyan-200';
        const icon = TOOL_ICONS[tool] || <Terminal className="w-4 h-4" />;

        return (
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg border ${iconColor}`}>
              {icon}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-medium">Running Tool</span>
              <span className="text-sm text-slate-700">{status.description || status.message}</span>
            </div>
            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin ml-auto" />
          </div>
        );
      }

      case 'tool_result':
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-slate-700">{status.message}</span>
          </div>
        );

      case 'complete':
        return (
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50">
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-slate-700">Analysis complete</span>
          </div>
        );

      default:
        return (
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
            <span className="text-slate-700">{status.message || 'Processing...'}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg min-w-[280px] max-w-[500px]">
      {getStatusDisplay()}
    </div>
  );
});

StatusBar.displayName = 'StatusBar';
