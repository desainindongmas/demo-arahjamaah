// Local harness for the actual native Netlify function and official Blobs SDK.
// No SQLite or Express API routes are used by this harness.
import express from "express";
import { startBlobsFixture } from "./helpers/blobs-fixture.mjs";
import { setEnvironmentContext } from "@netlify/blobs";
import { mkdirSync } from "node:fs";
import handler from "../netlify/functions/api.mjs";
mkdirSync(".data/netlify-browser", { recursive: true });
const blobs = await startBlobsFixture();
setEnvironmentContext({
  edgeURL: blobs.url,
  uncachedEdgeURL: blobs.url,
  siteID: "local-netlify-demo",
  token: "local-browser-test-only",
});
const app = express();
app.use(
  ["/api", "/.netlify/functions/api"],
  express.text({ type: "*/*", limit: "1mb" }),
  async (req, res) => {
    const request = new Request(`http://127.0.0.1:3004${req.originalUrl}`, {
      method: req.method,
      headers: req.headers,
      ...(req.method === "POST" ? { body: req.body || "" } : {}),
    });
    const response = await handler(request);
    res.status(response.status);
    response.headers.forEach((v, k) => res.set(k, v));
    res.send(await response.text());
  },
);
app.use(express.static("dist"));
app.get("/{*path}", (req, res) =>
  res.sendFile(process.cwd() + "/dist/index.html"),
);
const server = app.listen(3004, "127.0.0.1", () =>
  console.log("Netlify adapter harness ready"),
);
const stop = async () => {
  server.close();
  await blobs.stop();
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
