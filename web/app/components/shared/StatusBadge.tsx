'use client';

import { memo } from 'react';
import { Loader2, CheckCircle, X, AlertTriangle, Clock, HelpCircle } from 'lucide-react';

export type StatusType =
  | 'idle'
  | 'pending'
  | 'running'
  | 'streaming'
  | 'completed'
  | 'failed'
  | 'warning'
  | 'flagged'
  | 'match'
  | 'clear'
  | 'alert'
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

interface StatusBadgeProps {
  status: StatusType | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: React.ReactNode; animate: boolean }> = {
  completed: { bg: 'bg-emerald-500', text: 'Clear', icon: <CheckCircle className="w-3 h-3" />, animate: false },
  clear: { bg: 'bg-emerald-500', text: 'Clear', icon: <CheckCircle className="w-3 h-3" />, animate: false },
  warning: { bg: 'bg-amber-500', text: 'Match', icon: <AlertTriangle className="w-3 h-3" />, animate: false },
  match: { bg: 'bg-amber-500', text: 'Match', icon: <AlertTriangle className="w-3 h-3" />, animate: false },
  alert: { bg: 'bg-amber-500', text: 'Alert', icon: <AlertTriangle className="w-3 h-3" />, animate: false },
  failed: { bg: 'bg-red-500', text: 'Failed', icon: <X className="w-3 h-3" />, animate: false },
  running: { bg: 'bg-cyan-500', text: 'Running', icon: <Loader2 className="w-3 h-3 animate-spin" />, animate: true },
  streaming: { bg: 'bg-violet-500', text: 'Streaming', icon: <Loader2 className="w-3 h-3 animate-spin" />, animate: true },
  pending: { bg: 'bg-slate-400', text: 'Pending', icon: <Clock className="w-3 h-3" />, animate: false },
  flagged: { bg: 'bg-amber-500', text: 'Flagged', icon: <AlertTriangle className="w-3 h-3" />, animate: false },
  low: { bg: 'bg-emerald-500', text: 'Low Risk', icon: <CheckCircle className="w-3 h-3" />, animate: false },
  medium: { bg: 'bg-amber-500', text: 'Medium Risk', icon: <AlertTriangle className="w-3 h-3" />, animate: false },
  high: { bg: 'bg-red-500', text: 'High Risk', icon: <AlertTriangle className="w-3 h-3" />, animate: false },
  critical: { bg: 'bg-red-600', text: 'Critical', icon: <X className="w-3 h-3" />, animate: false },
  idle: { bg: 'bg-slate-300', text: 'Idle', icon: <HelpCircle className="w-3 h-3" />, animate: false },
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export const StatusBadge = memo(({ status, size = 'md', showIcon = true }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle;
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span className={`${config.bg} text-white ${sizeClass} rounded-full font-medium inline-flex items-center gap-1 shadow-sm`}>
      {showIcon && config.icon}
      <span className={config.animate ? 'animate-pulse' : ''}>{config.text}</span>
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';
