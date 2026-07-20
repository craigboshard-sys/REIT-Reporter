import { withStealthPage } from "../browser.js";
import { CompanyAdapter, parseDDMonthYYYY } from "../types.js";

const LIST_URL = "https://www.redefine.co.za/investors/investor-information/sens-announcements";
// The "senses" class and "sens-data*" id live on different, nested
// elements (parent/child), not the same one, so this can't be a single
// compound selector.
const ROW_SELECTOR = ".senses";

export const redefine: CompanyAdapter = {
  jseCode: "RDF",
  async scrape() {
    return withStealthPage(async (page) => {
      await page.goto(LIST_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForSelector(ROW_SELECTOR, { timeout: 30000, state: "attached" });

      // Row clicks navigate via Angular's in-app router (no <a href> to read
      // directly), so we can only get each announcement's permalink and full
      // text by clicking through and reading the resulting URL, then going
      // back. This only covers the first page (~6 most recent items), which
      // is fine since this scraper runs multiple times a day and the DB
      // upsert dedupes on (company_id, title, announced_at).
      const rowCount = await page.locator(ROW_SELECTOR).count();
      const results: { title: string; announcedAt: string; sourceUrl: string }[] = [];

      for (let i = 0; i < rowCount; i++) {
        const row = page.locator(ROW_SELECTOR).nth(i);
        await row.scrollIntoViewIfNeeded();
        await row.click();
        await page.waitForURL(/sens-announcements\/.+-\d+$/, { timeout: 15000 });
        await page.waitForSelector(".rd-heading.rd-heading-sm", { timeout: 15000, state: "attached" });

        const title = (await page.locator(".rd-heading.rd-heading-sm").first().textContent())?.trim() ?? "";
        const dateRaw = (await page.locator("p.rd-text-grey-mid.rd-text-grey.mt-3").first().textContent()) ?? "";
        const dateText = dateRaw.replace(/^\s*Published:\s*/, "").trim();
        const sourceUrl = page.url();

        if (title && dateText) {
          results.push({
            title,
            announcedAt: parseDDMonthYYYY(dateText),
            sourceUrl,
          });
        }

        await page.goBack({ waitUntil: "domcontentloaded" });
        await page.waitForSelector(ROW_SELECTOR, { timeout: 30000, state: "attached" });
      }

      return results;
    });
  },
};
