"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { apiFetch, ApiError, errorMessage } from "../api";
import { shopCopy } from "./copy";
import { COUNTRIES } from "./countries";

export type ProfileDefaults = {
  accountType: "INDIVIDUAL" | "BUSINESS";
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;
  companyRegistrationNumber: string;
  vatNumber: string;
  vatCountryCode: string;
  marketingConsent: boolean;
  billing: {
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    city: string;
    stateOrProvince: string;
    countryCode: string;
  };
};

type Legal = {
  versions: { TERMS: string; PRIVACY: string };
  termsUrl: string;
  privacyUrl: string;
};

export const inputClass =
  "block w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-950 focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/10 aria-[invalid=true]:border-neutral-950";

/**
 * Customer profile + billing address. With `legal` it is the onboarding form (POST,
 * includes Terms/Privacy acceptance, then navigates to `returnTo`); without it it edits
 * the existing profile (PUT, stays on the page with a success notice).
 */
export function ProfileForm(props: {
  lang: string;
  defaults: ProfileDefaults;
  legal?: Legal;
  returnTo?: string;
  submitLabel: string;
}) {
  const t = shopCopy(props.lang);
  const router = useRouter();
  const d = props.defaults;
  const [accountType, setAccountType] = useState(d.accountType);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const business = accountType === "BUSINESS";

  const field = (
    name: string,
    label: string,
    opts: { required?: boolean; maxLength?: number; autoComplete?: string; defaultValue: string; type?: string; optional?: boolean; inputMode?: "tel" | "text" },
  ) => {
    const err = fieldErrors[name];
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-medium text-neutral-800">
          {label}
          {opts.optional && <span className="ml-1 font-normal text-neutral-500">({t.optional})</span>}
        </label>
        <input
          id={name}
          name={name}
          type={opts.type ?? "text"}
          required={opts.required}
          maxLength={opts.maxLength}
          autoComplete={opts.autoComplete}
          inputMode={opts.inputMode}
          defaultValue={opts.defaultValue}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${name}-error` : undefined}
          className={inputClass}
        />
        {err && <p id={`${name}-error`} className="text-xs font-medium text-neutral-950">{err}</p>}
      </div>
    );
  };

  const countrySelect = (name: string, label: string, value: string, opts: { required?: boolean; emptyLabel: string; optional?: boolean; autoComplete?: string }) => {
    const err = fieldErrors[name];
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-medium text-neutral-800">
          {label}
          {opts.optional && <span className="ml-1 font-normal text-neutral-500">({t.optional})</span>}
        </label>
        <select
          id={name}
          name={name}
          required={opts.required}
          defaultValue={value}
          autoComplete={opts.autoComplete}
          aria-invalid={err ? true : undefined}
          aria-describedby={err ? `${name}-error` : undefined}
          className={inputClass}
        >
          <option value="" disabled={opts.required}>{opts.emptyLabel}</option>
          {COUNTRIES.map(([code, n]) => <option key={code} value={code}>{n}</option>)}
        </select>
        {err && <p id={`${name}-error`} className="text-xs font-medium text-neutral-950">{err}</p>}
      </div>
    );
  };

  return (
    <form
      className="flex flex-col gap-10"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const s = (k: string) => String(f.get(k) ?? "").trim();
        const body = {
          accountType,
          firstName: s("firstName"),
          lastName: s("lastName"),
          phone: s("phone") || null,
          companyName: business ? s("companyName") || null : null,
          companyRegistrationNumber: business ? s("companyRegistrationNumber") || null : null,
          vatNumber: business ? s("vatNumber") || null : null,
          vatCountryCode: business ? s("vatCountryCode") || null : null,
          marketingConsent: f.get("marketingConsent") === "on",
          billingAddress: {
            addressLine1: s("billingAddress.addressLine1"),
            addressLine2: s("billingAddress.addressLine2") || null,
            postalCode: s("billingAddress.postalCode"),
            city: s("billingAddress.city"),
            stateOrProvince: s("billingAddress.stateOrProvince") || null,
            countryCode: s("billingAddress.countryCode"),
          },
        };
        setBusy(true);
        setSaved(false);
        setError(null);
        setFieldErrors({});
        try {
          if (props.legal) {
            await apiFetch("/api/shop/account/onboarding", {
              method: "POST",
              body: {
                ...body,
                preferredLanguage: props.lang === "fr" ? "fr" : "en",
                acceptTerms: f.get("acceptTerms") === "on",
                acceptPrivacy: f.get("acceptPrivacy") === "on",
                termsVersion: props.legal.versions.TERMS,
                privacyVersion: props.legal.versions.PRIVACY,
              },
            });
            router.push(props.returnTo ?? "/");
            router.refresh();
            return;
          }
          await apiFetch("/api/shop/account/profile", { method: "PUT", body });
          setSaved(true);
          setBusy(false);
          router.refresh();
        } catch (err) {
          if (err instanceof ApiError && Array.isArray(err.details)) {
            const map: Record<string, string> = {};
            for (const x of err.details as { path: string; message: string }[]) if (x.path && !map[x.path]) map[x.path] = x.message;
            setFieldErrors(map);
            setError(Object.keys(map).length ? t.fixErrors : errorMessage(err));
          } else {
            setError(errorMessage(err));
          }
          setBusy(false);
        }
      }}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm font-medium text-neutral-800">{t.accountTypeLabel}</legend>
        <div className="mt-3 inline-flex self-start rounded-full border border-neutral-300 p-1">
          {(["INDIVIDUAL", "BUSINESS"] as const).map((v) => (
            <label
              key={v}
              className={clsx(
                "cursor-pointer rounded-full px-5 py-2 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-neutral-950/30",
                accountType === v ? "bg-neutral-950 font-semibold text-white" : "text-neutral-600 hover:text-neutral-950",
              )}
            >
              <input
                type="radio"
                name="accountType"
                value={v}
                checked={accountType === v}
                onChange={() => setAccountType(v)}
                className="sr-only"
              />
              {v === "INDIVIDUAL" ? t.individual : t.business}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="font-display text-lg font-bold text-neutral-950">{t.contactDetails}</legend>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {field("firstName", t.firstName, { required: true, maxLength: 80, autoComplete: "given-name", defaultValue: d.firstName })}
          {field("lastName", t.lastName, { required: true, maxLength: 80, autoComplete: "family-name", defaultValue: d.lastName })}
        </div>
        {field("phone", t.phone, { maxLength: 40, autoComplete: "tel", type: "tel", inputMode: "tel", defaultValue: d.phone, optional: true })}
      </fieldset>

      {/* Kept mounted while hidden so switching type back and forth keeps what was typed. */}
      <fieldset className={clsx("flex-col gap-6", business ? "flex" : "hidden")} disabled={!business}>
          <legend className="font-display text-lg font-bold text-neutral-950">{t.businessDetails}</legend>
          <div className="mt-6">
            {field("companyName", t.companyName, { required: business, maxLength: 200, autoComplete: "organization", defaultValue: d.companyName })}
          </div>
          {field("companyRegistrationNumber", t.companyRegistrationNumber, { maxLength: 60, defaultValue: d.companyRegistrationNumber, optional: true })}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {field("vatNumber", t.vatNumber, { maxLength: 20, defaultValue: d.vatNumber, optional: true })}
            {countrySelect("vatCountryCode", t.vatCountry, d.vatCountryCode, { emptyLabel: t.sameAsBilling, optional: true })}
          </div>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="font-display text-lg font-bold text-neutral-950">{t.billingAddress}</legend>
        <div className="mt-6">
          {field("billingAddress.addressLine1", t.addressLine1, { required: true, maxLength: 200, autoComplete: "address-line1", defaultValue: d.billing.addressLine1 })}
        </div>
        {field("billingAddress.addressLine2", t.addressLine2, { maxLength: 200, autoComplete: "address-line2", defaultValue: d.billing.addressLine2, optional: true })}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {field("billingAddress.postalCode", t.postalCode, { required: true, maxLength: 20, autoComplete: "postal-code", defaultValue: d.billing.postalCode })}
          <div className="sm:col-span-2">
            {field("billingAddress.city", t.city, { required: true, maxLength: 120, autoComplete: "address-level2", defaultValue: d.billing.city })}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {field("billingAddress.stateOrProvince", t.stateOrProvince, { maxLength: 120, autoComplete: "address-level1", defaultValue: d.billing.stateOrProvince, optional: true })}
          {countrySelect("billingAddress.countryCode", t.country, d.billing.countryCode, { required: true, emptyLabel: t.chooseCountry, autoComplete: "country" })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1 border-t border-neutral-200 pt-6">
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="marketingConsent"
            defaultChecked={d.marketingConsent}
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
          />
          <span>
            {t.marketingConsentLabel}
            <span className="mt-0.5 block text-xs text-neutral-500">{t.marketingConsentHint}</span>
          </span>
        </label>
      </div>

      {props.legal && (
        <fieldset className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
          <legend className="sr-only">{t.legalTitle}</legend>
          <label className="flex items-start gap-3 text-sm text-neutral-700">
            <input type="checkbox" name="acceptTerms" required className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950" />
            <span>
              <a href={props.legal.termsUrl} target="_blank" rel="noreferrer" className="font-medium text-neutral-950 underline underline-offset-4">{t.acceptTerms}</a>
              <span className="ml-1 text-neutral-500">({t.version} {props.legal.versions.TERMS})</span>
            </span>
          </label>
          {fieldErrors.acceptTerms && <p className="text-xs font-medium text-neutral-950">{fieldErrors.acceptTerms}</p>}
          <label className="flex items-start gap-3 text-sm text-neutral-700">
            <input type="checkbox" name="acceptPrivacy" required className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950" />
            <span>
              <a href={props.legal.privacyUrl} target="_blank" rel="noreferrer" className="font-medium text-neutral-950 underline underline-offset-4">{t.acceptPrivacy}</a>
              <span className="ml-1 text-neutral-500">({t.version} {props.legal.versions.PRIVACY})</span>
            </span>
          </label>
          {fieldErrors.acceptPrivacy && <p className="text-xs font-medium text-neutral-950">{fieldErrors.acceptPrivacy}</p>}
        </fieldset>
      )}

      <div className="flex flex-col gap-4" aria-live="polite">
        {error && <p role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">{error}</p>}
        {saved && !error && (
          <p className="flex items-center gap-2 rounded-xl bg-neutral-100 px-4 py-3 text-sm font-medium text-neutral-950">
            <CheckCircle size={18} weight="fill" aria-hidden />
            {t.profileSaved}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="self-start rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy ? `${t.saving}…` : props.submitLabel}
        </button>
      </div>
    </form>
  );
}
