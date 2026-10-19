import type { CustomerSoftwareStatus } from "../../../domain/software-status";

/** Whose move it is, so every status says whether the customer or DMI acts next. */
export function whoseMove(status: CustomerSoftwareStatus): "customer" | "dmi" | "done" | null {
  switch (status) {
    case "REGISTRATION_CODE_NEEDED":
    case "ACTION_REQUIRED":
    case "ATTENTION":
    case "SUSPENDED":
      return "customer";
    case "WAITING_FOR_DMI":
    case "BEING_PROCESSED":
      return "dmi";
    case "LICENSED":
      return "done";
    default:
      return null;
  }
}
