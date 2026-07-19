// Below this length, substring matching produces false positives (e.g. "AI"
// is a literal substring of "Fairvest", "Property" is a substring of
// "Stor-Age Property REIT" and would match nearly every article in a
// property-focused feed).
const MIN_MATCH_LENGTH = 4;

export function matchesCompany(texts: string[], companyName: string): boolean {
  const normalized = texts.map((t) => t.toLowerCase());
  const nameWords = companyName
    .toLowerCase()
    .replace(/\b(properties|property fund|property|reit|limited|ltd)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (nameWords.length < MIN_MATCH_LENGTH) return false;

  return normalized.some((t) => {
    if (t.length < MIN_MATCH_LENGTH) return false;
    return t.includes(nameWords) || nameWords.includes(t);
  });
}
