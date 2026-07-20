-- Expand financial_metrics with the additional ratios analysts typically use
-- when covering property REITs. All manual entry (no free API), except
-- price_to_nav which is computed in the app from share_prices x nav_per_share
-- (same pattern as market_cap).
alter table financial_metrics
  add column wacc numeric(5, 2),
  add column distribution_per_share numeric(10, 2),
  add column distribution_yield numeric(5, 2),
  add column payout_ratio numeric(5, 2),
  add column vacancy_rate numeric(5, 2),
  add column wale numeric(4, 1),
  add column avg_cost_of_debt numeric(5, 2),
  add column hedged_debt_pct numeric(5, 2);

comment on column financial_metrics.wacc is 'Weighted Average Cost of Capital, %';
comment on column financial_metrics.distribution_per_share is 'Distribution/dividend per share, ZAR cents or rand as reported';
comment on column financial_metrics.distribution_yield is 'Distribution yield, %';
comment on column financial_metrics.payout_ratio is 'Payout ratio, %';
comment on column financial_metrics.vacancy_rate is 'Portfolio vacancy rate, %';
comment on column financial_metrics.wale is 'Weighted Average Lease Expiry, years';
comment on column financial_metrics.avg_cost_of_debt is 'Average cost of debt, %';
comment on column financial_metrics.hedged_debt_pct is 'Percentage of debt hedged, %';

-- Broker & Analyst Coverage: broker_updates holds both automated content
-- (Currie Group, via scraper) and manually curated entries for the other 9
-- brokers researched (JLL, Broll, Galetti, Rode, CBRE Excellerate, Pam
-- Golding, Knight Frank, Swindon, JHI) -- none of which offer a clean
-- automatable feed, same as Social Media Posts.
create table broker_updates (
  id uuid primary key default gen_random_uuid(),
  broker text not null,
  title text not null,
  url text not null unique,
  published_at date,
  summary text,
  created_at timestamptz not null default now()
);

create table broker_update_companies (
  broker_update_id uuid not null references broker_updates (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  primary key (broker_update_id, company_id)
);

create index broker_updates_published_at_idx on broker_updates (published_at desc nulls last);

alter table broker_updates enable row level security;
alter table broker_update_companies enable row level security;

create policy "Public read access" on broker_updates for select using (true);
create policy "Public read access" on broker_update_companies for select using (true);
create policy "Authenticated write access" on broker_updates
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
