"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, ApiError, errorMessage } from "../api";
import { shopCopy } from "./copy";

const COUNTRIES: [string, string][] = [
  ["AT", "Austria"], ["AU", "Australia"], ["BE", "Belgium"], ["BG", "Bulgaria"], ["CA", "Canada"], ["CH", "Switzerland"],
  ["CY", "Cyprus"], ["CZ", "Czechia"], ["DE", "Germany"], ["DK", "Denmark"], ["EE", "Estonia"], ["ES", "Spain"],
  ["FI", "Finland"], ["FR", "France"], ["GB", "United Kingdom"], ["GR", "Greece"], ["HR", "Croatia"], ["HU", "Hungary"],
  ["IE", "Ireland"], ["IS", "Iceland"], ["IT", "Italy"], ["JP", "Japan"], ["LI", "Liechtenstein"], ["LT", "Lithuania"],
  ["LU", "Luxembourg"], ["LV", "Latvia"], ["MT", "Malta"], ["NL", "Netherlands"], ["NO", "Norway"], ["NZ", "New Zealand"],
  ["PL", "Poland"], ["PT", "Portugal"], ["RO", "Romania"], ["SE", "Sweden"], ["SI", "Slovenia"], ["SK", "Slovakia"],
  ["US", "United States"],
];

const input =
  "block w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-950 focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/10";

export function OnboardingForm(props: {
  lang: string;
  defaults: { firstName: string; lastName: string; countryCode: string };
  versions: { TERMS: string; PRIVACY: string };
  termsUrl: string;
  privacyUrl: string;
  returnTo: string;
}) {
  const t = shopCopy(props.lang);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setBusy(true);
        setError(null);
        setFieldErrors({});
        try {
          await apiFetch("/api/shop/account/onboarding", {
            method: "POST",
            body: {
              firstName: String(f.get("firstName") ?? ""),
              lastName: String(f.get("lastName") ?? ""),
              countryCode: String(f.get("countryCode") ?? ""),
              acceptTerms: f.get("acceptTerms") === "on",
              acceptPrivacy: f.get("acceptPrivacy") === "on",
              termsVersion: props.versions.TERMS,
              privacyVersion: props.versions.PRIVACY,
            },
          });
          router.push(props.returnTo);
          router.refresh();
        } catch (err) {
          if (err instanceof ApiError && Array.isArray(err.details)) {
            const map: Record<string, string> = {};
            for (const d of err.details as { path: string; message: string }[]) map[d.path] = d.message;
            setFieldErrors(map);
          }
          setError(errorMessage(err));
          setBusy(false);
        }
      }}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="firstName" className="text-sm font-medium text-neutral-800">{t.firstName}</label>
          <input id="firstName" name="firstName" required maxLength={80} autoComplete="given-name" defaultValue={props.defaults.firstName} className={input} />
          {fieldErrors.firstName && <p className="text-xs font-medium text-neutral-950">{fieldErrors.firstName}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="lastName" className="text-sm font-medium text-neutral-800">{t.lastName}</label>
          <input id="lastName" name="lastName" required maxLength={80} autoComplete="family-name" defaultValue={props.defaults.lastName} className={input} />
          {fieldErrors.lastName && <p className="text-xs font-medium text-neutral-950">{fieldErrors.lastName}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="countryCode" className="text-sm font-medium text-neutral-800">{t.country}</label>
        <select id="countryCode" name="countryCode" required defaultValue={props.defaults.countryCode} className={input} autoComplete="country">
          <option value="" disabled>{t.chooseCountry}</option>
          {COUNTRIES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
      </div>
      <fieldset className="flex flex-col gap-3 border-t border-neutral-200 pt-6">
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input type="checkbox" name="acceptTerms" required className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950" />
          <span>
            <a href={props.termsUrl} target="_blank" rel="noreferrer" className="font-medium text-neutral-950 underline underline-offset-4">{t.acceptTerms}</a>
            <span className="ml-1 text-neutral-500">({t.version} {props.versions.TERMS})</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-neutral-700">
          <input type="checkbox" name="acceptPrivacy" required className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950" />
          <span>
            <a href={props.privacyUrl} target="_blank" rel="noreferrer" className="font-medium text-neutral-950 underline underline-offset-4">{t.acceptPrivacy}</a>
            <span className="ml-1 text-neutral-500">({t.version} {props.versions.PRIVACY})</span>
          </span>
        </label>
      </fieldset>
      {error && <p role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">{error}</p>}
      <button type="submit" disabled={busy} className="self-start rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50">
        {busy ? `${t.saving}…` : t.continue}
      </button>
    </form>
  );
}
