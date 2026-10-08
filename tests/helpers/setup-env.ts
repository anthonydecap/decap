// Test environment: isolated database, in-memory storage, fake secrets. Never real services.
import { TEST_DATABASE_URL } from "./test-db-url";

process.env.SHOP_DATABASE_URL = TEST_DATABASE_URL;
process.env.SHOP_STORAGE_DRIVER = "memory";
process.env.SHOP_UPLOAD_TICKET_SECRET = "test-upload-ticket-secret";
process.env.STRIPE_SECRET_KEY = "sk_test_dummy_for_tests";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
process.env.APP_BASE_URL = "http://localhost:3000";
process.env.SHOP_REQUIRE_STAFF_MFA = "false";
process.env.SHOP_REQUIRE_PREVIEW_TO_PUBLISH = "true";
process.env.SHOP_DATABASE_URL_UNPOOLED = TEST_DATABASE_URL;
