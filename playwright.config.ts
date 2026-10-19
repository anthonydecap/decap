import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests for the DMI shop. Run against a server you started yourself
 * (`npm run next:dev` or `next start`) plus `npm run stripe:listen` for webhooks.
 *
 * Specs that need real Auth0 accounts are skipped unless these are set:
 *   E2E_CUSTOMER_EMAIL / E2E_CUSTOMER_PASSWORD   verified, onboarded test customer
 *   E2E_NEW_USER_PASSWORD                        enables the signup spec (random email)
 *   E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD         staff account (MFA disabled in the test tenant)
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
