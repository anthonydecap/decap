import { execSync } from "node:child_process";
import { TEST_DATABASE_URL } from "./test-db-url";

/** Applies committed migrations to the test database before the run. */
export default function setup() {
  const url = TEST_DATABASE_URL;
  if (!/test/.test(url)) throw new Error("Refusing to run tests against a database whose URL does not contain 'test'");
  execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: { ...process.env, SHOP_DATABASE_URL: url, SHOP_DATABASE_URL_UNPOOLED: url },
  });
}
