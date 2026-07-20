import * as cheerio from "cheerio";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.acceleratepf.co.za/about/governance/";

export const accelerate: PeopleAdapter = {
  jseCode: "APF",
  async scrape() {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`Accelerate governance page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".team-member").each((_, el) => {
      const $el = $(el);
      const fullName = $el.find(".team-member-name").first().text().trim();
      const roleTitle = $el.find(".team-member-title").first().text().trim();
      const paragraphs = $el.find(".team-member-details p").toArray().map((p) => $(p).text().trim());
      const bio = paragraphs.length > 0 ? paragraphs[paragraphs.length - 1] : null;

      if (!fullName || !roleTitle) return;
      people.push({
        fullName: fullName.replace(/^Mr |^Ms |^Mrs |^Dr /, ""),
        roleTitle,
        isExecutive: looksExecutive(roleTitle),
        bio: bio && bio.length > 20 ? bio : null,
      });
    });

    return people;
  },
};
