"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { Checkbox, FormGrid, textareaClass } from "../catalog/ui";
import { btn, Field, inputClass, Notice, Panel } from "../primitives";
import { centsToEuros, eurosToCents } from "./labels";

export type SoftwareProductInitial = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  systemRequirements: string | null;
  activationInstructions: string | null;
  trialAvailable: boolean;
  licenseRequiredForFullUse: boolean;
  defaultLicensePriceCents: number | null;
  defaultMaxActivations: number;
  sortOrder: number;
};

const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

/** Create or edit a software product. Every softwareProductSchema field; price in euros. */
export function SoftwareProductForm({ initial, canWrite }: { initial: SoftwareProductInitial | null; canWrite: boolean }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [systemRequirements, setSystemRequirements] = useState(initial?.systemRequirements ?? "");
  const [activationInstructions, setActivationInstructions] = useState(initial?.activationInstructions ?? "");
  const [trialAvailable, setTrialAvailable] = useState(initial?.trialAvailable ?? true);
  const [licenseRequired, setLicenseRequired] = useState(initial?.licenseRequiredForFullUse ?? true);
  const [price, setPrice] = useState(centsToEuros(initial?.defaultLicensePriceCents));
  const [maxActivations, setMaxActivations] = useState(String(initial?.defaultMaxActivations ?? 1));
  const [sortOrder, setSortOrder] = useState(String(initial?.sortOrder ?? 0));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "error" | "success"; text: string } | null>(null);

  const priceCents = eurosToCents(price);
  const priceError = Number.isNaN(priceCents) ? "Enter an amount like 49 or 49.95" : null;
  const maxNum = Number(maxActivations);
  const maxError = !Number.isInteger(maxNum) || maxNum < 1 || maxNum > 50 ? "Between 1 and 50" : null;
  const sortNum = Number(sortOrder);
  const sortError = !Number.isInteger(sortNum) || sortNum < -1000 || sortNum > 1000 ? "Whole number between -1000 and 1000" : null;
  const slugError = slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? "Lowercase letters, digits and single dashes only" : null;
  const invalid = !name.trim() || !slug || Boolean(priceError || maxError || sortError || slugError);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (invalid || !canWrite) return;
    setBusy(true);
    setMsg(null);
    const body = {
      slug,
      name: name.trim(),
      shortDescription: shortDescription.trim() || null,
      description: description.trim() || null,
      systemRequirements: systemRequirements.trim() || null,
      activationInstructions: activationInstructions.trim() || null,
      trialAvailable,
      licenseRequiredForFullUse: licenseRequired,
      defaultLicensePriceCents: priceCents,
      currency: "EUR",
      defaultMaxActivations: maxNum,
      sortOrder: sortNum,
    };
    try {
      if (initial) {
        await apiFetch(`/api/admin/shop/software/${initial.id}`, { method: "PATCH", body });
        setMsg({ tone: "success", text: "Product saved." });
        router.refresh();
      } else {
        const r = await apiFetch<{ id: string }>("/api/admin/shop/software", { body });
        router.push(`/admin/shop/software/${r.id}?tab=releases`);
        router.refresh();
        return;
      }
    } catch (err) {
      setMsg({ tone: "error", text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }

  const disabled = !canWrite || busy;

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {!canWrite && <Notice>Your role can view this product but not edit it.</Notice>}
      <Panel title="Product">
        <div className="flex flex-col gap-4">
          <FormGrid>
            <Field label="Name" htmlFor="sp-name">
              <input
                id="sp-name"
                className={inputClass}
                value={name}
                maxLength={120}
                required
                disabled={disabled}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug" htmlFor="sp-slug" error={slugError} help="Used in the public address /en/software/your-slug.">
              <input
                id="sp-slug"
                className={`${inputClass} font-mono`}
                value={slug}
                maxLength={120}
                required
                disabled={disabled}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase());
                }}
              />
            </Field>
          </FormGrid>
          <Field label="Short description" htmlFor="sp-short" help="One or two sentences for the software catalog. Up to 300 characters.">
            <input id="sp-short" className={inputClass} value={shortDescription} maxLength={300} disabled={disabled} onChange={(e) => setShortDescription(e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="sp-desc">
            <textarea id="sp-desc" rows={8} className={textareaClass} value={description} maxLength={20000} disabled={disabled} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="System requirements" htmlFor="sp-req" help="For example: Windows 10 or later, 64-bit. Up to 500 characters.">
            <textarea id="sp-req" rows={2} className={textareaClass} value={systemRequirements} maxLength={500} disabled={disabled} onChange={(e) => setSystemRequirements(e.target.value)} />
          </Field>
          <Field
            label="Activation instructions"
            htmlFor="sp-act"
            help="Shown to customers when they enter their registration code. Tell them where to find the code in the software."
          >
            <textarea id="sp-act" rows={3} className={textareaClass} value={activationInstructions} maxLength={2000} disabled={disabled} onChange={(e) => setActivationInstructions(e.target.value)} />
          </Field>
        </div>
      </Panel>

      <Panel title="Licensing and price">
        <div className="flex flex-col gap-4">
          <FormGrid cols={3}>
            <Field label="License price (EUR)" htmlFor="sp-price" error={priceError} help="Including VAT. Leave empty when no license is for sale.">
              <input id="sp-price" inputMode="decimal" className={`${inputClass} tabular-nums`} value={price} disabled={disabled} onChange={(e) => setPrice(e.target.value)} placeholder="Not for sale" />
            </Field>
            <Field label="Activations per license" htmlFor="sp-max" error={maxError} help="Default for new licenses. Staff can change it per license.">
              <input id="sp-max" type="number" min={1} max={50} className={`${inputClass} tabular-nums`} value={maxActivations} disabled={disabled} onChange={(e) => setMaxActivations(e.target.value)} />
            </Field>
            <Field label="Sort order" htmlFor="sp-sort" error={sortError} help="Lower numbers are listed first.">
              <input id="sp-sort" type="number" min={-1000} max={1000} className={`${inputClass} tabular-nums`} value={sortOrder} disabled={disabled} onChange={(e) => setSortOrder(e.target.value)} />
            </Field>
          </FormGrid>
          <Checkbox
            id="sp-trial"
            label="Trial available"
            help="Signed-in customers can download the installer and use it in trial mode without a license."
            checked={trialAvailable}
            disabled={disabled}
            onChange={setTrialAvailable}
          />
          <Checkbox
            id="sp-licreq"
            label="License required for full use"
            help="The software needs a registration code and activation key to unlock all features."
            checked={licenseRequired}
            disabled={disabled}
            onChange={setLicenseRequired}
          />
          <p className="text-xs text-neutral-500">License type: Perpetual. Currency: EUR.</p>
        </div>
      </Panel>

      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      {canWrite && (
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btn.primary} disabled={invalid || busy}>
            {busy ? "Saving…" : initial ? "Save product" : "Create product"}
          </button>
          {!initial && <p className="self-center text-xs text-neutral-500">New products start as Draft and are not visible to customers.</p>}
        </div>
      )}
    </form>
  );
}
