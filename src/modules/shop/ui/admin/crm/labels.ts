/** Display options shared by the CRM pages and their client forms. Values mirror the Prisma enums. */

export const CRM_STATUSES = [
  { value: "PROSPECT", label: "Prospect" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

export const CUSTOMER_SOURCES = [
  { value: "WEBSITE", label: "Website" },
  { value: "DIRECT_SALE", label: "Direct sale" },
  { value: "DEALER", label: "Dealer" },
  { value: "REFERRAL", label: "Referral" },
  { value: "TRADE_SHOW", label: "Trade show" },
  { value: "LEGACY_IMPORT", label: "Legacy import" },
  { value: "OTHER", label: "Other" },
] as const;

export const TASK_PRIORITIES = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
] as const;

export const TASK_STATUSES = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

export const COMMUNICATION_TYPES = [
  { value: "PHONE_CALL", label: "Phone call" },
  { value: "EMAIL", label: "Email" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "IN_PERSON", label: "In person" },
  { value: "OTHER", label: "Other" },
] as const;

export function optionLabel(options: readonly { value: string; label: string }[], value: string | null | undefined): string {
  if (!value) return "Not set";
  return options.find((o) => o.value === value)?.label ?? value.replace(/_/g, " ").toLowerCase();
}

export function displayCustomer(c: { firstName: string | null; lastName: string | null; companyName?: string | null; email: string }): string {
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  if (c.companyName && name) return `${name}, ${c.companyName}`;
  return c.companyName || name || c.email;
}

export const staffLabel = (s: { displayName: string | null; email: string | null } | null | undefined) =>
  s ? (s.displayName ?? s.email ?? "Staff") : null;
