import * as cheerio from "cheerio";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://emira.co.za/meet-the-team/";

const GOVERNANCE_KEYWORDS = ["chief", "director", "chairman", "chairperson"];

export const emira: PeopleAdapter = {
  jseCode: "EMI",
  async scrape() {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`Emira meet-the-team page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const seen = new Map<string, ScrapedPerson>();
    $("h4.ld-fh-element").each((_, el) => {
      const name = $(el).text().trim();
      const roleTitle = $(el).closest(".wpb_column").find("h6.ld-fh-element").first().text().trim();
      if (!name || !roleTitle) return;
      if (!GOVERNANCE_KEYWORDS.some((k) => roleTitle.toLowerCase().includes(k))) return;

      const key = name.toLowerCase();
      const existing = seen.get(key);
      // Prefer the properly-cased version over an ALL-CAPS duplicate.
      if (!existing || (existing.fullName === existing.fullName.toUpperCase() && name !== name.toUpperCase())) {
        seen.set(key, { fullName: name, roleTitle, isExecutive: looksExecutive(roleTitle), bio: null });
      }
    });

    return [...seen.values()];
  },
};
