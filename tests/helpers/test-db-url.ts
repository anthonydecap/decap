import { userInfo } from "node:os";

/** Local test database. Override with SHOP_TEST_DATABASE_URL (must contain "test"). */
export const TEST_DATABASE_URL =
  process.env.SHOP_TEST_DATABASE_URL ?? `postgresql://${userInfo().username}@localhost:5432/decap_shop_test`;
