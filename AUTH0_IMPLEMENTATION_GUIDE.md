# Auth0 Implementation Guide for Next.js 15

## Overview

This guide documents how to implement Auth0 authentication in Next.js 15 using the latest `@auth0/nextjs-auth0` SDK (v4.8+). Next.js 15 with the App Router requires a different approach compared to the Pages Router due to React Server Components and the new routing paradigm.

## Table of Contents

1. [Current Implementation](#current-implementation)
2. [Key Changes in Next.js 15](#key-changes-in-nextjs-15)
3. [Complete Setup Guide](#complete-setup-guide)
4. [Usage Examples](#usage-examples)
5. [Environment Variables](#environment-variables)
6. [Deployment](#deployment)

---

## Current Implementation

### Package Version

```json
"@auth0/nextjs-auth0": "^4.8.0"
```

### File Structure

```
src/
├── auth0.ts                  # Auth0 client initialization
├── middleware.ts             # Next.js middleware with Auth0 integration
└── app/
    └── api/
        └── auth/
            └── [auth0]/
                └── route.ts  # (TO BE CREATED) Auth0 route handler
```

### Current Files

#### `src/auth0.ts`

```typescript
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client();
```

**Purpose**: Creates a singleton Auth0 client instance that can be imported throughout the application for server-side authentication operations.

#### `src/middleware.ts`

```typescript
import type { NextRequest } from "next/server";
import { auth0 } from "./auth0";
import { createLocaleRedirect, pathnameHasLocale } from "@/i18n";

export async function middleware(request: NextRequest) {
  try {
    // First handle Auth0 authentication if available
    if (auth0) {
      const authResult = await auth0.middleware(request);
      
      // If Auth0 returns a response (redirect, error, etc.), use it
      if (authResult) {
        return authResult;
      }
    }
  } catch (error) {
    // If Auth0 fails, continue with internationalization
    console.warn("Auth0 middleware failed:", error);
  }
  
  // Then handle internationalization
  if (!pathnameHasLocale(request)) { 
    return createLocaleRedirect(request); 
  } 
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

**Purpose**: Integrates Auth0's middleware with custom middleware (internationalization in this case). The Auth0 middleware handles session management and token refresh automatically.

---

## Key Changes in Next.js 15

### 1. **New App Router Architecture**

Next.js 15 uses the App Router by default, which fundamentally changes how routing works:
- Server Components are the default
- API routes are defined as `route.ts` files
- Client components must be explicitly marked with `'use client'`

### 2. **Auth0 SDK Changes**

The `@auth0/nextjs-auth0` v4.8+ is designed specifically for Next.js 15:
- **`Auth0Client`**: New server-side client for App Router
- **`handleAuth()`**: Simplified authentication route handler
- **Server/Client separation**: Clear distinction between server imports (`@auth0/nextjs-auth0/server`) and client imports (`@auth0/nextjs-auth0/client`)

### 3. **Middleware Integration**

The SDK now provides a built-in middleware method that can be called in Next.js middleware for automatic session management.

---

## Complete Setup Guide

### Step 1: Install Dependencies

```bash
npm install @auth0/nextjs-auth0
```

### Step 2: Configure Auth0 Dashboard

1. Log in to [Auth0 Dashboard](https://manage.auth0.com/)
2. Create a new **Regular Web Application**
3. Note down:
   - Domain (e.g., `your-tenant.auth0.com`)
   - Client ID
   - Client Secret
4. Configure Application URIs:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`, `https://yourdomain.com/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`, `https://yourdomain.com`
   - **Allowed Web Origins**: `http://localhost:3000`, `https://yourdomain.com`

### Step 3: Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# Generate a random 32-character string for AUTH0_SECRET
# You can use: openssl rand -hex 32
AUTH0_SECRET='use-a-very-long-random-string-here-minimum-32-characters'

# Your Auth0 application domain
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'

# Your Auth0 application's Client ID
AUTH0_CLIENT_ID='your-client-id'

# Your Auth0 application's Client Secret
AUTH0_CLIENT_SECRET='your-client-secret'

# The base URL of your application
AUTH0_BASE_URL='http://localhost:3000'

# Optional: Customize the audience for API calls
# AUTH0_AUDIENCE='https://your-api-identifier'

# Optional: Define scopes
# AUTH0_SCOPE='openid profile email'
```

**Important**: Never commit `.env.local` to version control. Add it to `.gitignore`.

### Step 4: Create Auth0 Route Handler

Create the file `src/app/api/auth/[auth0]/route.ts`:

```typescript
import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth();
```

This single line sets up all required authentication routes:
- `/api/auth/login` - Initiates login
- `/api/auth/logout` - Logs out the user
- `/api/auth/callback` - Handles the Auth0 callback
- `/api/auth/me` - Returns user profile information

**Optional**: Customize the auth handler:

```typescript
import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    returnTo: '/dashboard',
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email read:posts',
    },
  }),
  logout: handleLogout({
    returnTo: '/',
  }),
});
```

### Step 5: Initialize Auth0 Client (Already Done)

Your existing `src/auth0.ts` is correct:

```typescript
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client();
```

### Step 6: Integrate Middleware (Already Done)

Your middleware integration is already set up correctly in `src/middleware.ts`.

**Alternative**: If you want Auth0-only middleware without custom logic:

```typescript
import { auth0 } from "./auth0";

export async function middleware(request: NextRequest) {
  return auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

### Step 7: Wrap App with UserProvider (Client-Side)

Update `src/app/layout.tsx` to provide authentication context:

```typescript
import { UserProvider } from '@auth0/nextjs-auth0/client';
import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-neutral-950 text-base antialiased">
      <body className="flex min-h-full flex-col">
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
```

---

## Usage Examples

### 1. Adding Login/Logout Links (Client Component)

Create `src/components/AuthButton.tsx`:

```typescript
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export function AuthButton() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span>Welcome, {user.name}</span>
        <Link 
          href="/api/auth/logout"
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Logout
        </Link>
      </div>
    );
  }

  return (
    <Link 
      href="/api/auth/login"
      className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white"
    >
      Login
    </Link>
  );
}
```

### 2. Accessing User in Server Components

```typescript
import { auth0 } from '@/auth0';

export default async function ProfilePage() {
  const session = await auth0.getSession();
  
  if (!session || !session.user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {session.user.name}</p>
      <p>Email: {session.user.email}</p>
      <img src={session.user.picture} alt="Profile" />
    </div>
  );
}
```

### 3. Protecting Pages (Server Component)

```typescript
import { auth0 } from '@/auth0';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/api/auth/login?returnTo=/dashboard');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome back, {session.user.name}!</p>
    </div>
  );
}
```

### 4. Protected API Routes

Create `src/app/api/protected/route.ts`:

```typescript
import { auth0 } from '@/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth0.getSession();
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  // Access user information
  const userId = session.user.sub;
  
  return NextResponse.json({
    message: 'This is protected data',
    user: session.user,
  });
}
```

### 5. Using Access Tokens for API Calls

```typescript
import { auth0 } from '@/auth0';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth0.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get access token for API calls
  const accessToken = session.accessToken;
  
  // Call external API
  const response = await fetch('https://your-api.com/data', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  const data = await response.json();
  return NextResponse.json(data);
}
```

### 6. Conditional Rendering in Client Components

```typescript
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';

export function UserProfile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {user ? (
        <div>
          <h2>Logged in as {user.name}</h2>
          <p>{user.email}</p>
        </div>
      ) : (
        <a href="/api/auth/login">Please log in</a>
      )}
    </div>
  );
}
```

### 7. Getting User in Client-Side Fetch

```typescript
'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useEffect, useState } from 'react';

export function UserData() {
  const { user } = useUser();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (user) {
      fetch('/api/protected')
        .then(res => res.json())
        .then(data => setData(data));
    }
  }, [user]);

  if (!user) return <div>Please log in</div>;
  if (!data) return <div>Loading data...</div>;

  return <div>Data: {JSON.stringify(data)}</div>;
}
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH0_SECRET` | Random string for encrypting the session cookie (min 32 chars) | `openssl rand -hex 32` |
| `AUTH0_ISSUER_BASE_URL` | Your Auth0 domain | `https://tenant.auth0.com` |
| `AUTH0_CLIENT_ID` | Auth0 application Client ID | `abc123def456` |
| `AUTH0_CLIENT_SECRET` | Auth0 application Client Secret | `secret123` |
| `AUTH0_BASE_URL` | Base URL of your application | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTH0_AUDIENCE` | API audience for access tokens | - |
| `AUTH0_SCOPE` | OAuth scopes to request | `openid profile email` |
| `AUTH0_COOKIE_DOMAIN` | Domain for session cookie | Current domain |
| `AUTH0_COOKIE_PATH` | Path for session cookie | `/` |
| `AUTH0_COOKIE_TRANSIENT` | Use transient (session) cookies | `false` |
| `AUTH0_SESSION_ABSOLUTE_DURATION` | Max session duration in seconds | `604800` (7 days) |
| `AUTH0_SESSION_ROLLING` | Enable rolling sessions | `true` |
| `AUTH0_SESSION_ROLLING_DURATION` | Rolling session duration | `86400` (1 day) |

---

## Deployment

### Vercel Deployment

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Add environment variables in Project Settings:
   - `AUTH0_SECRET`
   - `AUTH0_ISSUER_BASE_URL`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - `AUTH0_BASE_URL` (set to your production URL)
4. Update Auth0 Dashboard with production URLs

### Other Platforms

Ensure all environment variables are set according to your hosting platform's documentation. Most platforms support `.env` variable configuration through their dashboard or CLI.

### Important Security Notes

1. **Never commit** `.env.local` or any file containing secrets
2. Use different Auth0 applications for **development** and **production**
3. Rotate `AUTH0_SECRET` periodically
4. Use HTTPS in production (required by Auth0)
5. Keep the SDK updated for security patches

---

## Advanced Configuration

### Custom Session Configuration

Create `src/auth0.ts` with custom config:

```typescript
import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  session: {
    rollingDuration: 60 * 60 * 24, // 1 day
    absoluteDuration: 60 * 60 * 24 * 7, // 7 days
    cookie: {
      transient: false,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
  routes: {
    callback: '/api/auth/callback',
    postLogoutRedirect: '/',
  },
});
```

### Role-Based Access Control

```typescript
import { auth0 } from '@/auth0';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect('/api/auth/login?returnTo=/admin');
  }

  // Check for admin role (assuming roles are in user metadata)
  const roles = session.user['https://your-app.com/roles'] || [];
  
  if (!roles.includes('admin')) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Dashboard</div>;
}
```

### Multi-Tenancy Support

If you have multiple locales and want to preserve them:

```typescript
// In your middleware.ts - already implemented in your project!
export async function middleware(request: NextRequest) {
  try {
    if (auth0) {
      const authResult = await auth0.middleware(request);
      if (authResult) {
        return authResult;
      }
    }
  } catch (error) {
    console.warn("Auth0 middleware failed:", error);
  }
  
  // Your custom locale handling
  if (!pathnameHasLocale(request)) { 
    return createLocaleRedirect(request); 
  } 
}
```

---

## Troubleshooting

### Common Issues

1. **"Missing required environment variable"**
   - Ensure all required env vars are set in `.env.local`
   - Restart dev server after adding env vars

2. **"Invalid state" or "CSRF token mismatch"**
   - Check that `AUTH0_SECRET` is set and persistent
   - Ensure cookies are enabled
   - Check that `AUTH0_BASE_URL` matches your actual URL

3. **Infinite redirect loop**
   - Check middleware matcher configuration
   - Ensure auth routes are not caught by middleware
   - Verify callback URL in Auth0 dashboard

4. **Session not persisting**
   - Check cookie settings (secure flag in production)
   - Verify domain settings for cookies
   - Check session duration configuration

### Debug Mode

Enable debug logging:

```typescript
// Add to .env.local
AUTH0_DEBUG=true
```

---

## Migration from Pages Router

If migrating from Next.js Pages Router:

| Pages Router | App Router (Next.js 15) |
|--------------|-------------------------|
| `pages/api/auth/[...auth0].ts` | `app/api/auth/[auth0]/route.ts` |
| `withPageAuthRequired(Component)` | Server Component + `getSession()` |
| `withApiAuthRequired(handler)` | `getSession()` in route handler |
| `useUser()` (anywhere) | `useUser()` (client only) |
| `getSession(req, res)` | `await auth0.getSession()` |

---

## Resources

- [Auth0 Next.js SDK Documentation](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Auth0 Next.js SDK GitHub](https://github.com/auth0/nextjs-auth0)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Auth0 Dashboard](https://manage.auth0.com/)

---

## Summary

The key differences for Next.js 15 implementation:

1. ✅ Use `@auth0/nextjs-auth0` v4.8+
2. ✅ Create auth route at `app/api/auth/[auth0]/route.ts`
3. ✅ Use `Auth0Client` from server imports
4. ✅ Wrap app with `UserProvider` for client-side auth
5. ✅ Use `getSession()` in Server Components
6. ✅ Use `useUser()` hook in Client Components
7. ✅ Integrate Auth0 middleware in Next.js middleware
8. ✅ Set up environment variables properly

This implementation provides a modern, secure, and performant authentication system that leverages Next.js 15's App Router architecture.

