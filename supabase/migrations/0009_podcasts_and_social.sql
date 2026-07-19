-- Phase 4: Podcasts (RSS, automated) and Social Media Posts (manual curation,
-- since LinkedIn/X have no usable free API and scraping LinkedIn violates
-- their ToS -- they actively sue over this).

create table podcast_episodes (
  id uuid primary key default gen_random_uuid(),
  guid text not null unique,
  title text not null,
  link text not null,
  published_at timestamptz not null,
  duration text,
  audio_url text,
  description text,
  created_at timestamptz not null default now()
);

create table podcast_episode_companies (
  podcast_episode_id uuid not null references podcast_episodes (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  primary key (podcast_episode_id, company_id)
);

create index podcast_episodes_published_at_idx on podcast_episodes (published_at desc);

alter table podcast_episodes enable row level security;
alter table podcast_episode_companies enable row level security;

create policy "Public read access" on podcast_episodes for select using (true);
create policy "Public read access" on podcast_episode_companies for select using (true);

-- social_media_posts: manually curated (post URL you found relevant + your
-- own note), same pattern as share_prices/financial_metrics.
create table social_media_posts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies (id) on delete set null,
  platform text not null check (platform in ('linkedin', 'x')),
  post_url text not null unique,
  author text,
  note text,
  posted_at date,
  created_at timestamptz not null default now()
);

create index social_media_posts_company_id_idx on social_media_posts (company_id);

alter table social_media_posts enable row level security;

create policy "Public read access" on social_media_posts for select using (true);
create policy "Authenticated write access" on social_media_posts
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
