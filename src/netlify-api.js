import { seed, expire, mutate } from "./domain.js";
import { viewState } from "./view-state.js";

const roles = new Set(["owner", "admin", "ops", "finance", "sales"]);
const key = "workspace-org1";
const response = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

class ConflictError extends Error {}

// Strong reads + conditional writes preserve capacity and ledger invariants
// across independent serverless invocations. Never fall back to blind writes.
async function load(store) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const current = await store.getWithMetadata(key, {
      type: "json",
      consistency: "strong",
    });
    if (current) {
      if (!current.etag) throw Error("Missing storage version");
      return current;
    }
    const data = seed();
    const created = await store.setJSON(key, data, { onlyIfNew: true });
    if (created.modified && created.etag) return { data, etag: created.etag };
  }
  throw new ConflictError("Workspace sedang sibuk. Silakan coba lagi.");
}

async function transaction(store, update) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, etag } = await load(store);
    const result = update(data);
    if (JSON.stringify(data).length > 4000000)
      throw Error(
        "Batas penyimpanan berkas demo tercapai. Gunakan berkas dummy yang lebih kecil.",
      );
    const saved = await store.setJSON(key, data, { onlyIfMatch: etag });
    if (saved.modified) {
      if (!saved.etag) throw Error("Missing storage version");
      return result;
    }
  }
  throw new ConflictError("Data baru saja berubah. Silakan ulangi tindakan.");
}

export async function handleNetlifyRequest(request, getStore, notifyPilot = null) {
  const role = request.headers.get("x-demo-role") || "owner";
  const tenant = request.headers.get("x-demo-tenant") || "org1";
  if (!roles.has(role)) return response({ error: "Peran tidak dikenal." }, 403);
  if (tenant !== "org1")
    return response(
      { error: "Workspace tidak diizinkan dalam sesi demo ini." },
      403,
    );
  const path = new URL(request.url).pathname.replace(
    /^\/(?:api|\.netlify\/functions\/api)\/?/,
    "",
  );
  if (!["state", "action", "reset"].includes(path))
    return response({ error: "Endpoint tidak ditemukan." }, 404);
  if (request.method !== (path === "state" ? "GET" : "POST"))
    return response({ error: "Metode tidak diizinkan." }, 405);
  if (path === "reset" && role !== "owner")
    return response({ error: "Hanya Owner dapat mereset demo." }, 403);

  let input;
  if (path === "action") {
    const text = await request.text();
    if (text.length > 1000000)
      return response({ error: "Berkas permintaan terlalu besar." }, 413);
    try {
      input = JSON.parse(text);
    } catch {
      return response({ error: "Format permintaan tidak valid." }, 400);
    }
  }
  let store;
  try {
    store = getStore();
  } catch {
    return response(
      {
        error:
          "Penyimpanan Netlify Blobs belum tersedia. Periksa konfigurasi deployment.",
      },
      503,
    );
  }
  try {
    if (path === "state") {
      // A normal read does not rewrite storage. Expired holds are committed
      // conditionally so they cannot overwrite a simultaneous verified payment.
      const current = await load(store);
      const auditCount = current.data.audit.length;
      expire(current.data);
      if (current.data.audit.length === auditCount)
        return response(viewState(current.data, role));
      const visible = await transaction(store, (db) => {
        expire(db);
        return viewState(db, role);
      });
      return response(visible);
    }
    if (path === "reset") {
      await transaction(store, (db) => {
        const fresh = seed();
        for (const k of Object.keys(db)) delete db[k];
        Object.assign(db, fresh);
      });
      return response({ ok: true });
    }
    let result = await transaction(store, (db) =>
      mutate(db, input?.action, input?.data || {}, role),
    );

    if (input?.action === "subscriptionOrder" && result && notifyPilot) {
      const existingNotification = result.notification;
      if (existingNotification?.email !== "SENT") {
        let notification;
        try {
          notification = await notifyPilot(result);
        } catch (error) {
          console.error("Pilot email notification failed:", error?.message || error);
          notification = {
            email: "FAILED",
            message:
              "Permintaan tersimpan, tetapi notifikasi email belum terkirim.",
          };
        }
        try {
          result = await transaction(store, (db) => {
            const order = (db.subscriptionOrders || []).find(
              (item) => item.requestId === result.requestId,
            );
            if (order) {
              order.notification = {
                ...notification,
                updatedAt: new Date().toISOString(),
              };
              return order;
            }
            return { ...result, notification };
          });
        } catch (error) {
          console.error(
            "Pilot notification status could not be persisted:",
            error?.message || error,
          );
          result = { ...result, notification };
        }
      }
    }

    return response({ ok: true, ...(result ? { result } : {}) });
  } catch (error) {
    if (error instanceof ConflictError)
      return response({ error: error.message }, 409);
    // Domain rule errors should be reviewable by the user; provider failures
    // should not expose credentials, storage URLs, or infrastructure internals.
    const infrastructure =
      error.name?.includes("Blobs") ||
      /fetch failed|Missing storage version|ECONN|ENOTFOUND/.test(
        error.message,
      );
    return response(
      {
        error: infrastructure
          ? "Penyimpanan demo sementara tidak tersedia. Silakan coba lagi."
          : error.message,
      },
      infrastructure ? 503 : 400,
    );
  }
}
