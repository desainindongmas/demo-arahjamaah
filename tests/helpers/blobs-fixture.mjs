import { createServer } from "node:http";

// HTTP fixture for Netlify's documented Blobs edge contract. The official
// local BlobsServer 11.1.4 omits ETag headers on GET, so it cannot exercise
// conditional transactions. This fixture supplies real versioned semantics;
// production continues to use the official SDK and Netlify storage binding.
export async function startBlobsFixture() {
  const entries = new Map();
  let revision = 0;
  const server = createServer(async (req, res) => {
    const path = new URL(req.url, "http://fixture").pathname;
    if (req.method === "GET") {
      const entry = entries.get(path);
      if (!entry) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, {
        "Content-Type": "application/json",
        ETag: entry.etag,
      });
      res.end(entry.body);
      return;
    }
    if (req.method === "PUT") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString("utf8");
      const current = entries.get(path);
      if (
        (req.headers["if-none-match"] === "*" && current) ||
        (req.headers["if-match"] && req.headers["if-match"] !== current?.etag)
      ) {
        res.writeHead(412);
        res.end();
        return;
      }
      const etag = `"revision-${++revision}"`;
      entries.set(path, { body, etag });
      res.writeHead(200, { ETag: etag });
      res.end();
      return;
    }
    res.writeHead(405);
    res.end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${server.address().port}`,
    stop: () => new Promise((resolve) => server.close(resolve)),
  };
}
