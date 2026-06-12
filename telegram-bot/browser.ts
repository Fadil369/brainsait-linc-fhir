import puppeteer from "@cloudflare/puppeteer";
import type { Browser, Page } from "@cloudflare/puppeteer";
import type { Env } from "./index";

/**
 * Launch a browser instance using Cloudflare Browser Run
 */
export async function launchBrowser(env: Env): Promise<Browser> {
  try {
    return await puppeteer.launch(env.MYBROWSER);
  } catch (error: any) {
    console.error("Failed to launch browser:", error);
    throw new Error(`Browser launch failed: ${error.message}`);
  }
}

/**
 * Login to Dr. Najeeb Lectures using Google OAuth
 * Note: This requires manual first-time login
 */
export async function loginToDrNajeeb(
  page: Page,
  env: Env
): Promise<{ success: boolean; message: string }> {
  try {
    // Set viewport for better rendering
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to login page
    await page.goto(env.DRNAJEEB_LOGIN_URL, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Check if already logged in
    const currentUrl = page.url();
    if (
      !currentUrl.includes("login") &&
      !currentUrl.includes("signin") &&
      currentUrl.includes("activeCourses")
    ) {
      return { success: true, message: "Already logged in" };
    }

    // Look for Google login button with multiple selectors
    const googleSelectors = [
      'button[class*="google"]',
      '[data-provider="google"]',
      'a[href*="google"]',
      ".google-login",
      "#google-login",
      'button:has-text("Google")',
      'a:has-text("Sign in with Google")',
      'button:has-text("Sign in with Google")',
    ];

    let googleButton = null;
    for (const selector of googleSelectors) {
      try {
        googleButton = await page.$(selector);
        if (googleButton) break;
      } catch {
        // Selector might not be valid, continue
      }
    }

    if (googleButton) {
      await googleButton.click();
      await page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 });
    }

    // Check if we're on Google's login page
    const newUrl = page.url();
    if (newUrl.includes("accounts.google.com")) {
      return {
        success: false,
        message: "Google login page detected. Manual login required.",
      };
    }

    return { success: true, message: "Login flow initiated" };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, message: `Login error: ${error.message}` };
  }
}

/**
 * Extract courses from the active courses page
 */
export async function getCourses(
  page: Page
): Promise<Array<{ title: string; description?: string; progress?: string; url?: string }>> {
  try {
    // Wait for course content to load with multiple selectors
    const courseSelectors = [
      '.course-item',
      '.course-card',
      '[class*="course"]',
      '.card',
      '.list-item',
      'article',
      '.content-item',
      '.item',
      '.entry',
    ];

    let found = false;
    for (const selector of courseSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        found = true;
        break;
      } catch {
        // Try next selector
      }
    }

    if (!found) {
      console.warn("No course selectors found, attempting extraction anyway");
    }

    // Extract course data - this runs in the browser context
    const courses = await page.evaluate(() => {
      const selectors = [
        ".course-item",
        ".course-card",
        '[class*="course"]',
        ".card",
        ".list-item",
        "article",
        ".content-item",
        ".item",
        ".entry",
      ];

      let items: Element[] = [];
      for (const selector of selectors) {
        items = Array.from(document.querySelectorAll(selector));
        if (items.length > 0) break;
      }

      // If no items found, try to get any meaningful content
      if (items.length === 0) {
        const body = document.body;
        if (body) {
          const allDivs = Array.from(body.querySelectorAll("div, section, li"));
          items = allDivs.filter((el) => {
            const text = el.textContent?.trim() || "";
            return text.length > 10 && text.length < 500;
          }).slice(0, 20);
        }
      }

      return items.map((item) => {
        const titleEl =
          item.querySelector("h1, h2, h3, h4, .title, .name, [class*='title']") ||
          item.querySelector("a");
        const descEl = item.querySelector(
          "p, .description, .desc, [class*='description'], .summary"
        );
        const progressEl = item.querySelector(
          ".progress, [class*='progress'], .completion"
        );
        const linkEl = item.querySelector("a");

        return {
          title: titleEl?.textContent?.trim() || "Untitled",
          description: descEl?.textContent?.trim(),
          progress: progressEl?.textContent?.trim(),
          url: (linkEl as HTMLAnchorElement)?.href,
        };
      });
    });

    // Filter out empty or invalid courses
    return courses.filter((c) => c.title && c.title !== "Untitled" && c.title.length > 2);
  } catch (error: any) {
    console.error("Error extracting courses:", error);
    return [];
  }
}

/**
 * Extract notes and drawings from the notes page
 */
export async function getNotesAndDrawings(
  page: Page
): Promise<Array<{ title: string; type?: string; url?: string }>> {
  try {
    // Wait for content to load with multiple selectors
    const noteSelectors = [
      '.note',
      '.drawing',
      '.pdf',
      '[class*="note"]',
      '[class*="drawing"]',
      '.file-item',
      '.attachment',
      '.card',
      '.list-item',
      'article',
    ];

    let found = false;
    for (const selector of noteSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        found = true;
        break;
      } catch {
        // Try next selector
      }
    }

    if (!found) {
      console.warn("No note selectors found, attempting extraction anyway");
    }

    // Extract notes data - this runs in the browser context
    const notes = await page.evaluate(() => {
      const selectors = [
        ".note",
        ".drawing",
        ".pdf",
        '[class*="note"]',
        '[class*="drawing"]',
        ".file-item",
        ".attachment",
        ".card",
        ".list-item",
        "article",
        "a[href*='.pdf']",
        "a[href*='download']",
        "img[class*='drawing']",
      ];

      let items: Element[] = [];
      for (const selector of selectors) {
        items = Array.from(document.querySelectorAll(selector));
        if (items.length > 0) break;
      }

      // If no items found, try to get any meaningful content
      if (items.length === 0) {
        const body = document.body;
        if (body) {
          const allLinks = Array.from(body.querySelectorAll("a[href]"));
          items = allLinks.filter((el) => {
            const href = (el as HTMLAnchorElement).href || "";
            return href.includes(".pdf") || href.includes("download") || href.includes("note");
          });
        }
      }

      return items.map((item) => {
        const titleEl =
          item.querySelector("h1, h2, h3, h4, .title, .name, [class*='title']") ||
          item;
        const linkEl = item.querySelector("a") || item;

        // Determine type
        let type = "note";
        const href = (linkEl as HTMLAnchorElement)?.href || "";
        const className = item.className || "";
        if (
          href.includes(".pdf") ||
          className.includes("pdf") ||
          className.includes("drawing")
        ) {
          type = href.includes(".pdf") ? "PDF" : "Drawing";
        }

        return {
          title: titleEl?.textContent?.trim() || "Untitled",
          type,
          url: href || undefined,
        };
      });
    });

    // Filter out empty or invalid notes
    return notes.filter((n) => n.title && n.title !== "Untitled" && n.title.length > 2);
  } catch (error: any) {
    console.error("Error extracting notes:", error);
    return [];
  }
}

/**
 * Take a full page screenshot
 */
export async function takeScreenshot(page: Page): Promise<Buffer> {
  try {
    return (await page.screenshot({
      type: "png",
      fullPage: true,
    })) as Buffer;
  } catch (error: any) {
    console.error("Screenshot error:", error);
    throw new Error(`Screenshot failed: ${error.message}`);
  }
}

/**
 * Export page as PDF
 */
export async function exportPdf(page: Page): Promise<Buffer> {
  try {
    return (await page.pdf({
      format: "A4",
      printBackground: true,
    })) as Buffer;
  } catch (error: any) {
    console.error("PDF export error:", error);
    throw new Error(`PDF export failed: ${error.message}`);
  }
}

/**
 * Wait for page to be ready
 */
export async function waitForPageReady(page: Page, timeout: number = 10000): Promise<void> {
  try {
    await page.waitForFunction(() => document.readyState === "complete", { timeout });
  } catch {
    // Timeout is acceptable
  }
}

/**
 * Get page title
 */
export async function getPageTitle(page: Page): Promise<string> {
  try {
    return await page.title();
  } catch {
    return "Unknown";
  }
}
