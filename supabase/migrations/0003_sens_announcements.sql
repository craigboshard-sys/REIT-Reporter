-- Phase 2: SENS announcements, sourced from each company's own IR page/vendor.
-- Populated by the scraper in scraper/ (see scraper/README.md), run on a schedule
-- via GitHub Actions using the Supabase service_role key (bypasses RLS below).

create table sens_announcements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  title text not null,
  announced_at date not null,
  source_url text not null,
  source text not null,
  created_at timestamptz not null default now(),
  unique (company_id, title, announced_at)
);

create index sens_announcements_company_id_idx on sens_announcements (company_id);
create index sens_announcements_announced_at_idx on sens_announcements (announced_at desc);

alter table sens_announcements enable row level security;

create policy "Public read access" on sens_announcements for select using (true);

-- No public write policy: rows are inserted only via the scraper's
-- service_role key, which bypasses RLS entirely.
