import { expect, type Page } from "@playwright/test";

export const creds = {
  customer: process.env.E2E_CUSTOMER_EMAIL && process.env.E2E_CUSTOMER_PASSWORD
    ? { email: process.env.E2E_CUSTOMER_EMAIL, password: process.env.E2E_CUSTOMER_PASSWORD }
    : null,
  admin: process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD
    ? { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD }
    : null,
  newUserPassword: process.env.E2E_NEW_USER_PASSWORD ?? null,
};

/** Auth0 Universal Login (New Universal Login, identifier-first or classic). */
export async function auth0Login(page: Page, email: string, password: string) {
  await page.waitForURL(/auth0\.com/);
  await page.getByLabel(/email/i).first().fill(email);
  const pw = page.getByLabel(/password/i).first();
  if (!(await pw.isVisible().catch(() => false))) await page.getByRole("button", { name: /continue/i }).first().click();
  await pw.fill(password);
  await page.getByRole("button", { name: /continue|log in/i }).first().click();
  await page.waitForURL((u) => !/auth0\.com/.test(u.host), { timeout: 30_000 });
}

/** Fills the Stripe Payment Element (test card) and pays. */
export async function payWithTestCard(page: Page, card = "4242424242424242") {
  const frame = page.frameLocator('iframe[title*="Secure payment input frame"]').first();
  await frame.getByLabel(/card number/i).fill(card);
  await frame.getByLabel(/expiration/i).fill("12 / 34");
  await frame.getByLabel(/security code|cvc/i).fill("123");
  const country = frame.getByLabel(/country/i);
  if (await country.isVisible().catch(() => false)) await country.selectOption("BE");
  await page.getByRole("button", { name: /^pay /i }).click();
}

export async function expectFulfilled(page: Page) {
  await expect(page).toHaveURL(/\/shop\/checkout\/complete/);
  // The webhook (stripe listen) fulfills; the page only reflects it.
  await expect(page.getByText(/your arrangements are in your library/i)).toBeVisible({ timeout: 60_000 });
}

export async function emptyCart(page: Page) {
  await page.goto("/en/shop/cart");
  for (;;) {
    const remove = page.getByRole("button", { name: /^remove$/i }).first();
    if (!(await remove.isVisible().catch(() => false))) break;
    await remove.click();
    await page.waitForTimeout(400);
  }
}
