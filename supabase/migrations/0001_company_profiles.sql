-- Phase 1: REIT / company profile schema

create extension if not exists "pgcrypto";

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  jse_code text not null unique,
  sector text not null check (sector in (
    'Diversified', 'Retail', 'Office', 'Industrial', 'Residential',
    'Healthcare', 'Storage', 'Hospitality', 'Specialised'
  )),
  description text,
  logo_url text,
  website_url text,
  headquarters text,
  listing_date date,
  has_international_exposure boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table company_people (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  full_name text not null,
  role_title text not null,
  is_executive boolean not null default false,
  bio text,
  photo_url text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table company_service_providers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  provider_type text not null check (provider_type in (
    'jse_sponsor', 'auditor', 'legal_counsel', 'transfer_secretary', 'company_secretary'
  )),
  firm_name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index company_people_company_id_idx on company_people (company_id);
create index company_service_providers_company_id_idx on company_service_providers (company_id);

-- keep updated_at current on every row change
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companies_set_updated_at
  before update on companies
  for each row execute function set_updated_at();

create trigger company_people_set_updated_at
  before update on company_people
  for each row execute function set_updated_at();

create trigger company_service_providers_set_updated_at
  before update on company_service_providers
  for each row execute function set_updated_at();

-- Row Level Security: this is public reference data (company profiles),
-- so anyone can read it, but only authenticated admin users can write.
-- Writes will go through an authenticated role once auth/admin is built in Phase 1.
alter table companies enable row level security;
alter table company_people enable row level security;
alter table company_service_providers enable row level security;

create policy "Public read access" on companies for select using (true);
create policy "Public read access" on company_people for select using (true);
create policy "Public read access" on company_service_providers for select using (true);

create policy "Authenticated write access" on companies
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated write access" on company_people
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated write access" on company_service_providers
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
