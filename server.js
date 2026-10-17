import express from "express";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { seed, mutate, expire } from "./src/domain.js";
import { viewState } from "./src/view-state.js";
const app = express();
app.use(express.json({ limit: "1mb" }));
mkdirSync(".data", { recursive: true });
const sql = new DatabaseSync(process.env.DB_PATH || ".data/demo.sqlite");
sql.exec(
  "CREATE TABLE IF NOT EXISTS tenants (id TEXT PRIMARY KEY, data TEXT NOT NULL)",
);
const read = (id) => {
  const row = sql.prepare("SELECT data FROM tenants WHERE id=?").get(id);
  return row ? JSON.parse(row.data) : null;
};
const save = (id, db) =>
  sql
    .prepare("INSERT OR REPLACE INTO tenants VALUES (?,?)")
    .run(id, JSON.stringify(db));
if (!read("org1")) save("org1", seed());
app.use("/api", (req, res, next) => {
  req.role = req.headers["x-demo-role"] || "owner";
  req.tenant = req.headers["x-demo-tenant"] || "org1";
  if (!["owner", "admin", "ops", "finance", "sales"].includes(req.role))
    return res.status(403).json({ error: "Peran tidak dikenal." });
  if (req.tenant !== "org1")
    return res
      .status(403)
      .json({ error: "Workspace tidak diizinkan dalam sesi demo ini." });
  next();
});
app.get("/api/state", (req, res) => {
  const db = read(req.tenant);
  expire(db);
  save(req.tenant, db);
  res.json(viewState(db, req.role));
});
app.post("/api/action", (req, res) => {
  sql.exec("BEGIN IMMEDIATE");
  try {
    const db = read(req.tenant);
    const result = mutate(db, req.body.action, req.body.data || {}, req.role);
    save(req.tenant, db);
    sql.exec("COMMIT");
    res.json({ ok: true, result });
  } catch (e) {
    sql.exec("ROLLBACK");
    res.status(400).json({ error: e.message });
  }
});
app.post("/api/reset", (req, res) => {
  if (req.role !== "owner")
    return res.status(403).json({ error: "Hanya Owner dapat mereset demo." });
  save(req.tenant, seed());
  res.json({ ok: true });
});
if (process.env.NODE_ENV !== "production") {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static("dist"));
  app.get("/{*path}", (req, res) =>
    res.sendFile(process.cwd() + "/dist/index.html"),
  );
}
app.listen(Number(process.env.PORT) || 3000, "0.0.0.0", () =>
  console.log("Arah Jamaah berjalan pada port " + (process.env.PORT || 3000)),
);
