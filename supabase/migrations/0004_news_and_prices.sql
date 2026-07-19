-- Phase 2: News articles (RSS) and share prices (manual entry via Supabase Table Editor)

create table news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  source text not null,
  published_at timestamptz not null,
  summary text,
  created_at timestamptz not null default now()
);

create table news_article_companies (
  news_article_id uuid not null references news_articles (id) on delete cascade,
  company_id uuid not null references companies (id) on delete cascade,
  primary key (news_article_id, company_id)
);

create index news_articles_published_at_idx on news_articles (published_at desc);

alter table news_articles enable row level security;
alter table news_article_companies enable row level security;

create policy "Public read access" on news_articles for select using (true);
create policy "Public read access" on news_article_companies for select using (true);

-- share_prices: populated manually via the Supabase Table Editor for now
-- (no paid market data subscription yet, per the project's data strategy).
create table share_prices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies (id) on delete cascade,
  price_date date not null,
  close_price numeric(10, 2) not null,
  created_at timestamptz not null default now(),
  unique (company_id, price_date)
);

create index share_prices_company_id_idx on share_prices (company_id);
create index share_prices_price_date_idx on share_prices (price_date desc);

alter table share_prices enable row level security;

create policy "Public read access" on share_prices for select using (true);
create policy "Authenticated write access" on share_prices
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
