import { Auth0Client, filterDefaultIdTokenClaims } from "@auth0/nextjs-auth0/server";

/**
 * Auth0 owns authentication (Universal Login, credentials, password reset, email
 * verification, MFA). Routes are mounted by the proxy under /auth/* (login, logout, callback).
 *
 * Configuration comes from AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_SECRET
 * and APP_BASE_URL. Created lazily so the marketing site never depends on Auth0 config.
 */
let client: Auth0Client | null = null;

export function auth0(): Auth0Client {
  if (client) return client;
  client = new Auth0Client({
    signInReturnToPath: "/en/shop/account",
    authorizationParameters: { scope: "openid profile email" },
    session: {
      rolling: true,
      inactivityDuration: 60 * 60 * 24 * 3,
      absoluteDuration: 60 * 60 * 24 * 14,
    },
    // Keep the standard claims plus `amr` / `auth_time`, which staff guards use to confirm
    // that MFA happened on this login.
    async beforeSessionSaved(session) {
      const { amr, auth_time } = session.user as { amr?: unknown; auth_time?: unknown };
      return {
        ...session,
        user: {
          ...filterDefaultIdTokenClaims(session.user),
          ...(Array.isArray(amr) ? { amr } : {}),
          ...(typeof auth_time === "number" ? { auth_time } : {}),
        },
      };
    },
  });
  return client;
}

export type SessionUser = {
  sub: string;
  email?: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  amr?: string[];
};

export function loginUrl(returnTo: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ returnTo, ...extra });
  return `/auth/login?${params.toString()}`;
}

export function signupUrl(returnTo: string): string {
  return loginUrl(returnTo, { screen_hint: "signup" });
}

/** Staff sign-in asks Auth0 for MFA explicitly; the tenant policy should also enforce it. */
export function staffLoginUrl(returnTo = "/admin/shop"): string {
  return loginUrl(returnTo, { acr_values: "http://schemas.openid.net/pape/policies/2007/06/multi-factor" });
}
