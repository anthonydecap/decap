/** Typed shop errors. `code` is stable and safe to show to clients; `status` maps to HTTP. */
export type ShopErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "MFA_REQUIRED"
  | "EMAIL_NOT_VERIFIED"
  | "ONBOARDING_REQUIRED"
  | "NOT_FOUND"
  | "VALIDATION_FAILED"
  | "ALREADY_OWNED"
  | "CART_EMPTY"
  | "UNAVAILABLE"
  | "CONFLICT"
  | "PUBLISH_BLOCKED"
  | "RATE_LIMITED"
  | "PAYMENT_PROVIDER_ERROR"
  | "STORAGE_ERROR"
  | "UPLOAD_EXPIRED"
  | "INVALID_STATE";

const STATUS: Record<ShopErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  MFA_REQUIRED: 403,
  EMAIL_NOT_VERIFIED: 403,
  ONBOARDING_REQUIRED: 403,
  NOT_FOUND: 404,
  VALIDATION_FAILED: 422,
  ALREADY_OWNED: 409,
  CART_EMPTY: 409,
  UNAVAILABLE: 409,
  CONFLICT: 409,
  PUBLISH_BLOCKED: 422,
  RATE_LIMITED: 429,
  PAYMENT_PROVIDER_ERROR: 502,
  STORAGE_ERROR: 502,
  UPLOAD_EXPIRED: 410,
  INVALID_STATE: 409,
};

export class ShopError extends Error {
  readonly status: number;
  constructor(
    public readonly code: ShopErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.status = STATUS[code];
  }
}

export const notFound = (what = "Resource") => new ShopError("NOT_FOUND", `${what} not found`);
