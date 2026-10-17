import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getStore } from "@netlify/blobs";
import { startBlobsFixture } from "./helpers/blobs-fixture.mjs";
import { handleNetlifyRequest } from "../src/netlify-api.js";
import { seed } from "../src/domain.js";
function memoryStore(initial = seed()) {
  let data = structuredClone(initial),
    version = 1,
    conflicts = 0;
  return {
    get data() {
      return data;
    },
    get conflicts() {
      return conflicts;
    },
    async getWithMetadata() {
      await Promise.resolve();
      return { data: structuredClone(data), etag: String(version) };
    },
    async setJSON(key, next, options) {
      await Promise.resolve();
      if (options.onlyIfNew || options.onlyIfMatch !== String(version)) {
        conflicts++;
        return { modified: false };
      }
      data = structuredClone(next);
      return { modified: true, etag: String(++version) };
    },
  };
}
const request = (path, body, role = "owner", tenant = "org1") =>
  new Request("https://demo.example/api/" + path, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      "x-demo-role": role,
      "x-demo-tenant": tenant,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const run = (store, path, body, role, tenant) =>
  handleNetlifyRequest(request(path, body, role, tenant), () => store);
test("Netlify native request uses same domain behavior and financial visibility", async () => {
  const s = memoryStore();
  let r = await run(s, "state", null, "ops");
  const d = await r.json();
  assert.equal(d.demo, true);
  assert.equal(d.openingCash, undefined);
  assert.deepEqual(d.payments, []);
  assert.equal(r.headers.get("Cache-Control"), "no-store");
  r = await run(
    s,
    "action",
    { action: "verifyPayment", data: { id: "pay10" } },
    "finance",
  );
  assert.equal(r.status, 200);
  assert.equal(s.data.bookings[9].status, "CONFIRMED");
  assert.equal(s.data.openingCash, 90000000);
});
test("Netlify conditional transactions retry competing last-seat reservations", async () => {
  const s = memoryStore();
  s.data.departures[0].capacity = 11;
  const responses = await Promise.all(
    [1, 2].map((i) =>
      run(
        s,
        "action",
        {
          action: "booking",
          data: { name: "Concurrent " + i, departureId: "dep1" },
        },
        "sales",
      ),
    ),
  );
  assert.equal(responses.filter((r) => r.status === 200).length, 1);
  assert.equal(responses.filter((r) => r.status === 400).length, 1);
  assert.ok(s.conflicts > 0);
  assert.equal(
    s.data.bookings.filter((b) => b.departureId === "dep1").length,
    11,
  );
});
test("Netlify rejects cross-tenant access, unknown methods, and unauthorized reset", async () => {
  const s = memoryStore();
  assert.equal((await run(s, "state", null, "owner", "org2")).status, 403);
  assert.equal((await run(s, "reset", {}, "ops")).status, 403);
  assert.equal((await run(s, "unknown")).status, 404);
  assert.equal((await run(s, "action")).status, 405);
});
test("expired holds are conditionally persisted, normal GETs do not mutate storage", async () => {
  const s = memoryStore();
  s.data.bookings[9].holdUntil = Date.now() - 1;
  const d = await (await run(s, "state")).json();
  assert.equal(d.bookings[9].status, "EXPIRED");
  assert.equal(s.data.bookings[9].status, "EXPIRED");
  const audit = s.data.audit.length;
  await run(s, "state");
  assert.equal(s.data.audit.length, audit);
});
test("failed Netlify mutation leaves persisted state unchanged", async () => {
  const s = memoryStore();
  const before = JSON.stringify(s.data);
  const r = await run(
    s,
    "action",
    { action: "payCost", data: { id: "c1" } },
    "finance",
  );
  assert.equal(r.status, 400);
  assert.equal(JSON.stringify(s.data), before);
});
test("persistent write conflicts return 409 instead of blind overwrites", async () => {
  const s = memoryStore();
  s.setJSON = async () => ({ modified: false });
  const r = await run(
    s,
    "action",
    { action: "lead", data: { name: "Conflict" } },
    "sales",
  );
  assert.equal(r.status, 409);
  assert.equal(s.data.leads.length, 4);
});
test("missing Netlify binding returns actionable 503 without exposing internals", async () => {
  const r = await handleNetlifyRequest(request("state"), () => {
    throw Error("secret-value");
  });
  assert.equal(r.status, 503);
  assert.ok(!(await r.text()).includes("secret-value"));
});
let blobs, store;
before(async () => {
  blobs = await startBlobsFixture();
  store = getStore({
    name: "arah-test",
    siteID: "local-site",
    token: "local-test-token",
    edgeURL: blobs.url,
    uncachedEdgeURL: blobs.url,
    consistency: "strong",
  });
});
after(async () => {
  await blobs?.stop();
});
test("official Blobs SDK persists state and rejects stale ETags against HTTP contract fixture", async () => {
  const r = await run(
    store,
    "action",
    { action: "lead", data: { name: "Persisted in Blobs" } },
    "sales",
  );
  assert.equal(r.status, 200);
  const a = await store.getWithMetadata("workspace-org1", { type: "json" });
  assert.equal(a.data.leads[0].name, "Persisted in Blobs");
  const next = structuredClone(a.data);
  next.leads[0].name = "Updated";
  assert.equal(
    (await store.setJSON("workspace-org1", next, { onlyIfMatch: a.etag }))
      .modified,
    true,
  );
  assert.equal(
    (await store.setJSON("workspace-org1", a.data, { onlyIfMatch: a.etag }))
      .modified,
    false,
  );
  const d = await (await run(store, "state")).json();
  assert.equal(d.leads[0].name, "Updated");
});
