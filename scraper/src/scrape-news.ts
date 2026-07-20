import { createClient } from "@supabase/supabase-js";
import { scrapeMoneywebProperty } from "./news/moneyweb.js";
import { scrapeGoogleNewsForCompany } from "./news/google-news.js";
import { matchesCompany } from "./match-company.js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function upsertArticle(
  title: string,
  url: string,
  source: string,
  publishedAt: string,
  summary: string | null,
  companyIds: string[],
) {
  const { data: inserted, error: insertError } = await supabase
    .from("news_articles")
    .upsert({ title, url, source, published_at: publishedAt, summary }, { onConflict: "url" })
    .select("id")
    .single();

  if (insertError) {
    console.error(`Failed to upsert "${title}"`, insertError.message);
    return;
  }

  if (companyIds.length > 0) {
    const { error: linkError } = await supabase.from("news_article_companies").upsert(
      companyIds.map((company_id) => ({ news_article_id: inserted.id, company_id })),
      { onConflict: "news_article_id,company_id", ignoreDuplicates: true },
    );
    if (linkError) {
      console.error(`Failed to link companies for "${title}"`, linkError.message);
    }
  }
}

async function run() {
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name");
  if (companiesError) throw companiesError;

  // Moneyweb: one shared feed covering all companies, matched by category keyword.
  try {
    const articles = await scrapeMoneywebProperty();
    console.log(`Moneyweb: scraped ${articles.length} articles`);
    for (const article of articles) {
      const companyIds = companies
        .filter((c) => matchesCompany(article.categories, c.name))
        .map((c) => c.id);
      await upsertArticle(article.title, article.url, "Moneyweb", article.publishedAt, article.summary, companyIds);
    }
  } catch (err) {
    console.error("Moneyweb: scrape failed", (err as Error).message);
  }

  // Google News: one targeted query per company, so the match is already known.
  // The feed returns up to 100 results spanning months, but this scraper runs
  // every 2 hours -- capping to the last 14 days keeps each run's DB writes
  // to roughly what's actually new, instead of re-upserting the same
  // months-old backlog every run.
  const recencyCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  for (const company of companies) {
    try {
      const allArticles = await scrapeGoogleNewsForCompany(company.name);
      const articles = allArticles.filter((a) => new Date(a.publishedAt).getTime() >= recencyCutoff);
      console.log(`${company.name}: scraped ${articles.length} recent Google News articles (${allArticles.length} total)`);
      for (const article of articles) {
        await upsertArticle(
          article.title,
          article.url,
          article.source ?? "Google News",
          article.publishedAt,
          article.summary,
          [company.id],
        );
      }
    } catch (err) {
      console.error(`${company.name}: Google News scrape failed`, (err as Error).message);
    }
  }
}

run();
