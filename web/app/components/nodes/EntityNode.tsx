'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Building2, User, AlertTriangle, X, Shield, Globe, MapPin, Wallet } from 'lucide-react';

interface EntityNodeData {
  label: string;
  entityType: 'Company' | 'Individual' | 'company' | 'individual';
  status: 'pending' | 'processing' | 'flagged' | 'approved' | 'running' | 'completed';
  riskScore: number;
  country?: string;
  ipAddress?: string;
  website?: string;
  cryptoAddress?: string;
  sanctions?: boolean;
  adverseMedia?: number;
  pep?: boolean;
  riskLevel?: string;
  onDelete?: (id: string) => void;
  [key: string]: unknown;
}

export const EntityNode = memo(({ id, data }: NodeProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const nodeData = data as EntityNodeData;

  const getRiskBorder = () => {
    if (nodeData.riskScore >= 70) return 'border-red-500/50 shadow-lg shadow-red-500/20';
    if (nodeData.riskScore >= 40) return 'border-amber-500/50 shadow-lg shadow-amber-500/20';
    return 'border-white/20';
  };

  const getStatusConfig = () => {
    switch (nodeData.status) {
      case 'flagged':
        return { color: 'bg-red-500', text: 'FLAGGED', pulse: true };
      case 'approved':
      case 'completed':
        return { color: 'bg-emerald-500', text: 'COMPLETED', pulse: false };
      case 'processing':
      case 'running':
        return { color: 'bg-cyan-500', text: 'ANALYZING', pulse: true };
      default:
        return { color: 'bg-slate-400', text: 'PENDING', pulse: false };
    }
  };

  const statusConfig = getStatusConfig();
  const hasDetails = nodeData.country || nodeData.ipAddress || nodeData.website || nodeData.cryptoAddress;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative bg-black/20 backdrop-blur-md border-2 ${getRiskBorder()} transition-all duration-300 min-w-[280px] overflow-visible group hover:scale-105 hover:bg-black/30 grain`}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-1 ${
          nodeData.riskScore >= 70
            ? 'bg-gradient-to-r from-red-500 to-red-600'
            : nodeData.riskScore >= 40
            ? 'bg-gradient-to-r from-amber-500 to-amber-600'
            : 'bg-gradient-to-r from-cyan-500 to-cyan-600'
        }`}
      />

      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-gradient-to-r !from-cyan-400 !to-blue-500 !border-2 !border-white/30 !shadow-lg !shadow-cyan-500/30" />

      {isHovered && nodeData.onDelete && (
        <button
          onClick={() => nodeData.onDelete?.(id)}
          className="absolute -top-3 -right-3 w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-all opacity-0 group-hover:opacity-100 z-50 hover:scale-110 border border-red-400/30"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 shadow-lg border ${
              nodeData.entityType === 'Company'
                ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/30 border-cyan-400/30'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30 border-blue-400/30'
            }`}
          >
            {nodeData.entityType === 'Company' ? (
              <Building2 className="w-5 h-5 text-white" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm truncate">{nodeData.label}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-white/60 uppercase tracking-wider">{nodeData.entityType}</span>
              {nodeData.status === 'flagged' && (
                <div className="flex items-center gap-1 text-red-500 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs font-medium uppercase">REVIEW</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 space-y-3">
        {hasDetails && (
          <div className="bg-black/30 border border-white/10 p-3 text-xs space-y-2">
            {nodeData.country && (
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  Location
                </span>
                <span className="text-white font-medium uppercase">{nodeData.country}</span>
              </div>
            )}
            {nodeData.website && (
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
                  <Globe className="w-3 h-3" />
                  Website
                </span>
                <span className="text-white font-medium">{nodeData.website}</span>
              </div>
            )}
            {nodeData.cryptoAddress && (
              <div className="flex items-center justify-between">
                <span className="text-white/60 flex items-center gap-1.5 uppercase tracking-wider">
                  <Wallet className="w-3 h-3" />
                  Wallet
                </span>
                <span className="text-white font-medium font-mono text-[10px]">{nodeData.cryptoAddress}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Status</span>
          <span
            className={`px-2.5 py-1 ${statusConfig.color} text-white text-xs font-medium shadow-sm flex items-center gap-1.5 uppercase tracking-wider border border-white/20 ${
              statusConfig.pulse ? 'animate-pulse' : ''
            }`}
          >
            <span className="w-1.5 h-1.5 bg-white/80" />
            {statusConfig.text}
          </span>
        </div>

        {nodeData.riskScore > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-white/60" />
                <span className="text-xs text-white/60 font-medium uppercase tracking-wider">Risk</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  className={`text-xl font-bold ${
                    nodeData.riskScore >= 70 ? 'text-red-500' : nodeData.riskScore >= 40 ? 'text-amber-500' : 'text-cyan-500'
                  }`}
                >
                  {nodeData.riskScore}
                </span>
                <span className="text-xs text-white/40">/100</span>
              </div>
            </div>

            <div className="w-full bg-black/40 border border-white/10 h-2 overflow-hidden">
              <div
                className={`h-2 transition-all duration-700 ${
                  nodeData.riskScore >= 70
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : nodeData.riskScore >= 40
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-cyan-500 to-cyan-600'
                }`}
                style={{ width: `${nodeData.riskScore}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-gradient-to-r !from-cyan-400 !to-blue-500 !border-2 !border-white/30 !shadow-lg !shadow-cyan-500/30" />
    </div>
  );
});

EntityNode.displayName = 'EntityNode';