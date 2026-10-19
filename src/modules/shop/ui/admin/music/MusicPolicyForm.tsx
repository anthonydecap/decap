"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { additionalPlayerPriceCents, type MusicPolicy } from "../../../domain/music-policy";
import { apiFetch, errorMessage } from "../../api";
import { formatMoney } from "../../format";
import { btn, Field, inputClass, Notice, Panel } from "../primitives";
import { REPLACEMENT_POLICY_LABEL, RESALE_POLICY_LABEL } from "./labels";

const STRATEGIES = [
  { value: "NO_DISCOUNT", label: "Full price", help: "Every player pays the normal arrangement price." },
  { value: "ADDITIONAL_PERCENTAGE", label: "Percentage of the normal price", help: "For a player after the first, the customer pays a share of the normal price." },
  { value: "ADDITIONAL_FIXED_PRICE", label: "Fixed price", help: "For a player after the first, a flat price per arrangement (never more than the normal price)." },
] as const;

const RESALE_HELP: Record<string, string> = {
  PLAYER_AND_LIBRARY: "When a player is sold, its music goes with it. The seller can no longer use those licenses.",
  PLAYER_ONLY: "When a player is sold, its music is retired. The buyer starts with an empty library.",
  ADMIN_DECIDES: "Staff choose per transfer, with a reason. Only super admins can transfer a player.",
};

const REPLACEMENT_HELP: Record<string, string> = {
  FREE_ADMIN_APPROVED: "Replacing a player moves its music free of charge once staff approve it.",
  PAID_TRANSFER: "Recorded as a paid library transfer. No fee is charged automatically yet.",
  MANUAL_DECISION: "Staff decide per case and note it on the transfer.",
};

function Radio({ name, checked, onChange, title, help, disabled }: { name: string; checked: boolean; onChange: () => void; title: string; help: string; disabled: boolean }) {
  return (
    <label className="flex items-start gap-2 text-sm">
      <input type="radio" name={name} className="mt-1" checked={checked} onChange={onChange} disabled={disabled} />
      <span>
        <span className="font-medium text-neutral-950">{title}</span>
        <span className="block text-neutral-600">{help}</span>
      </span>
    </label>
  );
}

/** Section 26, 37, 66, 67: the one place the commercial licensing rules change. */
export function MusicPolicyForm({ initial, canWrite, exampleRetailCents }: { initial: MusicPolicy; canWrite: boolean; exampleRetailCents: number }) {
  const router = useRouter();
  const id = useId();
  const [p, setP] = useState<MusicPolicy>(initial);
  const [percent, setPercent] = useState(String(initial.additionalPlayer.percentageBps / 100));
  const [fixed, setFixed] = useState((initial.additionalPlayer.fixedPriceCents / 100).toFixed(2));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const percentBps = Math.round(Number(percent.replace(",", ".")) * 100);
  const fixedCents = Math.round(Number(fixed.replace(",", ".")) * 100);
  const percentValid = Number.isFinite(percentBps) && percentBps >= 0 && percentBps <= 10000;
  const fixedValid = Number.isFinite(fixedCents) && fixedCents >= 0 && fixedCents <= 1_000_000;
  const additional = {
    ...p.additionalPlayer,
    percentageBps: percentValid ? percentBps : p.additionalPlayer.percentageBps,
    fixedPriceCents: fixedValid ? fixedCents : p.additionalPlayer.fixedPriceCents,
  };
  const exampleAdditional = additionalPlayerPriceCents(exampleRetailCents, additional);
  const valid = (p.additionalPlayer.strategy !== "ADDITIONAL_PERCENTAGE" || percentValid) && (p.additionalPlayer.strategy !== "ADDITIONAL_FIXED_PRICE" || fixedValid);
  const set = (patch: Partial<MusicPolicy>) => { setP((v) => ({ ...v, ...patch })); setSaved(false); };
  const disabled = !canWrite || busy;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!valid || !canWrite) return;
        setBusy(true);
        setError(null);
        try {
          const next = await apiFetch<MusicPolicy>("/api/admin/shop/settings/music-policy", { method: "PUT", body: { ...p, additionalPlayer: additional } });
          setP(next);
          setSaved(true);
          router.refresh();
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}
    >
      <Panel title="Additional-player price" description="What a customer pays for an arrangement they already license on another of their players.">
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Pricing strategy</legend>
            {STRATEGIES.map((s) => (
              <Radio
                key={s.value}
                name={`${id}-strategy`}
                checked={p.additionalPlayer.strategy === s.value}
                onChange={() => set({ additionalPlayer: { ...p.additionalPlayer, strategy: s.value } })}
                title={s.label}
                help={s.help}
                disabled={disabled}
              />
            ))}
          </fieldset>
          {p.additionalPlayer.strategy === "ADDITIONAL_PERCENTAGE" && (
            <Field label="Share of the normal price charged (%)" htmlFor={`${id}-pct`} error={percentValid ? null : "Enter a number from 0 to 100."} className="max-w-xs">
              <input id={`${id}-pct`} inputMode="decimal" className={inputClass} value={percent} onChange={(e) => { setPercent(e.target.value); setSaved(false); }} disabled={disabled} />
            </Field>
          )}
          {p.additionalPlayer.strategy === "ADDITIONAL_FIXED_PRICE" && (
            <Field label="Fixed price per arrangement (EUR)" htmlFor={`${id}-fixed`} error={fixedValid ? null : "Enter an amount of 0 or more."} className="max-w-xs">
              <input id={`${id}-fixed`} inputMode="decimal" className={inputClass} value={fixed} onChange={(e) => { setFixed(e.target.value); setSaved(false); }} disabled={disabled} />
            </Field>
          )}
          <div className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-800">
            <p className="text-xs text-neutral-500">Example for an arrangement of {formatMoney(exampleRetailCents)}</p>
            <p className="mt-1 font-medium tabular-nums">
              First player {formatMoney(exampleRetailCents)}, additional player {formatMoney(exampleAdditional)}
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="Buying music">
        <div className="flex flex-col gap-4 text-sm">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" checked={p.allowAssignLater} onChange={(e) => set({ allowAssignLater: e.target.checked })} disabled={disabled} />
            <span>
              <span className="font-medium text-neutral-950">Allow buying before a player is chosen</span>
              <span className="block text-neutral-600">Customers without an eligible player may buy now and place the music on a player later.</span>
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1" checked={p.requireActiveSoftwareLicenseForMusic} onChange={(e) => set({ requireActiveSoftwareLicenseForMusic: e.target.checked })} disabled={disabled} />
            <span>
              <span className="font-medium text-neutral-950">Require an active software license for music</span>
              <span className="block text-neutral-600">Music can only be bought for, or granted to, a player whose software is fully licensed.</span>
            </span>
          </label>
        </div>
      </Panel>

      <Panel title="Player resale" description="What happens to the music when staff transfer a player to another customer.">
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Resale policy</legend>
          {(Object.keys(RESALE_POLICY_LABEL) as MusicPolicy["resalePolicy"][]).map((v) => (
            <Radio key={v} name={`${id}-resale`} checked={p.resalePolicy === v} onChange={() => set({ resalePolicy: v })} title={RESALE_POLICY_LABEL[v]!} help={RESALE_HELP[v]!} disabled={disabled} />
          ))}
        </fieldset>
      </Panel>

      <Panel title="Player replacement" description="Recorded on every replacement. Charging a fee is not automated yet.">
        <fieldset className="flex flex-col gap-3">
          <legend className="sr-only">Replacement policy</legend>
          {(Object.keys(REPLACEMENT_POLICY_LABEL) as MusicPolicy["replacementPolicy"][]).map((v) => (
            <Radio key={v} name={`${id}-replace`} checked={p.replacementPolicy === v} onChange={() => set({ replacementPolicy: v })} title={REPLACEMENT_POLICY_LABEL[v]!} help={REPLACEMENT_HELP[v]!} disabled={disabled} />
          ))}
        </fieldset>
      </Panel>

      {error && <Notice tone="error">{error}</Notice>}
      {saved && <Notice tone="success">Licensing policy saved. It applies to new carts, grants and transfers from now on.</Notice>}
      {canWrite ? (
        <div className="flex justify-end">
          <button type="submit" className={btn.primary} disabled={!valid || busy} aria-busy={busy}>
            {busy ? "Saving…" : "Save policy"}
          </button>
        </div>
      ) : (
        <Notice>Your role can read this policy but not change it.</Notice>
      )}
    </form>
  );
}
