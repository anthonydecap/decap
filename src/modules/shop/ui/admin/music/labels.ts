/**
 * Display labels for music licenses, transfers and policy. No server imports: server pages
 * and client components both use them. Values mirror the Prisma enums.
 */

export const LICENSE_STATUS_LABEL: Record<string, string> = {
  UNASSIGNED: "Not on a player yet",
  ACTIVE: "Active",
  TRANSFER_PENDING: "Transfer pending",
  RETIRED: "Retired",
  REVOKED: "Revoked",
};

export const LICENSE_SOURCE_LABEL: Record<string, string> = {
  PURCHASE: "Purchase",
  BUNDLE: "Collection purchase",
  ADDITIONAL_PLAYER_PURCHASE: "Additional-player purchase",
  ADMIN_GRANT: "Admin grant",
  PROMOTION: "Promotion",
  CUSTOMER_SERVICE: "Customer service",
  PLAYER_STARTER_PACK: "Starter collection",
  LEGACY_IMPORT: "Legacy import",
  LEGACY_MIGRATION: "Legacy migration",
  TRANSFER: "Transfer",
  REPLACEMENT_TRANSFER: "Replacement transfer",
};

export const LICENSE_SOURCES = Object.keys(LICENSE_SOURCE_LABEL);

export const GRANT_SOURCE_OPTIONS = [
  { value: "ADMIN_GRANT", label: "Admin grant" },
  { value: "CUSTOMER_SERVICE", label: "Customer service" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "LEGACY_IMPORT", label: "Legacy import" },
] as const;

export const EVENT_LABEL: Record<string, string> = {
  CREATED: "Created",
  ASSIGNED: "Assigned to a player",
  TRANSFERRED_OUT: "Transferred out",
  TRANSFERRED_IN: "Transferred in",
  RETIRED: "Retired",
  REVOKED: "Revoked",
  REACTIVATED: "Reactivated",
};

export const TRANSFER_TYPE_LABEL: Record<string, string> = {
  HARDWARE_REPLACEMENT: "Hardware replacement",
  WARRANTY_REPLACEMENT: "Warranty replacement",
  COMPUTER_REPLACEMENT: "Computer replacement",
  UPGRADE: "Upgrade",
  CUSTOMER_PLAYER_TRANSFER: "Player moved between customers",
  PLAYER_RESALE: "Player resale",
  ADMIN_CORRECTION: "Admin correction",
  OTHER: "Other",
};

export const TRANSFER_MODE_LABEL: Record<string, string> = {
  MOVE: "Move",
  COPY: "Additional licenses",
  PLAYER_OWNERSHIP: "Player ownership",
};

export const REPLACEMENT_TYPES = ["HARDWARE_REPLACEMENT", "WARRANTY_REPLACEMENT", "COMPUTER_REPLACEMENT", "UPGRADE", "OTHER"] as const;

export const LIBRARY_TRANSFER_TYPES = [
  "HARDWARE_REPLACEMENT",
  "WARRANTY_REPLACEMENT",
  "COMPUTER_REPLACEMENT",
  "UPGRADE",
  "ADMIN_CORRECTION",
  "OTHER",
] as const;

export const RESALE_POLICY_LABEL: Record<string, string> = {
  PLAYER_AND_LIBRARY: "Player and library",
  PLAYER_ONLY: "Player only",
  ADMIN_DECIDES: "Staff decide per case",
};

export const REPLACEMENT_POLICY_LABEL: Record<string, string> = {
  FREE_ADMIN_APPROVED: "Free, approved by staff",
  PAID_TRANSFER: "Paid transfer",
  MANUAL_DECISION: "Decided per case",
};

export const MIGRATION_STATUS_LABEL: Record<string, string> = {
  NEEDS_REVIEW: "Needs review",
  WAITING_FOR_PLAYER: "Waiting for player",
  READY_TO_ASSIGN: "Ready to assign",
};

export const SKIP_REASON_LABEL: Record<string, string> = {
  ALREADY_LICENSED: "already on that player",
  INCOMPATIBLE: "not compatible with that player type",
};

export const label = (map: Record<string, string>, value: string | null | undefined) =>
  value ? (map[value] ?? value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())) : "";

/** Registration codes are stored without separators; staff read them in groups of four. */
export const groupCode = (code: string) => code.match(/.{1,4}/g)?.join("-") ?? code;

/** Client-safe mirror of the service's maskRegistration / playerDisplayName. */
export const maskCode = (code: string | null | undefined) => (code ? `••••${code.slice(-4)}` : "");
export const playerLabel = (p: { friendlyName?: string | null; registrationCode: string; playerType: { name: string } }) =>
  p.friendlyName?.trim() || `${p.playerType.name} ${maskCode(p.registrationCode)}`;
