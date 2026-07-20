import { chromium, type Page } from "playwright";

// Some sites' bot protection (Cloudflare) blocks vanilla headless Chromium
// by detecting automation fingerprints (navigator.webdriver, missing
// automation-controlled flag patching). These are standard, publicly
// documented evasions -- not identity spoofing, just not exposing the
// automation flag that headless browsers set by default.
export async function withStealthPage<T>(fn: (page: Page) => Promise<T>): Promise<T> {
  const browser = await chromium.launch({
    args: ["--disable-blink-features=AutomationControlled"],
  });
  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      locale: "en-US",
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
    });
    const page = await context.newPage();
    return await fn(page);
  } finally {
    await browser.close();
  }
}
