import { describe, expect, it } from "vitest";
import {
  activationSteps, customerSoftwareStatus, maskRegistrationCode, normaliseRegistrationCode, sniffInstaller, type StatusInput,
} from "@/modules/shop/domain/software-status";

type Lic = StatusInput["licenses"][number];
const lic = (over: Partial<Lic> = {}): Lic => ({ id: "l", status: "PENDING_ACTIVATION", maxActivations: 1, activeInstallations: 0, latestRequest: null, ...over });

describe("customer software status", () => {
  it("distinguishes download, trial and license states", () => {
    expect(customerSoftwareStatus({ trialAvailable: true, downloaded: false, licenses: [] })).toBe("NOT_DOWNLOADED");
    expect(customerSoftwareStatus({ trialAvailable: true, downloaded: true, licenses: [] })).toBe("TRIAL");
    expect(customerSoftwareStatus({ trialAvailable: false, downloaded: true, licenses: [] })).toBe("DOWNLOADED");
    expect(customerSoftwareStatus({ trialAvailable: true, downloaded: true, licenses: [lic()] })).toBe("REGISTRATION_CODE_NEEDED");
  });

  it("says whose move it is", () => {
    const s = (r: Lic["latestRequest"], extra: Partial<Lic> = {}) => customerSoftwareStatus({ trialAvailable: true, downloaded: true, licenses: [lic({ latestRequest: r, ...extra })] });
    expect(s({ status: "SUBMITTED", conflict: false })).toBe("WAITING_FOR_DMI");
    expect(s({ status: "IN_REVIEW", conflict: false })).toBe("BEING_PROCESSED");
    expect(s({ status: "WAITING_FOR_CUSTOMER", conflict: false })).toBe("ACTION_REQUIRED");
    expect(s({ status: "REJECTED", conflict: false })).toBe("ATTENTION");
    expect(s({ status: "APPROVED", conflict: false }, { status: "ACTIVE", activeInstallations: 1 })).toBe("LICENSED");
    expect(s(null, { status: "SUSPENDED" })).toBe("SUSPENDED");
  });

  it("surfaces a pending second license over an already licensed one", () => {
    expect(customerSoftwareStatus({
      trialAvailable: true, downloaded: true,
      licenses: [lic({ status: "ACTIVE", activeInstallations: 1 }), lic({ id: "l2" })],
    })).toBe("REGISTRATION_CODE_NEEDED");
  });

  it("falls back to trial when the only license was revoked", () => {
    expect(customerSoftwareStatus({ trialAvailable: true, downloaded: true, licenses: [lic({ status: "REVOKED" })] })).toBe("TRIAL");
  });

  it("only marks real steps as done", () => {
    const waiting = activationSteps(lic({ latestRequest: { status: "SUBMITTED", conflict: false } }));
    expect(waiting.map((s) => [s.key, s.done, s.current])).toEqual([
      ["purchased", true, undefined], ["submitted", true, false], ["processing", false, true], ["ready", false, false],
    ]);
    const done = activationSteps(lic({ status: "ACTIVE", activeInstallations: 1, latestRequest: { status: "APPROVED", conflict: false } }));
    expect(done.every((s) => s.done)).toBe(true);
  });
});

describe("registration codes and installers", () => {
  it("normalises and masks codes", () => {
    expect(normaliseRegistrationCode(" a8f2-73kd 91pl ")).toBe("A8F273KD91PL");
    expect(maskRegistrationCode("A8F2-73KD-91PL")).toBe("****91PL");
  });
  it("recognises installer containers and rejects anything else", () => {
    expect(sniffInstaller(new Uint8Array([0x4d, 0x5a, 0, 0]))?.kind).toBe("PE");
    expect(sniffInstaller(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))?.kind).toBe("MSI");
    expect(sniffInstaller(new Uint8Array([0x50, 0x4b, 0x03, 0x04]))?.kind).toBe("ZIP");
    expect(sniffInstaller(new Uint8Array([0x25, 0x50, 0x44, 0x46]))).toBeNull();
  });
});
