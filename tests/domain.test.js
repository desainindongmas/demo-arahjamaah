import test from "node:test";
import assert from "node:assert/strict";
import { seed, derive, mutate, paid, expire } from "../src/domain.js";
test("pending payment does not confirm a booking or alter paid balance", () => {
  const d = seed();
  assert.equal(paid(d, "b10"), 0);
  assert.equal(d.bookings[9].status, "RESERVED");
  mutate(d, "verifyPayment", { id: "pay10" }, "finance");
  assert.equal(d.bookings[9].status, "CONFIRMED");
  assert.equal(paid(d, "b10"), 5000000);
  assert.equal(d.openingCash, 90000000);
});
test("rejected payment never counts as verified DP", () => {
  const d = seed();
  mutate(d, "rejectPayment", { id: "pay10" }, "finance");
  assert.equal(paid(d, "b10"), 0);
  assert.equal(d.bookings[9].status, "RESERVED");
});
test("confirmed and held seats prevent overselling the last seat", () => {
  const d = seed();
  d.departures[0].capacity = 11;
  mutate(
    d,
    "booking",
    { name: "Jamaah Terakhir", departureId: "dep1" },
    "sales",
  );
  assert.throws(
    () =>
      mutate(d, "booking", { name: "Oversell", departureId: "dep1" }, "sales"),
    /Kapasitas penuh/,
  );
  assert.equal(derive(d).journeys[0].available, 0);
});
test("expired 48-hour hold releases its seat with audit trail", () => {
  const d = seed();
  d.bookings[9].holdUntil = Date.now() - 1;
  expire(d);
  assert.equal(d.bookings[9].status, "EXPIRED");
  assert.equal(derive(d).journeys[0].available, 3);
  assert.match(d.audit[0].action, /kedaluwarsa/);
});
test("overpayment remains credit and leaves invoice intact", () => {
  const d = seed();
  mutate(d, "payment", { bookingId: "b1", amount: 2000000 }, "finance");
  const p = d.payments[0];
  mutate(d, "verifyPayment", { id: p.id }, "finance");
  const b = derive(d).books[0];
  assert.equal(b.total, 32500000);
  assert.equal(b.outstanding, 0);
  assert.equal(b.credit, 2000000);
});
test("reversal preserves original transaction and recalculates paid total", () => {
  const d = seed();
  mutate(
    d,
    "reversePayment",
    { id: "pay1", reason: "Nominal salah" },
    "finance",
  );
  assert.equal(d.payments.find((p) => p.id === "pay1").reversed, true);
  assert.equal(paid(d, "b1"), 0);
  assert.match(d.audit[0].action, /Nominal salah/);
  assert.equal(d.bookings[0].status, "RESERVED");
});
test("fully paid booking with passport risk cannot get clearance", () => {
  const d = seed();
  assert.equal(paid(d, "b1"), 32500000);
  assert.equal(derive(d).journeys[0].status, "BLOCKED");
  assert.throws(
    () => mutate(d, "clearance", { id: "dep1" }, "ops"),
    /Final Clearance ditolak/,
  );
});
test("100 percent checklist with expired verified passport is still blocked", () => {
  const d = seed();
  d.bookings = d.bookings.filter((b) => b.id === "b1");
  d.people[0].docs = {
    passport: "VERIFIED",
    visa: "VERIFIED",
    photo: "VERIFIED",
  };
  d.bookings[0].room = "201";
  d.tasks = [];
  const j = derive(d).journeys[0];
  assert.equal(j.score, 100);
  assert.equal(j.status, "BLOCKED");
});
test("exception engine deduplicates and clears risk only from source data", () => {
  const d = seed();
  const before = derive(d).exceptions;
  assert.equal(new Set(before.map((e) => e.id)).size, before.length);
  mutate(
    d,
    "document",
    {
      personId: "p1",
      type: "passport",
      expiry: "2030-01-01",
      status: "VERIFIED",
    },
    "ops",
  );
  assert.ok(!derive(d).exceptions.some((e) => e.id === "b1-passport"));
  assert.ok(derive(d).exceptions.some((e) => e.id === "b1-room"));
});
test("positive projected profit does not hide cash shortfall", () => {
  const d = seed(),
    e = derive(d);
  assert.ok(e.projectedRevenue - e.projectedCost > 0);
  assert.ok(e.lowestCash < 0);
});
test("server rules enforce role permissions", () => {
  const d = seed();
  assert.throws(
    () => mutate(d, "verifyPayment", { id: "pay10" }, "ops"),
    /Akses peran/,
  );
  assert.throws(
    () =>
      mutate(
        d,
        "document",
        { personId: "p1", type: "visa", status: "VERIFIED" },
        "finance",
      ),
    /Akses peran/,
  );
});
test("lead conversion is traceable and duplicate conversion is rejected", () => {
  const d = seed();
  mutate(
    d,
    "booking",
    { leadId: "l3", name: "Hj. Yuni Kartika", departureId: "dep2" },
    "sales",
  );
  assert.equal(d.leads[2].status, "CONVERTED");
  assert.throws(
    () =>
      mutate(
        d,
        "booking",
        { leadId: "l3", name: "Hj. Yuni Kartika", departureId: "dep2" },
        "sales",
      ),
    /sudah dikonversi/,
  );
  assert.match(d.tasks[0].title, /Yuni/);
});
test("same person can travel again without duplicating identity", () => {
  const d = seed();
  mutate(d, "booking", { personId: "p1", departureId: "dep2" }, "sales");
  assert.equal(d.people.length, 24);
  assert.equal(d.bookings.filter((b) => b.personId === "p1").length, 2);
});
test("clearance succeeds only after payment, documents, room, and tasks are ready", () => {
  const d = seed();
  d.bookings = d.bookings.filter((b) => b.id === "b1");
  d.people[0].docs = {
    passport: "VERIFIED",
    visa: "VERIFIED",
    photo: "VERIFIED",
  };
  d.people[0].passportExpiry = "2030-01-01";
  d.bookings[0].room = "201";
  d.tasks = [];
  mutate(d, "clearance", { id: "dep1" }, "ops");
  assert.equal(d.departures[0].cleared, true);
});
test("supplier cannot be paid twice or above available cash", () => {
  const d = seed();
  assert.throws(
    () => mutate(d, "payCost", { id: "c1" }, "finance"),
    /tidak cukup/,
  );
  mutate(d, "payCost", { id: "c2" }, "finance");
  assert.equal(d.openingCash, 20000000);
  assert.throws(
    () => mutate(d, "payCost", { id: "c2" }, "finance"),
    /Sudah dibayar/,
  );
});

test("room assignment is scoped to booking, not reused across journeys", () => {
  const d = seed();
  mutate(d, "booking", { personId: "p1", departureId: "dep2" }, "sales");
  const b = d.bookings[0];
  assert.equal(b.room, "");
  mutate(d, "room", { bookingId: b.id, room: "Istanbul 201" }, "ops");
  assert.equal(b.room, "Istanbul 201");
  assert.equal(d.bookings.find((x) => x.id === "b1").room, "");
});
test("cancellation releases capacity and preserves payment as refundable credit", () => {
  const d = seed();
  mutate(d, "cancelBooking", { id: "b1", reason: "Jadwal berubah" }, "finance");
  const b = derive(d).books.find((b) => b.id === "b1");
  assert.equal(b.status, "CANCELLED");
  assert.equal(b.total, 32500000);
  assert.equal(b.credit, 32500000);
  assert.equal(b.outstanding, 0);
  assert.equal(derive(d).journeys[0].available, 3);
  assert.equal(d.payments.find((p) => p.id === "pay1").status, "VERIFIED");
});
test("refund uses available credit, reduces cash, and keeps original ledger", () => {
  const d = seed();
  mutate(d, "cancelBooking", { id: "b1", reason: "Batal" }, "finance");
  mutate(
    d,
    "refund",
    { bookingId: "b1", amount: 32500000, reason: "Transfer kembali" },
    "finance",
  );
  assert.equal(d.openingCash, 52500000);
  assert.equal(derive(d).books[0].credit, 0);
  assert.equal(derive(d).books[0].refunded, 32500000);
  assert.equal(d.refunds.length, 1);
  assert.throws(
    () =>
      mutate(
        d,
        "refund",
        { bookingId: "b1", amount: 1, reason: "Ulang" },
        "finance",
      ),
    /melebihi credit/,
  );
});
test("uploaded document moves to review and requires separate verification", () => {
  const d = seed();
  mutate(
    d,
    "uploadDocument",
    {
      personId: "p2",
      type: "visa",
      file: {
        name: "dummy.pdf",
        mime: "application/pdf",
        base64: Buffer.from("%PDF-1.4 dummy").toString("base64"),
      },
    },
    "ops",
  );
  assert.equal(d.people[1].docs.visa, "REVIEW");
  assert.equal(d.people[1].files.visa.name, "dummy.pdf");
  assert.ok(derive(d).exceptions.some((e) => e.id === "b2-visa"));
  assert.throws(
    () =>
      mutate(
        d,
        "uploadDocument",
        {
          personId: "p2",
          type: "visa",
          file: {
            name: "fake.pdf",
            mime: "application/pdf",
            base64: Buffer.from("not pdf").toString("base64"),
          },
        },
        "ops",
      ),
    /tidak sesuai/,
  );
});
test("commercial qualification remains provisional without TTM and never invents official prices", () => {
  const d = seed();
  mutate(
    d,
    "qualification",
    {
      organization: "Travel Baru",
      active: "80",
      departures: "2",
      users: "3",
      branches: "1",
      module: "UMRAH_OPERATIONS",
    },
    "owner",
  );
  assert.equal(d.qualifications[0].plan, "MITRA");
  assert.equal(d.qualifications[0].provisional, true);
  assert.equal(d.qualifications[0].officialPrice, null);
  mutate(
    d,
    "qualification",
    { organization: "KBIHU", module: "HAJJ_GUIDANCE", active: "50" },
    "owner",
  );
  assert.equal(d.qualifications[0].manualReview, true);
  assert.equal(d.qualifications[0].plan, "BELUM TERSEDIA");
});
