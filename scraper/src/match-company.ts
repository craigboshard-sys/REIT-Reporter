export function matchesCompany(texts: string[], companyName: string): boolean {
  const normalized = texts.map((t) => t.toLowerCase());
  const nameWords = companyName
    .toLowerCase()
    .replace(/\b(properties|property fund|reit|limited|ltd)\b/g, "")
    .trim();
  return normalized.some((t) => t.includes(nameWords) || nameWords.includes(t));
}
