'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot, Loader2, CheckCircle, Search, Shield, FileSearch, Newspaper, TrendingUp, X, AlertTriangle } from 'lucide-react';

interface AgentNodeData {
  label: string;
  status: 'idle' | 'pending' | 'running' | 'streaming' | 'completed' | 'failed' | 'flagged' | 'warning';
  task: string;
  progress?: number;
  error?: string;
  duration?: number;
  findings?: unknown[];
  streamingText?: string;
  confidence?: number;
  resultType?: string;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
}

export const AgentNode = memo(({ id, data }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as AgentNodeData;

  const getAgentPersonality = () => {
    const label = nodeData.label.toLowerCase();

    if (label.includes('sanctions') || label.includes('screening') || label.includes('aml')) {
      return {
        icon: <Shield className="w-5 h-5 text-white" />,
        color: 'bg-red-500',
        border: 'border-red-200',
        emoji: '🛡️',
      };
    } else if (label.includes('adverse') || label.includes('media')) {
      return {
        icon: <Newspaper className="w-5 h-5 text-white" />,
        color: 'bg-violet-500',
        border: 'border-violet-200',
        emoji: '📰',
      };
    } else if (label.includes('pep') || label.includes('political')) {
      return {
        icon: <FileSearch className="w-5 h-5 text-white" />,
        color: 'bg-amber-500',
        border: 'border-amber-200',
        emoji: '👔',
      };
    } else if (label.includes('risk') || label.includes('analyzer')) {
      return {
        icon: <TrendingUp className="w-5 h-5 text-white" />,
        color: 'bg-cyan-500',
        border: 'border-cyan-200',
        emoji: '📊',
      };
    } else if (label.includes('kyc') || label.includes('verification')) {
      return {
        icon: <Search className="w-5 h-5 text-white" />,
        color: 'bg-emerald-500',
        border: 'border-emerald-200',
        emoji: '🔍',
      };
    }

    return {
      icon: <Bot className="w-5 h-5 text-white" />,
      color: 'bg-cyan-500',
      border: 'border-slate-200',
      emoji: '🤖',
    };
  };

  const getStatusConfig = () => {
    switch (nodeData.status) {
      case 'completed':
        return { bg: 'bg-emerald-500', text: 'Clear', icon: <CheckCircle className="w-4 h-4 text-emerald-500" />, animate: false };
      case 'warning':
        return { bg: 'bg-amber-500', text: 'Match', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, animate: false };
      case 'failed':
        return { bg: 'bg-red-500', text: 'Failed', icon: <X className="w-4 h-4 text-red-500" />, animate: false };
      case 'streaming':
        return { bg: 'bg-violet-500', text: 'Streaming', icon: <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />, animate: true };
      case 'running':
        return { bg: 'bg-cyan-500', text: 'Running', icon: <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />, animate: true };
      case 'pending':
        return { bg: 'bg-slate-400', text: 'Pending', icon: <Bot className="w-4 h-4 text-slate-400" />, animate: false };
      case 'flagged':
        return { bg: 'bg-amber-500', text: 'Flagged', icon: <Search className="w-4 h-4 text-amber-500" />, animate: false };
      default:
        return { bg: 'bg-slate-300', text: 'Idle', icon: <Bot className="w-4 h-4 text-slate-400" />, animate: false };
    }
  };

  const personality = getAgentPersonality();
  const statusConfig = getStatusConfig();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-white border ${personality.border} rounded-2xl shadow-lg transition-all duration-300 min-w-[260px] overflow-visible group hover:shadow-xl`}
    >
      <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${personality.color}`} />

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white !shadow-lg" />

      {isHovered && nodeData.onDelete && (
        <button
          onClick={() => nodeData.onDelete?.(id)}
          className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-50 hover:scale-110"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`relative p-3 rounded-xl ${personality.color}`}>
            {personality.icon}
            {statusConfig.animate && (
              <div className="absolute -top-1 -right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{personality.emoji}</span>
              <div className="text-slate-900 font-semibold text-sm">{nodeData.label}</div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`px-2 py-0.5 ${statusConfig.bg} text-white text-xs rounded-full font-medium flex items-center gap-1.5 shadow-sm`}
              >
                <span className={`w-1.5 h-1.5 bg-white/80 rounded-full ${statusConfig.animate ? 'animate-pulse' : ''}`} />
                {statusConfig.text}
              </span>
              {nodeData.findings && nodeData.findings.length > 0 && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">
                  {nodeData.findings.length} findings
                </span>
              )}
              {nodeData.confidence && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full font-medium">
                  {nodeData.confidence}%
                </span>
              )}
            </div>
          </div>
          <div className="flex-shrink-0">{statusConfig.icon}</div>
        </div>

        {(nodeData.status === 'running' || nodeData.status === 'streaming') && (
          <div className="relative h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${personality.color} transition-all duration-300 animate-pulse`}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {nodeData.status === 'failed' && nodeData.error && (
          <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-600 truncate">{nodeData.error}</p>
          </div>
        )}

        {(nodeData.status === 'completed' || nodeData.status === 'warning') && nodeData.findings && nodeData.findings.length > 0 && (
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {nodeData.findings.slice(0, 2).map((finding, idx) => {
              const f = finding as Record<string, unknown>;
              const name = f.name || f.title || f.country || 'Finding';
              return (
                <div key={idx} className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs text-slate-600 truncate">
                  {String(name)}
                </div>
              );
            })}
            {nodeData.findings.length > 2 && (
              <div className="text-xs text-slate-400 px-2">+{nodeData.findings.length - 2} more</div>
            )}
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white !shadow-lg" />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
