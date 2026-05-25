/**
 * Oracle Portal Login via Cloudflare Browser Rendering
 * Uses CF Browser Rendering to log into Oracle portals with stored credentials
 * Endpoint: /api/oracle/login/:hospital
 */

const ORACLE_PORTALS = {
  riyadh: { url: "https://oracle-riyadh.brainsait.org/prod/faces/Login.jsf", user: "U29200", pass: "U29201" },
  madinah: { url: "https://oracle-madinah.brainsait.org/Oasis/faces/Login.jsf", user: "U29200", pass: "U29201" },
  jizan: { url: "https://oracle-jizan.brainsait.org/prod/faces/Login.jsf", user: "U29200", pass: "U29201" },
  khamis: { url: "https://oracle-khamis.brainsait.org/prod/faces/Login.jsf", user: "U29200", pass: "U29201" },
  unaizah: { url: "https://oracle-unaizah.brainsait.org/prod/faces/Login.jsf", user: "U29200", pass: "U29201" },
  abha: { url: "https://oracle-abha.brainsait.org/Oasis/faces/Login.jsf", user: "U29200", pass: "U29201" },
};

export async function handleOracleLogin(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  // /api/oracle/login/:hospital — attempt login via Browser Rendering
  const match = path.match(/^\/api\/oracle\/login\/([a-z]+)$/);
  if (!match) {
    return new Response(JSON.stringify({
      usage: { "/api/oracle/login/riyadh": "Login to Oracle Riyadh (riyadh, madinah, jizan, khamis, unaizah, abha)" },
      portals: ORACLE_PORTALS,
    }, null, 2), {
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
    });
  }

  const hospital = match[1];
  const portal = ORACLE_PORTALS[hospital];
  if (!portal) {
    return new Response(JSON.stringify({
      error: `Unknown hospital: ${hospital}`,
      available: Object.keys(ORACLE_PORTALS),
    }), { status: 400, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
  }

  // Attempt 1: Direct HTTP login (Oracle EBS/Forms based — will likely need JS)
  // Attempt 2: Via Browser Rendering if available
  // Attempt 3: Via bridge worker

  const hasBrowser = env.BROWSER_RENDERING !== undefined;

  if (hasBrowser) {
    try {
      const browser = await env.BROWSER_RENDERING.launch();
      const page = await browser.newPage();
      await page.goto(portal.url, { waitUntil: "networkidle0", timeout: 30000 });

      // Fill in Oracle login form
      const usernameField = await page.$("input[type='text'], input[name*='user'], input[id*='user'], input[name*='User'], input[id*='User']");
      const passwordField = await page.$("input[type='password'], input[name*='pass'], input[id*='pass'], input[name*='Password'], input[id*='Password']");
      const loginButton = await page.$("input[type='submit'], button[type='submit'], input[value*='Login'], input[value*='login']");

      if (usernameField && passwordField) {
        await usernameField.type(portal.user);
        await passwordField.type(portal.pass);
        if (loginButton) await loginButton.click();
        else await page.keyboard.press("Enter");

        await page.waitForTimeout(5000);
        const screenshot = await page.screenshot();
        const title = await page.title();
        const currentUrl = page.url();

        await browser.close();

        return new Response(JSON.stringify({
          hospital,
          portal: portal.url,
          loginAttempted: true,
          browserRendering: true,
          resultPage: currentUrl,
          resultTitle: title,
          loginSuccess: !currentUrl.includes("Login.jsf"),
          screenshotAvailable: true,
          note: "Screenshot captured on the worker side. Use R2 for persistent storage.",
        }), {
          headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
        });
      } else {
        await browser.close();
        return new Response(JSON.stringify({
          hospital,
          loginFormFound: false,
          note: "Could not locate login form fields on the Oracle page. May need custom selectors.",
          htmlSnippet: await (await page).content().then(c => c.substring(0, 1000)),
        }), {
          headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({
        hospital,
        error: `Browser Rendering error: ${e.message}`,
        fallback: "Use the oracle-bridge worker for API access instead.",
      }), { status: 500, headers: { "content-type": "application/json", "access-control-allow-origin": "*" } });
    }
  }

  // Fallback: no browser rendering available
  return new Response(JSON.stringify({
    hospital,
    portal: portal.url,
    credentials: { username: portal.user, password: "****" },
    browserRenderingAvailable: false,
    alternatives: [
      "Call oracle-bridge worker-to-worker (bypasses SSO)",
      "Set up Cloudflare Browser Rendering binding in wrangler.toml",
      "Use the NPHIES API for claims data (already live)",
    ],
    directLoginNote: "Oracle EBS login requires JS execution. Browser Rendering is needed.",
  }, null, 2), {
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
