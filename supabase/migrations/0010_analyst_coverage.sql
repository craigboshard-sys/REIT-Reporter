-- Phase 4: Analyst Coverage (buy/sell/hold consensus), manually curated via
-- the Supabase Table Editor -- no free API for analyst ratings exists.

create table analyst_coverage (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  analyst_firm text not null,
  rating text not null check (rating in ('buy', 'hold', 'sell')),
  target_price numeric(10, 2),
  rating_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (company_id, analyst_firm, rating_date)
);

create index analyst_coverage_company_id_idx on analyst_coverage (company_id);

alter table analyst_coverage enable row level security;

create policy "Public read access" on analyst_coverage for select using (true);
create policy "Authenticated write access" on analyst_coverage
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
