-- Phase 3: Financial metrics per REIT (LTV, See-Through LTV, ICR, NAV).
-- These are disclosed in interim/annual results, not available via any
-- free API, so -- like share_prices -- this is populated manually via the
-- Supabase Table Editor as each company reports.
--
-- Market Cap is not stored here: it's computed in the app from
-- share_prices.close_price x companies.shares_in_issue, so it stays current
-- automatically as new prices come in via the existing scraper.

alter table companies add column shares_in_issue bigint;

create table financial_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  period_end date not null,
  ltv numeric(5, 2),
  see_through_ltv numeric(5, 2),
  icr numeric(5, 2),
  nav_per_share numeric(10, 2),
  created_at timestamptz not null default now(),
  unique (company_id, period_end)
);

create index financial_metrics_company_id_idx on financial_metrics (company_id);

alter table financial_metrics enable row level security;

create policy "Public read access" on financial_metrics for select using (true);
create policy "Authenticated write access" on financial_metrics
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
