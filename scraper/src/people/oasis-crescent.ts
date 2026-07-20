import * as cheerio from "cheerio";
import { fetchHtml } from "../http.js";
import { PeopleAdapter, ScrapedPerson, looksExecutive } from "./types.js";

const URL = "https://www.oasis.co.za/directors";

// Note: this page lists directors of the parent Oasis Group Holdings, not
// confirmed to be identical to Oasis Crescent Property Fund's own board
// (likely overlapping, given it's a small family-run group, but not
// verified) -- role is labeled accordingly rather than presented as if it
// were the fund's own board composition. No separate role-title field
// exists on the page; a best-effort title is pulled from the bio text.
function extractRole(bio: string): string {
  const match = bio.match(/is (?:the|a|an) ([^.]{3,60}?)(?:\s+of\s+(?:Oasis|the)|\.|,)/i);
  if (match) return `${match[1].trim()} (Oasis Group)`;
  return "Director (Oasis Group)";
}

export const oasisCrescent: PeopleAdapter = {
  jseCode: "OAS",
  async scrape() {
    const res = await fetchHtml(URL);
    if (!res.ok) throw new Error(`Oasis directors page returned ${res.status}`);
    const $ = cheerio.load(await res.text());

    const people: ScrapedPerson[] = [];
    $(".wixui-column-strip__column").each((_, col) => {
      const paragraphs = $(col)
        .find("p.font_8")
        .toArray()
        .map((p) => $(p).text().trim())
        .filter(Boolean);
      const [fullNameRaw, bio] = paragraphs;
      if (!fullNameRaw || !bio) return;

      const fullName = fullNameRaw.replace(/^(Mr|Ms|Mrs|Dr)\s+/, "");
      const roleTitle = extractRole(bio);

      people.push({ fullName, roleTitle, isExecutive: looksExecutive(roleTitle), bio });
    });

    return people;
  },
};
