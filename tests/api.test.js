import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
let server;
const base = "http://127.0.0.1:3001";
const directory = mkdtempSync(join(tmpdir(), "arah-api-"));
const request = (path, body, headers = {}) =>
  fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...headers },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
before(async () => {
  server = spawn(process.execPath, ["server.js"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: "3001",
      DB_PATH: join(directory, "test.sqlite"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    let log = "";
    server.stdout.on("data", (chunk) => {
      log += chunk;
      if (log.includes("berjalan")) resolve();
    });
    server.on("error", reject);
    server.on("exit", (code) => reject(Error("Test server exited " + code)));
    setTimeout(
      () => reject(Error("Test server did not become ready")),
      10000,
    ).unref();
  });
});
after(() => {
  server?.kill();
  rmSync(directory, { recursive: true, force: true });
});
test("API rejects cross-tenant reads and mutations", async () => {
  assert.equal(
    (await request("/api/state", null, { "x-demo-tenant": "org2" })).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/api/action",
        { action: "lead", data: { name: "Forbidden" } },
        { "x-demo-tenant": "org2" },
      )
    ).status,
    403,
  );
});
test("API filters finance data and rejects unauthorized financial mutations", async () => {
  const r = await request("/api/state", null, { "x-demo-role": "ops" }),
    d = await r.json();
  assert.equal(d.openingCash, undefined);
  assert.deepEqual(d.payments, []);
  assert.deepEqual(d.costs, []);
  assert.equal(d.engine.projectedRevenue, undefined);
  assert.equal(d.engine.books[0].total, undefined);
  assert.equal(
    (
      await request(
        "/api/action",
        { action: "verifyPayment", data: { id: "pay10" } },
        { "x-demo-role": "ops" },
      )
    ).status,
    400,
  );
});
test("concurrent last-seat reservations are atomic; only two of three succeed", async () => {
  await request("/api/reset", {});
  const responses = await Promise.all(
    [1, 2, 3].map((i) =>
      request(
        "/api/action",
        {
          action: "booking",
          data: { name: "Concurrent " + i, departureId: "dep1" },
        },
        { "x-demo-role": "sales" },
      ),
    ),
  );
  assert.equal(responses.filter((r) => r.ok).length, 2);
  assert.equal(responses.filter((r) => r.status === 400).length, 1);
  const d = await (await request("/api/state")).json();
  assert.equal(d.engine.journeys[0].available, 0);
  assert.equal(d.engine.journeys[0].booked, 12);
});
test("failed mutation rolls back without changing persisted state", async () => {
  await request("/api/reset", {});
  const a = await (await request("/api/state")).json();
  await request("/api/action", {
    action: "refund",
    data: { bookingId: "b1", amount: 50000000, reason: "Invalid" },
  });
  const b = await (await request("/api/state")).json();
  assert.equal(b.openingCash, a.openingCash);
  assert.equal(b.audit.length, a.audit.length);
});
