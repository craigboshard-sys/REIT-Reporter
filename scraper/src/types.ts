export type ScrapedAnnouncement = {
  title: string;
  announcedAt: string; // ISO date, YYYY-MM-DD
  sourceUrl: string;
};

export type CompanyAdapter = {
  jseCode: string;
  scrape: () => Promise<ScrapedAnnouncement[]>;
};

const MONTHS: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

/** Parses "26 Jun 2026" (with regular or non-breaking spaces) into "2026-06-26". */
export function parseDDMonYYYY(text: string): string {
  const cleaned = text.replace(/ /g, " ").trim();
  const match = cleaned.match(/(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
  if (!match) throw new Error(`Unrecognized date format: "${text}"`);
  const [, day, mon, year] = match;
  const month = MONTHS[mon as keyof typeof MONTHS];
  if (!month) throw new Error(`Unrecognized month: "${mon}" in "${text}"`);
  return `${year}-${month}-${day.padStart(2, "0")}`;
}

/** Parses "2026/07/08 07:58:11" (with regular or non-breaking spaces) into "2026-07-08". */
export function parseYYYYMMDD(text: string): string {
  const cleaned = text.replace(/ /g, " ").trim();
  const match = cleaned.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  if (!match) throw new Error(`Unrecognized date format: "${text}"`);
  const [, year, month, day] = match;
  return `${year}-${month}-${day}`;
}

/** Parses "24.06.2026" into "2026-06-24". */
export function parseDDMMYYYYDotted(text: string): string {
  const cleaned = text.trim();
  const match = cleaned.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (!match) throw new Error(`Unrecognized date format: "${text}"`);
  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/** Parses "06 July 2026" into "2026-07-06". */
export function parseDDMonthYYYY(text: string): string {
  const cleaned = text.trim();
  const match = cleaned.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (!match) throw new Error(`Unrecognized date format: "${text}"`);
  const [, day, monthName, year] = match;
  const month = new Date(`${monthName} 1, 2000`).getMonth();
  if (Number.isNaN(month)) throw new Error(`Unrecognized month: "${monthName}" in "${text}"`);
  return `${year}-${String(month + 1).padStart(2, "0")}-${day.padStart(2, "0")}`;
}
