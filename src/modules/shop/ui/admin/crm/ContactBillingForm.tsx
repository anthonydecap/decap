"use client";

import { useState } from "react";
import { apiFetch } from "../../api";
import { btn, Field, inputClass, Notice } from "../primitives";
import { CRM_STATUSES, CUSTOMER_SOURCES } from "./labels";
import { useMutation } from "./useMutation";

export type ContactBillingValues = {
  email: string;
  accountType: "INDIVIDUAL" | "BUSINESS";
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  companyRegistrationNumber: string;
  vatNumber: string;
  vatCountryCode: string;
  preferredLanguage: string;
  marketingConsent: boolean;
  billing: {
    name: string;
    companyName: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    city: string;
    stateOrProvince: string;
    countryCode: string;
  };
};

/** CRM status and source: saved on their own so a status change never needs a full address. */
export function CrmStatusForm({
  customerId,
  crmStatus,
  customerSource,
}: {
  customerId: string;
  crmStatus: string;
  customerSource: string | null;
}) {
  const [status, setStatus] = useState(crmStatus);
  const [source, setSource] = useState(customerSource ?? "");
  const [saved, setSaved] = useState(false);
  const { busy, error, run } = useMutation();
  const dirty = status !== crmStatus || source !== (customerSource ?? "");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    const ok = await run(() =>
      apiFetch(`/api/admin/shop/customers/${customerId}`, {
        method: "PATCH",
        body: { crmStatus: status, customerSource: source || null },
      }),
    );
    if (ok) setSaved(true);
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="CRM status" htmlFor="crm-status" help="Operational only. It never changes what the customer can download.">
          <select id="crm-status" className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
            {CRM_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Customer source" htmlFor="crm-source">
          <select id="crm-source" className={inputClass} value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">Not set</option>
            {CUSTOMER_SOURCES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      {saved && !dirty && <Notice tone="success">Saved.</Notice>}
      <div>
        <button type="submit" className={btn.primary} disabled={busy || !dirty} aria-busy={busy}>
          {busy ? "Saving..." : "Save status"}
        </button>
      </div>
    </form>
  );
}

/** Contact details and default billing address, edited on the customer's behalf. */
export function ContactBillingForm({ customerId, initial }: { customerId: string; initial: ContactBillingValues }) {
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(false);
  const { busy, error, run } = useMutation();
  const set = <K extends keyof ContactBillingValues>(k: K, value: ContactBillingValues[K]) => {
    setSaved(false);
    setV((p) => ({ ...p, [k]: value }));
  };
  const setBilling = (k: keyof ContactBillingValues["billing"], value: string) => {
    setSaved(false);
    setV((p) => ({ ...p, billing: { ...p.billing, [k]: value } }));
  };
  const business = v.accountType === "BUSINESS";

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const ok = await run(() =>
      apiFetch(`/api/admin/shop/customers/${customerId}`, {
        method: "PATCH",
        body: {
          profile: {
            accountType: v.accountType,
            firstName: v.firstName,
            lastName: v.lastName,
            phone: v.phone || null,
            companyName: v.companyName || null,
            companyRegistrationNumber: v.companyRegistrationNumber || null,
            vatNumber: v.vatNumber || null,
            vatCountryCode: v.vatCountryCode || null,
            preferredLanguage: v.preferredLanguage || null,
            // Consent belongs to the customer: staff edits pass it through unchanged.
            marketingConsent: initial.marketingConsent,
            billingAddress: {
              name: v.billing.name || null,
              companyName: v.billing.companyName || null,
              addressLine1: v.billing.addressLine1,
              addressLine2: v.billing.addressLine2 || null,
              postalCode: v.billing.postalCode,
              city: v.billing.city,
              stateOrProvince: v.billing.stateOrProvince || null,
              countryCode: v.billing.countryCode.toUpperCase(),
            },
          },
        },
      }),
    );
    if (ok) setSaved(true);
  }

  const text = (id: string, label: string, value: string, onChange: (s: string) => void, opts: { required?: boolean; help?: string; maxLength?: number; autoComplete?: string } = {}) => (
    <Field label={opts.required ? label : `${label} (optional)`} htmlFor={id} help={opts.help}>
      <input
        id={id}
        className={inputClass}
        value={value}
        required={opts.required}
        maxLength={opts.maxLength}
        autoComplete={opts.autoComplete ?? "off"}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-display text-sm font-bold text-neutral-950">Contact</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="cb-email" help="Owned by the sign-in account. The customer changes it there.">
            <input id="cb-email" className={inputClass} value={v.email} disabled readOnly />
          </Field>
          <Field label="Account type" htmlFor="cb-type">
            <select id="cb-type" className={inputClass} value={v.accountType} onChange={(e) => set("accountType", e.target.value as ContactBillingValues["accountType"])}>
              <option value="INDIVIDUAL">Individual</option>
              <option value="BUSINESS">Business</option>
            </select>
          </Field>
          {text("cb-first", "First name", v.firstName, (s) => set("firstName", s), { required: true, maxLength: 80 })}
          {text("cb-last", "Last name", v.lastName, (s) => set("lastName", s), { required: true, maxLength: 80 })}
          {text("cb-phone", "Phone", v.phone, (s) => set("phone", s), { maxLength: 40, help: "Digits, spaces and + ( ) - . / only." })}
          <Field label="Preferred language" htmlFor="cb-lang">
            <select id="cb-lang" className={inputClass} value={v.preferredLanguage} onChange={(e) => set("preferredLanguage", e.target.value)}>
              <option value="">Not set</option>
              <option value="en">English</option>
              <option value="fr">French</option>
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-display text-sm font-bold text-neutral-950">Company</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {text("cb-company", "Company name", v.companyName, (s) => set("companyName", s), { required: business, maxLength: 200 })}
          {text("cb-reg", "Company registration number", v.companyRegistrationNumber, (s) => set("companyRegistrationNumber", s), { maxLength: 60 })}
          {text("cb-vat", "VAT number", v.vatNumber, (s) => set("vatNumber", s), { maxLength: 20 })}
          {text("cb-vat-country", "VAT country code", v.vatCountryCode, (s) => set("vatCountryCode", s.toUpperCase()), { maxLength: 2, help: "Two letters, for example BE." })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 font-display text-sm font-bold text-neutral-950">Billing address</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {text("cb-b-name", "Name on invoice", v.billing.name, (s) => setBilling("name", s), { maxLength: 160 })}
          {text("cb-b-company", "Company on invoice", v.billing.companyName, (s) => setBilling("companyName", s), { maxLength: 200 })}
          {text("cb-b-line1", "Address line 1", v.billing.addressLine1, (s) => setBilling("addressLine1", s), { required: true, maxLength: 200 })}
          {text("cb-b-line2", "Address line 2", v.billing.addressLine2, (s) => setBilling("addressLine2", s), { maxLength: 200 })}
          {text("cb-b-postal", "Postal code", v.billing.postalCode, (s) => setBilling("postalCode", s), { required: true, maxLength: 20 })}
          {text("cb-b-city", "City", v.billing.city, (s) => setBilling("city", s), { required: true, maxLength: 120 })}
          {text("cb-b-state", "State or province", v.billing.stateOrProvince, (s) => setBilling("stateOrProvince", s), { maxLength: 120 })}
          {text("cb-b-country", "Country code", v.billing.countryCode, (s) => setBilling("countryCode", s.toUpperCase()), { required: true, maxLength: 2, help: "Two letters, for example BE." })}
        </div>
      </fieldset>

      <p className="text-sm text-neutral-600">
        Marketing consent: <span className="font-medium text-neutral-950">{initial.marketingConsent ? "Given" : "Not given"}</span>. Only the customer can change it, from their account.
      </p>

      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="success">Contact and billing details saved. Past orders keep the billing details they were placed with.</Notice>}
      <div>
        <button type="submit" className={btn.primary} disabled={busy} aria-busy={busy}>
          {busy ? "Saving..." : "Save contact and billing"}
        </button>
      </div>
    </form>
  );
}
