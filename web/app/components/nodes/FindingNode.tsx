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
    icon: <Shield className="w-4 h-4" />,
    color: 'text-red-600',
    bg: 'bg-red-500',
    border: 'border-red-200',
  },
  pep: {
    icon: <User className="w-4 h-4" />,
    color: 'text-amber-600',
    bg: 'bg-amber-500',
    border: 'border-amber-200',
  },
  adverse_media: {
    icon: <FileWarning className="w-4 h-4" />,
    color: 'text-violet-600',
    bg: 'bg-violet-500',
    border: 'border-violet-200',
  },
  ip_address: {
    icon: <Globe className="w-4 h-4" />,
    color: 'text-blue-600',
    bg: 'bg-blue-500',
    border: 'border-blue-200',
  },
  crypto: {
    icon: <Wallet className="w-4 h-4" />,
    color: 'text-orange-600',
    bg: 'bg-orange-500',
    border: 'border-orange-200',
  },
  company: {
    icon: <Building2 className="w-4 h-4" />,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500',
    border: 'border-cyan-200',
  },
  person: {
    icon: <User className="w-4 h-4" />,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500',
    border: 'border-indigo-200',
  },
  generic: {
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-slate-600',
    bg: 'bg-slate-500',
    border: 'border-slate-200',
  },
};

const SEVERITY_COLORS = {
  low: 'bg-slate-100 text-slate-600',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
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
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-blue-500 !border-2 !border-white" />

        {isHovered && nodeData.onDelete && (
          <button
            onClick={() => nodeData.onDelete?.(id)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-50"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <div className={`w-24 h-24 rounded-full ${config.bg} shadow-lg flex flex-col items-center justify-center text-white transition-transform hover:scale-105`}>
          <Globe className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-mono leading-tight text-center px-2 truncate max-w-full">
            {nodeData.label}
          </span>
        </div>

        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-blue-500 !border-2 !border-white" />
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
        <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-orange-500 !border-2 !border-white" />

        {isHovered && nodeData.onDelete && (
          <button
            onClick={() => nodeData.onDelete?.(id)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-50"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        <div className={`relative w-28 h-24 ${config.bg} shadow-lg flex flex-col items-center justify-center text-white transition-transform hover:scale-105`}
          style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
        >
          <Wallet className="w-5 h-5 mb-1" />
          <span className="text-[9px] font-mono leading-tight text-center px-3 truncate max-w-full">
            {nodeData.label.slice(0, 12)}...
          </span>
        </div>

        <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-orange-500 !border-2 !border-white" />
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-white border ${config.border} rounded-xl shadow-md transition-all duration-200 min-w-[180px] max-w-[220px] overflow-visible group hover:shadow-lg`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${config.bg}`} />

      <Handle type="target" position={Position.Top} className={`!w-2 !h-2 ${config.bg} !border-2 !border-white`} />

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
          <div className={`p-1.5 rounded-lg ${config.bg} text-white flex-shrink-0`}>
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">{nodeData.label}</div>
            {nodeData.source && (
              <div className="text-[10px] text-slate-500 truncate">{nodeData.source}</div>
            )}
          </div>
        </div>

        {nodeData.description && (
          <p className="mt-2 text-[10px] text-slate-600 line-clamp-2">{nodeData.description}</p>
        )}

        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          {nodeData.severity && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${SEVERITY_COLORS[nodeData.severity]}`}>
              {nodeData.severity.toUpperCase()}
            </span>
          )}
          {nodeData.confidence && (
            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium">
              {nodeData.confidence}%
            </span>
          )}
          {nodeData.url && (
            <a
              href={nodeData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-0.5 hover:bg-slate-100 rounded"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={`!w-2 !h-2 ${config.bg} !border-2 !border-white`} />
    </div>
  );
});

FindingNode.displayName = 'FindingNode';
