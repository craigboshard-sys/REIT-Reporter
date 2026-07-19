-- Phase 4: Video/interviews, sourced from the YouTube Data API v3
-- (the one Phase 4 content type with a real, official free API per the
-- project's data strategy -- social media and TV interviews stay manual).

create table video_interviews (
  id uuid primary key default gen_random_uuid(),
  video_id text not null unique,
  title text not null,
  channel_title text not null,
  published_at timestamptz not null,
  thumbnail_url text,
  description text,
  created_at timestamptz not null default now()
);

create table video_interview_companies (
  video_interview_id uuid not null references video_interviews (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  primary key (video_interview_id, company_id)
);

create index video_interviews_published_at_idx on video_interviews (published_at desc);

alter table video_interviews enable row level security;
alter table video_interview_companies enable row level security;

create policy "Public read access" on video_interviews for select using (true);
create policy "Public read access" on video_interview_companies for select using (true);
