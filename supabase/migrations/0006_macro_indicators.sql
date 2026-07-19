-- Phase 3: Macro indicators (interest rates, inflation, bond yields), sourced
-- from the South African Reserve Bank's own public web API
-- (custom.resbank.co.za/SarbWebApi/WebIndicators/HomePageRates) -- an
-- official, no-auth, no-ToS-restriction source, unlike the media
-- aggregators checked for SENS.

create table macro_indicators (
  id uuid primary key default gen_random_uuid(),
  timeseries_code text not null,
  name text not null,
  category text not null,
  value numeric not null,
  observation_date date not null,
  created_at timestamptz not null default now(),
  unique (timeseries_code, observation_date)
);

create index macro_indicators_timeseries_code_idx on macro_indicators (timeseries_code, observation_date desc);

alter table macro_indicators enable row level security;

create policy "Public read access" on macro_indicators for select using (true);
