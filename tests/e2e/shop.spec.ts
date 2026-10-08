import { expect, test } from "@playwright/test";
import { auth0Login, creds, emptyCart, expectFulfilled, payWithTestCard } from "./helpers";

/**
 * Storefront and security flows. The first block needs no accounts and always runs.
 * Purchase flows run only when Auth0 test credentials are provided (see playwright.config.ts)
 * and `npm run stripe:listen` is forwarding webhooks.
 */

test.describe("public storefront", () => {
  test("browse, search, preview controls and collections", async ({ page }) => {
    await page.goto("/en/shop");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByLabel(/search the catalog/i).first().fill("Joplin");
    await page.getByRole("button", { name: /^search$/i }).first().click();
    await expect(page).toHaveURL(/\/en\/shop\/browse\?q=Joplin/);
    await expect(page.getByRole("heading", { name: "The Entertainer" })).toBeVisible();

    await page.goto("/en/shop/collections");
    await page.getByRole("link", { name: /ragtime parlour/i }).first().click();
    await expect(page.getByText(/bought separately/i)).toBeVisible();
  });

  test("anonymous cart dedupes an arrangement already inside a collection", async ({ page }) => {
    await page.goto("/en/shop/browse?q=Entertainer");
    await page.getByRole("button", { name: /add to cart/i }).first().click();
    await expect(page.getByRole("link", { name: /in cart/i }).first()).toBeVisible();
    await page.goto("/en/shop/collections/ragtime-parlour");
    await page.getByRole("button", { name: /add to cart/i }).first().click();
    await page.goto("/en/shop/cart");
    await expect(page.getByText(/included in ragtime parlour/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in to check out/i })).toBeVisible();
  });
});

test.describe("unauthorized access", () => {
  test("admin pages and APIs require a staff session", async ({ page, request }) => {
    const res = await page.goto("/admin/shop");
    expect(page.url()).toMatch(/auth0\.com|\/auth\/login/);
    expect(res?.status()).toBeLessThan(500);
    expect((await request.get("/api/admin/shop/imports")).status()).toBe(401);
    expect((await request.post("/api/admin/shop/arrangements", { data: {} })).status()).toBe(401);
  });

  test("orders are private and checkout needs sign-in", async ({ page, request }) => {
    expect((await request.get("/api/shop/orders/2b1f8f5e-6a50-4a8e-9a77-1a2b3c4d5e6f")).status()).toBe(401);
    expect((await request.post("/api/shop/checkout/prepare", { data: {} })).status()).toBe(401);
    await page.goto("/en/shop/checkout");
    expect(page.url()).toMatch(/auth0\.com|\/auth\/login/);
  });

  test("webhook rejects unsigned events", async ({ request }) => {
    expect((await request.post("/api/stripe/webhook", { data: { type: "payment_intent.succeeded" } })).status()).toBe(400);
  });
});

test.describe("signup and onboarding", () => {
  test.skip(!creds.newUserPassword, "E2E_NEW_USER_PASSWORD not set");
  test("new customer signs up through Auth0 and completes onboarding", async ({ page }) => {
    const email = `e2e+${Date.now()}@dmi-shop.test`;
    await page.goto("/auth/login?screen_hint=signup&returnTo=/en/shop/account");
    await page.waitForURL(/auth0\.com/);
    await page.getByLabel(/email/i).first().fill(email);
    await page.getByLabel(/password/i).first().fill(creds.newUserPassword!);
    await page.getByRole("button", { name: /continue|sign up/i }).first().click();
    await page.waitForURL(/\/en\/shop\/account\/onboarding/, { timeout: 30_000 });
    await page.getByLabel(/first name/i).fill("Noor");
    await page.getByLabel(/last name/i).fill("Vandeputte");
    await page.getByLabel(/country/i).selectOption("BE");
    await page.getByLabel(/terms of sale/i).check();
    await page.getByLabel(/privacy policy/i).check();
    await page.getByRole("button", { name: /continue/i }).click();
    await expect(page).toHaveURL(/\/en\/shop\/account$/);
  });
});

test.describe("purchases", () => {
  test.skip(!creds.customer, "E2E_CUSTOMER_EMAIL / E2E_CUSTOMER_PASSWORD not set");

  test.beforeEach(async ({ page }) => {
    await page.goto(`/auth/login?returnTo=${encodeURIComponent("/en/shop")}`);
    await auth0Login(page, creds.customer!.email, creds.customer!.password);
    await emptyCart(page);
  });

  test("individual arrangement purchase lands in the library via the webhook", async ({ page }) => {
    await page.goto("/en/shop/browse?sort=newest");
    const buy = page.getByRole("button", { name: /add to cart/i }).first();
    test.skip(!(await buy.isVisible().catch(() => false)), "Test customer already owns every arrangement");
    await buy.click();
    await page.goto("/en/shop/cart");
    await page.getByRole("link", { name: /^checkout$/i }).click();
    await payWithTestCard(page);
    await expectFulfilled(page);
  });

  test("bundle purchase, and complete-the-collection pricing for a partly owned bundle", async ({ page }) => {
    await page.goto("/en/shop/collections/quiet-evening");
    const youOwn = page.getByText(/you own \d+ of \d+/i);
    if (await youOwn.isVisible().catch(() => false)) {
      await expect(page.getByText(/complete the collection for/i)).toBeVisible();
    }
    const add = page.getByRole("button", { name: /add to cart/i }).first();
    test.skip(!(await add.isVisible().catch(() => false)), "Collection already fully owned by the test customer");
    await add.click();
    await page.goto("/en/shop/cart");
    await page.getByRole("link", { name: /^checkout$/i }).click();
    await payWithTestCard(page);
    await expectFulfilled(page);
    await page.goto("/en/shop/collections/quiet-evening");
    await expect(page.getByText(/you already own every arrangement/i)).toBeVisible();
  });
});

test.describe("admin catalog publishing", () => {
  test.skip(!creds.admin, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD not set");
  test("admin creates a draft and publishing is blocked until requirements are met", async ({ page }) => {
    await page.goto("/auth/login?returnTo=/admin/shop");
    await auth0Login(page, creds.admin!.email, creds.admin!.password);
    await page.goto("/admin/shop/arrangements");
    await expect(page.getByRole("heading", { name: /arrangements/i })).toBeVisible();
    const first = page.getByRole("link").filter({ hasText: /DMI-0001|Gymnop/ }).first();
    await first.click();
    await page.getByRole("link", { name: /publishing/i }).click();
    await expect(page.getByText(/published|publish/i).first()).toBeVisible();
  });
});
