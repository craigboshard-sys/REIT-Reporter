export type ScrapedPerson = {
  fullName: string;
  roleTitle: string;
  isExecutive: boolean;
  bio: string | null;
};

export type PeopleAdapter = {
  jseCode: string;
  scrape: () => Promise<ScrapedPerson[]>;
};

const EXEC_KEYWORDS = [
  "chief executive",
  "ceo",
  "chief financial",
  "cfo",
  "chief operating",
  "chief operations",
  "coo",
  "chief investment",
  "cio",
  "financial director",
  "managing director",
  "executive director",
];

export function looksExecutive(roleTitle: string): boolean {
  const lower = roleTitle.toLowerCase();
  if (lower.includes("non-executive") || lower.includes("independent")) return false;
  return EXEC_KEYWORDS.some((k) => lower.includes(k));
}
