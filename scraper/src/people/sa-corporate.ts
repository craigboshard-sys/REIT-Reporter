import * as cheerio from "cheerio";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://sacorporatefund.co.za/about/directors";

export const saCorporate: PeopleAdapter = {
  jseCode: "SAC",
  async scrape() {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`SA Corporate directors page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".col-inner").each((_, el) => {
      const $el = $(el);
      const fullName = $el.find(".person-name").first().text().trim();
      const roleTitle = $el.find(".person-title").first().text().trim();
      if (!fullName || !roleTitle) return;

      const textBlocks = $el
        .find(".text p")
        .toArray()
        .map((p) => $(p).text().trim())
        .filter((t) => t.length > 40);
      const bio = textBlocks.length > 0 ? textBlocks[textBlocks.length - 1] : null;

      people.push({ fullName, roleTitle, isExecutive: looksExecutive(roleTitle), bio });
    });

    return people;
  },
};
