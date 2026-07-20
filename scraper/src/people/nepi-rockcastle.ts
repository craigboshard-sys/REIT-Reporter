import * as cheerio from "cheerio";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://nepirockcastle.com/group/corporate-governance/the-board-and-board-committees/";

// Bios live on separate per-person pages (e.g. /director/marek-noetzel/) --
// names and roles only from this overview page.
export const nepiRockcastle: PeopleAdapter = {
  jseCode: "NRP",
  async scrape() {
    const res = await fetch(URL);
    if (!res.ok) throw new Error(`NEPI Rockcastle board page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".jet-listing-grid__item").each((_, el) => {
      const fields = $(el)
        .find(".jet-listing-dynamic-field__content")
        .toArray()
        .map((f) => $(f).text().trim())
        .filter(Boolean);
      const [fullName, roleTitle] = fields;
      if (!fullName || !roleTitle) return;
      people.push({ fullName, roleTitle, isExecutive: looksExecutive(roleTitle), bio: null });
    });

    return people;
  },
};
