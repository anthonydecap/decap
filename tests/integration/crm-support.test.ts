import { beforeEach, describe, expect, it } from "vitest";
import { POST as createTicketPOST } from "@/app/api/shop/support/route";
import { GET as attachmentGET } from "@/app/api/shop/support/attachments/[id]/route";
import { POST as staffMessagePOST } from "@/app/api/admin/shop/support/[id]/messages/route";
import { PATCH as ticketPATCH } from "@/app/api/admin/shop/support/[id]/route";
import { POST as invitePOST } from "@/app/api/admin/shop/staff/invites/route";
import { POST as notePOST } from "@/app/api/admin/shop/customers/[id]/notes/route";
import { shopDb } from "@/modules/shop/db";
import { addToCart } from "@/modules/shop/services/cart";
import { prepareCheckout } from "@/modules/shop/services/checkout";
import { addNote, createTask, searchCrmCustomers, setCustomerTags, saveCustomerTag, customerOverview } from "@/modules/shop/services/crm-admin";
import { listActivity } from "@/modules/shop/services/crm";
import { setEmailProvider, type EmailMessage } from "@/modules/shop/services/email";
import { saveProfile } from "@/modules/shop/services/profile";
import { acceptStaffInvite, createStaffInvite, describeInvite } from "@/modules/shop/services/staff";
import { createTicket, customerReply, getCustomerTicket, staffMessage, updateTicket } from "@/modules/shop/services/support";
import { checkoutReadiness, requireStaff } from "@/modules/shop/auth/session";
import { fakeStripe, makeArrangement, makeBuyer, makeCustomer, makeStaff, resetDb, signInAs, useMemoryStorage } from "../helpers/fixtures";
import type { MemoryStorageService } from "@/modules/shop/storage/memory";

let storage: MemoryStorageService;
let sent: EmailMessage[];
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
const png = () => new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])], "screen.png", { type: "image/png" });

function multipart(url: string, payload: object, files: File[] = []) {
  const fd = new FormData();
  fd.set("payload", JSON.stringify(payload));
  for (const f of files) fd.append("files", f);
  return new Request(url, { method: "POST", body: fd });
}

async function playerFor(customerId: string, code: string) {
  const db = shopDb();
  const type = await db.playerType.upsert({ where: { code: "CLASSIC" }, create: { code: "CLASSIC", name: "DMI Classic" }, update: {} });
  return db.registeredPlayer.create({
    data: { customerId, playerTypeId: type.id, registrationCode: code, registrationIdentifier: code, status: "ACTIVE", serialNumber: `SN-${code.slice(-4)}` },
  });
}

beforeEach(async () => {
  await resetDb();
  storage = useMemoryStorage();
  fakeStripe();
  signInAs(null);
  sent = [];
  setEmailProvider({ send: async (m) => { sent.push(m); } });
});

describe("profile and billing snapshot", () => {
  it("requires a complete billing profile before checkout", async () => {
    const { customer } = await makeCustomer();
    await shopDb().customerAddress.deleteMany({ where: { customerId: customer.id } });
    expect(await checkoutReadiness(customer)).toEqual({ ready: false, reason: "ONBOARDING_REQUIRED" });
  });

  it("keeps the order's billing details when the customer later moves", async () => {
    const { customer } = await makeBuyer();
    const { arrangement } = await makeArrangement({ priceCents: 1000, storage });
    await saveProfile(customer, {
      accountType: "BUSINESS", firstName: "Maren", lastName: "Holtz", phone: "+32 2 555 01 01", companyName: "Holtz Automaten BV",
      companyRegistrationNumber: "0755.123.456", vatNumber: "BE0755123456", vatCountryCode: "BE", preferredLanguage: "en", marketingConsent: false,
      billingAddress: { name: null, companyName: null, addressLine1: "Kaai 3", addressLine2: null, postalCode: "9000", city: "Gent", stateOrProvince: null, countryCode: "BE" },
    }, { type: "CUSTOMER" });
    const fresh = await shopDb().customer.findUniqueOrThrow({ where: { id: customer.id } });
    await addToCart({ customerId: customer.id, anonymousToken: null }, { type: "ARRANGEMENT", arrangementId: arrangement.id });
    const prepared = await prepareCheckout(fresh);

    await saveProfile(fresh, {
      accountType: "BUSINESS", firstName: "Maren", lastName: "Holtz", phone: null, companyName: "Holtz Automaten BV",
      companyRegistrationNumber: null, vatNumber: "BE0755123456", vatCountryCode: "BE", preferredLanguage: "en", marketingConsent: true,
      billingAddress: { name: null, companyName: null, addressLine1: "Nieuwstraat 99", addressLine2: null, postalCode: "1000", city: "Brussel", stateOrProvince: null, countryCode: "BE" },
    }, { type: "CUSTOMER" });

    const snap = await shopDb().orderBillingSnapshot.findUniqueOrThrow({ where: { orderId: prepared.orderId } });
    expect(snap).toMatchObject({ companyName: "Holtz Automaten BV", vatNumber: "BE0755123456", addressLine1: "Kaai 3", city: "Gent" });
    const after = await shopDb().customer.findUniqueOrThrow({ where: { id: customer.id } });
    expect(after.marketingConsent).toBe(true);
    expect(after.marketingConsentAt).not.toBeNull();
    expect((await listActivity(customer.id)).map((a) => a.type)).toContain("profile.billing_updated");
  });
});

describe("support tickets: customer isolation", () => {
  it("only lets a customer link their own player, order and arrangement", async () => {
    const me = await makeCustomer();
    const other = await makeCustomer();
    const theirPlayer = await playerFor(other.customer.id, "AAAA1111BBBB");
    signInAs(me.session);
    const res = await createTicketPOST(multipart("http://localhost:3000/api/shop/support", {
      subject: "My player will not start", category: "PLAYER_PROBLEM", registeredPlayerId: theirPlayer.id, message: "It stays dark after power on.",
    }), ctx(""));
    expect(res.status).toBe(422);
    expect(await shopDb().supportTicket.count()).toBe(0);
  });

  it("creates a ticket with attachment, number and WAITING_FOR_SUPPORT, and emails the customer", async () => {
    const me = await makeCustomer();
    const player = await playerFor(me.customer.id, "CCCC2222DDDD");
    signInAs(me.session);
    const res = await createTicketPOST(multipart("http://localhost:3000/api/shop/support", {
      subject: "Registration code", category: "PLAYER_REGISTRATION", registeredPlayerId: player.id, message: "Here is the code from the screen.",
    }, [png()]), ctx(""));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.ticketNumber).toMatch(/^SUP-\d+$/);
    expect(body.status).toBe("WAITING_FOR_SUPPORT");
    const att = await shopDb().supportAttachment.findFirstOrThrow();
    expect(att.storageKey).toMatch(/^support\/attachment\//); // separate private namespace
    expect(sent.at(-1)!.subject).toContain(body.ticketNumber);
    expect(sent.at(-1)!.actionUrl).toContain(`/shop/account/support/${body.id}`);
  });

  it("refuses files that are not on the allowlist", async () => {
    const me = await makeCustomer();
    signInAs(me.session);
    const exe = new File([new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0])], "invoice.pdf", { type: "application/pdf" });
    const res = await createTicketPOST(multipart("http://localhost:3000/api/shop/support", {
      subject: "Invoice question", category: "BILLING", message: "See attached file please.",
    }, [exe]), ctx(""));
    expect(res.status).toBe(422);
    expect(await shopDb().supportTicket.count()).toBe(0);
  });

  it("never shows internal notes or their attachments to the customer, and isolates customers", async () => {
    const me = await makeCustomer();
    const other = await makeCustomer();
    const { staff } = await makeStaff("SUPPORT");
    const t = await createTicket(me.customer, { subject: "Music skips", category: "MUSIC_PLAYBACK", message: "Track 3 skips at 1:20." });

    await staffMessage({ staffId: staff.id }, t.id, { message: "Customer is on firmware 2.1, known bug.", visibility: "INTERNAL" }, [png()]);
    await staffMessage({ staffId: staff.id }, t.id, { message: "Which firmware version do you have?", visibility: "PUBLIC", nextStatus: "WAITING_FOR_CUSTOMER" });

    const view = (await getCustomerTicket(me.customer.id, t.id))!;
    expect(view.status).toBe("WAITING_FOR_CUSTOMER");
    expect(view.messages.map((m) => m.body)).toEqual(["Track 3 skips at 1:20.", "Which firmware version do you have?"]);
    expect(JSON.stringify(view)).not.toContain("known bug");

    const internalAttachment = await shopDb().supportAttachment.findFirstOrThrow();
    signInAs(me.session);
    expect((await attachmentGET(new Request("http://x"), ctx(internalAttachment.id))).status).toBe(404);

    expect(await getCustomerTicket(other.customer.id, t.id)).toBeNull();
    await expect(customerReply(other.customer, t.id, "hello")).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("follows the status automation and reopening rules", async () => {
    const me = await makeCustomer();
    const { staff } = await makeStaff("SUPPORT");
    const t = await createTicket(me.customer, { subject: "Download", category: "MUSIC_DOWNLOAD", message: "Nothing arrives on the player." });

    await staffMessage({ staffId: staff.id }, t.id, { message: "Looking into it.", visibility: "PUBLIC" });
    let row = await shopDb().supportTicket.findUniqueOrThrow({ where: { id: t.id } });
    expect(row).toMatchObject({ status: "IN_PROGRESS", assignedStaffId: staff.id });
    expect(row.firstResponseAt).not.toBeNull();

    await customerReply(me.customer, t.id, "Any news?");
    expect((await shopDb().supportTicket.findUniqueOrThrow({ where: { id: t.id } })).status).toBe("WAITING_FOR_SUPPORT");

    await staffMessage({ staffId: staff.id }, t.id, { message: "Fixed on our side.", visibility: "PUBLIC", nextStatus: "RESOLVED" });
    expect(sent.at(-1)!.subject).toContain("resolved");
    await customerReply(me.customer, t.id, "Still broken, sorry.");
    row = await shopDb().supportTicket.findUniqueOrThrow({ where: { id: t.id } });
    expect(row.status).toBe("WAITING_FOR_SUPPORT"); // reopened
    expect(row.resolvedAt).toBeNull();

    await updateTicket({ staffId: staff.id }, t.id, { status: "CLOSED" });
    await expect(customerReply(me.customer, t.id, "One more thing")).rejects.toMatchObject({ code: "INVALID_STATE" });
    const types = (await listActivity(me.customer.id)).map((a) => a.type);
    expect(types).toEqual(expect.arrayContaining(["support.ticket_created", "support.staff_replied", "support.ticket_resolved", "support.ticket_reopened", "support.ticket_updated"]));
  });
});

describe("support and CRM: staff permissions", () => {
  it("lets SUPPORT reply but only assigners assign, and keeps catalog managers out", async () => {
    const me = await makeCustomer();
    const t = await createTicket(me.customer, { subject: "Account", category: "ACCOUNT", message: "Please change my email." });
    const catalog = await makeStaff("CATALOG_MANAGER");
    signInAs(catalog.session);
    expect((await staffMessagePOST(multipart("http://x", { message: "hi", visibility: "PUBLIC" }), ctx(t.id))).status).toBe(403);
    expect((await notePOST(new Request("http://x", { method: "POST", body: JSON.stringify({ body: "note" }) }), ctx(me.customer.id))).status).toBe(403);

    const finance = await makeStaff("FINANCE");
    signInAs(finance.session);
    const assign = await ticketPATCH(new Request("http://x", { method: "PATCH", body: JSON.stringify({ assignedStaffId: finance.staff.id }) }), ctx(t.id));
    expect(assign.status).toBe(403);

    const support = await makeStaff("SUPPORT");
    signInAs(support.session);
    const ok = await ticketPATCH(new Request("http://x", { method: "PATCH", body: JSON.stringify({ assignedStaffId: support.staff.id, priority: "HIGH" }) }), ctx(t.id));
    expect(ok.status).toBe(200);
    const sys = await shopDb().supportMessage.findFirstOrThrow({ where: { ticketId: t.id, authorType: "SYSTEM" } });
    expect(sys.visibility).toBe("INTERNAL");
  });

  it("finds the right customer from a registration code, serial or SUP number", async () => {
    const me = await makeCustomer();
    await makeCustomer();
    await playerFor(me.customer.id, "A8F273KD91PL");
    const t = await createTicket(me.customer, { subject: "Hello", category: "OTHER", message: "Just a question." });
    for (const q of ["A8F2-73KD-91PL", "SN-91PL", `SUP-${t.number}`]) {
      const r = await searchCrmCustomers({ q });
      expect(r.items.map((c) => c.id)).toEqual([me.customer.id]);
    }
    expect((await searchCrmCustomers({ view: "with_players" })).items.map((c) => c.id)).toEqual([me.customer.id]);
  });

  it("shows alert tags and the next task on the overview", async () => {
    const me = await makeCustomer();
    const { staff } = await makeStaff("ADMIN");
    const s = { staffId: staff.id };
    const alert = await saveCustomerTag(s, null, { name: "Special player configuration", description: null, isAlert: true });
    const vip = await saveCustomerTag(s, null, { name: "VIP", description: null, isAlert: false });
    await setCustomerTags(s, me.customer.id, [alert.id, vip.id]);
    await addNote(s, me.customer.id, "Prefers phone calls in the morning.");
    await createTask(s, me.customer.id, { title: "Call back about firmware", description: null, status: "OPEN", priority: "HIGH", dueAt: new Date(Date.now() + 86400000) });
    const o = (await customerOverview(me.customer.id))!;
    expect(o.alerts.map((a) => a.name)).toEqual(["Special player configuration"]);
    expect(o.metrics.nextTask?.title).toBe("Call back about firmware");
    expect(o.metrics.nextTask?.assignedStaffId).toBe(staff.id);
  });
});

describe("staff invitations", () => {
  it("only SUPER_ADMIN can invite, and only the invited verified email can accept", async () => {
    const admin = await makeStaff("ADMIN");
    signInAs(admin.session);
    expect((await invitePOST(new Request("http://x", { method: "POST", body: JSON.stringify({ email: "lena@dmi.test", role: "SUPPORT" }) }), ctx(""))).status).toBe(403);

    const root = await makeStaff("SUPER_ADMIN");
    const { link } = await createStaffInvite({ actorStaffId: root.staff.id, email: "Lena@dmi.test", role: "SUPPORT" });
    const token = link.split("/").pop()!;
    expect(await describeInvite(token)).toMatchObject({ email: "lena@dmi.test", role: "SUPPORT" });
    expect(sent.at(-1)!.to).toBe("lena@dmi.test");
    expect(await shopDb().staffInvite.findFirst({ where: { tokenHash: token } })).toBeNull(); // only the hash is stored

    await expect(acceptStaffInvite({ token, authSubject: "auth0|wrong", email: "someone@else.test", emailVerified: true }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(acceptStaffInvite({ token, authSubject: "auth0|lena", email: "lena@dmi.test", emailVerified: false }))
      .rejects.toMatchObject({ code: "FORBIDDEN" });
    const staff = await acceptStaffInvite({ token, authSubject: "auth0|lena", email: "lena@dmi.test", emailVerified: true, name: "Lena Moreau" });
    expect(staff).toMatchObject({ role: "SUPPORT", status: "ACTIVE", createdByStaffId: root.staff.id });
    await expect(acceptStaffInvite({ token, authSubject: "auth0|lena2", email: "lena@dmi.test", emailVerified: true })).rejects.toMatchObject({ code: "NOT_FOUND" });

    signInAs({ sub: "auth0|lena", email: "lena@dmi.test", email_verified: true });
    await expect(requireStaff("support:reply")).resolves.toBeTruthy();
    await expect(requireStaff("staff:manage")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("task updates", () => {
  it("only change the fields that are sent", async () => {
    const me = await makeCustomer();
    const { staff } = await makeStaff("SUPPORT");
    const { taskPatchSchema } = await import("@/modules/shop/schemas");
    const { updateTask } = await import("@/modules/shop/services/crm-admin");
    const task = await createTask({ staffId: staff.id }, me.customer.id, {
      title: "Send service sheet", description: "PDF from the workshop", status: "IN_PROGRESS", priority: "URGENT",
    });
    const done = await updateTask({ staffId: staff.id }, task.id, taskPatchSchema.parse({ status: "DONE" }));
    expect(done).toMatchObject({ status: "DONE", priority: "URGENT", description: "PDF from the workshop", title: "Send service sheet" });
    expect(done.completedAt).not.toBeNull();
    const renamed = await updateTask({ staffId: staff.id }, task.id, taskPatchSchema.parse({ title: "Send service sheet v2" }));
    expect(renamed).toMatchObject({ status: "DONE", priority: "URGENT" });
    expect(renamed.completedAt).not.toBeNull();
  });
});
