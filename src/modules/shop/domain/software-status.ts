/**
 * What the customer should see for one software product. Pure: callers pass the
 * customer's licenses, open/latest activation requests and installations for the product.
 *
 * The answer always tells the customer whose move it is:
 *   ACTION_REQUIRED / REGISTRATION_CODE_NEEDED / ATTENTION  → the customer
 *   WAITING_FOR_DMI / BEING_PROCESSED                        → DMI
 *   LICENSED                                                 → nobody, done
 */

export type CustomerSoftwareStatus =
  | "NOT_DOWNLOADED"
  | "DOWNLOADED"
  | "TRIAL"
  | "REGISTRATION_CODE_NEEDED"
  | "WAITING_FOR_DMI"
  | "BEING_PROCESSED"
  | "ACTION_REQUIRED"
  | "ATTENTION"
  | "LICENSED"
  | "SUSPENDED";

export type StatusInput = {
  trialAvailable: boolean;
  downloaded: boolean;
  licenses: ReadonlyArray<{
    id: string;
    status: "PENDING_ACTIVATION" | "ACTIVE" | "SUSPENDED" | "REVOKED";
    maxActivations: number;
    activeInstallations: number;
    /** Most recent activation request for this license, if any. */
    latestRequest: { status: "SUBMITTED" | "IN_REVIEW" | "WAITING_FOR_CUSTOMER" | "APPROVED" | "REJECTED" | "CANCELLED"; conflict: boolean } | null;
  }>;
};

export type LicenseState =
  | "REGISTRATION_CODE_NEEDED"
  | "WAITING_FOR_DMI"
  | "BEING_PROCESSED"
  | "ACTION_REQUIRED"
  | "ATTENTION"
  | "LICENSED"
  | "SUSPENDED"
  | "REVOKED";

export const OPEN_ACTIVATION_STATUSES = ["SUBMITTED", "IN_REVIEW", "WAITING_FOR_CUSTOMER"] as const;

export function licenseState(l: StatusInput["licenses"][number]): LicenseState {
  if (l.status === "REVOKED") return "REVOKED";
  if (l.status === "SUSPENDED") return "SUSPENDED";
  const r = l.latestRequest;
  if (r?.status === "WAITING_FOR_CUSTOMER") return "ACTION_REQUIRED";
  // A conflicting registration is reviewed by DMI; the customer sees a friendly review state.
  if (r?.status === "SUBMITTED") return "WAITING_FOR_DMI";
  if (r?.status === "IN_REVIEW") return "BEING_PROCESSED";
  if (l.status === "ACTIVE" && l.activeInstallations > 0) return "LICENSED";
  if (r?.status === "REJECTED") return "ATTENTION";
  return "REGISTRATION_CODE_NEEDED";
}

/** Priority: anything that needs the customer first, then waiting on DMI, then done. */
const PRIORITY: LicenseState[] = [
  "ACTION_REQUIRED", "ATTENTION", "REGISTRATION_CODE_NEEDED", "WAITING_FOR_DMI", "BEING_PROCESSED", "LICENSED", "SUSPENDED", "REVOKED",
];

export function customerSoftwareStatus(input: StatusInput): CustomerSoftwareStatus {
  const states = input.licenses.map(licenseState).filter((s): s is Exclude<LicenseState, "REVOKED"> => s !== "REVOKED");
  if (states.length) {
    // A customer with one licensed installation and one pending second license should still
    // be told about the pending one.
    const top = PRIORITY.find((p) => (states as LicenseState[]).includes(p))!;
    return top as CustomerSoftwareStatus;
  }
  if (!input.downloaded) return "NOT_DOWNLOADED";
  return input.trialAvailable ? "TRIAL" : "DOWNLOADED";
}

/** Steps for the activation progress view. No fake progress: only real recorded steps. */
export function activationSteps(l: StatusInput["licenses"][number]) {
  const state = licenseState(l);
  const submitted = l.latestRequest && l.latestRequest.status !== "CANCELLED";
  return [
    { key: "purchased", done: true },
    { key: "submitted", done: Boolean(submitted) && state !== "REGISTRATION_CODE_NEEDED", current: state === "REGISTRATION_CODE_NEEDED" || state === "ATTENTION" || state === "ACTION_REQUIRED" },
    { key: "processing", done: state === "LICENSED", current: state === "WAITING_FOR_DMI" || state === "BEING_PROCESSED" },
    { key: "ready", done: state === "LICENSED", current: false },
  ];
}

/** Uppercase, no spaces or dashes; codes are compared and stored in this form. */
export function normaliseRegistrationCode(value: string): string {
  return value.replace(/[\s\-_.]/g, "").toUpperCase();
}

export function maskRegistrationCode(code: string): string {
  const c = normaliseRegistrationCode(code);
  return c.length <= 4 ? "****" : `****${c.slice(-4)}`;
}

export const licenseNumber = (n: number) => `LIC-${n}`;
export const activationNumber = (n: number) => `ACT-${n}`;

/** Recognises the installer container from its first bytes. Nothing is ever executed. */
export function sniffInstaller(head: Uint8Array): { kind: "PE" | "MSI" | "ZIP" | "XAR" | "DMG_OR_UNKNOWN"; ext: string } | null {
  if (head.length >= 2 && head[0] === 0x4d && head[1] === 0x5a) return { kind: "PE", ext: "exe" }; // MZ
  if (head.length >= 8 && [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((b, i) => head[i] === b)) return { kind: "MSI", ext: "msi" };
  if (head.length >= 4 && head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04) return { kind: "ZIP", ext: "zip" };
  if (head.length >= 4 && head[0] === 0x78 && head[1] === 0x61 && head[2] === 0x72 && head[3] === 0x21) return { kind: "XAR", ext: "pkg" }; // xar!
  return null;
}

/** Allowed file extensions and the container each must really be. */
export const INSTALLER_EXTENSIONS: Record<string, string[]> = {
  exe: ["PE"],
  msi: ["MSI"],
  zip: ["ZIP"],
  pkg: ["XAR"],
};

export const MAX_INSTALLER_BYTES = 2 * 1024 * 1024 * 1024;
