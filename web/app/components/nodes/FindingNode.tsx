'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  AlertTriangle,
  Globe,
  Wallet,
  Building2,
  User,
  FileWarning,
  Shield,
  X,
  ExternalLink,
} from 'lucide-react';

export type FindingType = 'sanction' | 'pep' | 'adverse_media' | 'ip_address' | 'crypto' | 'company' | 'person' | 'generic';

interface FindingNodeData {
  label: string;
  findingType: FindingType;
  source?: string;
  confidence?: number;
  description?: string;
  url?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, unknown>;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
}

const FINDING_CONFIG: Record<FindingType, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  sanction: {
    icon: <Shield className="w-4 h-4 text-white" />,
    color: 'text-red-400',
    bg: 'bg-gradient-to-br from-red-500 to-red-600',
    border: 'border-red-500/50',
  },
  pep: {
    icon: <User className="w-4 h-4 text-white" />,
    color: 'text-amber-400',
    bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    border: 'border-amber-500/50',
  },
  adverse_media: {
    icon: <FileWarning className="w-4 h-4 text-white" />,
    color: 'text-violet-400',
    bg: 'bg-gradient-to-br from-violet-500 to-violet-600',
    border: 'border-violet-500/50',
  },
  ip_address: {
    icon: <Globe className="w-4 h-4 text-white" />,
    color: 'text-blue-400',
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    border: 'border-blue-500/50',
  },
  crypto: {
    icon: <Wallet className="w-4 h-4 text-white" />,
    color: 'text-orange-400',
    bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
    border: 'border-orange-500/50',
  },
  company: {
    icon: <Building2 className="w-4 h-4 text-white" />,
    color: 'text-cyan-400',
    bg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    border: 'border-cyan-500/50',
  },
  person: {
    icon: <User className="w-4 h-4 text-white" />,
    color: 'text-indigo-400',
    bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    border: 'border-indigo-500/50',
  },
  generic: {
    icon: <AlertTriangle className="w-4 h-4 text-white" />,
    color: 'text-slate-400',
    bg: 'bg-gradient-to-br from-slate-500 to-slate-600',
    border: 'border-slate-500/50',
  },
};

const SEVERITY_COLORS = {
  low: 'bg-black/40 text-white/60',
  medium: 'bg-amber-500/20 text-amber-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
};

export const FindingNode = memo(({ id, data }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as FindingNodeData;
  const config = FINDING_CONFIG[nodeData.findingType] || FINDING_CONFIG.generic;
  const isCircular = nodeData.findingType === 'ip_address';
  const isHexagonal = nodeData.findingType === 'crypto';

  if (isCircular) {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
      >
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gradient-to-r !from-blue-400 !to-blue-500 !border-2 !border-white/30 !shadow-lg !shadow-blue-500/30" />

        {isHovered && nodeData.onDelete && (
          <button
            onClick={() => nodeData.onDelete?.(id)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all opacity-0 group-hover:opacity-100 z-50 border border-red-400/30"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <div className={`w-24 h-24 ${config.bg} shadow-lg shadow-blue-500/30 flex flex-col items-center justify-center text-white transition-transform hover:scale-105 backdrop-blur-md border-2 border-blue-400/30 grain`}>
          <Globe className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-mono leading-tight text-center px-2 truncate max-w-full">
            {nodeData.label}
          </span>
        </div>

        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gradient-to-r !from-blue-400 !to-blue-500 !border-2 !border-white/30 !shadow-lg !shadow-blue-500/30" />
      </div>
    );
  }

  if (isHexagonal) {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
      >
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gradient-to-r !from-orange-400 !to-orange-500 !border-2 !border-white/30 !shadow-lg !shadow-orange-500/30" />

        {isHovered && nodeData.onDelete && (
          <button
            onClick={() => nodeData.onDelete?.(id)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all opacity-0 group-hover:opacity-100 z-50 border border-red-400/30"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <div className={`relative w-28 h-24 ${config.bg} shadow-lg shadow-orange-500/30 flex flex-col items-center justify-center text-white transition-transform hover:scale-105 backdrop-blur-md border-2 border-orange-400/30 grain`}
        >
          <Wallet className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-mono leading-tight text-center px-3 truncate max-w-full">
            {nodeData.label.slice(0, 12)}...
          </span>
        </div>

        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gradient-to-r !from-orange-400 !to-orange-500 !border-2 !border-white/30 !shadow-lg !shadow-orange-500/30" />
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-black/20 backdrop-blur-md border-2 ${config.border} shadow-lg transition-all duration-200 min-w-[180px] max-w-[220px] overflow-visible group hover:scale-105 hover:bg-black/30 grain`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${config.bg}`} />

      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-gradient-to-r !from-cyan-400 !to-blue-500 !border-2 !border-white/30 !shadow-lg !shadow-cyan-500/30" />

      {isHovered && nodeData.onDelete && (
        <button
          onClick={() => nodeData.onDelete?.(id)}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-50"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className={`p-1.5 ${config.bg} text-white flex-shrink-0 border border-white/20`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">{nodeData.label}</div>
            {nodeData.source && (
              <div className="text-[10px] text-white/60 truncate">{nodeData.source}</div>
            )}
          </div>
        </div>

        {nodeData.description && (
          <p className="mt-2 text-[10px] text-white/70 line-clamp-2">{nodeData.description}</p>
        )}

        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {nodeData.severity && (
            <span className={`px-1.5 py-0.5 text-[9px] font-medium ${SEVERITY_COLORS[nodeData.severity]} border border-white/10`}>
              {nodeData.severity.toUpperCase()}
            </span>
          )}
          {nodeData.confidence && (
            <span className="px-1.5 py-0.5 bg-black/40 text-white/70 text-[9px] font-medium border border-white/10">
              {nodeData.confidence}%
            </span>
          )}
          {nodeData.url && (
            <a
              href={nodeData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-0.5 hover:bg-black/40 border border-transparent hover:border-white/10 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3 text-white/50" />
            </a>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-gradient-to-r !from-cyan-400 !to-blue-500 !border-2 !border-white/30 !shadow-lg !shadow-cyan-500/30" />
    </div>
  );
});

FindingNode.displayName = 'FindingNode';
