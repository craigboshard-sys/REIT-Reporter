import { createClient } from "@supabase/supabase-js";
import { scrapeMoneywebProperty } from "./news/moneyweb.js";

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function matchesCompany(categories: string[], companyName: string): boolean {
  const normalizedCategories = categories.map((c) => c.toLowerCase());
  const nameWords = companyName
    .toLowerCase()
    .replace(/\b(properties|property fund|reit|limited|ltd)\b/g, "")
    .trim();
  return normalizedCategories.some(
    (c) => c.includes(nameWords) || nameWords.includes(c),
  );
}

async function run() {
  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name");
  if (companiesError) throw companiesError;

  const articles = await scrapeMoneywebProperty();
  console.log(`Scraped ${articles.length} articles from Moneyweb`);

  for (const article of articles) {
    const { data: inserted, error: insertError } = await supabase
      .from("news_articles")
      .upsert(
        {
          title: article.title,
          url: article.url,
          source: "Moneyweb",
          published_at: article.publishedAt,
          summary: article.summary,
        },
        { onConflict: "url" },
      )
      .select("id")
      .single();

    if (insertError) {
      console.error(`Failed to upsert "${article.title}"`, insertError.message);
      continue;
    }

    const matchedCompanyIds = companies
      .filter((c) => matchesCompany(article.categories, c.name))
      .map((c) => c.id);

    if (matchedCompanyIds.length > 0) {
      const { error: linkError } = await supabase
        .from("news_article_companies")
        .upsert(
          matchedCompanyIds.map((company_id) => ({
            news_article_id: inserted.id,
            company_id,
          })),
          { onConflict: "news_article_id,company_id", ignoreDuplicates: true },
        );
      if (linkError) {
        console.error(`Failed to link companies for "${article.title}"`, linkError.message);
      }
    }
  }
}

run();
