import { scrapeMoneywebProperty } from "./news/moneyweb.js";

const articles = await scrapeMoneywebProperty();
console.log(`Scraped ${articles.length} articles\n`);
for (const a of articles.slice(0, 5)) {
  console.log(`${a.publishedAt}  ${a.title}`);
  console.log(`  categories: ${a.categories.join(", ")}`);
  console.log(`  ${a.url}\n`);
}
