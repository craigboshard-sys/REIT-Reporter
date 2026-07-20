import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://spearprop.co.za/about-spear-reit-limited/leadership-team/";

export const spear: PeopleAdapter = {
  jseCode: "SEA",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Spear REIT leadership page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const seen = new Map<string, ScrapedPerson>();
    $(".et_pb_column").each((_, el) => {
      const $el = $(el);
      const nameHtml = $el.find(".et_pb_text_inner h3").first().html() ?? "";
      const fullName = nameHtml
        .replace(/<br\s*\/?>/gi, " ")
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const roleTitle = $el.find(".et_pb_text_inner h4").first().text().trim();
      const bio = $el.find(".et_pb_blurb_description p").first().text().trim();

      if (!fullName || !roleTitle) return;
      seen.set(fullName.toLowerCase(), {
        fullName,
        roleTitle,
        isExecutive: looksExecutive(roleTitle),
        bio: bio.length > 20 ? bio : null,
      });
    });

    // Note: non-executive directors are on this same page but use a
    // different module structure this adapter doesn't capture -- executives
    // only for now.
    return [...seen.values()];
  },
};
