import { defineConfig } from "@playwright/test";
import base from "./playwright.config.js";
export default defineConfig({
  ...base,
  use: { ...base.use, baseURL: "http://127.0.0.1:3004" },
  webServer: {
    command: "node tests/netlify-local-server.mjs",
    url: "http://127.0.0.1:3004/api/state",
    reuseExistingServer: false,
  },
});
