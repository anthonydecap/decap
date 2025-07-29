import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Only create Auth0 client if environment variables are available
let auth0: Auth0Client | null = null;

try {
  if (process.env.AUTH0_SECRET && process.env.AUTH0_BASE_URL) {
    auth0 = new Auth0Client();
  }
} catch (error) {
  console.warn("Auth0 client initialization failed:", error);
}

export { auth0 };