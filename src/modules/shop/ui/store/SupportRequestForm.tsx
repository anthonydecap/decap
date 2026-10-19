"use client";

import { ChatCircleText, CreditCard, Desktop, MusicNotes, PianoKeys, User } from "@phosphor-icons/react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ApiError, errorMessage } from "../api";
import { AttachmentPicker, checkAttachments, postWithFiles } from "./AttachmentPicker";
import { shopCopy, shopPath } from "./copy";
import { ABOUT_CATEGORIES, accountCopy, SUPPORT_ABOUTS, type SupportAbout } from "./copy-account";
import { inputClass } from "./ProfileForm";

type Option = { id: string; label: string };

/** One software choice: a license the customer holds, or a product they only downloaded. */
export type SoftwareOption = {
  value: string;
  productId: string;
  licenseId: string | null;
  label: string;
  installations: Option[];
  activations: Option[];
};

const ABOUT_ICON = { player: PianoKeys, music: MusicNotes, software: Desktop, order: CreditCard, account: User, other: ChatCircleText } as const;

/**
 * New support request. It starts with "What is this about?" and then only asks for what
 * matters for that answer (which player, which arrangement, which order...). Every choice
 * comes from the customer's own records (passed in by the server); the API verifies
 * ownership again.
 */
export function SupportRequestForm(props: {
  lang: string;
  categories: { value: string; label: string }[];
  options: {
    players: Option[];
    orders: Option[];
    arrangements: Option[];
    /** Arrangements licensed on each player, keyed by player id. */
    arrangementsByPlayer?: Record<string, Option[]>;
    software?: SoftwareOption[];
  };
  preselect: {
    about?: SupportAbout;
    player?: string;
    order?: string;
    arrangement?: string;
    category?: string;
    /** `SoftwareOption.value` */
    software?: string;
    installation?: string;
    activation?: string;
  };
}) {
  const t = shopCopy(props.lang);
  const a = accountCopy(props.lang);
  const swAll = t.sw;
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { players, orders, arrangements } = props.options;
  const byPlayer = props.options.arrangementsByPlayer ?? {};
  const software = useMemo(() => props.options.software ?? [], [props.options.software]);
  const pre = (list: Option[], v?: string) => (v && list.some((o) => o.id === v) ? v : "");

  const categoryLabel = (value: string) => props.categories.find((c) => c.value === value)?.label ?? value;
  const categoriesFor = (about: SupportAbout) => ABOUT_CATEGORIES[about].filter((c) => props.categories.some((x) => x.value === c));

  const [about, setAbout] = useState<SupportAbout | "">(props.preselect.about ?? "");
  const [category, setCategory] = useState(() => {
    const allowed = props.preselect.about ? categoriesFor(props.preselect.about) : [];
    return props.preselect.category && allowed.includes(props.preselect.category) ? props.preselect.category : allowed.length === 1 ? allowed[0]! : "";
  });
  const [playerId, setPlayerId] = useState(() => pre(players, props.preselect.player) || (players.length === 1 ? players[0]!.id : ""));
  const [arrangementId, setArrangementId] = useState(() => {
    const p = pre(players, props.preselect.player) || (players.length === 1 ? players[0]!.id : "");
    return pre(p ? (byPlayer[p] ?? []) : arrangements, props.preselect.arrangement);
  });
  const [softwareValue, setSoftwareValue] = useState(() =>
    props.preselect.software && software.some((o) => o.value === props.preselect.software) ? props.preselect.software : "",
  );
  const chosenSoftware = software.find((o) => o.value === softwareValue) ?? null;
  const initialSoftware = props.preselect.software ?? "";
  const musicArrangements = playerId ? (byPlayer[playerId] ?? []) : players.length ? [] : arrangements;

  const chooseAbout = (next: SupportAbout) => {
    setAbout(next);
    const allowed = categoriesFor(next);
    setCategory((c) => (allowed.includes(c) ? c : allowed.length === 1 ? allowed[0]! : ""));
    setFieldErrors({});
  };

  const errorFor = (name: string) =>
    fieldErrors[name] ? <p id={`${name}-error`} className="text-xs font-medium text-neutral-950">{fieldErrors[name]}</p> : null;
  const aria = (name: string) => (fieldErrors[name] ? { "aria-invalid": true, "aria-describedby": `${name}-error` } : {});
  const fieldLabel = (htmlFor: string, label: string, optional: boolean) => (
    <label htmlFor={htmlFor} className="text-sm font-medium text-neutral-800">
      {label} {optional && <span className="font-normal text-neutral-500">({t.optional})</span>}
    </label>
  );

  const topics = about ? categoriesFor(about) : [];
  const needsPlayer = (about === "player" || about === "music") && players.length > 0;

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!about) {
          setFieldErrors({ about: a.aboutRequired });
          setError(t.fixErrors);
          return;
        }
        if (needsPlayer && !playerId) {
          setFieldErrors({ registeredPlayerId: a.playerRequired });
          setError(t.fixErrors);
          return;
        }
        const problem = checkAttachments(files, props.lang);
        setFileError(problem);
        if (problem) return;
        const f = new FormData(e.currentTarget);
        const s = (k: string) => String(f.get(k) ?? "").trim();
        const withPlayer = about === "player" || about === "music";
        const withSoftware = about === "software" && chosenSoftware;
        setBusy(true);
        setError(null);
        setFieldErrors({});
        try {
          const res = await postWithFiles<{ id: string; ticketNumber: string; status: string }>(
            "/api/shop/support",
            {
              subject: s("subject"),
              category,
              registeredPlayerId: (withPlayer && playerId) || null,
              orderId: (about === "order" && s("orderId")) || null,
              arrangementId: (about === "music" && arrangementId) || null,
              softwareProductId: withSoftware ? chosenSoftware.productId : null,
              softwareLicenseId: withSoftware ? chosenSoftware.licenseId : null,
              softwareInstallationId: (withSoftware && s("softwareInstallationId")) || null,
              softwareActivationRequestId: (withSoftware && s("softwareActivationRequestId")) || null,
              message: s("message"),
            },
            files,
          );
          router.push(`${shopPath(props.lang, `/account/support/${res.id}`)}?created=1`);
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
      <fieldset aria-describedby={fieldErrors.about ? "about-error" : undefined}>
        <legend className="font-display text-lg font-bold text-neutral-950">{a.aboutLegend}</legend>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SUPPORT_ABOUTS.map((value) => {
            const Icon = ABOUT_ICON[value];
            const checked = about === value;
            return (
              <label
                key={value}
                className={clsx(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950",
                  checked ? "border-neutral-950 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400",
                )}
              >
                <input
                  type="radio"
                  name="about"
                  value={value}
                  checked={checked}
                  onChange={() => chooseAbout(value)}
                  className="mt-1 h-4 w-4 shrink-0 accent-neutral-950"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 font-semibold text-neutral-950">
                    <Icon size={18} aria-hidden />
                    {a.about[value].label}
                  </span>
                  <span className="mt-0.5 block text-sm text-neutral-600">{a.about[value].hint}</span>
                </span>
              </label>
            );
          })}
        </div>
        {errorFor("about")}
      </fieldset>

      {about && (
        <div className="flex flex-col gap-6 rounded-2xl border border-neutral-200 p-5 sm:p-6">
          {(about === "player" || about === "music") &&
            (players.length > 0 ? (
              <div className="flex flex-col gap-2">
                {fieldLabel("registeredPlayerId", a.whichPlayer, false)}
                <select
                  id="registeredPlayerId"
                  value={playerId}
                  onChange={(e) => {
                    setPlayerId(e.target.value);
                    setArrangementId("");
                  }}
                  required
                  className={inputClass}
                  {...aria("registeredPlayerId")}
                >
                  {players.length > 1 && <option value="" disabled>{a.choosePlayer}</option>}
                  {players.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
                {errorFor("registeredPlayerId")}
              </div>
            ) : (
              <p className="text-sm text-neutral-600">{a.noPlayersYet}</p>
            ))}

          {about === "music" && musicArrangements.length > 0 && (
            <div className="flex flex-col gap-2">
              {fieldLabel("arrangementId", a.whichArrangement, true)}
              <select
                id="arrangementId"
                value={arrangementId}
                onChange={(e) => setArrangementId(e.target.value)}
                className={inputClass}
                {...aria("arrangementId")}
              >
                <option value="">{a.notOneArrangement}</option>
                {musicArrangements.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              {errorFor("arrangementId")}
            </div>
          )}

          {about === "order" && orders.length > 0 && (
            <div className="flex flex-col gap-2">
              {fieldLabel("orderId", a.whichOrder, true)}
              <select id="orderId" name="orderId" defaultValue={pre(orders, props.preselect.order)} className={inputClass} {...aria("orderId")}>
                <option value="">{a.notOneOrder}</option>
                {orders.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              {errorFor("orderId")}
            </div>
          )}

          {about === "software" && software.length > 0 && (
            <>
              <div className="flex flex-col gap-2">
                {fieldLabel("software", a.whichSoftware, true)}
                <select
                  id="software"
                  value={softwareValue}
                  onChange={(e) => setSoftwareValue(e.target.value)}
                  className={inputClass}
                  {...aria("softwareProductId")}
                >
                  <option value="">{t.none}</option>
                  {software.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errorFor("softwareProductId")}
                {errorFor("softwareLicenseId")}
              </div>
              {/* Keyed by the chosen software so the dependent selects reset when it changes. */}
              {chosenSoftware && (
                <div key={chosenSoftware.value} className="flex flex-col gap-6">
                  {chosenSoftware.installations.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {fieldLabel("softwareInstallationId", swAll.relatedComputer, true)}
                      <select
                        id="softwareInstallationId"
                        name="softwareInstallationId"
                        defaultValue={softwareValue === initialSoftware ? pre(chosenSoftware.installations, props.preselect.installation) : ""}
                        className={inputClass}
                        {...aria("softwareInstallationId")}
                      >
                        <option value="">{t.none}</option>
                        {chosenSoftware.installations.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                      {errorFor("softwareInstallationId")}
                    </div>
                  )}
                  {chosenSoftware.activations.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {fieldLabel("softwareActivationRequestId", swAll.relatedActivation, true)}
                      <select
                        id="softwareActivationRequestId"
                        name="softwareActivationRequestId"
                        defaultValue={softwareValue === initialSoftware ? pre(chosenSoftware.activations, props.preselect.activation) : ""}
                        className={inputClass}
                        {...aria("softwareActivationRequestId")}
                      >
                        <option value="">{t.none}</option>
                        {chosenSoftware.activations.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                      {errorFor("softwareActivationRequestId")}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {topics.length > 1 ? (
            <div className="flex flex-col gap-2">
              {fieldLabel("category", a.topic, false)}
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className={inputClass} {...aria("category")}>
                <option value="" disabled>{a.chooseTopic}</option>
                {topics.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
              </select>
              {errorFor("category")}
            </div>
          ) : (
            errorFor("category")
          )}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="subject" className="text-sm font-medium text-neutral-800">{t.subject}</label>
        <input id="subject" name="subject" required minLength={3} maxLength={160} className={inputClass} {...aria("subject")} />
        {errorFor("subject")}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-sm font-medium text-neutral-800">{t.message}</label>
        <p id="message-hint" className="text-xs text-neutral-500">{t.messageHint}</p>
        <textarea
          id="message"
          name="message"
          required
          minLength={5}
          maxLength={10000}
          rows={8}
          className={inputClass}
          aria-describedby={fieldErrors.message ? "message-error" : "message-hint"}
          aria-invalid={fieldErrors.message ? true : undefined}
        />
        {errorFor("message")}
      </div>

      <AttachmentPicker
        lang={props.lang}
        files={files}
        disabled={busy}
        error={fileError}
        onChange={(next) => {
          setFiles(next);
          setFileError(checkAttachments(next, props.lang));
        }}
      />

      <div className="flex flex-col gap-4">
        {error && <p role="alert" className="rounded-xl border border-neutral-950 px-4 py-3 text-sm font-medium text-neutral-950">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy}
          className="self-start rounded-full bg-neutral-950 px-8 py-3 font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy ? `${t.sending}…` : t.sendRequest}
        </button>
      </div>
    </form>
  );
}
