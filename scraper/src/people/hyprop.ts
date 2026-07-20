import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.hyprop.co.za/our-leadership.php";

export const hyprop: PeopleAdapter = {
  jseCode: "HYP",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Hyprop leadership page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".leaderships-block").each((_, el) => {
      const $el = $(el);
      const fullName = $el.find(".leaderships-box h4").first().text().trim();
      const roleTitle = $el.find(".leaderships-box p").first().text().trim();
      const paragraphs = $el
        .find(".member-content p")
        .toArray()
        .map((p) => $(p).text().trim())
        .filter((t) => t.length > 30 && !t.startsWith("Qualification"));
      const bio = paragraphs.length > 0 ? paragraphs[0] : null;

      if (!fullName || !roleTitle) return;
      people.push({ fullName, roleTitle, isExecutive: looksExecutive(roleTitle), bio });
    });

    return people;
  },
};
