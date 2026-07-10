/**
 * Verbose Prismic traces: `npm run dev` or set `PRISMIC_DEBUG=1` (also works in production builds).
 */
export function isPrismicDebug(): boolean {
  return (
    process.env.PRISMIC_DEBUG === "1" || process.env.NODE_ENV === "development"
  );
}

/** Structured log when debug is on (server terminal / build output). */
export function prismicLog(message: string, data?: Record<string, unknown>): void {
  if (!isPrismicDebug()) return;
  if (data !== undefined) {
    console.log(`[prismic] ${message}`, data);
  } else {
    console.log(`[prismic] ${message}`);
  }
}

/** Always log failures (404, API errors, wrong locale). */
export function prismicError(message: string, data?: Record<string, unknown>): void {
  if (data !== undefined) {
    console.error(`[prismic] ${message}`, data);
  } else {
    console.error(`[prismic] ${message}`);
  }
}

export function prismicErrorFromUnknown(
  message: string,
  err: unknown,
  extra?: Record<string, unknown>,
): void {
  const e = err instanceof Error ? err : new Error(String(err));
  prismicError(message, {
    ...extra,
    name: e.name,
    message: e.message,
    stack: isPrismicDebug() ? e.stack : undefined,
  });
}
