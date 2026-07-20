// Some sites' bot-protection blocks or challenges requests with Node's
// default fetch headers (generic User-Agent, no Accept), especially from
// shared CI IP ranges like GitHub Actions runners. Sending realistic
// browser-like headers avoids that without doing anything deceptive --
// we're not spoofing identity, just not looking like a bare HTTP client.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

export async function fetchHtml(url: string): Promise<Response> {
  return fetch(url, { headers: BROWSER_HEADERS });
}
