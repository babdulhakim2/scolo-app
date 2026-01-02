-- Investigations table
create table if not exists investigations (
  id text primary key,
  entity_name text not null,
  entity_type text not null default 'company',
  status text not null default 'pending',
  agents text[] not null default '{}',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Findings table
create table if not exists findings (
  id uuid primary key default gen_random_uuid(),
  investigation_id text not null references investigations(id) on delete cascade,
  agent_type text not null,
  label text not null,
  result_type text not null,
  content text not null,
  details text,
  source text,
  confidence int,
  created_at timestamptz not null default now()
);

-- Entities table
create table if not exists entities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  entity_type text not null default 'company',
  country text,
  risk_score int default 0,
  metadata jsonb default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_findings_investigation on findings(investigation_id);
create index if not exists idx_investigations_status on investigations(status);
