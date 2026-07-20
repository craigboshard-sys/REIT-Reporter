-- Phase 2 (finally revisited): Regulatory Bodies. Sourced from the FSCA's
-- own public Media Releases page (static HTML, no bot protection, no
-- robots.txt restrictions -- a public regulator's own disclosure page).
--
-- Note: FSCA's press releases are almost entirely unrelated to REITs
-- (unlicensed FSPs, debarments, insurance/pension matters). Genuinely
-- relevant items are rare -- this page will often show nothing new, which
-- is expected, not a bug. JSE and SARB were investigated too: JSE's news
-- listing has no dates without visiting each article, and SARB's newsroom
-- page didn't respond to a plain fetch (unlike their clean rates API used
-- for Macro Indicators) -- so FSCA is the only one of the three worth
-- automating for now.

create table regulatory_updates (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  title text not null,
  document_url text not null unique,
  published_date date,
  published_year int not null,
  created_at timestamptz not null default now()
);

create table regulatory_update_companies (
  regulatory_update_id uuid not null references regulatory_updates (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  primary key (regulatory_update_id, company_id)
);

create index regulatory_updates_published_date_idx on regulatory_updates (published_date desc nulls last, published_year desc);

alter table regulatory_updates enable row level security;
alter table regulatory_update_companies enable row level security;

create policy "Public read access" on regulatory_updates for select using (true);
create policy "Public read access" on regulatory_update_companies for select using (true);
