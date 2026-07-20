import { withStealthPage } from "../browser.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.burstone.com/our-board";

// Bios are behind a click-to-reveal tab interface (one shared panel,
// swapped per click) -- names and roles only, from the tab list itself.
export const burstone: PeopleAdapter = {
  jseCode: "BTN",
  async scrape() {
    return withStealthPage(async (page) => {
      await page.goto(URL, { waitUntil: "networkidle" });

      const tabs = await page.$$eval('[class*="card-tabs_nav-tab-text"]', (els) =>
        els.map((el) => ({
          name: el.querySelector("span:first-child")?.textContent?.trim() ?? "",
          role: el.querySelector("span:nth-child(2)")?.textContent?.trim() ?? "",
        })),
      );

      const seen = new Map<string, ScrapedPerson>();
      for (const t of tabs) {
        if (!t.name || !t.role) continue;
        seen.set(t.name.toLowerCase(), {
          fullName: t.name,
          roleTitle: t.role,
          isExecutive: looksExecutive(t.role),
          bio: null,
        });
      }
      return [...seen.values()];
    });
  },
};
