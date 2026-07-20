import * as cheerio from "cheerio";

export type ScrapedUpdate = {
  title: string;
  documentUrl: string;
  publishedDate: string | null; // ISO date, if parseable
  publishedYear: number;
};

const FEED_URL = "https://www.fsca.co.za/Latest-News/";
const BASE_URL = "https://www.fsca.co.za";

const MONTHS: Record<string, string> = {
  january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
  july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
};

/**
 * FSCA titles embed the date as free text in inconsistent formats, e.g.
 * "..._17 July 2026", "...-14July26", or no parseable date at all. Returns
 * null (not a thrown error) when the format isn't recognized -- the
 * accordion year is used as a guaranteed fallback in that case.
 */
function parseEmbeddedDate(title: string, fallbackYear: number): string | null {
  const spaced = title.match(/(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\s*$/i);
  if (spaced) {
    const [, day, monthName, year] = spaced;
    const month = MONTHS[monthName.toLowerCase()];
    if (month) return `${year}-${month}-${day.padStart(2, "0")}`;
  }

  const glued = title.match(/(\d{1,2})(january|february|march|april|may|june|july|august|september|october|november|december)(\d{2,4})\s*$/i);
  if (glued) {
    const [, day, monthName, yearRaw] = glued;
    const month = MONTHS[monthName.toLowerCase()];
    const year = yearRaw.length === 2 ? `${fallbackYear.toString().slice(0, 2)}${yearRaw}` : yearRaw;
    if (month) return `${year}-${month}-${day.padStart(2, "0")}`;
  }

  return null;
}

function cleanTitle(rawTitle: string): string {
  return rawTitle
    .replace(/^FSCA Press Release\s*[-_]\s*/i, "")
    .replace(/[-_]\s*\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*$/i, "")
    .replace(/\s*\d{1,2}(January|February|March|April|May|June|July|August|September|October|November|December)\d{2,4}\s*$/i, "")
    .trim();
}

export async function scrapeFsca(): Promise<ScrapedUpdate[]> {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`FSCA page returned ${res.status}`);
  const $ = cheerio.load(await res.text());

  const updates: ScrapedUpdate[] = [];

  $("#media-releases .accordion-item").each((_, section) => {
    const yearText = $(section).find(".accordion-header button").first().text().trim();
    const year = parseInt(yearText, 10);
    if (!year) return;

    $(section)
      .find("tr[onclick]")
      .each((_, row) => {
        const onclick = $(row).attr("onclick") ?? "";
        const urlMatch = onclick.match(/window\.open\('([^']+)'/);
        const rawTitle = $(row).find("td").first().text().trim();
        if (!urlMatch || !rawTitle) return;

        updates.push({
          title: cleanTitle(rawTitle),
          documentUrl: `${BASE_URL}${urlMatch[1]}`,
          publishedDate: parseEmbeddedDate(rawTitle, year),
          publishedYear: year,
        });
      });
  });

  return updates;
}
