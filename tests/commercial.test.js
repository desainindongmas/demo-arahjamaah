import test from "node:test";
import assert from "node:assert/strict";
import { qualifyNeeds, createSubscriptionOrder } from "../src/commercial.js";
import { seed, mutate } from "../src/domain.js";
import { viewState } from "../src/view-state.js";
const needs = {
  organization: "Safa Amanah Travel (Demo)",
  organizationType: "PPIU",
  module: "UMRAH_OPERATIONS",
  hasHistory: "yes",
  ttm: "280",
  active: "80",
  departures: "4",
  users: "8",
  branches: "1",
};
const order = () => ({
  requestId: crypto.randomUUID(),
  needs,
  contact: {
    name: "Rina Contoh",
    email: "rina@example.com",
    phone: "081200001234",
    note: "Data dummy",
  },
  consent: true,
});
test("calculator uses actual TTM instead of inventing annual volume", () => {
  const r = qualifyNeeds(needs);
  assert.equal(r.plan, "STARTER");
  assert.equal(r.volume, 280);
  assert.equal(r.provisional, false);
  assert.equal(r.officialPrice, null);
  assert.equal(r.quoteValidDays, 14);
  assert.equal(r.initialLockDays, 90);
});
test("new travel uses active volume and is explicitly provisional", () => {
  const r = qualifyNeeds({
    ...needs,
    hasHistory: "no",
    ttm: "999999",
    active: 40,
    departures: 2,
    users: 3,
  });
  assert.equal(r.volume, 40);
  assert.equal(r.basis, "ACTIVE");
  assert.equal(r.provisional, true);
  assert.equal(r.plan, "MITRA");
});
test("zero verified TTM remains zero and does not fall back to active people", () => {
  const r = qualifyNeeds({
    ...needs,
    ttm: 0,
    active: 999,
    departures: 1,
    users: 1,
  });
  assert.equal(r.volume, 0);
  assert.equal(r.provisional, false);
  assert.equal(r.plan, "MITRA");
});
test("illustrative recommendation covers users and departures as well as volume", () => {
  assert.equal(
    qualifyNeeds({ ...needs, ttm: 20, users: 20, departures: 1 }).plan,
    "GROWTH",
  );
  assert.equal(
    qualifyNeeds({ ...needs, ttm: 20, users: 3, departures: 20 }).plan,
    "SCALE",
  );
});
test("network complexity and volumes beyond published examples require review", () => {
  for (const patch of [
    { branches: 2 },
    { users: 51 },
    { departures: 31 },
    { ttm: 3001 },
  ]) {
    const r = qualifyNeeds({ ...needs, ...patch });
    assert.equal(r.plan, "NETWORK");
    assert.equal(r.manualReview, true);
  }
});
test("future modules cannot become live subscriptions through qualification", () => {
  for (const module of ["HAJJ_SPECIAL", "HAJJ_GUIDANCE"]) {
    const r = qualifyNeeds({ ...needs, module });
    assert.equal(r.available, false);
    assert.equal(r.plan, "BELUM TERSEDIA");
    assert.equal(r.manualReview, true);
  }
});
test("invalid integers and missing identity are rejected", () => {
  for (const patch of [
    { organization: "" },
    { users: 0 },
    { branches: 0 },
    { active: -1 },
    { departures: 1.5 },
    { ttm: "" },
    { ttm: Infinity },
  ])
    assert.throws(() => qualifyNeeds({ ...needs, ...patch }));
});
test("calculation does not mutate booking, ledger, cash, or audit", () => {
  const db = seed();
  db.bookings[9].holdUntil = 0;
  const before = JSON.stringify(db);
  const r = mutate(db, "calculateNeeds", needs, "ops");
  assert.equal(r.plan, "STARTER");
  assert.equal(JSON.stringify(db), before);
});
test("server recomputes subscription requests and ignores forged plan or amount", () => {
  const db = seed(),
    input = order();
  input.plan = "SCALE";
  input.amount = 1;
  const result = mutate(db, "subscriptionOrder", input, "sales");
  assert.equal(result.plan, "STARTER");
  assert.equal(result.officialPrice, null);
  assert.equal(result.paymentStatus, "NOT_REQUESTED");
  assert.equal(result.status, "REQUESTED_DEMO");
  assert.equal(db.subscriptionOrders.length, 1);
  assert.equal(db.audit[0].actor, "Pengunjung demo");
});
test("subscription consent and valid dummy contact are required", () => {
  for (const patch of [
    { consent: false },
    { contact: { name: "Rina", email: "invalid", phone: "081200001234" } },
    { contact: { name: "Rina", email: "rina@example.com", phone: "abc" } },
  ])
    assert.throws(() =>
      createSubscriptionOrder(seed(), { ...order(), ...patch }),
    );
});
test("same request id is idempotent, while changed contents are rejected", () => {
  const db = seed(),
    input = order();
  const a = createSubscriptionOrder(db, input),
    b = createSubscriptionOrder(db, input);
  assert.equal(a.reference, b.reference);
  assert.equal(db.subscriptionOrders.length, 1);
  assert.equal(db.audit.length, 3);
  assert.throws(
    () =>
      createSubscriptionOrder(db, {
        ...input,
        contact: { ...input.contact, name: "Berbeda" },
      }),
    /data berbeda/,
  );
});
test("roadmap interests and network requests retain their review status", () => {
  assert.equal(
    createSubscriptionOrder(seed(), {
      ...order(),
      needs: { ...needs, module: "HAJJ_GUIDANCE" },
    }).status,
    "WAITLIST_DEMO",
  );
  assert.equal(
    createSubscriptionOrder(seed(), {
      ...order(),
      needs: { ...needs, branches: 3 },
    }).status,
    "MANUAL_REVIEW_DEMO",
  );
});
test("shared workspace never exposes visitor order contacts", () => {
  const db = seed();
  createSubscriptionOrder(db, order());
  for (const role of ["owner", "ops", "finance", "sales", "admin"])
    assert.equal(viewState(db, role).subscriptionOrders, undefined);
});
