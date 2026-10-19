"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { apiFetch, errorMessage } from "../../api";
import { btn, EmptyState, Field, inputClass, Notice, Panel, StatusBadge, Table, td, th, tr } from "../primitives";
import { textareaClass } from "../catalog/ui";

export type PlayerTypeRow = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  playerCount: number;
  supportsMusicLibrary: boolean;
  softwareProduct: { id: string; name: string } | null;
  starterBundle: { id: string; title: string } | null;
  systemProfiles: { id: string; name: string }[];
};

export type PlayerTypeOptions = {
  softwareProducts: { id: string; name: string }[];
  bundles: { id: string; sku: string; title: string }[];
  systemProfiles: { id: string; name: string; manufacturer: string | null; isGeneric: boolean; active: boolean }[];
};

/**
 * Player types are managed, not hard-coded, because the range keeps growing. They are
 * never deleted: a type that players already reference has to keep its name, or the
 * service history of those machines stops making sense. Deactivating hides it from the
 * "add player" form while leaving every existing record readable.
 */
export function PlayerTypesManager({ rows, canWrite, options }: { rows: PlayerTypeRow[]; canWrite: boolean; options: PlayerTypeOptions }) {
  return (
    <div className="flex flex-col gap-6">
      {canWrite && <CreateTypePanel />}
      <Panel
        title="Player types"
        description={`${rows.length} type${rows.length === 1 ? "" : "s"}. Deactivate rather than delete; existing players keep their type.`}
        padded={false}
      >
        {rows.length === 0 ? (
          <div className="p-5 sm:p-6">
            <EmptyState title="No player types yet" body="Add the first one above, for example “DMI Classic”." />
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <th className={th}>Type</th>
                <th className={th}>Code</th>
                <th className={th}>Music and software</th>
                <th className={th}>Players</th>
                <th className={th}>Status</th>
                {canWrite && (
                  <th className={th}>
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <TypeRow key={row.id} row={row} canWrite={canWrite} options={options} />
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </div>
  );
}

function TypeRow({ row, canWrite, options }: { row: PlayerTypeRow; canWrite: boolean; options: PlayerTypeOptions }) {
  const router = useRouter();
  const id = useId();
  const [editing, setEditing] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [name, setName] = useState(row.name);
  const [description, setDescription] = useState(row.description ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/player-types/${row.id}`, { method: "PATCH", body });
      setEditing(false);
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    <tr className={tr}>
      <td className={td}>
        {editing ? (
          <div className="flex max-w-sm flex-col gap-3">
            <Field label="Name" htmlFor={`${id}-name`}>
              <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={inputClass} />
            </Field>
            <Field label="Description" htmlFor={`${id}-desc`}>
              <textarea
                id={`${id}-desc`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={2}
                className={textareaClass}
              />
            </Field>
          </div>
        ) : (
          <>
            <span className="font-medium text-neutral-950">{row.name}</span>
            {row.description && <span className="mt-0.5 block text-xs text-neutral-500">{row.description}</span>}
          </>
        )}
      </td>
      <td className={td}>
        <code className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-700">{row.code}</code>
      </td>
      <td className={`${td} max-w-[18rem] whitespace-normal`}>
        <p className={row.supportsMusicLibrary ? "font-medium text-neutral-950" : "text-neutral-500"}>
          {row.supportsMusicLibrary ? "Can receive music" : "No music library"}
        </p>
        <p className="text-xs text-neutral-500">
          {[
            row.softwareProduct ? `Software: ${row.softwareProduct.name}` : null,
            row.starterBundle ? `Starter: ${row.starterBundle.title}` : null,
            row.systemProfiles.length ? `Profiles: ${row.systemProfiles.map((p) => p.name).join(", ")}` : null,
          ]
            .filter(Boolean)
            .join(". ") || "No software, starter collection or profiles linked"}
        </p>
      </td>
      <td className={td}>{row.playerCount}</td>
      <td className={td}>
        <StatusBadge status={row.active ? "ACTIVE" : "INACTIVE"} />
      </td>
      {canWrite && (
        <td className={`${td} align-top`}>
          {error && (
            <div className="mb-2 max-w-sm">
              <Notice tone="error">{error}</Notice>
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {editing ? (
              <>
                <button
                  type="button"
                  className={btn.primary}
                  disabled={busy || name.trim().length < 2}
                  aria-busy={busy}
                  onClick={() => patch({ name: name.trim(), description: description.trim() || null })}
                >
                  {busy ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className={btn.ghost}
                  disabled={busy}
                  onClick={() => {
                    setEditing(false);
                    setName(row.name);
                    setDescription(row.description ?? "");
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" className={btn.ghost} onClick={() => setEditing(true)}>
                  Edit
                </button>
                <button type="button" className={btn.ghost} onClick={() => setConfiguring((v) => !v)} aria-expanded={configuring}>
                  Music and software
                </button>
                <button
                  type="button"
                  className={btn.ghost}
                  disabled={busy}
                  aria-busy={busy}
                  onClick={() => patch({ active: !row.active })}
                >
                  {row.active ? "Deactivate" : "Activate"}
                </button>
              </>
            )}
          </div>
        </td>
      )}
    </tr>
    {configuring && canWrite && (
      <tr>
        <td colSpan={6} className="border-t border-neutral-100 bg-neutral-50 px-5 py-5 sm:px-6">
          <TypeSettings row={row} options={options} onDone={() => setConfiguring(false)} />
        </td>
      </tr>
    )}
    </>
  );
}

/**
 * What a type can do with music: whether it has a library at all (MIDI tools do not), the
 * software that runs it, the starter collection granted on activation, and the system
 * profiles that decide which arrangements are compatible.
 */
function TypeSettings({ row, options, onDone }: { row: PlayerTypeRow; options: PlayerTypeOptions; onDone: () => void }) {
  const router = useRouter();
  const id = useId();
  const [supportsMusicLibrary, setSupports] = useState(row.supportsMusicLibrary);
  const [softwareProductId, setSoftware] = useState(row.softwareProduct?.id ?? "");
  const [starterBundleId, setStarter] = useState(row.starterBundle?.id ?? "");
  const [profileIds, setProfileIds] = useState<string[]>(row.systemProfiles.map((p) => p.id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (pid: string) => setProfileIds((ids) => (ids.includes(pid) ? ids.filter((x) => x !== pid) : [...ids, pid]));

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await apiFetch(`/api/admin/shop/player-types/${row.id}`, {
        method: "PATCH",
        body: {
          supportsMusicLibrary,
          softwareProductId: softwareProductId || null,
          starterBundleId: supportsMusicLibrary ? starterBundleId || null : null,
          systemProfileIds: profileIds,
        },
      });
      onDone();
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" className="mt-1" checked={supportsMusicLibrary} onChange={(e) => setSupports(e.target.checked)} />
        <span>
          <span className="font-medium text-neutral-950">Can receive music</span>
          <span className="block text-neutral-600">
            Turn off for types without a music library, such as MIDI Mapper. Their players are never offered as a music target.
            {row.supportsMusicLibrary && !supportsMusicLibrary && " Existing licenses on these players are not removed."}
          </span>
        </span>
      </label>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Software product" htmlFor={`${id}-sw`} help="The software that runs this player, shown with its registration.">
          <select id={`${id}-sw`} className={inputClass} value={softwareProductId} onChange={(e) => setSoftware(e.target.value)}>
            <option value="">None</option>
            {options.softwareProducts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="Starter collection" htmlFor={`${id}-starter`} help="Licensed to a player of this type when it becomes active. No order is created.">
          <select id={`${id}-starter`} className={inputClass} value={starterBundleId} onChange={(e) => setStarter(e.target.value)} disabled={!supportsMusicLibrary}>
            <option value="">None</option>
            {options.bundles.map((b) => <option key={b.id} value={b.id}>{b.title} ({b.sku})</option>)}
          </select>
        </Field>
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-neutral-800">Compatible system profiles</legend>
        <p className="mt-0.5 text-xs text-neutral-500">Arrangements sharing a profile with this type, or marked generic, can be licensed to its players. None selected: every arrangement is allowed.</p>
        {options.systemProfiles.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">No system profiles exist yet. Add them under Compatibility.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {options.systemProfiles.map((sp) => (
              <li key={sp.id}>
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-0.5" checked={profileIds.includes(sp.id)} onChange={() => toggle(sp.id)} />
                  <span>
                    <span className="text-neutral-950">{sp.name}</span>
                    <span className="block text-xs text-neutral-500">
                      {[sp.manufacturer, sp.isGeneric ? "generic" : null, sp.active ? null : "inactive"].filter(Boolean).join(", ")}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="flex gap-2">
        <button type="button" className={btn.primary} disabled={busy} aria-busy={busy} onClick={save}>{busy ? "Saving…" : "Save settings"}</button>
        <button type="button" className={btn.ghost} disabled={busy} onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}

function CreateTypePanel() {
  const router = useRouter();
  const id = useId();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const valid = code.trim().length >= 2 && name.trim().length >= 2;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await apiFetch("/api/admin/shop/player-types", {
        body: { code: code.trim(), name: name.trim(), description: description.trim() || null },
      });
      setSuccess(`Added ${name.trim()}.`);
      setCode("");
      setName("");
      setDescription("");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Add a player type" description="The code is what stays stable; the name is what staff reads.">
      <form className="flex flex-col gap-5" onSubmit={submit} noValidate>
        {success && <Notice tone="success">{success}</Notice>}
        {error && <Notice tone="error">{error}</Notice>}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="Code" htmlFor={`${id}-code`} help="Stored uppercase, for example DMI_CLASSIC.">
            <input
              id={`${id}-code`}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={40}
              className={inputClass}
              autoComplete="off"
            />
          </Field>
          <Field label="Name" htmlFor={`${id}-name`}>
            <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} maxLength={120} className={inputClass} />
          </Field>
          <Field label="Description (optional)" htmlFor={`${id}-desc`}>
            <input
              id={`${id}-desc`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <button type="submit" className={btn.primary} disabled={!valid || busy} aria-busy={busy}>
            {busy ? "Adding…" : "Add type"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
