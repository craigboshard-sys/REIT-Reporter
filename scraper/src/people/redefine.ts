import { withStealthPage } from "../browser.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.redefine.co.za/about-us/corporate-governance";

// No bios inline on this page (each links to a separate profile) -- names
// and roles only.
export const redefine: PeopleAdapter = {
  jseCode: "RDF",
  async scrape() {
    return withStealthPage(async (page) => {
      await page.goto(URL, { waitUntil: "networkidle" });

      const cards = await page.$$eval(".people-card-content", (els) =>
        els.map((el) => ({
          name: el.querySelector(".rd-heading")?.textContent?.trim() ?? "",
          role: el.querySelector(".d-flex.align-items-center")?.textContent?.trim() ?? "",
        })),
      );

      const seen = new Map<string, ScrapedPerson>();
      for (const c of cards) {
        if (!c.name || !c.role) continue;
        seen.set(c.name.toLowerCase(), {
          fullName: c.name,
          roleTitle: c.role,
          isExecutive: looksExecutive(c.role),
          bio: null,
        });
      }
      return [...seen.values()];
    });
  },
};
