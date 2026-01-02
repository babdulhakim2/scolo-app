'use client';

import { memo } from 'react';
import { ExternalLink, AlertTriangle, CheckCircle, User, Building2, Globe, FileText } from 'lucide-react';

export interface Finding {
  name?: string;
  title?: string;
  country?: string;
  position?: string;
  pep_level?: string;
  fatf_status?: string;
  corruption_index?: number;
  risk_level?: string;
  datasets?: string[];
  score?: number;
  source?: string;
  url?: string;
  date?: string;
  sentiment?: string;
  schema?: string;
  [key: string]: unknown;
}

interface FindingsListProps {
  findings: Finding[];
  maxItems?: number;
  compact?: boolean;
}

export const FindingsList = memo(({ findings, maxItems = 5, compact = false }: FindingsListProps) => {
  if (!findings || findings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-emerald-600 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>No findings</span>
      </div>
    );
  }

  const displayFindings = findings.slice(0, maxItems);
  const remaining = findings.length - maxItems;

  return (
    <div className="space-y-2">
      {displayFindings.map((finding, idx) => (
        <FindingItem key={idx} finding={finding} compact={compact} />
      ))}
      {remaining > 0 && (
        <div className="text-xs text-slate-400 pl-2">+{remaining} more findings</div>
      )}
    </div>
  );
});

FindingsList.displayName = 'FindingsList';

const FindingItem = memo(({ finding, compact }: { finding: Finding; compact: boolean }) => {
  const name = finding.name || finding.title || finding.country || 'Unknown';
  const isPerson = finding.schema === 'Person' || finding.position;
  const isCountry = finding.country && !finding.name && !finding.title;

  if (compact) {
    return (
      <div className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-xs text-slate-600 truncate">
        {String(name)}
      </div>
    );
  }

  return (
    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">
          {isPerson ? (
            <User className="w-4 h-4 text-blue-500" />
          ) : isCountry ? (
            <Globe className="w-4 h-4 text-cyan-500" />
          ) : (
            <Building2 className="w-4 h-4 text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-slate-900 truncate">{String(name)}</div>
          {finding.position && (
            <div className="text-xs text-slate-500">{finding.position}</div>
          )}
          {finding.country && !isCountry && (
            <div className="text-xs text-slate-500">{finding.country}</div>
          )}
        </div>
        {finding.score && (
          <div className="flex-shrink-0">
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              finding.score >= 90 ? 'bg-red-100 text-red-700' :
              finding.score >= 70 ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {finding.score}%
            </span>
          </div>
        )}
      </div>

      {finding.datasets && finding.datasets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {finding.datasets.map((ds, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] rounded font-medium uppercase">
              {ds}
            </span>
          ))}
        </div>
      )}

      {finding.pep_level && (
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span className="text-xs text-amber-700">PEP Level: {finding.pep_level}</span>
        </div>
      )}

      {finding.fatf_status && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">FATF Status</span>
          <span className={`font-medium ${
            finding.fatf_status === 'black' ? 'text-red-600' :
            finding.fatf_status === 'grey' ? 'text-amber-600' :
            'text-emerald-600'
          }`}>
            {finding.fatf_status}
          </span>
        </div>
      )}

      {finding.corruption_index !== undefined && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Corruption Index</span>
          <span className="font-medium text-slate-700">{finding.corruption_index}/100</span>
        </div>
      )}

      {finding.sentiment && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Sentiment</span>
          <span className={`font-medium ${
            finding.sentiment === 'negative' ? 'text-red-600' :
            finding.sentiment === 'positive' ? 'text-emerald-600' :
            'text-slate-600'
          }`}>
            {finding.sentiment}
          </span>
        </div>
      )}

      {finding.url && (
        <a
          href={finding.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-cyan-600 hover:text-cyan-700"
        >
          <ExternalLink className="w-3 h-3" />
          <span className="truncate">{finding.source || 'View source'}</span>
        </a>
      )}
    </div>
  );
});

FindingItem.displayName = 'FindingItem';
