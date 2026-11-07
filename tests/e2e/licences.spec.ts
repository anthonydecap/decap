import { expect, test } from "@playwright/test";
import { auth0Login, creds } from "./helpers";

/**
 * Licence v1 (contract C7): player registration with a .decapreq and the licence queue.
 * Without credentials only the locks are checked; with E2E_CUSTOMER_* / E2E_ADMIN_* the pages too.
 */
const PLAYER = { id: "f7928d1fc97c177a6ee3e7694b7652ef", publicKey: "3f65fb0ffd39ac6284ca94f41950c3cd95b15ecfa4658d9b4a859a5f7aff5110" };
const decapreq = JSON.stringify({ format: "decap-request", formatVersion: 1, player: PLAYER, app: "DecapPlayer", created: "2026-11-07" }, null, 2);
const NIL = "00000000-0000-4000-8000-000000000000";

test.describe("licence v1: locked without the right sign-in", () => {
  test("registering a player and downloading a licence need a customer session", async ({ request }) => {
    const reg = await request.post("/api/shop/account/players", { data: { request: decapreq } });
    expect(reg.status()).toBe(401);
    const dl = await request.get(`/api/shop/account/players/${NIL}/licence`);
    expect(dl.status()).toBe(401);
  });

  test("the licence queue and its files need a staff session", async ({ page, request }) => {
    for (const path of ["request", "songs"]) {
      expect((await request.get(`/api/admin/shop/licences/${NIL}/${path}`)).status()).toBe(401);
    }
    expect((await request.post(`/api/admin/shop/licences/${NIL}/upload`, { data: { licence: "x" } })).status()).toBe(401);
    expect((await request.post(`/api/admin/shop/licences/${NIL}/refuse`, { data: { reason: "nope" } })).status()).toBe(401);
    expect((await request.patch(`/api/admin/shop/licences/${NIL}`, { data: {} })).status()).toBe(401);
    await page.goto("/admin/shop/licences");
    await expect(page.getByText(/player licences/i)).toHaveCount(0);
  });

  test("a cross-site post is refused before anything else", async ({ request }) => {
    const res = await request.post("/api/shop/account/players", { data: { request: decapreq }, headers: { origin: "https://evil.example" } });
    expect([401, 403]).toContain(res.status());
  });
});

test.describe("licence v1: customer registers a player", () => {
  test.skip(!creds.customer, "E2E_CUSTOMER_EMAIL / E2E_CUSTOMER_PASSWORD not set");
  test("upload a .decapreq on Account > Players", async ({ page }) => {
    await page.goto("/en/shop/account/players");
    if (/auth0\.com/.test(page.url()) || (await page.getByRole("link", { name: /sign in|log in/i }).first().isVisible().catch(() => false))) {
      if (!/auth0\.com/.test(page.url())) await page.getByRole("link", { name: /sign in|log in/i }).first().click();
      await auth0Login(page, creds.customer!.email, creds.customer!.password);
      await page.goto("/en/shop/account/players");
    }
    await expect(page.getByRole("heading", { name: /register a decap player/i })).toBeVisible();
    await page.getByLabel(/activation request/i).setInputFiles({ name: `${PLAYER.id}.decapreq`, mimeType: "application/json", buffer: Buffer.from(decapreq) });
    await page.getByRole("button", { name: /register player/i }).click();
    await expect(page.getByText(/player registered|already registered to your account|another account/i)).toBeVisible();
  });
});

test.describe("licence v1: staff licence queue", () => {
  test.skip(!creds.admin, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");
  test("the queue lists waiting players and an order shows the decaplic command", async ({ page }) => {
    await page.goto("/admin/shop/licences");
    if (/auth0\.com/.test(page.url())) await auth0Login(page, creds.admin!.email, creds.admin!.password);
    await page.goto("/admin/shop/licences");
    await expect(page.getByRole("heading", { name: /player licences/i })).toBeVisible();
    const first = page.locator("a[href^='/admin/shop/licences/']").first();
    test.skip(!(await first.isVisible().catch(() => false)), "No licence orders yet");
    await first.click();
    await expect(page.getByText(/decaplic issue/)).toBeVisible();
  });
});
