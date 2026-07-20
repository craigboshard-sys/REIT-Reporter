import { withStealthPage } from "../browser.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://growthpoint.co.za/corporate-governance";

export const growthpoint: PeopleAdapter = {
  jseCode: "GRT",
  async scrape() {
    return withStealthPage(async (page) => {
      await page.goto(URL, { waitUntil: "networkidle" });

      const cards = await page.$$eval("article .flex.flex-col", (els) =>
        els
          .map((el) => Array.from(el.querySelectorAll("p")).map((p) => p.textContent?.trim() ?? ""))
          .filter((ps) => ps.length >= 2 && ps[0] && ps[1]),
      );

      const people: ScrapedPerson[] = [];
      const seen = new Set<string>();
      for (const [nameRaw, roleTitle, , bio] of cards) {
        const fullName = nameRaw.replace(/\s*\(\d+\)\s*$/, "").trim();
        if (!fullName || !roleTitle || seen.has(fullName.toLowerCase())) continue;
        seen.add(fullName.toLowerCase());
        people.push({
          fullName,
          roleTitle,
          isExecutive: looksExecutive(roleTitle),
          bio: bio && bio.length > 20 ? bio : null,
        });
      }

      return people;
    });
  },
};
