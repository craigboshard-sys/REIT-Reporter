import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://octodec.co.za/about-us/";

export const octodec: PeopleAdapter = {
  jseCode: "OCT",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Octodec about-us page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $('[id^="popmake-"] .row.profile').each((_, el) => {
      const $el = $(el);
      const fullName = $el.find("h3").first().text().trim();
      let roleTitle = "";
      $el.find("p").each((_, p) => {
        const text = $(p).text().trim();
        if (text.startsWith("Designation:")) roleTitle = text.replace("Designation:", "").trim();
      });
      if (!fullName || !roleTitle) return;

      const bioParagraphs = $el
        .find("p")
        .toArray()
        .map((p) => $(p).text().trim())
        .filter((t) => t.length > 40 && !/^(Qualifications|Designation|Date of appointment|Board committee|Significant other)/i.test(t));
      const bio = bioParagraphs.length > 0 ? bioParagraphs.join(" ") : null;

      people.push({ fullName, roleTitle, isExecutive: looksExecutive(roleTitle), bio });
    });

    return people;
  },
};
