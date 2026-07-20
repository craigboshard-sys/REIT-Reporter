import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://attacq.co.za/leadership";

// Bios are fetched client-side from a headless CMS backend and aren't in
// the static HTML -- names and roles only.
export const attacq: PeopleAdapter = {
  jseCode: "ATT",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Attacq leadership page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const seen = new Map<string, ScrapedPerson>();
    $("h4.subheader").each((_, el) => {
      const $el = $(el);
      const fullName = $el.text().trim();
      const roleTitle = $el.next("p").text().replace(/\*$/, "").trim();
      if (!fullName || !roleTitle) return;
      seen.set(fullName.toLowerCase(), {
        fullName,
        roleTitle,
        isExecutive: looksExecutive(roleTitle),
        bio: null,
      });
    });

    return [...seen.values()];
  },
};
