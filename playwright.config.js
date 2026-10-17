import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3002",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath: "/usr/bin/chromium",
      args: ["--no-sandbox"],
    },
  },
  webServer: {
    command:
      "NODE_ENV=production PORT=3002 DB_PATH=.data/browser-test.sqlite node server.js",
    url: "http://127.0.0.1:3002/api/state",
    reuseExistingServer: false,
  },
  outputDir: "test-results",
});
