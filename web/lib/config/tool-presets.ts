export type ToolKey =
  | 'sanctions'
  | 'pep_check'
  | 'adverse_media'
  | 'geo_risk'
  | 'business_registry'
  | 'ubo_lookup'
  | 'employment_verify'
  | 'education_verify'
  | 'court_records'
  | 'property_records'
  | 'corporate_filings'
  | 'phone_lookup'
  | 'email_lookup'
  | 'social_media'
  | 'domain_whois'
  | 'ip_geolocation'
  | 'crypto_trace';

export type PresetKey = 'all' | 'compliance' | 'hr_background' | 'journalism' | 'digital';

export interface ToolPreset {
  label: string;
  description: string;
  tools: ToolKey[];
}

export const TOOL_PRESETS: Record<PresetKey, ToolPreset> = {
  all: {
    label: 'Complete Investigation',
    description: 'Run all available checks',
    tools: [
      'sanctions',
      'pep_check',
      'adverse_media',
      'geo_risk',
      'business_registry',
      'ubo_lookup',
      'court_records',
      'property_records',
      'corporate_filings',
      'phone_lookup',
      'email_lookup',
      'social_media',
      'domain_whois',
      'ip_geolocation',
      'crypto_trace',
    ],
  },
  compliance: {
    label: 'Compliance & AML',
    description: 'KYC, sanctions, PEP screening',
    tools: ['sanctions', 'pep_check', 'adverse_media', 'geo_risk', 'business_registry', 'ubo_lookup'],
  },
  hr_background: {
    label: 'HR Background Check',
    description: 'Employment, education, records',
    tools: ['employment_verify', 'education_verify', 'court_records', 'social_media', 'adverse_media'],
  },
  journalism: {
    label: 'Investigative Research',
    description: 'Court, property, corporate records',
    tools: [
      'court_records',
      'property_records',
      'corporate_filings',
      'adverse_media',
      'social_media',
      'ubo_lookup',
    ],
  },
  digital: {
    label: 'Digital Footprint',
    description: 'Email, phone, domain, IP analysis',
    tools: ['email_lookup', 'phone_lookup', 'domain_whois', 'ip_geolocation', 'social_media', 'crypto_trace'],
  },
};

export const ALL_TOOLS: { key: ToolKey; name: string; category: string; icon: string }[] = [
  { key: 'sanctions', name: 'Sanctions Check', category: 'compliance', icon: 'shield' },
  { key: 'pep_check', name: 'PEP Screening', category: 'compliance', icon: 'user-check' },
  { key: 'adverse_media', name: 'Adverse Media', category: 'compliance', icon: 'newspaper' },
  { key: 'geo_risk', name: 'Geographic Risk', category: 'compliance', icon: 'globe' },
  { key: 'business_registry', name: 'Business Registry', category: 'compliance', icon: 'building' },
  { key: 'ubo_lookup', name: 'UBO Lookup', category: 'compliance', icon: 'users' },
  { key: 'employment_verify', name: 'Employment Verification', category: 'hr', icon: 'briefcase' },
  { key: 'education_verify', name: 'Education Verification', category: 'hr', icon: 'graduation-cap' },
  { key: 'court_records', name: 'Court Records', category: 'legal', icon: 'gavel' },
  { key: 'property_records', name: 'Property Records', category: 'legal', icon: 'home' },
  { key: 'corporate_filings', name: 'Corporate Filings', category: 'legal', icon: 'file-text' },
  { key: 'phone_lookup', name: 'Phone Lookup', category: 'digital', icon: 'phone' },
  { key: 'email_lookup', name: 'Email Lookup', category: 'digital', icon: 'mail' },
  { key: 'social_media', name: 'Social Media', category: 'digital', icon: 'at-sign' },
  { key: 'domain_whois', name: 'Domain WHOIS', category: 'digital', icon: 'globe' },
  { key: 'ip_geolocation', name: 'IP Geolocation', category: 'digital', icon: 'map-pin' },
  { key: 'crypto_trace', name: 'Crypto Trace', category: 'digital', icon: 'wallet' },
];

export function getToolsByCategory(category: string): typeof ALL_TOOLS {
  return ALL_TOOLS.filter((t) => t.category === category);
}

export function getToolsForPreset(preset: PresetKey): typeof ALL_TOOLS {
  const presetConfig = TOOL_PRESETS[preset];
  return ALL_TOOLS.filter((t) => presetConfig.tools.includes(t.key));
}
